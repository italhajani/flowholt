"""Simple in-memory rate limiter middleware for FastAPI.

Uses a sliding-window counter per client IP. No external dependencies
(no Redis needed). Suitable for single-instance deployments.

For multi-instance deployments behind a load balancer, replace with
a Redis-backed or Postgres-backed implementation.
"""

from __future__ import annotations

import time
from collections import defaultdict
from typing import Any

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import JSONResponse


class RateLimitEntry:
    __slots__ = ("count", "window_start")

    def __init__(self) -> None:
        self.count = 0
        self.window_start = 0.0


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limit requests by client IP using sliding window counters.

    Args:
        app: The ASGI application.
        requests_per_minute: Max requests per IP per minute for general endpoints.
        burst_limit: Max requests per IP per 10-second burst window.
        exempt_paths: Paths exempt from rate limiting (e.g. health checks).
        system_requests_per_minute: Max requests for /system/* endpoints.
        sensitive_paths_rpm: Dict of path substrings to per-minute limits for sensitive endpoints.
    """

    def __init__(
        self,
        app: Any,
        *,
        requests_per_minute: int = 120,
        burst_limit: int = 30,
        exempt_paths: set[str] | None = None,
        system_requests_per_minute: int = 30,
        sensitive_paths_rpm: dict[str, int] | None = None,
    ) -> None:
        super().__init__(app)
        self._requests_per_minute = requests_per_minute
        self._burst_limit = burst_limit
        self._system_rpm = system_requests_per_minute
        self._exempt_paths = exempt_paths or {"/health", "/favicon.ico"}
        self._sensitive_paths_rpm = sensitive_paths_rpm or {}

        # Sliding window counters: IP -> RateLimitEntry
        self._minute_counters: dict[str, RateLimitEntry] = defaultdict(RateLimitEntry)
        self._burst_counters: dict[str, RateLimitEntry] = defaultdict(RateLimitEntry)
        self._sensitive_counters: dict[str, RateLimitEntry] = defaultdict(RateLimitEntry)
        self._last_cleanup = time.monotonic()

    def _get_client_ip(self, request: Request) -> str:
        # Trust X-Forwarded-For if behind a reverse proxy
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    def _check_rate_limit(self, client_ip: str, path: str) -> tuple[bool, int, int]:
        """Check if the request should be rate limited.

        Returns (allowed, remaining, retry_after_seconds).
        """
        now = time.monotonic()

        # Periodic cleanup of stale entries (every 60 seconds)
        if now - self._last_cleanup > 60:
            self._cleanup(now)
            self._last_cleanup = now

        # Check sensitive path limits first
        for path_substr, limit in self._sensitive_paths_rpm.items():
            if path_substr in path:
                key = f"{client_ip}:{path_substr}"
                entry = self._sensitive_counters[key]
                if now - entry.window_start >= 60:
                    entry.count = 0
                    entry.window_start = now
                entry.count += 1
                if entry.count > limit:
                    retry_after = int(60 - (now - entry.window_start)) + 1
                    return False, 0, retry_after

        # Determine limit based on path
        is_system = "/system/" in path
        rpm = self._system_rpm if is_system else self._requests_per_minute

        # Check minute window
        minute_entry = self._minute_counters[client_ip]
        if now - minute_entry.window_start >= 60:
            minute_entry.count = 0
            minute_entry.window_start = now

        # Check burst window (10 seconds)
        burst_entry = self._burst_counters[client_ip]
        if now - burst_entry.window_start >= 10:
            burst_entry.count = 0
            burst_entry.window_start = now

        minute_entry.count += 1
        burst_entry.count += 1

        remaining = max(0, rpm - minute_entry.count)

        if minute_entry.count > rpm:
            retry_after = int(60 - (now - minute_entry.window_start)) + 1
            return False, remaining, retry_after

        if burst_entry.count > self._burst_limit:
            retry_after = int(10 - (now - burst_entry.window_start)) + 1
            return False, remaining, retry_after

        return True, remaining, 0

    def _cleanup(self, now: float) -> None:
        """Remove stale rate limit entries."""
        stale_ips = [
            ip for ip, entry in self._minute_counters.items()
            if now - entry.window_start > 120
        ]
        for ip in stale_ips:
            del self._minute_counters[ip]
            self._burst_counters.pop(ip, None)
        stale_sensitive = [
            key for key, entry in self._sensitive_counters.items()
            if now - entry.window_start > 120
        ]
        for key in stale_sensitive:
            del self._sensitive_counters[key]

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        path = request.url.path

        # Skip rate limiting for exempt paths
        if path in self._exempt_paths:
            return await call_next(request)

        # Skip rate limiting for webhook endpoints (they have their own auth)
        if "/webhooks/" in path:
            return await call_next(request)

        client_ip = self._get_client_ip(request)
        allowed, remaining, retry_after = self._check_rate_limit(client_ip, path)

        if not allowed:
            return JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded. Please slow down."},
                headers={
                    "Retry-After": str(retry_after),
                    "X-RateLimit-Remaining": "0",
                },
            )

        response = await call_next(request)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        return response

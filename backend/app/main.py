"""
FlowHolt API — FastAPI application entry point.

All route handlers live in ``routers/`` sub-modules.
Shared helpers are in ``helpers.py``; the common import bundle is in
``_router_imports.py``.
"""
from __future__ import annotations

import logging
from typing import Any

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from .config import get_settings
from .db import init_db
from .helpers import (
    PUBLIC_CHAT_PATH_RE,
    build_public_chat_cors_headers,
    resolve_public_chat_cors_context,
)
from .seeds import seed_data
from .worker import start_in_process_worker, request_shutdown
from . import runtime_state
from .scheduler import start_scheduler, request_shutdown as scheduler_request_shutdown
from .plugin_loader import merge_plugins_into_registry
from .rate_limiter import RateLimitMiddleware

# ── Router imports ─────────────────────────────────────────────────────
from .routers.system import router as system_router
from .routers.identity import router as identity_router
from .routers.oauth import router as oauth_router
from .routers.inbox import router as inbox_router
from .routers.studio import router as studio_router
from .routers.vault import router as vault_router
from .routers.assistant import router as assistant_router
from .routers.chat import router as chat_router
from .routers.workflows import router as workflows_router
from .routers.executions import router as executions_router
from .routers.triggers import router as triggers_router
from .routers.misc import router as misc_router
from .routers.agents import router as agents_router
from .routers.knowledge import router as knowledge_router
from .routers.webhooks import router as webhooks_router
from .routers.mcp import router as mcp_router
from .routers.evaluation import router as eval_router

settings = get_settings()

# ── Production safety checks ─────────────────────────────────────────
if settings.app_env == "production":
    if settings.session_secret == "flowholt-local-dev-secret":
        raise RuntimeError("SESSION_SECRET must be changed from default in production")
    if not settings.vault_encryption_key:
        raise RuntimeError("VAULT_ENCRYPTION_KEY must be set in production")
    if settings.allow_dev_login:
        import logging as _boot_log
        _boot_log.getLogger("flowholt.boot").warning(
            "ALLOW_DEV_LOGIN is True in production — forcing to False"
        )
        settings.allow_dev_login = False

# ── App creation & router registration ────────────────────────────────
app = FastAPI(title=settings.app_name, version="0.1.0")

app.include_router(system_router)
app.include_router(identity_router)
app.include_router(oauth_router)
app.include_router(inbox_router)
app.include_router(studio_router)
app.include_router(vault_router)
app.include_router(assistant_router)
app.include_router(chat_router)
app.include_router(workflows_router)
app.include_router(executions_router)
app.include_router(triggers_router)
app.include_router(misc_router)
app.include_router(agents_router)
app.include_router(knowledge_router)
app.include_router(webhooks_router)
app.include_router(mcp_router)
app.include_router(eval_router)


# ── Middleware ─────────────────────────────────────────────────────────
class PublicChatCorsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        cors_context = resolve_public_chat_cors_context(request)
        origin = request.headers.get("origin")

        if request.method == "OPTIONS" and PUBLIC_CHAT_PATH_RE.match(request.url.path):
            if cors_context is None:
                return Response(status_code=403)
            response = Response(status_code=204)
            for header, value in build_public_chat_cors_headers(
                origin=origin,
                allowed_origins_value=str(cors_context.get("allowed_origins") or "*"),
                requested_headers=request.headers.get("access-control-request-headers"),
            ).items():
                response.headers[header] = value
            return response

        response = await call_next(request)
        if cors_context is not None:
            for header, value in build_public_chat_cors_headers(
                origin=origin,
                allowed_origins_value=str(cors_context.get("allowed_origins") or "*"),
                requested_headers=request.headers.get("access-control-request-headers"),
            ).items():
                response.headers[header] = value
        return response


@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    if request.url.path.startswith("/chat/"):
        response.headers.pop("X-Frame-Options", None)
        response.headers["Content-Security-Policy"] = "frame-ancestors 'self' http: https:"
    else:
        response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    if settings.app_env == "production":
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
    return response


app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origin.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.add_middleware(PublicChatCorsMiddleware)

if settings.app_env != "test":
    app.add_middleware(
        RateLimitMiddleware,
        requests_per_minute=120,
        burst_limit=30,
        system_requests_per_minute=30,
        sensitive_paths_rpm={
            "/auth/dev-login": 10,
            "/auth/login": 15,
            "/auth/signup": 10,
            "/oauth2/": 20,
            "/sandbox/execute": 15,
            "/workflows/run": 30,
        },
    )

_logger = logging.getLogger("flowholt.api")


# ── Exception handlers ────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all for unhandled exceptions — log full traceback, return safe 500."""
    _logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal error occurred. Please try again later."},
    )


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError) -> JSONResponse:
    return JSONResponse(status_code=422, content={"detail": str(exc)})


# ── Startup / Shutdown ────────────────────────────────────────────────
_worker_task = None
_scheduler_task = None


@app.on_event("startup")
async def on_startup() -> None:
    global _worker_task, _scheduler_task
    init_db()
    seed_data()
    merge_plugins_into_registry()
    if settings.execution_mode == "async":
        _worker_task = await start_in_process_worker()
        runtime_state.worker_task = _worker_task
    _scheduler_task = await start_scheduler()
    runtime_state.scheduler_task = _scheduler_task


@app.on_event("shutdown")
async def on_shutdown() -> None:
    request_shutdown()
    scheduler_request_shutdown()
    if _worker_task is not None:
        _worker_task.cancel()
    if _scheduler_task is not None:
        _scheduler_task.cancel()

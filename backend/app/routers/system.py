"""
System router — health probes, LLM/system status, search, help, sandbox, audit events.
"""
from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse

from ..config import get_settings
from ..db import get_database_backend, get_db
from ..deps import get_session_context, record_audit_event, require_workspace_role
from ..help_content import list_help_articles
from ..integration_registry import list_integration_apps
from ..llm_router import get_llm_router
from ..models import (
    AuditEventSummary,
    AuthPreflightResponse,
    HealthResponse,
    SetupReportResponse,
)
from ..plugin_loader import get_plugin_registry
from ..repository import (
    count_executions_by_status,
    count_workflows_by_status,
    get_workspace_settings,
    list_audit_events,
    list_executions,
    list_vault_assets,
    list_workflow_jobs,
    list_workflows,
)
from ..auth import get_supabase_auth_mode
from .. import runtime_state
from .. import repository as repo

settings = get_settings()
router = APIRouter()


# ---------------------------------------------------------------------------
# Health probes
# ---------------------------------------------------------------------------

@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        environment=settings.app_env,
        llm_mode=settings.llm_mode,
        database_backend=get_database_backend(),
    )


@router.get("/health/ready")
def health_ready() -> dict[str, Any]:
    """Readiness probe — checks DB connectivity."""
    try:
        with get_db() as conn:
            conn.execute("SELECT 1").fetchone()
        db_status = "connected"
        db_ok = True
    except Exception as exc:
        db_status = f"error: {exc}"
        db_ok = False

    return JSONResponse(
        status_code=200 if db_ok else 503,
        content={
            "ready": db_ok,
            "database": db_status,
            "environment": settings.app_env,
        },
    )


@router.get(f"{settings.api_prefix}/health/deep")
def deep_health_check() -> dict[str, Any]:
    """Deep health check — probes database, LLM, scheduler, and worker."""
    checks: dict[str, dict[str, Any]] = {}
    overall = True

    try:
        with get_db() as conn:
            conn.execute("SELECT 1").fetchone()
        checks["database"] = {"status": "healthy", "backend": get_database_backend()}
    except Exception as exc:
        checks["database"] = {"status": "unhealthy", "error": str(exc)[:200]}
        overall = False

    try:
        llm_router = get_llm_router()
        providers = llm_router.list_available()
        checks["llm"] = {"status": "healthy" if providers else "degraded", "providers": providers}
        if not providers:
            overall = False
    except Exception as exc:
        checks["llm"] = {"status": "unhealthy", "error": str(exc)[:200]}
        overall = False

    try:
        reg = get_plugin_registry()
        checks["plugins"] = {"status": "healthy", "count": len(reg._plugins)}
    except Exception as exc:
        checks["plugins"] = {"status": "unhealthy", "error": str(exc)[:200]}

    try:
        from ..worker import _shutdown_event
        worker_running = _shutdown_event is not None and not _shutdown_event.is_set()
        checks["worker"] = {"status": "healthy" if worker_running else "idle"}
    except Exception:
        checks["worker"] = {"status": "unknown"}

    try:
        from ..scheduler import _scheduler_shutdown_event
        scheduler_running = _scheduler_shutdown_event is not None and not _scheduler_shutdown_event.is_set()
        checks["scheduler"] = {"status": "healthy" if scheduler_running else "idle"}
    except Exception:
        checks["scheduler"] = {"status": "unknown"}

    return {
        "status": "healthy" if overall else "degraded",
        "checks": checks,
        "timestamp": datetime.now(UTC).isoformat(),
    }


# ---------------------------------------------------------------------------
# LLM & system status
# ---------------------------------------------------------------------------

@router.get(f"{settings.api_prefix}/llm/status")
def llm_status() -> dict[str, Any]:
    llm_router = get_llm_router()
    return {
        "configured_provider": settings.llm_provider,
        "available_providers": llm_router.available_providers,
        "default_provider": llm_router._default_provider,
        "execution_mode": settings.execution_mode,
        "worker_active": runtime_state.worker_task is not None and not runtime_state.worker_task.done(),
        "scheduler_active": runtime_state.scheduler_task is not None and not runtime_state.scheduler_task.done(),
    }


@router.get(f"{settings.api_prefix}/system/status")
def system_status(session: dict[str, Any] = Depends(get_session_context)) -> dict[str, Any]:
    workspace_id = str(session["workspace"]["id"])
    llm_router = get_llm_router()
    plugin_registry = get_plugin_registry()

    jobs = list_workflow_jobs(workspace_id)
    pending_jobs = sum(1 for j in jobs if str(j.get("status")) == "pending")
    processing_jobs = sum(1 for j in jobs if str(j.get("status")) == "processing")
    failed_jobs = sum(1 for j in jobs if str(j.get("status")) == "failed")
    completed_jobs = sum(1 for j in jobs if str(j.get("status")) == "completed")

    exec_counts = count_executions_by_status(workspace_id)
    total_executions = sum(exec_counts.values())

    wf_counts = count_workflows_by_status(workspace_id)
    total_workflows = sum(wf_counts.values())
    active_workflows = wf_counts.get("active", 0)

    integration_apps = list_integration_apps()
    plugin_count = len(plugin_registry._plugins) if plugin_registry else 0

    return {
        "platform": {
            "version": "0.1.0",
            "environment": settings.app_env,
            "database_backend": get_database_backend(),
            "execution_mode": settings.execution_mode,
        },
        "llm": {
            "configured_provider": settings.llm_provider,
            "available_providers": llm_router.available_providers,
            "default_provider": llm_router._default_provider,
        },
        "worker": {
            "active": runtime_state.worker_task is not None and not runtime_state.worker_task.done(),
            "mode": settings.execution_mode,
        },
        "scheduler": {
            "active": runtime_state.scheduler_task is not None and not runtime_state.scheduler_task.done(),
        },
        "jobs": {
            "pending": pending_jobs,
            "processing": processing_jobs,
            "failed": failed_jobs,
            "completed": completed_jobs,
            "total": len(jobs),
        },
        "executions": {
            "total": total_executions,
            "success": exec_counts.get("success", 0),
            "failed": exec_counts.get("failed", 0),
            "running": exec_counts.get("running", 0),
        },
        "workflows": {
            "total": total_workflows,
            "active": active_workflows,
        },
        "integrations": {
            "builtin_count": len(integration_apps),
            "plugin_count": plugin_count,
            "total": len(integration_apps) + plugin_count,
        },
    }


@router.get(f"{settings.api_prefix}/system/setup-report", response_model=SetupReportResponse)
def get_setup_report(session: dict[str, Any] = Depends(get_session_context)) -> SetupReportResponse:
    workspace_id = str(session["workspace"]["id"])
    workspace_settings = get_workspace_settings(workspace_id)
    next_actions: list[str] = []

    if not settings.database_url:
        next_actions.append("Add DATABASE_URL to move from local SQLite to hosted Postgres.")
    if not settings.supabase_url:
        next_actions.append("Add SUPABASE_URL so the backend can verify real Supabase tokens.")
    if settings.supabase_url and get_supabase_auth_mode() == "none":
        next_actions.append("Configure SUPABASE_JWT_SECRET or use JWKS mode with installed backend auth dependencies.")
    if not settings.scheduler_secret:
        next_actions.append("Set SCHEDULER_SECRET before exposing scheduled processing online.")
    if not (workspace_settings.get("public_base_url") or settings.public_base_url):
        next_actions.append("Set PUBLIC_BASE_URL or workspace public_base_url before sharing webhook or chat URLs.")
    if not workspace_settings.get("require_webhook_signature"):
        next_actions.append("Enable require_webhook_signature in workspace settings before public webhooks.")
    if workspace_settings.get("require_webhook_signature") and not workspace_settings.get("webhook_signing_secret"):
        next_actions.append("Save a webhook_signing_secret in workspace settings.")
    if not bool(workspace_settings.get("allow_public_chat_triggers", True)):
        next_actions.append("Enable allow_public_chat_triggers in workspace settings before sharing public chat endpoints.")

    return SetupReportResponse(
        database_backend=get_database_backend(),
        database_url_configured=bool(settings.database_url),
        supabase_url_configured=bool(settings.supabase_url),
        supabase_auth_mode=get_supabase_auth_mode(),
        scheduler_secret_configured=bool(settings.scheduler_secret),
        public_base_url_configured=bool(workspace_settings.get("public_base_url") or settings.public_base_url),
        webhook_signature_required=bool(workspace_settings.get("require_webhook_signature")),
        workspace_id=workspace_id,
        next_actions=next_actions,
    )


# ---------------------------------------------------------------------------
# Search
# ---------------------------------------------------------------------------

@router.get(f"{settings.api_prefix}/search")
def global_search(
    q: str = "",
    session: dict[str, Any] = Depends(get_session_context),
) -> dict[str, Any]:
    workspace_id = str(session["workspace"]["id"])
    query = q.strip().lower()
    if not query or len(query) < 2:
        return {"workflows": [], "executions": [], "vault_assets": []}

    all_workflows = list_workflows(workspace_id) or []
    matched_workflows = []
    for wf in all_workflows:
        name = str(wf.get("name") or "").lower()
        category = str(wf.get("category") or "").lower()
        if query in name or query in category:
            matched_workflows.append({
                "id": wf["id"],
                "name": wf.get("name"),
                "status": wf.get("status"),
                "category": wf.get("category"),
                "type": "workflow",
            })
        if len(matched_workflows) >= 10:
            break

    all_executions = list_executions(workspace_id, limit=200) or []
    matched_executions = []
    for ex in all_executions:
        wf_name = str(ex.get("workflow_name") or "").lower()
        status = str(ex.get("status") or "").lower()
        error_text = str(ex.get("error_text") or "").lower()
        if query in wf_name or query in status or query in error_text:
            matched_executions.append({
                "id": ex["id"],
                "workflow_name": ex.get("workflow_name"),
                "status": ex.get("status"),
                "started_at": ex.get("started_at"),
                "type": "execution",
            })
        if len(matched_executions) >= 10:
            break

    vault_data = list_vault_assets(workspace_id=workspace_id) or []
    matched_vault = []
    for asset in vault_data:
        name = str(asset.get("name") or asset.get("key") or "").lower()
        kind = str(asset.get("kind") or "").lower()
        if query in name or query in kind:
            matched_vault.append({
                "id": asset["id"],
                "name": asset.get("name") or asset.get("key"),
                "kind": asset.get("kind"),
                "type": "vault_asset",
            })
        if len(matched_vault) >= 10:
            break

    return {
        "workflows": matched_workflows,
        "executions": matched_executions,
        "vault_assets": matched_vault,
    }


# ---------------------------------------------------------------------------
# Help & sandbox
# ---------------------------------------------------------------------------

@router.get(f"{settings.api_prefix}/help/articles")
def get_help_articles(
    category: str | None = None,
    q: str | None = None,
    session: dict[str, Any] = Depends(get_session_context),
) -> list[dict[str, Any]]:
    _ = session
    return list_help_articles(category=category, query=q)


@router.post(f"{settings.api_prefix}/sandbox/execute")
async def sandbox_execute(request: Request, session: dict[str, Any] = Depends(get_session_context)) -> dict[str, Any]:
    require_workspace_role(session, "owner", "admin", "builder")
    body = await request.json()
    code = str(body.get("code", ""))
    language = str(body.get("language", "python"))
    input_data = body.get("input_data", {})
    timeout = int(body.get("timeout", 30))

    if not code.strip():
        raise HTTPException(status_code=400, detail="Code must not be empty.")

    from ..sandbox import execute_code
    return await execute_code(code=code, language=language, input_data=input_data, timeout=timeout)


# ---------------------------------------------------------------------------
# Auth preflight
# ---------------------------------------------------------------------------

@router.get(f"{settings.api_prefix}/auth/preflight", response_model=AuthPreflightResponse)
def get_auth_preflight() -> AuthPreflightResponse:
    return AuthPreflightResponse(
        local_dev_login_enabled=settings.allow_dev_login,
        supabase_configured=bool(settings.supabase_url or settings.supabase_jwt_secret),
        supabase_auth_mode=get_supabase_auth_mode(),
        database_backend=get_database_backend(),
    )


# ---------------------------------------------------------------------------
# Audit events
# ---------------------------------------------------------------------------

@router.get(f"{settings.api_prefix}/audit-events", response_model=list[AuditEventSummary])
def get_audit_events(
    session: dict[str, Any] = Depends(get_session_context),
) -> list[AuditEventSummary]:
    return [
        AuditEventSummary.model_validate(item)
        for item in list_audit_events(str(session["workspace"]["id"]))
    ]


# ── Prometheus-style Metrics ──

@router.get("/metrics")
def prometheus_metrics() -> str:
    """Prometheus-compatible text metrics endpoint."""
    from fastapi.responses import PlainTextResponse
    lines: list[str] = []

    # Execution metrics
    try:
        with get_db() as conn:
            row = conn.execute(
                "SELECT COUNT(*) as total, "
                "SUM(CASE WHEN status='success' THEN 1 ELSE 0 END) as success, "
                "SUM(CASE WHEN status='failed' THEN 1 ELSE 0 END) as failed, "
                "SUM(CASE WHEN status='running' THEN 1 ELSE 0 END) as running "
                "FROM executions"
            ).fetchone()
            if row:
                lines.append("# HELP flowholt_executions_total Total workflow executions")
                lines.append("# TYPE flowholt_executions_total counter")
                lines.append(f'flowholt_executions_total {row["total"] or 0}')
                lines.append("# HELP flowholt_executions_by_status Executions by status")
                lines.append("# TYPE flowholt_executions_by_status gauge")
                lines.append(f'flowholt_executions_by_status{{status="success"}} {row["success"] or 0}')
                lines.append(f'flowholt_executions_by_status{{status="failed"}} {row["failed"] or 0}')
                lines.append(f'flowholt_executions_by_status{{status="running"}} {row["running"] or 0}')

            # Workflow count
            wf_row = conn.execute("SELECT COUNT(*) as cnt FROM workflows").fetchone()
            lines.append("# HELP flowholt_workflows_total Total workflows")
            lines.append("# TYPE flowholt_workflows_total gauge")
            lines.append(f'flowholt_workflows_total {wf_row["cnt"] if wf_row else 0}')

            # Webhook queue depth
            q_row = conn.execute(
                "SELECT COUNT(*) as pending FROM webhook_queue WHERE status='pending'"
            ).fetchone()
            lines.append("# HELP flowholt_webhook_queue_depth Pending webhook queue items")
            lines.append("# TYPE flowholt_webhook_queue_depth gauge")
            lines.append(f'flowholt_webhook_queue_depth {q_row["pending"] if q_row else 0}')

            # Agent count
            a_row = conn.execute("SELECT COUNT(*) as cnt FROM agents").fetchone()
            lines.append("# HELP flowholt_agents_total Total AI agents")
            lines.append("# TYPE flowholt_agents_total gauge")
            lines.append(f'flowholt_agents_total {a_row["cnt"] if a_row else 0}')

            # Knowledge bases
            kb_row = conn.execute("SELECT COUNT(*) as cnt FROM knowledge_bases").fetchone()
            lines.append("# HELP flowholt_knowledge_bases_total Total knowledge bases")
            lines.append("# TYPE flowholt_knowledge_bases_total gauge")
            lines.append(f'flowholt_knowledge_bases_total {kb_row["cnt"] if kb_row else 0}')

    except Exception:
        lines.append("# Error collecting metrics")

    return PlainTextResponse("\n".join(lines) + "\n", media_type="text/plain; version=0.0.4")


# ── Analytics Dashboard Metrics ──

@router.get(f"{settings.api_prefix}/analytics/overview")
def analytics_overview(
    session: dict[str, Any] = Depends(get_session_context),
) -> dict[str, Any]:
    """Dashboard analytics: execution metrics, usage trends, error rates."""
    ws_id = str(session["workspace"]["id"])
    exec_counts = count_executions_by_status(ws_id)
    wf_counts = count_workflows_by_status(ws_id)

    total_execs = sum(exec_counts.values())
    success = exec_counts.get("success", 0)
    failed = exec_counts.get("failed", 0)
    error_rate = round(failed / total_execs * 100, 1) if total_execs > 0 else 0

    return {
        "executions": {
            "total": total_execs,
            "success": success,
            "failed": failed,
            "running": exec_counts.get("running", 0),
            "paused": exec_counts.get("paused", 0),
            "error_rate_pct": error_rate,
        },
        "workflows": {
            "total": sum(wf_counts.values()),
            "active": wf_counts.get("active", 0),
            "draft": wf_counts.get("draft", 0),
            "paused": wf_counts.get("paused", 0),
        },
        "workspace_id": ws_id,
    }


# ── Log Streaming Config ──

@router.get(f"{settings.api_prefix}/system/log-config")
def get_log_config(
    session: dict[str, Any] = Depends(get_session_context),
) -> dict[str, Any]:
    """Get current log streaming configuration."""
    ws_settings = get_workspace_settings(str(session["workspace"]["id"]))
    return {
        "log_level": ws_settings.get("log_level", "info"),
        "destinations": ["console"],
        "supported_destinations": ["console", "datadog", "elastic", "loki", "cloudwatch"],
        "retention_days": ws_settings.get("execution_data_retention_days", 14),
    }


@router.post(f"{settings.api_prefix}/system/log-config")
def update_log_config(
    body: dict[str, Any],
    session: dict[str, Any] = Depends(get_session_context),
) -> dict[str, Any]:
    """Update log streaming configuration (admin only)."""
    require_workspace_role(session, "admin", "owner")
    record_audit_event(
        session=session,
        workspace_id=str(session["workspace"]["id"]),
        action="system.log_config.update",
        target_type="system",
        target_id=None,
        status="success",
        details=body,
    )
    return {"status": "updated", "config": body}


# ── Execution Latency Percentiles ──

@router.get(f"{settings.api_prefix}/analytics/latency")
def analytics_latency(
    session: dict[str, Any] = Depends(get_session_context),
) -> dict[str, Any]:
    """Execution latency percentile breakdown for the workspace."""
    ws_id = str(session["workspace"]["id"])
    with get_db() as conn:
        rows = conn.execute(
            "SELECT duration_ms FROM executions "
            "WHERE workspace_id = ? AND duration_ms IS NOT NULL AND duration_ms > 0 "
            "ORDER BY duration_ms",
            (ws_id,),
        ).fetchall()

    if not rows:
        return {"p50": 0, "p90": 0, "p95": 0, "p99": 0, "count": 0}

    durations = [r["duration_ms"] for r in rows]
    n = len(durations)

    def percentile(p: int) -> int:
        idx = max(0, min(int(n * p / 100) - 1, n - 1))
        return durations[idx]

    return {
        "p50": percentile(50),
        "p90": percentile(90),
        "p95": percentile(95),
        "p99": percentile(99),
        "count": n,
        "avg_ms": round(sum(durations) / n, 1) if n else 0,
    }


# ── Execution Timeline (recent runs) ──

@router.get(f"{settings.api_prefix}/analytics/timeline")
def analytics_timeline(
    days: int = 7,
    session: dict[str, Any] = Depends(get_session_context),
) -> list[dict[str, Any]]:
    """Execution counts by day for charts."""
    ws_id = str(session["workspace"]["id"])
    with get_db() as conn:
        rows = conn.execute(
            "SELECT DATE(started_at) as day, "
            "COUNT(*) as total, "
            "SUM(CASE WHEN status='success' THEN 1 ELSE 0 END) as success, "
            "SUM(CASE WHEN status='failed' THEN 1 ELSE 0 END) as failed "
            "FROM executions "
            "WHERE workspace_id = ? AND started_at >= date('now', ? || ' days') "
            "GROUP BY DATE(started_at) ORDER BY day",
            (ws_id, f"-{days}"),
        ).fetchall()
    return [dict(r) for r in rows]


# ---------------------------------------------------------------------------
# Model Directory — lists available LLM models from config
# ---------------------------------------------------------------------------

@router.get(f"{settings.api_prefix}/models")
def list_models() -> list[dict[str, Any]]:
    """Return all known LLM models with availability status."""
    llm_router = get_llm_router()
    available = set(llm_router.available_providers)

    models = [
        {"id": "gemini-2.0-flash", "name": "Gemini 2.0 Flash", "provider": "Google", "modality": ["text", "code", "vision"], "contextWindow": "1M", "maxOutput": "8192", "latencyTier": "fast", "costTier": "free", "description": "Fast and free multimodal model from Google."},
        {"id": "gemini-1.5-pro", "name": "Gemini 1.5 Pro", "provider": "Google", "modality": ["text", "code", "vision", "audio"], "contextWindow": "2M", "maxOutput": "8192", "latencyTier": "standard", "costTier": "low", "description": "Long-context flagship model from Google."},
        {"id": "llama-3.3-70b", "name": "Llama 3.3 70B", "provider": "Groq", "modality": ["text", "code"], "contextWindow": "128K", "maxOutput": "8192", "latencyTier": "fast", "costTier": "free", "description": "Meta's open model served ultra-fast via Groq."},
        {"id": "llama-3.1-8b", "name": "Llama 3.1 8B", "provider": "Groq", "modality": ["text", "code"], "contextWindow": "128K", "maxOutput": "8192", "latencyTier": "fast", "costTier": "free", "description": "Lightweight fast model via Groq."},
        {"id": "gpt-4o", "name": "GPT-4o", "provider": "OpenAI", "modality": ["text", "code", "vision", "audio"], "contextWindow": "128K", "maxOutput": "16384", "latencyTier": "standard", "costTier": "medium", "description": "OpenAI's flagship multimodal model."},
        {"id": "gpt-4o-mini", "name": "GPT-4o Mini", "provider": "OpenAI", "modality": ["text", "code", "vision"], "contextWindow": "128K", "maxOutput": "16384", "latencyTier": "fast", "costTier": "low", "description": "Compact and affordable GPT-4 class model."},
        {"id": "claude-sonnet-4", "name": "Claude Sonnet 4", "provider": "Anthropic", "modality": ["text", "code", "vision"], "contextWindow": "200K", "maxOutput": "8192", "latencyTier": "standard", "costTier": "medium", "description": "Anthropic's balanced model for coding and analysis."},
        {"id": "claude-haiku-3.5", "name": "Claude Haiku 3.5", "provider": "Anthropic", "modality": ["text", "code", "vision"], "contextWindow": "200K", "maxOutput": "4096", "latencyTier": "fast", "costTier": "low", "description": "Fastest Anthropic model, great for quick tasks."},
        {"id": "deepseek-v3", "name": "DeepSeek V3", "provider": "DeepSeek", "modality": ["text", "code"], "contextWindow": "128K", "maxOutput": "8192", "latencyTier": "standard", "costTier": "low", "description": "Powerful open model from DeepSeek for coding."},
        {"id": "grok-3", "name": "Grok-3", "provider": "xAI", "modality": ["text", "code"], "contextWindow": "128K", "maxOutput": "8192", "latencyTier": "standard", "costTier": "medium", "description": "xAI's frontier model."},
        {"id": "ollama-local", "name": "Ollama (Local)", "provider": "Ollama", "modality": ["text", "code"], "contextWindow": "varies", "maxOutput": "varies", "latencyTier": "standard", "costTier": "free", "description": "Self-hosted local models via Ollama."},
    ]

    # Mark availability based on configured providers
    provider_map = {"Google": "gemini", "Groq": "groq", "OpenAI": "openai", "Anthropic": "anthropic", "DeepSeek": "openai", "xAI": "openai", "Ollama": "ollama"}
    for m in models:
        backend_key = provider_map.get(m["provider"], "")
        m["status"] = "available" if backend_key in available else "limited"
        m["featured"] = m["costTier"] == "free"

    return models

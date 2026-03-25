from fastapi import FastAPI

from app.api.routes.orchestrator import router as orchestrator_router
from app.core.config import settings

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Execution engine for FlowHolt AI workflows.",
)

app.include_router(orchestrator_router, prefix="/api")


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok", "service": settings.app_name}

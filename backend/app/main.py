from __future__ import annotations

import time

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .db import init_db
from .executor import execute_workflow_definition
from .models import ExecutionSummary, HealthResponse, RunWorkflowRequest, TemplateSummary, WorkflowCreate, WorkflowSummary
from .repository import (
    create_execution_record,
    create_workflow,
    finish_execution_record,
    get_workflow,
    list_executions,
    list_templates,
    list_workflows,
    touch_workflow_run,
)
from .seeds import seed_data

settings = get_settings()
app = FastAPI(title=settings.app_name, version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.cors_origin, "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()
    seed_data()


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok", environment=settings.app_env, llm_mode=settings.llm_mode)


@app.get(f"{settings.api_prefix}/templates", response_model=list[TemplateSummary])
def get_templates() -> list[TemplateSummary]:
    return [TemplateSummary.model_validate(item) for item in list_templates()]


@app.get(f"{settings.api_prefix}/workflows", response_model=list[WorkflowSummary])
def get_workflows() -> list[WorkflowSummary]:
    return [WorkflowSummary.model_validate(item) for item in list_workflows()]


@app.post(f"{settings.api_prefix}/workflows", response_model=WorkflowSummary, status_code=201)
def post_workflow(payload: WorkflowCreate) -> WorkflowSummary:
    workflow = create_workflow(payload)
    return WorkflowSummary.model_validate(workflow)


@app.get(f"{settings.api_prefix}/executions", response_model=list[ExecutionSummary])
def get_executions() -> list[ExecutionSummary]:
    executions = []
    for item in list_executions():
        item["steps"] = item.pop("steps_json")
        executions.append(ExecutionSummary.model_validate(item))
    return executions


@app.post(f"{settings.api_prefix}/workflows/{{workflow_id}}/run", response_model=ExecutionSummary)
def run_workflow(workflow_id: str, payload: RunWorkflowRequest) -> ExecutionSummary:
    workflow = get_workflow(workflow_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    execution = create_execution_record(workflow, payload.payload)
    started = time.perf_counter()

    try:
        step_results, result = execute_workflow_definition(workflow["definition_json"], payload.payload)
        status = "success"
        error_text = None
    except Exception as exc:  # noqa: BLE001
        step_results = []
        result = None
        status = "failed"
        error_text = str(exc)

    duration_ms = int((time.perf_counter() - started) * 1000)
    stored = finish_execution_record(
        execution["id"],
        status=status,
        duration_ms=duration_ms,
        steps=step_results,
        result=result,
        error_text=error_text,
    )
    touch_workflow_run(workflow_id)
    stored["steps"] = stored.pop("steps_json")
    return ExecutionSummary.model_validate(stored)

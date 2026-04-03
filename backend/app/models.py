from typing import Any, Literal

from pydantic import BaseModel, Field


WorkflowStatus = Literal["active", "draft", "paused"]
ExecutionStatus = Literal["success", "failed", "running"]
StepStatus = Literal["success", "failed", "skipped", "running"]


class TemplateSummary(BaseModel):
    id: str
    name: str
    description: str
    category: str
    trigger_type: str
    estimated_time: str
    complexity: str
    color: str
    owner: str
    installs: str
    outcome: str
    tags: list[str]


class WorkflowSummary(BaseModel):
    id: str
    name: str
    status: WorkflowStatus
    trigger_type: str
    category: str
    success_rate: int
    created_at: str
    last_run_at: str | None = None
    template_id: str | None = None


class WorkflowStep(BaseModel):
    id: str
    type: Literal["trigger", "transform", "condition", "llm", "output"]
    name: str
    config: dict[str, Any] = Field(default_factory=dict)


class WorkflowDefinition(BaseModel):
    steps: list[WorkflowStep]


class WorkflowCreate(BaseModel):
    name: str
    trigger_type: str = "manual"
    category: str = "Custom"
    status: WorkflowStatus = "draft"
    template_id: str | None = None
    definition: WorkflowDefinition


class ExecutionStepResult(BaseModel):
    name: str
    status: StepStatus
    duration_ms: int
    output: dict[str, Any] | None = None


class ExecutionSummary(BaseModel):
    id: str
    workflow_id: str
    workflow_name: str
    status: ExecutionStatus
    trigger_type: str
    started_at: str
    finished_at: str | None = None
    duration_ms: int | None = None
    error_text: str | None = None
    steps: list[ExecutionStepResult]


class RunWorkflowRequest(BaseModel):
    payload: dict[str, Any] = Field(default_factory=dict)


class HealthResponse(BaseModel):
    status: str
    environment: str
    llm_mode: str

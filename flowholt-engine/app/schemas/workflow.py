from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class WorkflowNode(BaseModel):
    id: str
    type: Literal[
        "trigger",
        "agent",
        "tool",
        "condition",
        "loop",
        "memory",
        "retriever",
        "output",
    ]
    label: str
    config: dict[str, Any] = Field(default_factory=dict)
    position: dict[str, float] | None = None


class WorkflowEdge(BaseModel):
    source: str
    target: str
    label: str | None = None
    branch: str | None = None


class WorkflowPayload(BaseModel):
    run_id: str | None = None
    workflow_id: str
    workspace_id: str
    workflow_name: str = "Untitled workflow"
    trigger_source: str = "manual"
    nodes: list[WorkflowNode]
    edges: list[WorkflowEdge]
    settings: dict[str, Any] = Field(default_factory=dict)


class WorkflowRunLog(BaseModel):
    level: Literal["debug", "info", "warn", "error"] = "info"
    message: str
    node_id: str | None = None
    payload: dict[str, Any] = Field(default_factory=dict)


class WorkflowRunSummary(BaseModel):
    workflow_id: str
    run_id: str | None = None
    workflow_name: str
    node_count: int
    edge_count: int
    executed_nodes: list[str] = Field(default_factory=list)
    trigger_source: str = "manual"


class WorkflowRunResult(BaseModel):
    status: Literal["succeeded", "failed"]
    started_at: datetime
    finished_at: datetime
    summary: WorkflowRunSummary
    output: dict[str, Any] = Field(default_factory=dict)
    logs: list[WorkflowRunLog] = Field(default_factory=list)

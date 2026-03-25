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


class WorkflowEdge(BaseModel):
    source: str
    target: str


class WorkflowPayload(BaseModel):
    workflow_id: str
    nodes: list[WorkflowNode]
    edges: list[WorkflowEdge]

import json
from collections import deque
from datetime import datetime, timezone
from time import monotonic, sleep
from typing import Any

from app.schemas.workflow import (
    WorkflowEdge,
    WorkflowNodeExecution,
    WorkflowPayload,
    WorkflowRunLog,
    WorkflowRunResult,
    WorkflowRunSummary,
)
from app.services.node_handlers import ExecutionContext, execute_node


def _build_graph(payload: WorkflowPayload) -> tuple[dict[str, list[WorkflowEdge]], dict[str, int]]:
    node_ids = [node.id for node in payload.nodes]
    adjacency: dict[str, list[WorkflowEdge]] = {node_id: [] for node_id in node_ids}
    indegree = {node_id: 0 for node_id in node_ids}

    for edge in payload.edges:
        if edge.source in adjacency and edge.target in indegree:
            adjacency[edge.source].append(edge)
            indegree[edge.target] += 1

    return adjacency, indegree


def _root_node_ids(payload: WorkflowPayload, indegree: dict[str, int]) -> list[str]:
    roots = [node.id for node in payload.nodes if indegree.get(node.id, 0) == 0]
    if roots:
        return roots
    return [payload.nodes[0].id] if payload.nodes else []


def _normalize_branch(value: object | None) -> str:
    return str(value or "").strip().lower()


def _as_dict(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def _to_int(value: Any, default: int) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _to_float(value: Any, default: float) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _execution_settings(payload: WorkflowPayload) -> dict[str, float | int]:
    settings = _as_dict(payload.settings)
    execution = _as_dict(settings.get("execution"))

    max_node_retries = max(
        0,
        _to_int(execution.get("max_node_retries", settings.get("retries", 0)), 0),
    )
    retry_backoff_seconds = max(
        0.0,
        _to_float(execution.get("retry_backoff_seconds", 0.75), 0.75),
    )
    max_run_seconds = max(
        0.0,
        _to_float(execution.get("max_run_seconds", 0.0), 0.0),
    )

    return {
        "max_node_retries": max_node_retries,
        "retry_backoff_seconds": retry_backoff_seconds,
        "max_run_seconds": max_run_seconds,
    }


def _choose_next_edges(
    node_type: str,
    node_id: str,
    result_output: dict[str, object],
    adjacency: dict[str, list[WorkflowEdge]],
) -> list[WorkflowEdge]:
    outgoing = adjacency.get(node_id, [])
    if node_type != "condition" or len(outgoing) <= 1:
        return outgoing

    branch = _normalize_branch(result_output.get("branch") or "default-continue")

    for edge in outgoing:
        edge_branch = _normalize_branch(edge.branch or edge.label)
        if edge_branch and edge_branch == branch:
            return [edge]

    unlabeled = [edge for edge in outgoing if not _normalize_branch(edge.branch or edge.label)]
    if unlabeled:
        return unlabeled[:1]

    return outgoing[:1]


def _duration_ms(started_at: datetime, finished_at: datetime) -> int:
    return max(0, int((finished_at - started_at).total_seconds() * 1000))


def _estimate_tokens(value: Any) -> int:
    try:
        text = json.dumps(value, ensure_ascii=False)
    except TypeError:
        text = str(value)

    return max(0, int(len(text) / 4))


def _summarize_output(output: dict[str, Any]) -> dict[str, Any]:
    summary: dict[str, Any] = {
        "keys": sorted(output.keys()),
    }

    text = output.get("text")
    if isinstance(text, str) and text.strip():
        summary["text_preview"] = text.strip()[:180]

    result_value = output.get("result")
    if isinstance(result_value, dict):
        summary["result_keys"] = sorted(result_value.keys())
    elif isinstance(result_value, str) and result_value.strip():
        summary["result_preview"] = result_value.strip()[:180]

    for key in ["branch", "matched", "status_code", "provider", "model", "url", "method"]:
        if key in output:
            summary[key] = output.get(key)

    return summary


def _with_correlation(payload: WorkflowPayload, values: dict[str, Any] | None = None) -> dict[str, Any]:
    merged = dict(values or {})
    if payload.request_correlation_id:
        merged["request_correlation_id"] = payload.request_correlation_id
    return merged


def _node_execution(
    *,
    node_id: str,
    node_label: str,
    node_type: str,
    sequence: int,
    status: str,
    attempt_count: int,
    started_at: datetime,
    finished_at: datetime,
    output: dict[str, Any] | None = None,
    error_class: str | None = None,
    error_message: str | None = None,
) -> WorkflowNodeExecution:
    resolved_output = output or {}
    return WorkflowNodeExecution(
        node_id=node_id,
        node_label=node_label,
        node_type=node_type,
        sequence=sequence,
        status=status,
        attempt_count=attempt_count,
        duration_ms=_duration_ms(started_at, finished_at),
        started_at=started_at,
        finished_at=finished_at,
        error_class=error_class,
        error_message=error_message,
        token_estimate=_estimate_tokens(resolved_output),
        output_summary=_summarize_output(resolved_output),
    )


def _failure_result(
    payload: WorkflowPayload,
    started_at: datetime,
    logs: list[WorkflowRunLog],
    executed_nodes: list[str],
    node_outputs: dict[str, object],
    node_executions: list[WorkflowNodeExecution],
    error_message: str,
    failed_node_id: str | None = None,
) -> WorkflowRunResult:
    finished_at = datetime.now(timezone.utc)
    summary = WorkflowRunSummary(
        workflow_id=payload.workflow_id,
        run_id=payload.run_id,
        workflow_name=payload.workflow_name,
        node_count=len(payload.nodes),
        edge_count=len(payload.edges),
        executed_nodes=executed_nodes,
        trigger_source=payload.trigger_source,
        request_correlation_id=payload.request_correlation_id,
    )

    output = _with_correlation(
        payload,
        {
            "summary_text": f"{payload.workflow_name} failed after {len(executed_nodes)} completed steps.",
            "executed_nodes": executed_nodes,
            "failed_node_id": failed_node_id,
            "error": error_message,
            "trigger_source": payload.trigger_source,
            "node_outputs": node_outputs,
        },
    )

    return WorkflowRunResult(
        status="failed",
        started_at=started_at,
        finished_at=finished_at,
        summary=summary,
        output=output,
        logs=logs,
        node_executions=node_executions,
    )


def run_workflow(payload: WorkflowPayload) -> WorkflowRunResult:
    started_at = datetime.now(timezone.utc)
    node_map = {node.id: node for node in payload.nodes}
    adjacency, indegree = _build_graph(payload)
    queue = deque(_root_node_ids(payload, indegree))
    settings = _execution_settings(payload)

    max_node_retries = int(settings["max_node_retries"])
    retry_backoff_seconds = float(settings["retry_backoff_seconds"])
    max_run_seconds = float(settings["max_run_seconds"])
    deadline = monotonic() + max_run_seconds if max_run_seconds > 0 else None

    logs: list[WorkflowRunLog] = [
        WorkflowRunLog(
            message="Workflow accepted by FlowHolt engine.",
            payload=_with_correlation(
                payload,
                {
                    "workflow_id": payload.workflow_id,
                    "run_id": payload.run_id,
                    "workflow_name": payload.workflow_name,
                    "node_count": len(payload.nodes),
                    "edge_count": len(payload.edges),
                    "max_node_retries": max_node_retries,
                    "max_run_seconds": max_run_seconds,
                },
            ),
        )
    ]

    executed_nodes: list[str] = []
    node_outputs: dict[str, object] = {}
    node_executions: list[WorkflowNodeExecution] = []
    context = ExecutionContext(node_outputs={}, previous_output={})
    visited: set[str] = set()
    sequence = 1

    while queue:
        if deadline and monotonic() > deadline:
            timeout_message = "Run timed out before all reachable nodes could execute."
            logs.append(
                WorkflowRunLog(
                    level="error",
                    message=timeout_message,
                    payload=_with_correlation(
                        payload,
                        {
                            "executed_nodes": executed_nodes,
                            "max_run_seconds": max_run_seconds,
                        },
                    ),
                )
            )
            return _failure_result(
                payload,
                started_at,
                logs,
                executed_nodes,
                node_outputs,
                node_executions,
                timeout_message,
            )

        node_id = queue.popleft()
        if node_id in visited or node_id not in node_map:
            continue

        node = node_map[node_id]
        max_attempts = max_node_retries + 1
        attempt = 1
        result = None
        node_started_at = datetime.now(timezone.utc)

        while attempt <= max_attempts:
            try:
                result = execute_node(node, payload, sequence, context)
                break
            except Exception as error:
                error_text = str(error)
                is_last_attempt = attempt >= max_attempts
                logs.append(
                    WorkflowRunLog(
                        node_id=node.id,
                        level="error" if is_last_attempt else "warn",
                        message=(
                            f"Node {node.label} failed on attempt {attempt}/{max_attempts}."
                            if not is_last_attempt
                            else f"Node {node.label} failed after {max_attempts} attempts."
                        ),
                        payload=_with_correlation(
                            payload,
                            {
                                "node_id": node.id,
                                "attempt": attempt,
                                "max_attempts": max_attempts,
                                "error": error_text,
                            },
                        ),
                    )
                )

                if is_last_attempt:
                    node_finished_at = datetime.now(timezone.utc)
                    node_executions.append(
                        _node_execution(
                            node_id=node.id,
                            node_label=node.label,
                            node_type=node.type,
                            sequence=sequence,
                            status="failed",
                            attempt_count=attempt,
                            started_at=node_started_at,
                            finished_at=node_finished_at,
                            output={},
                            error_class=error.__class__.__name__,
                            error_message=error_text,
                        )
                    )
                    return _failure_result(
                        payload,
                        started_at,
                        logs,
                        executed_nodes,
                        node_outputs,
                        node_executions,
                        error_text,
                        failed_node_id=node.id,
                    )

                backoff_seconds = retry_backoff_seconds * attempt
                if backoff_seconds > 0:
                    sleep(backoff_seconds)

                if deadline and monotonic() > deadline:
                    timeout_message = f"Run timed out while retrying node {node.label}."
                    logs.append(
                        WorkflowRunLog(
                            node_id=node.id,
                            level="error",
                            message=timeout_message,
                            payload=_with_correlation(
                                payload,
                                {
                                    "node_id": node.id,
                                    "attempt": attempt,
                                    "max_run_seconds": max_run_seconds,
                                },
                            ),
                        )
                    )
                    node_finished_at = datetime.now(timezone.utc)
                    node_executions.append(
                        _node_execution(
                            node_id=node.id,
                            node_label=node.label,
                            node_type=node.type,
                            sequence=sequence,
                            status="failed",
                            attempt_count=attempt,
                            started_at=node_started_at,
                            finished_at=node_finished_at,
                            output={},
                            error_class="TimeoutError",
                            error_message=timeout_message,
                        )
                    )
                    return _failure_result(
                        payload,
                        started_at,
                        logs,
                        executed_nodes,
                        node_outputs,
                        node_executions,
                        timeout_message,
                        failed_node_id=node.id,
                    )

                attempt += 1

        if result is None:
            node_finished_at = datetime.now(timezone.utc)
            node_executions.append(
                _node_execution(
                    node_id=node.id,
                    node_label=node.label,
                    node_type=node.type,
                    sequence=sequence,
                    status="failed",
                    attempt_count=attempt,
                    started_at=node_started_at,
                    finished_at=node_finished_at,
                    output={},
                    error_class="RuntimeError",
                    error_message=f"Node {node.label} did not produce a result.",
                )
            )
            return _failure_result(
                payload,
                started_at,
                logs,
                executed_nodes,
                node_outputs,
                node_executions,
                f"Node {node.label} did not produce a result.",
                failed_node_id=node.id,
            )

        node_finished_at = datetime.now(timezone.utc)
        node_executions.append(
            _node_execution(
                node_id=node.id,
                node_label=node.label,
                node_type=node.type,
                sequence=sequence,
                status="succeeded",
                attempt_count=attempt,
                started_at=node_started_at,
                finished_at=node_finished_at,
                output=result.output,
            )
        )

        visited.add(node.id)
        executed_nodes.append(node.id)
        logs.extend(result.logs)
        node_outputs[node.id] = result.output
        context.node_outputs = node_outputs
        context.previous_output = result.output
        sequence += 1

        next_edges = _choose_next_edges(node.type, node.id, result.output, adjacency)
        if node.type == "condition" and next_edges:
            logs.append(
                WorkflowRunLog(
                    node_id=node.id,
                    level="info",
                    message=f"Condition routed the flow to {', '.join(edge.target for edge in next_edges)}.",
                    payload=_with_correlation(
                        payload,
                        {
                            "branch": result.output.get("branch", "default-continue"),
                            "targets": [edge.target for edge in next_edges],
                            "edges": [
                                {
                                    "target": edge.target,
                                    "label": edge.label,
                                    "branch": edge.branch,
                                }
                                for edge in next_edges
                            ],
                        },
                    ),
                )
            )

        for edge in next_edges:
            if edge.target not in visited:
                queue.append(edge.target)

    skipped_nodes = [node.id for node in payload.nodes if node.id not in visited]
    if skipped_nodes:
        logs.append(
            WorkflowRunLog(
                level="warn",
                message="Some nodes were not executed because they were unreachable from the active route.",
                payload=_with_correlation(
                    payload,
                    {
                        "skipped_nodes": skipped_nodes,
                    },
                ),
            )
        )

    finished_at = datetime.now(timezone.utc)
    summary = WorkflowRunSummary(
        workflow_id=payload.workflow_id,
        run_id=payload.run_id,
        workflow_name=payload.workflow_name,
        node_count=len(payload.nodes),
        edge_count=len(payload.edges),
        executed_nodes=executed_nodes,
        trigger_source=payload.trigger_source,
        request_correlation_id=payload.request_correlation_id,
    )

    output = _with_correlation(
        payload,
        {
            "summary_text": f"{payload.workflow_name} completed {len(executed_nodes)} steps.",
            "executed_nodes": executed_nodes,
            "skipped_nodes": skipped_nodes,
            "last_node_id": executed_nodes[-1] if executed_nodes else None,
            "trigger_source": payload.trigger_source,
            "node_outputs": node_outputs,
        },
    )

    return WorkflowRunResult(
        status="succeeded",
        started_at=started_at,
        finished_at=finished_at,
        summary=summary,
        output=output,
        logs=logs,
        node_executions=node_executions,
    )

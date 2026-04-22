# FlowHolt Testing, Quality Assurance, and Evaluation Specification

> **Status:** New file created 2026-04-17  
> **Direction:** FlowHolt combines n8n's evaluation framework with Make's data pinning patterns and adds workflow-level testing primitives. Testing must be a first-class product surface, not an afterthought.  
> **Vault:** [[wiki/concepts/studio-anatomy]], [[wiki/concepts/execution-model]]  
> **Raw sources:**  
> - n8n evaluations: `research/n8n-docs-export/pages_markdown/advanced-ai/evaluation/` (overview, metrics, examples)  
> - n8n data pinning: `research/n8n-docs-export/pages_markdown/data/data-pinning.md`  
> - n8n partial executions: `research/n8n-docs-export/pages_markdown/workflows/executions/` (debug, partial)  
> - Make testing patterns: `research/make-pdf-full.txt` §Testing and Debug  
> **See also:** `50-FLOWHOLT-EXPRESSION-AND-DATA-MODEL-SPEC.md` (data pinning) | `44-FLOWHOLT-ERROR-HANDLING-AND-RESILIENCE-SPEC.md`  

---

## 1. Testing Philosophy

Workflow platforms have a testing gap: users build complex automations but have no systematic way to verify correctness before deploying to production. FlowHolt closes this gap at three levels:

| Level | What | How |
|-------|------|-----|
| **Manual testing** | Run workflow in Studio, inspect output | Data pinning, partial execution, step-by-step mode |
| **Automated testing** | Pre-deployment checks | Evaluation framework (light + metric-based), regression tests |
| **Production monitoring** | Runtime correctness | Metric evaluations, anomaly detection, execution comparison |

---

## 2. Data Pinning

### Purpose

Save a snapshot of a node's output for reuse during development. Avoids re-triggering external APIs (email sends, Stripe charges, webhook calls) while iterating on downstream logic.

### How It Works

1. Execute workflow manually in Studio
2. Click "Pin output" on any node's OUTPUT panel
3. Pinned data (`FlowItem[]`) is saved to database
4. Node shows pin badge (📌) on canvas
5. Future Studio runs skip pinned nodes — use saved output directly
6. Downstream nodes run normally against pinned data

### Pin Data Model

```python
class PinnedData:
    id: str                     # UUID
    workflow_id: str
    node_id: str
    user_id: str                # per-user pins (not shared by default)
    data: list[FlowItem]        # the pinned output items
    pinned_at: datetime
    source_execution_id: str    # which execution produced this data
    item_count: int
    data_size_bytes: int
```

### Pin Rules

| Rule | Behavior |
|------|----------|
| Pin scope | Per-user, per-workflow-draft |
| Max pin size | 5 MB per node |
| Max pins per workflow | 50 nodes |
| Pin + edit | Editing a pinned node marks it "dirty" — pin data may be stale |
| Pin + production | Pins are development-only. Warning on publish if pins exist. Never used in production execution. |
| Pin + trigger | Trigger nodes can be pinned (replays trigger data without external event) |
| Pin + error | If node errored, pin the error output (useful for testing error branches) |

### Dirty Node Detection

When a node's configuration changes after pinning:
- Node shows amber warning badge alongside pin badge
- Tooltip: "This node was modified since data was pinned. Pin data may be outdated."
- User can: re-run and re-pin, or keep stale pin

---

## 3. Partial Execution (Step-by-Step Mode)

### Purpose

Execute a workflow up to a specific node, then stop. Inspect intermediate state without running the full workflow.

### How It Works

1. Right-click a node in Studio → "Execute up to here"
2. Execution runs from trigger (or pinned trigger data) through to the selected node
3. All nodes up to target execute normally
4. Nodes after target are not executed
5. Output appears in inspector for all executed nodes

### Execute From Here

Complementary to "Execute up to here":

1. Right-click a node → "Execute from here"
2. Requires: the selected node has pinned data OR upstream nodes have been run
3. Executes from the selected node onward using available input data
4. Useful for re-running just the tail of a workflow after fixing a node

### Partial Execution Indicators

- Executed nodes: green check badge
- Skipped nodes: grey dashed border
- Failed nodes: red X badge
- Current target node: blue highlight border

---

## 4. Evaluation Framework

### Overview

Evaluations are automated tests for workflows. Inspired by n8n's evaluation system, adapted for FlowHolt's broader workflow types (not just AI).

### Two Evaluation Types

| Type | Audience | When | Purpose |
|------|----------|------|---------|
| **Light evaluation** | Builders during development | Pre-deployment | Verify workflow produces expected output for known inputs |
| **Metric evaluation** | Ops teams in production | Ongoing monitoring | Score production executions against quality metrics |

---

## 5. Light Evaluations (Pre-Deployment Testing)

### Concept

A light evaluation is a test suite for a workflow: given a set of input data, does the workflow produce the expected output?

### Test Case Structure

```python
class EvaluationTestCase:
    id: str
    evaluation_id: str
    name: str                           # "Happy path - standard order"
    input_data: list[FlowItem]          # trigger input
    expected_output: dict               # expected final output (partial match)
    match_mode: str                     # "exact" | "contains" | "schema" | "custom"
    timeout_seconds: int = 60
    tags: list[str] = []                # categorize: "happy_path", "edge_case", "regression"
```

### Match Modes

| Mode | Behavior | Use When |
|------|----------|----------|
| `exact` | Output must exactly match `expected_output` | Deterministic transformations |
| `contains` | Output must contain all keys/values from `expected_output` (extra keys OK) | Transformations that add metadata |
| `schema` | Output must match a JSON Schema | Variable outputs (API responses, timestamps) |
| `custom` | User-defined expression evaluates to true/false | Complex validation logic |

### Custom Match Expression

```javascript
// Example: verify output has more than 3 items and all have email field
{{ $output.length > 3 && $output.every(item => item.json.email) }}
```

### Test Suite Definition

```python
class Evaluation:
    id: str
    workflow_id: str
    name: str                           # "Order Processing Tests"
    description: str
    test_cases: list[EvaluationTestCase]
    created_by: str
    created_at: datetime
    last_run_at: datetime
    last_run_status: str                # "passed" | "failed" | "partial"
```

### Running Light Evaluations

1. From Studio: "Run evaluation" button in test panel
2. FlowHolt executes the workflow once per test case
3. Each test case injects its `input_data` as trigger data
4. Captures final output, compares against `expected_output` using `match_mode`
5. Reports: pass/fail per test case, overall pass rate, execution time

### Creating Test Cases

Three ways to create test cases:

1. **From execution history**: Browse past executions → "Save as test case" → captures input + output
2. **From pinned data**: Use pinned trigger data as input, pinned final output as expected
3. **Manual**: Define input/output JSON in the evaluation editor

### Evaluation Results UI

```
Route: /workspace/:id/workflows/:wf_id/evaluations
```

| Column | Content |
|--------|---------|
| Test case name | "Happy path - standard order" |
| Status | ✅ Pass / ❌ Fail / ⏱️ Timeout |
| Duration | 1.2s |
| Match details | Diff view for failed tests |
| Last run | 2026-04-17 14:32 |

---

## 6. Metric-Based Evaluations (Production Monitoring)

### Concept

Score production executions automatically against quality metrics. Catches regressions and quality degradation over time.

### How It Works

1. Define a metric evaluation: select a workflow + scoring criteria
2. FlowHolt periodically takes a sample of recent executions
3. For each execution, a scoring workflow (evaluator) runs to assess quality
4. Scores are aggregated and tracked over time
5. Alerts trigger when scores drop below threshold

### Metric Evaluation Structure

```python
class MetricEvaluation:
    id: str
    workflow_id: str                    # workflow being evaluated
    evaluator_workflow_id: str          # workflow that does the scoring
    name: str
    schedule: str                       # cron expression (how often to evaluate)
    sample_size: int                    # how many recent executions to sample
    threshold: float                    # minimum acceptable score (0-1)
    alert_on_below: bool                # trigger alert when below threshold
```

### Predefined Scoring Metrics

| Metric | What It Measures | Score |
|--------|-----------------|-------|
| **Completeness** | Did the workflow produce output for all input items? | output_count / input_count |
| **Error rate** | What fraction of recent executions failed? | 1 - (failures / total) |
| **Latency** | Average execution duration vs baseline | baseline_ms / actual_ms (capped at 1) |
| **Output validity** | Do outputs match expected schema? | valid_outputs / total_outputs |
| **Consistency** | How similar are outputs across runs for same input? | cosine_similarity(outputs) |

### Custom Scoring Workflows

For AI workflows or complex quality assessment:

1. Create a workflow starting with "Evaluation Trigger" node
2. This workflow receives: `{execution_input, execution_output, execution_metadata}`
3. The workflow scores the execution (can use LLM for AI quality assessment)
4. Final node outputs: `{score: 0-1, reason: "...", details: {...}}`

### Metric Dashboard

```
Route: /workspace/:id/workflows/:wf_id/evaluations/metrics
```

- Line chart: score over time (daily/weekly/monthly)
- Score distribution histogram
- Lowest-scoring executions list (click to inspect)
- Alert history

---

## 7. Regression Testing

### Purpose

Prevent regressions when editing workflows: ensure changes don't break existing behavior.

### Pre-Publish Regression Check

When a user attempts to promote a workflow (draft → staging → production):

1. If evaluations exist for this workflow → automatically run all light evaluations
2. All tests must pass before promotion proceeds
3. Failed tests → block promotion with detailed failure report
4. User can override (with appropriate permission) and add justification

### Configuration

| Setting | Options | Default | Scope |
|---------|---------|---------|-------|
| Require evaluations before publish | On/Off | Off | Workspace |
| Block on failure | Block / Warn / Off | Warn | Workspace |
| Allow override | By role | Admin + Builder | Workspace |

---

## 8. Execution Comparison

### Purpose

Compare two executions of the same workflow side-by-side to identify differences.

### Compare View

- Split panel: Execution A (left) vs Execution B (right)
- Node-by-node comparison:
  - Green: same output
  - Orange: different output
  - Red: one failed, other succeeded
- Diff view for JSON output per node
- Timeline comparison (duration per node)

### Use Cases

1. **Debug regression**: Compare a passing execution vs a failing one
2. **Validate fix**: Compare before-fix vs after-fix execution
3. **Environment comparison**: Compare staging vs production execution

---

## 9. Test Data Management

### Test Data Sets

Reusable input data sets for testing:

```python
class TestDataSet:
    id: str
    workspace_id: str
    name: str                   # "Sample Orders - 10 items"
    description: str
    data: list[FlowItem]       # the test data
    tags: list[str]
    created_by: str
    created_at: datetime
```

### Test Data Sources

| Source | How |
|--------|-----|
| From execution | Save execution input as test data set |
| From pinned data | Export pins to test data set |
| Manual entry | JSON editor |
| CSV import | Upload CSV → convert to FlowItem[] |
| Generate | Define schema → generate N random items |

### Test Data UI

```
Route: /workspace/:id/settings/test-data
```

- List of saved test data sets
- Preview data (table view)
- Edit data
- Use in evaluations

---

## 10. Debug Mode

### Purpose

Enhanced execution mode in Studio that captures detailed intermediate state.

### What Debug Mode Captures (beyond normal execution)

| Data | Normal Mode | Debug Mode |
|------|-------------|------------|
| Node input/output | ✅ | ✅ |
| Expression evaluation details | ❌ | ✅ (each expression → value + type) |
| Timing per node | ✅ (total) | ✅ (per-item breakdown) |
| HTTP request/response | ❌ (result only) | ✅ (full request + headers + body) |
| Retry attempts | Count only | Full attempt log with error per attempt |
| Memory usage | ❌ | ✅ (per-node memory delta) |
| Binary data preview | Metadata only | Thumbnail/preview where possible |

### Debug Panel

Activated via toggle in Studio toolbar. When enabled:
- Execution captures extra telemetry
- Performance may be slightly slower
- Debug data stored for 24 hours (not persisted in execution history)

---

## 11. Workflow Validation

### Static Analysis (No Execution)

Pre-execution checks that catch errors before running:

| Check | What It Catches | Severity |
|-------|----------------|----------|
| Disconnected nodes | Nodes not connected to any path from trigger | Warning |
| Missing required fields | Required node fields with no value or expression | Error |
| Invalid expressions | Syntax errors in `{{ }}` expressions | Error |
| Missing connections | Nodes referencing connections that don't exist or are expired | Error |
| Circular dependencies | Loops without proper loop node | Error |
| Unreachable branches | Conditional branches that can never execute (dead code) | Warning |
| Type mismatches | Expression result type doesn't match field type (when detectable statically) | Warning |
| Missing error handler | Nodes making external calls without error handling | Info |

### Validation Trigger Points

| When | Automatic | Blocking |
|------|-----------|----------|
| On save (draft) | ✅ | No (save always succeeds) |
| On manual run | ✅ | Yes (errors block, warnings show) |
| On publish/promote | ✅ | Yes (configurable by workspace) |
| On demand | User clicks "Validate" button | Shows report |

### Validation Results UI

- Inline indicators on canvas (red/amber/blue badges per node)
- Validation panel (bottom drawer) with full list
- Click issue → navigate to node + field
- "Auto-fix" suggestions for common issues (e.g., "Connect this node to...")

---

## 12. Database Schema

```sql
-- Evaluations (test suites)
CREATE TABLE evaluations (
    id UUID PRIMARY KEY,
    workflow_id UUID NOT NULL REFERENCES workflows(id),
    name TEXT NOT NULL,
    description TEXT,
    evaluation_type VARCHAR(20) NOT NULL,  -- "light" | "metric"
    config JSONB NOT NULL,                  -- type-specific config
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Test cases (for light evaluations)
CREATE TABLE evaluation_test_cases (
    id UUID PRIMARY KEY,
    evaluation_id UUID NOT NULL REFERENCES evaluations(id),
    name TEXT NOT NULL,
    input_data JSONB NOT NULL,              -- FlowItem[] as JSON
    expected_output JSONB,                  -- expected result
    match_mode VARCHAR(20) DEFAULT 'contains',
    custom_expression TEXT,                 -- for match_mode = "custom"
    timeout_seconds INT DEFAULT 60,
    tags TEXT[],
    sort_order INT DEFAULT 0
);

-- Evaluation runs
CREATE TABLE evaluation_runs (
    id UUID PRIMARY KEY,
    evaluation_id UUID NOT NULL REFERENCES evaluations(id),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'running',   -- running, passed, failed, partial, error
    total_cases INT,
    passed_cases INT DEFAULT 0,
    failed_cases INT DEFAULT 0,
    triggered_by UUID REFERENCES users(id)
);

-- Per-test-case results
CREATE TABLE evaluation_run_results (
    id UUID PRIMARY KEY,
    run_id UUID NOT NULL REFERENCES evaluation_runs(id),
    test_case_id UUID NOT NULL REFERENCES evaluation_test_cases(id),
    status VARCHAR(20) NOT NULL,            -- passed, failed, timeout, error
    actual_output JSONB,
    diff JSONB,                             -- structured diff for failed cases
    execution_id UUID,                      -- linked execution
    duration_ms INT,
    error_message TEXT
);

-- Metric evaluation scores
CREATE TABLE metric_evaluation_scores (
    id UUID PRIMARY KEY,
    evaluation_id UUID NOT NULL REFERENCES evaluations(id),
    scored_at TIMESTAMPTZ DEFAULT NOW(),
    execution_id UUID NOT NULL,             -- the execution being scored
    score FLOAT NOT NULL,                   -- 0.0 to 1.0
    metric_name VARCHAR(50),
    reason TEXT,
    details JSONB
);

CREATE INDEX idx_metric_scores_eval_time ON metric_evaluation_scores(evaluation_id, scored_at DESC);

-- Test data sets
CREATE TABLE test_data_sets (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES workspaces(id),
    name TEXT NOT NULL,
    description TEXT,
    data JSONB NOT NULL,                    -- FlowItem[] as JSON
    item_count INT,
    data_size_bytes INT,
    tags TEXT[],
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pinned data
CREATE TABLE pinned_data (
    id UUID PRIMARY KEY,
    workflow_id UUID NOT NULL REFERENCES workflows(id),
    node_id VARCHAR(100) NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    data JSONB NOT NULL,                    -- FlowItem[] as JSON
    source_execution_id UUID,
    item_count INT,
    data_size_bytes INT,
    pinned_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_pinned_data_unique ON pinned_data(workflow_id, node_id, user_id);
```

---

## 13. Implementation Phases

### Phase 1 — Manual Testing Foundations

- [ ] Data pinning (pin/unpin node output in Studio)
- [ ] Pin badge on canvas + stale pin warning
- [ ] Partial execution ("Execute up to here")
- [ ] Dirty node detection (modified since last pin/run)
- [ ] Basic workflow validation (disconnected nodes, missing fields, invalid expressions)
- [ ] Validation indicators on canvas

### Phase 2 — Evaluation Framework

- [ ] Light evaluation engine (test suite definition, execution, comparison)
- [ ] Test case creation from execution history
- [ ] Evaluation results UI with diff view
- [ ] Test data sets (create, manage, reuse)
- [ ] "Execute from here" (partial tail execution)
- [ ] Execution comparison (side-by-side diff)
- [ ] Debug mode toggle (enhanced telemetry capture)
- [ ] Pre-publish regression check (configurable)

### Phase 3 — Production Monitoring

- [ ] Metric evaluation engine (periodic scoring)
- [ ] Predefined scoring metrics (completeness, error rate, latency, validity, consistency)
- [ ] Custom scoring workflows
- [ ] Metric dashboard (score over time, distribution, alerts)
- [ ] CSV import for test data
- [ ] Test data generation from schema
- [ ] Evaluation API (run evaluations from CI/CD)

---

## Related Files

- `50-FLOWHOLT-EXPRESSION-AND-DATA-MODEL-SPEC.md` — data pinning design
- `44-FLOWHOLT-ERROR-HANDLING-AND-RESILIENCE-SPEC.md` — error types tested against
- `43-FLOWHOLT-ENVIRONMENT-AND-DEPLOYMENT-LIFECYCLE.md` — publish flow (regression gates)
- `07-FLOWHOLT-STUDIO-SURFACE-SPEC-SKELETON.md` — Studio UX for testing
- `41-FLOWHOLT-OBSERVABILITY-AND-ANALYTICS-SPEC.md` — execution metrics
- [[wiki/concepts/execution-model]] — execution states and lifecycle
- [[wiki/concepts/studio-anatomy]] — Studio surfaces for test UI

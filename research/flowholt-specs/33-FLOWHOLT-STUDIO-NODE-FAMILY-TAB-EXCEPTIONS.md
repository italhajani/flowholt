# FlowHolt Studio Node-Family Tab Exceptions And Workflow-Level Overrides

This file refines the general tab-role-state model from `30-FLOWHOLT-STUDIO-TAB-ROLE-STATES-AND-MAPPING.md` into exact per-node-family tab exceptions and workflow-level override rules.

It is grounded in:
- `27-FLOWHOLT-NODE-TYPE-FIELD-INVENTORY.md` (exact field keys and sensitivity classes)
- `30-FLOWHOLT-STUDIO-TAB-ROLE-STATES-AND-MAPPING.md` (baseline tab-state model)
- `backend/app/node_registry.py` (real field definitions)
- `src/components/studio/NodeConfigPanel.tsx` (current inspector behavior)
- Make help-center evidence:
  - `module-settings.md` (standard vs advanced fields, required vs optional, data types)
  - `scenario-settings.md` (sequential processing, data is confidential, incomplete executions, auto commit)
  - `ai-agents-configuration.md` (system prompt, context, MCP, tools, testing & training)
  - `manage-ai-agents.md` (agent settings: model, max tokens, max steps, max history)
  - `scenario-run-replay.md` (run with existing data, replay from history)
- Make UI image evidence (bottom operating strip with `Run once`, replay dropdown, and settings icons)
- **Make editor UI crawl** (2026-04-14): `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md` — AI module packages, bottom toolbar buttons, AI copilot button, inspector test IDs

---

## Cross-Reference Map

### This file is grounded in (raw sources)

| Section | Raw source | Key content |
|---------|-----------|-------------|
| Module settings field catalog | `research/make-help-center-export/pages_markdown/module-settings.md` | Standard vs advanced fields, required/optional, data types, read-only conditions |
| Workflow-level confidentiality | `research/make-help-center-export/pages_markdown/scenario-settings.md` | Sequential processing, data is confidential flag, incomplete execution behavior |
| AI agent configuration fields | `research/make-help-center-export/pages_markdown/ai-agents-configuration.md` | System prompt, context window, MCP server config, tools config, testing fields |
| AI agent settings | `research/make-help-center-export/pages_markdown/manage-ai-agents.md` | Model selector, max tokens, max steps, max history |
| Replay evidence | `research/make-help-center-export/pages_markdown/scenario-run-replay.md` | Run with existing data, replay from history |
| n8n Wait node form resume | `research/n8n-docs-export/pages_markdown/integrations__builtin__core-nodes__n8n-nodes-base_wait.md` | Form-based resume mode, custom fields, form ending |
| n8n Form mid-flow node | `research/n8n-docs-export/pages_markdown/integrations__builtin__core-nodes__n8n-nodes-base_form.md` | Multi-step form creation, JSON field definition, custom CSS |
| n8n node parameter types | `research/n8n-docs-export/pages_markdown/integrations__builtin__core-nodes__n8n-nodes-base_set.md` | Field type definitions used in practice |
| Node field inventory | `27-FLOWHOLT-NODE-TYPE-FIELD-INVENTORY.md` | Field keys and sensitivity classes per node family |
| Baseline tab-state model | `30-FLOWHOLT-STUDIO-TAB-ROLE-STATES-AND-MAPPING.md` | Tab-state outcomes and role rules |

### Key n8n source code files

| Feature | n8n source file |
|---------|----------------|
| Node parameter types | `n8n-master/packages/workflow/src/Interfaces.ts` → `INodeProperties`, `INodePropertyTypes` |
| Display conditions | `n8n-master/packages/workflow/src/NodeHelpers.ts` → `displayParameterPath` |
| Node settings UI | `n8n-master/packages/editor-ui/src/components/NodeSettings.vue` |
| Parameter component map | `n8n-master/packages/editor-ui/src/components/ParameterInputFull.vue` |
| AI agent node definition | `n8n-master/packages/nodes-langchain/nodes/agents/Agent/` |
| Wait node definition | `n8n-master/packages/nodes-base/nodes/Wait/Wait.node.ts` |

### n8n comparison

| Feature | n8n | FlowHolt |
|---------|-----|----------|
| Conditional field display | `displayOptions.show/hide` per parameter in node definition | Visibility rules in `node_registry.py`; sensitivity classes M0–S2 |
| AI node tab layout | Single settings panel with sub-node attachment slots | Separate Tools, Knowledge, Runtime tabs for AI agent root node |
| Human/pause nodes | Wait node with 4 resume modes; no dedicated human node | Separate Delay, Human (with assignee/due), and Callback node types |
| Credential field exceptions | `credentialsSelect` type; fully hidden when not owner | Vault asset reference chip; visibility governed by `VaultAssetCapabilities.reveal` |
| Workflow-level confidentiality | `redact_production_execution_data` env flag | `data_is_confidential` workspace policy; payload masking per execution category |

### This file feeds into

| File | What it informs |
|------|----------------|
| `34-FLOWHOLT-CAPABILITY-BUNDLE-PAYLOADS-AND-DENIAL.md` | Per-node-family tab exceptions inform capability bundle field list |
| `26-FLOWHOLT-STUDIO-OBJECT-FIELD-CATALOG-DRAFT.md` | Field catalog extensions for AI and pause node families |
| `27-FLOWHOLT-NODE-TYPE-FIELD-INVENTORY.md` | Confirms field key and sensitivity data |

---

## Baseline reminder

The standard tab model is:
- **Parameters** — business logic, primary fields, expression mapping
- **Settings** — retry, timeout, branch metadata, operational knobs
- **Test** — test payload, run-test action, preview, sample output, pinned data

Tab-state outcomes:
- `hidden`, `visible_readonly`, `visible_masked`, `visible_actionable`, `visible_actionable_limited`

This file specifies **where each node family deviates from the baseline** and **where workflow-level policy overrides change tab behavior**.

---

## 1. Trigger family

### Node types: `trigger`

### Parameters tab exceptions

The trigger node has the most complex conditional field tree because of the `source` selector (manual, chat, webhook, schedule, event, form, email). Every source sub-tree has different sensitivity profiles:

| Source | Secret fields (S2) | Exposure controls | M2 fields |
|---|---|---|---|
| manual | — | — | — |
| chat | `chat_basic_password` | `chat_public`, `chat_allowed_origins` | `chat_basic_username`, `chat_initial_messages` |
| webhook | `webhook_secret` | `webhook_path`, `webhook_method` | — |
| schedule | — | — | — |
| event | — | — | — |
| form | — | — | `form_fields` |
| email | — | — | — |
| email (credential) | — (S1 reference) | — | — |

**Viewer exceptions:**
- Chat: `chat_basic_password` → `hidden`. `chat_public` → `visible_readonly`. `chat_allowed_origins` → `visible_readonly`.
- Webhook: `webhook_secret` → `hidden`. `webhook_path` → `visible_readonly`.
- Email: `email_credential` → shows asset reference chip (bound name only, never raw secret).

**Builder exceptions:**
- Chat: `chat_basic_password` → `visible_actionable` but write-only (masked on re-render). `chat_public` → `visible_actionable_limited` (draft-only; publish-time exposure requires publisher capability).
- Webhook: `webhook_secret` → `visible_actionable` but write-only. `webhook_path` → `visible_actionable`.
- Email: `email_credential` → `visible_actionable` (can bind to Vault asset, cannot reveal stored secret).

**Publisher exceptions:**
- Chat: `chat_public` → `visible_actionable` (can change public exposure when workflow policy permits).
- Webhook: All fields actionable including path and auth controls that affect public surface.

### Settings tab exceptions

Trigger nodes have **fewer operational knobs** than data or integration nodes. The Settings tab should:
- Show `respond_immediately` (webhook only) as a runtime behavior toggle
- Show schedule frequency metadata as a summary (read-only for viewers, editable for builders)
- **Not** show retry or timeout here; trigger nodes do not retry in the same way as processing nodes

If the trigger source is `manual`, the Settings tab may be `hidden` entirely since there are no operational settings.

### Test tab exceptions

- For `manual` and `chat` triggers: Test tab is `visible_actionable` — the user can supply a sample payload or use chat preview.
- For `webhook` triggers: Test tab shows sample payload editor and a "test with sample request" action, but **not** a public webhook activation. The Test tab must never activate a production webhook endpoint.
- For `schedule` and `event` triggers: Test tab is `visible_actionable_limited` — the user can preview the next-invocation metadata but cannot force a real scheduled or event-driven execution from here.
- For `form` triggers: Test tab can preview a sample form submission payload.

**Workflow-level override:** When `data_is_confidential` is enabled, the Test tab for triggers should only show "trigger shape" metadata (field names, types), not actual sample payload bodies.

---

## 2. Data and logic family

### Node types: `transform`, `condition`, `filter`, `merge`, `loop`, `code`

### Parameters tab exceptions

These nodes have **no S1 or S2 fields**. All fields are M0, M1, or M2.

**Per-node specifics:**

- **`transform`**: `template` (M2) and `fields_map` (M2) support expression mapping. These are the highest-frequency mapping targets. No secrets involved.
- **`condition`**: `equals` (M2) may contain business-sensitive comparison values. In `visible_readonly` mode, viewers see the comparison but cannot change it. Expression mapping is fully supported on `field` and `equals`.
- **`filter`**: Same as condition. `value` (M2) is the main sensitivity point.
- **`merge`**: Pure structural node. No field-level sensitivity exceptions.
- **`loop`**: `sub_prompt` (M2) and `sub_template` (M2) may contain business logic templates. `max_iterations` (M1) is a safety knob that should appear in Settings rather than Parameters.
- **`code`**: `script` (M2) is the primary field. This field can embed credentials or proprietary logic unintentionally.

**Code node special rule:** The `script` field should carry a runtime warning banner when:
- The workflow has `data_is_confidential` enabled
- The execution preview would show the script output
This does not mask the script itself (that is an authoring field) but governs the preview and test output.

### Settings tab exceptions

All data/logic nodes should expose:
- `output_key` (if present) — should move to Settings to keep Parameters focused on business logic
- `continue_on_error` (loop) — operational behavior
- `batch_size` (loop) — runtime performance knob
- `timeout` (code) — execution safety
- `allowed_modules` and `memory_limit_mb` (code) — sandbox policy

**Viewer state:** All Settings fields → `visible_readonly`.
**Builder state:** All operational fields → `visible_actionable`.
**Publisher state:** Same as builder; no release-adjacent controls on data/logic nodes.

### Test tab exceptions

- All data/logic nodes: Test tab is `visible_actionable` for builders.
- **Code node:** Test output inherits execution redaction policy. If the workflow or environment restricts execution payload visibility, test output is shown as a success/failure summary without full body.
- **Loop node:** Test tab should show iteration count and sample output per iteration, not a single flattened result. A loop-specific preview format is needed.

---

## 3. Output and integration family

### Node types: `output`, `http_request`, `callback`

### Parameters tab exceptions

These nodes have the highest concentration of S1 and S2 fields.

**`output`:**
- `credential` (S1) → asset reference chip. Viewers see bound name only. Builders can rebind. No raw reveal.
- `message` (M2) → business content, fully editable for builders, readonly for viewers.

**`http_request`:**
- `credential` (S1) → asset reference chip.
- `token` (S2), `basic_password` (S2), `api_key_value` (S2) → write-only masked controls. Viewers: `hidden`. Builders: `visible_actionable` but write-only on re-render.
- `basic_user` (M2) → editable for builders, readonly for viewers.
- `body` (M2) → expression mapping supported, can contain sensitive business data.
- `url` (M1) → visible to all roles. Expression mapping supported.

**`callback`:**
- `instructions` (M2) and `choices` (M2) → may contain business-sensitive prompts.
- No S1/S2 fields.

### Settings tab exceptions

**`http_request`:**
- `timeout`, `follow_redirects`, `ignore_ssl`, `proxy_url`, `retry_on_fail`, `max_retries`, `retry_wait_ms` — all operational knobs → Settings tab.
- `ignore_ssl` carries a security implication banner: "Disabling SSL verification may expose requests to interception."
- `proxy_url` (M1) should be visible to builders but flagged as an infrastructure-level control.

**`output`:**
- `format`, `headers`, `include_metadata` → Settings tab.

**`callback`:**
- `timeout_hours`, `timeout_action`, `validate_payload` → Settings tab.
- `timeout_hours` should show a pause-impact badge: "This node creates a runtime pause. See Runtime for active pauses."

### Test tab exceptions

**`http_request`:**
- Test execution makes a **real outbound HTTP request**. The Test tab must carry a persistent warning banner: "Running this test will send a real HTTP request to the configured URL."
- In environments with `require_staging_before_production`, test execution may be gated by `workflowCapabilities.test`.

**`callback`:**
- Test tab creates a **simulated pause**, not a real external callback wait. A banner is required: "Test runs simulate the callback wait. No external system will be notified."

**`output`:**
- Test execution may send a real message (Slack, email, etc.). Same real-side-effect banner as `http_request`.

---

## 4. Pause and human-interaction family

### Node types: `delay`, `human`, `callback` (callback is also listed in output/integration; its pause behavior applies here)

### Parameters tab exceptions

**`delay`:**
- All fields are M1. No sensitivity exceptions.
- `delay_expression` supports expression mapping.

**`human`:**
- `instructions` (M2), `choices` (M2), `assignee_email` (M2) — business-sensitive.
- `escalation_email` (M2) — may contain PII-adjacent data.
- `show_context` (R1) — inherits execution visibility rules. If the workflow has `data_is_confidential`, this field's runtime output is redacted.

**Viewer state:** All M2 fields → `visible_readonly`. `show_context` → `visible_masked` (shows "runtime context will be provided" without body).
**Builder state:** All fields → `visible_actionable`.

### Settings tab exceptions

**`delay`:**
- `webhook_resume`, `resume_url`, `timeout_action` → Settings tab.
- `resume_url` is an exposure-adjacent field (it creates an externally reachable endpoint). Publisher capability required for production environments.

**`human`:**
- `require_comment`, `auto_approve_hours` → Settings tab.
- `auto_approve_hours` should carry a governance warning: "Auto-approval bypasses human review after the configured timeout."

### Test tab exceptions

Both `delay` and `human` nodes produce pauses. The Test tab must:
- Show a **pause-impact banner**: "Test runs for this node type create a simulated pause. Actual delays, callback waits, and human tasks are not created during test execution."
- Show simulated elapsed-time metadata instead of real wait.
- For `human` nodes, show the task shape (title, choices, assignee) as a preview but do not create a real human task.

### Operational badge

All pause-producing nodes (`delay`, `human`, `callback`) should display a persistent **runtime obligation badge** in the inspector header:
- Icon: clock or user-check
- Label: "Creates runtime pause"
- Tooltip: links to `/dashboard/runtime/pauses` for operational management

---

## 5. Core AI family

### Node types: `llm`, `ai_agent`

### Parameters tab exceptions

**`llm`:**
- `credential` (S1) → asset reference chip.
- `api_key` (S2) → write-only masked control in Advanced section. Viewers: `hidden`. Builders: `visible_actionable` but write-only.
- `system_message` (M2), `messages` (M2), `prompt` (M2) → business content. Expression mapping fully supported.
- Model parameters (`temperature`, `max_tokens`, etc.) are M1 and belong in the **Model Parameters** collapsible group within Parameters.

**`ai_agent`:**
- `credential_id` (S1) → asset reference chip.
- `prompt` (M2), `system_message` (M2), `sub_agents_json` (M2), `memory_session_key` (M2) → business content.
- `return_intermediate_steps` (R1) → runtime-derived. The plan must keep this separate from reasoning visibility.
- `tools` (M1) → tool list is structural, not sensitive.

**Make evidence alignment:**
Make's AI agent configuration separates: System prompt · Context · MCP · Tools · Testing & Training. FlowHolt's Parameters tab should mirror this grouping for `ai_agent` nodes:
1. **Prompt & Instructions** group (prompt, system_message)
2. **Model & Provider** group (provider, credential_id, model, temperature, etc.)
3. **Tools & Capabilities** group (tools, allow_code_execution, allow_web_search, etc.)
4. **Memory** group (memory_enabled, memory_type, memory_window, memory_session_key)
5. **Cluster / Sub-Agents** group (sub_agents_json, delegation_strategy)

This grouping should be enforced at the inspector section level, not left to field ordering.

### Settings tab exceptions

**`llm`:**
- `streaming`, `timeout`, `base_url`, `metadata` → Settings.
- `base_url` is an infrastructure-level field. Show provider-context help.

**`ai_agent`:**
- `max_iterations`, `return_intermediate_steps`, `output_format`, `output_key` → Settings.
- `max_iterations` parallels Make's "Maximum steps" agent setting.
- `return_intermediate_steps` triggers a policy fork: enabling this on production workflows with `data_is_confidential` should show a governance warning.

### Test tab exceptions

**AI trace separation rule (critical):**

The Test tab for AI nodes must render three distinct content tiers:

| Tier | Content | Default visibility | Policy override |
|---|---|---|---|
| **Result** | Final model output (text, JSON, structured) | Always visible to testers | Redacted if `data_is_confidential` |
| **Trace summary** | Tool calls made, iteration count, token usage, latency | Visible to builders | Visible to viewers if workflow allows |
| **Raw reasoning** | Full chain-of-thought, intermediate step payloads, raw tool I/O | Hidden by default | Requires `executionCapabilities.viewRawReasoning` |

This three-tier model prevents accidental exposure of reasoning chains while keeping test results useful.

**`ai_agent` cluster children:**
When testing an `ai_agent` node, the Test tab should show which cluster children (model, memory, tool, output_parser) participated in the execution and their individual status.

**Make evidence alignment:**
Make's "Testing & Training" shows tool usage, inputs, and outputs during agent testing. FlowHolt should match this with trace summary but gate raw reasoning behind explicit capability.

---

## 6. AI specialist family

### Node types: `ai_summarize`, `ai_extract`, `ai_classify`, `ai_sentiment`, `ai_chat_model`, `ai_memory`, `ai_tool`, `ai_output_parser`

**Make crawl evidence** — AI module package mapping (from `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md`, section 6):

| Make package | Make modules | FlowHolt node type |
|---|---|---|
| `ai-tools` | Ask, AnalyzeSentiment, Categorize, CountAndChunkText, DetectLanguage, Extract, Standardize, Summarize, Translate | `llm` + `ai_summarize`, `ai_extract`, `ai_classify`, `ai_sentiment` |
| `ai-local-agent` | RunLocalAIAgent | `ai_agent` |
| `make-ai-extractors` | captionAnImage, describeAnImage, extractADocument, extractAnInvoice, extractAReceipt, extractTextFromAnImage | Future: `ai_vision`, `ai_document_extract` (Phase 2+) |
| `make-ai-web-search` | generateAResponse | Future: `ai_web_search` (Phase 2+) |

Key insight: Make separates AI into 4 distinct packages. FlowHolt's AI specialist family currently covers `ai-tools` equivalents well. Vision/document extraction and web-augmented generation should be planned as Phase 2+ additions. `CountAndChunkText` is a knowledge pipeline utility, confirming the need for a chunking node in the RAG pipeline.

### Parameters tab exceptions

All AI specialist nodes share the pattern:
- `credential` / `credential_name` (S1) → asset reference chip.
- `text` / prompts (M2) → business content.
- `include_explanation` (R1, ai_sentiment), `persist_history` (R1, ai_memory) → runtime-derived.

**`ai_chat_model`, `ai_memory`, `ai_tool`, `ai_output_parser`:**
These are **cluster child nodes** that attach to an `ai_agent` parent. Their Parameters tab should show:
- An **"Attached To" banner** at the top showing the parent agent node name and slot (matches current `NodeConfigPanel` cluster UI).
- A reduced field set since their operational context comes from the parent.

### Settings tab exceptions

Most AI specialist nodes have minimal Settings. Keep Settings to:
- `chunking_strategy`, `characters_per_chunk`, `chunk_overlap` (ai_summarize) — operational tuning
- `strict_mode` (ai_output_parser) — runtime behavior
- Cluster slot metadata (read-only, showing which parent and slot this node occupies)

### Test tab exceptions

- **`ai_summarize`**: Test output should show summarization result and token usage. If the input text is large, show a truncated preview with "full output available in execution detail."
- **`ai_extract` / `ai_classify`**: Test output should show structured result as formatted JSON, not raw model output.
- **`ai_sentiment`**: Test output shows sentiment label and optional explanation. `include_explanation` (R1) output follows execution visibility rules.
- **Cluster children** (`ai_chat_model`, `ai_memory`, `ai_tool`, `ai_output_parser`): Test tab should be `hidden` when tested in isolation (these nodes are tested through their parent `ai_agent`). When selected individually, show a message: "Test this node through its parent agent."

---

## 7. Workflow-level overrides

These are policy settings on the workflow object that change tab behavior across **all nodes** in the workflow.

### `data_is_confidential`

**Make reference:** Scenario settings → "Data is confidential" — prevents storing execution data for inspection.

**FlowHolt override rules:**

| Surface | Effect |
|---|---|
| Test tab — all nodes | Test output shows success/failure summary and metadata only. Full payload body is suppressed. |
| Test tab — sample output | Shows field names and types but not values. |
| Test tab — pinned data | Pinned data body is masked. Provenance indicator ("pinned data exists") remains visible. |
| Parameters tab — R1 fields | `show_context`, `include_explanation`, `persist_history`, `return_intermediate_steps` show "governed by confidentiality policy" instead of runtime content. |
| AI trace | Only Result tier visible. Trace summary and raw reasoning are both suppressed. |

### `save_execution_data` (save-failed, save-successful, save-progress)

**FlowHolt override rules:**

| Policy state | Test tab effect |
|---|---|
| `save_successful: false` | Test tab warns: "Successful execution data will not be stored. Test output is available only during this session." |
| `save_failed: false` | Test tab warns: "Failed execution data will not be stored for later inspection." |
| `save_progress: false` | No impact on Test tab (progress is a runtime concern). |

### `sequential_processing`

**Make reference:** Scenario settings → "Sequential processing" — stops execution until incomplete executions resolve.

**FlowHolt override rules:**
- No direct tab visibility impact.
- The Status Bar (not the inspector) should show a "Sequential" badge when this is active.
- The Test tab should show a warning if there are pending incomplete executions: "This workflow has unresolved incomplete executions. New test runs may be queued."

### `require_staging_before_production`

**FlowHolt override rules:**

| Surface | Effect |
|---|---|
| Settings tab — all nodes | Fields that affect live behavior (retry counts, timeout, exposure toggles) show a "staging required" indicator if the workflow is in draft and this policy is active. |
| Test tab — trigger nodes | Webhook and chat test endpoints are explicitly marked as draft-only. |
| Parameters tab — trigger nodes | `chat_public` and `webhook_path` show "requires staging and production publish" banner in draft state. |

### `require_staging_approval` / `require_production_approval`

**FlowHolt override rules:**
- No direct tab visibility impact on node inspector.
- Top bar release controls (outside the inspector) should reflect these, per `23-FLOWHOLT-STUDIO-RELEASE-ACTIONS-DRAFT.md`.

### `execution_order` (parallel vs sequential node execution)

No direct tab visibility impact. This is a runtime scheduling concern, not an inspector concern.

---

## 8. Mapping-mode per-node-family rules

### Expression-eligible fields

The current inspector (`fieldSupportsExpressions`) allows expressions on `string`, `datetime`, `password`, and `textarea` fields. This is correct and should be preserved.

### Per-family mapping exceptions

| Family | Mapping behavior |
|---|---|
| **Trigger** | Expression mapping available on webhook `path`, schedule `time`, chat `initial_messages`. Not available on `source` selector or boolean toggles. |
| **Data/Logic** | Highest mapping density. `template`, `equals`, `value`, `script` all support expressions. `code` node `script` field supports expression injection but should show a warning: "Expressions in code are evaluated before execution, not at runtime." |
| **Output/Integration** | `url`, `body`, `message`, `headers` all support expressions. `token`, `password` fields technically support expressions but should discourage it with a warning: "Avoid embedding secrets in expressions. Use Vault credentials instead." |
| **Pause/Human** | `instructions`, `choices`, `assignee_email`, `delay_expression` support expressions. `delay_expression` is the primary computed-delay mechanism. |
| **AI** | `prompt`, `system_message`, `messages`, `text` all support expressions. These are the primary personalization points for AI nodes. |

### Mapping-mode side panel per family

The mapping-mode side panel (upstream data references) should be available for all families, but:
- **Trigger nodes**: The mapping panel should only show input namespace references (no upstream nodes exist before triggers).
- **Cluster children** (ai_chat_model, ai_memory, etc.): The mapping panel should show the parent agent's context and input data, not the full upstream chain.

---

## 9. AI-specific trace rendering rules

This section refines the AI trace separation from the Test tab into exact rendering expectations.

### `llm` node test output

```
┌─────────────────────────────────────────┐
│ Result                                  │
│ ─────────────────────────────────────── │
│ [Model output text or structured JSON]  │
│                                         │
│ Metadata                                │
│ ─────────────────────────────────────── │
│ Model: gpt-4o-mini  Provider: openai    │
│ Tokens: 142 in / 89 out  Latency: 1.2s │
│                                         │
│ ▶ Show trace summary (collapsed)        │
│   - No tool calls                       │
│   - 1 completion request                │
└─────────────────────────────────────────┘
```

### `ai_agent` node test output

```
┌─────────────────────────────────────────┐
│ Result                                  │
│ ─────────────────────────────────────── │
│ [Final agent output]                    │
│                                         │
│ Cluster participation                   │
│ ─────────────────────────────────────── │
│ ✓ Model: ai_chat_model (gpt-4o)        │
│ ✓ Memory: ai_memory (window=5)         │
│ ✓ Tool: ai_tool "search_docs" (called)  │
│ ○ Output parser: ai_output_parser (skip)│
│                                         │
│ Trace summary                           │
│ ─────────────────────────────────────── │
│ Iterations: 3                           │
│ Tool calls: search_docs (2×), calc (1×) │
│ Tokens: 890 in / 312 out               │
│ Latency: 4.7s                           │
│                                         │
│ ▶ Show raw reasoning (requires cap)     │
│   [Gated by viewRawReasoning]           │
└─────────────────────────────────────────┘
```

### Policy-driven trace redaction

| `data_is_confidential` | Result tier | Trace summary | Raw reasoning |
|---|---|---|---|
| false | Full | Full | Gated by capability |
| true | Metadata only (success/fail, latency, token count) | Hidden | Hidden |

---

## 10. Footer action rules per node family

The current inspector footer shows `Save` or `Run test` depending on active tab. These are the per-family exceptions:

| Family | Parameters footer | Settings footer | Test footer |
|---|---|---|---|
| **Trigger** | Save | Save (hidden if Settings tab hidden for manual trigger) | Run test |
| **Data/Logic** | Save | Save | Run test |
| **Output/Integration** | Save | Save | Run test ⚠️ (real side-effect warning) |
| **Pause/Human** | Save | Save | Run test (simulated) |
| **AI (llm, ai_agent)** | Save | Save | Run test |
| **AI cluster children** | Save | Save | (hidden — "test through parent") |

All footer actions respect capability gating:
- `Save` → disabled with reason when `workflowCapabilities.edit.allowed` is false
- `Run test` → disabled with reason when `workflowCapabilities.test.allowed` is false
- For view-only users: no footer mutation buttons at all

---

## 11. Build priorities

1. Implement field-level sensitivity metadata in node editor response (backend)
2. Implement per-node-family tab-state resolver in Studio (frontend)
3. Implement workflow-level override application (confidentiality, staging, save-execution policies)
4. Implement AI trace three-tier rendering in Test tab
5. Implement pause-impact badges for delay, human, callback nodes
6. Implement real-side-effect warning banners for http_request, output, callback test execution
7. Add "Explain flow" AI toolbar action (from Make crawl: `btn-inspector-explain-flow` with sparkles icon) — AI-powered workflow explanation as a first-class toolbar button
8. Plan Phase 2 AI specialist nodes: `ai_vision`, `ai_document_extract`, `ai_web_search` (from Make crawl package evidence)

## 12. If-else and Route Merge node family exceptions (from file 48 §1)

### Node types: `if_else`, `route_merge`

Two new flow-control node types derived from Make's 2025 If-else + Merge feature.

### `if_else` node

```
Family: flow_control
Sub-type: conditional_split
Fields:
  - conditions: list[{ label: str, rules: FilterRuleList }]  M1
  - else_label: str  (optional label for else route)  M2
Behavior:
  - Emits exactly one output bundle per execution (the first matching route)
  - Route count ≥ 2 (condition + else)
  - Cannot have Router/if_else as direct downstream (validation rule)
Credit usage: 0 (same as Make)
```

### `route_merge` node

```
Family: flow_control
Sub-type: route_converger
Fields:
  - outputs: list[{ condition_label: str, output_name: str, value_mapping: Expression }]  M1
Behavior:
  - Can only be placed as a downstream node of an if_else node's routes
  - Reconnects all if_else routes into a single downstream flow
  - Emits one bundle per execution (the data from the active route)
  - Graph validation ensures every if_else route connects to the same route_merge node
Credit usage: 0
```

Note: FlowHolt's existing `merge` node (a data-join node) is a **different node** from `route_merge`. The naming must be clearly differentiated in the Studio node picker.

### Canvas rendering

- `if_else` renders as a fan-out with numbered condition labels on each route edge + "Else" label on the final route + dashed-line suggestion toward the `route_merge` node
- `route_merge` renders as a fan-in — converging multiple incoming route edges into a single outgoing edge

### Tab exceptions

- **Parameters tab**: shows condition rows (if_else) / output mappings (route_merge)
- **Settings tab**: minimal — error behavior only
- **Test tab**: shows which condition was true on last test run; shows the output bundle passed through

---

## 13. Trigger "Process from" configuration (from file 48 §4.5)

When a trigger node is configured, the Parameters tab should include a **"Process from"** configuration section with these options:

| Option | Description |
|---|---|
| From now on (default) | Process only new bundles from this moment forward |
| Since specific date | Process all bundles after a specified date/time |
| With ID ≥ N | Process all bundles with ID ≥ a specified value |
| All bundles | Process all available bundles |
| Select first bundle | Manually pick the starting bundle from a list |

This applies to the `trigger` node family (Section 1) — specifically for polling, webhook, and event source types. Manual and schedule triggers do not need this.

---

## Remaining work

The final plan still needs:
- exact backend response fields for per-field sensitivity and per-tab capability (to be defined in file 34)
- environment-level overrides (staging vs production may have different confidentiality defaults)
- node-family-specific keyboard shortcuts and focus behavior in mapping mode

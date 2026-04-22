# FlowHolt Node-Type Field Inventory

This file turns the Studio object catalog into an exact node-type inventory based on the current registry.

It is grounded in:
- `26-FLOWHOLT-STUDIO-OBJECT-FIELD-CATALOG-DRAFT.md`
- `backend/app/node_registry.py`
- `src/lib/api.ts` node editor contracts
- local Make UI evidence, especially the bottom operating strip and compact canvas controls visible in:
  - `research/make-help-center-export/assets/images/E_5T95KsL1DhRC8IVy9xQ-20251010-125928__98e0efa41b6b.png`
  - `research/make-help-center-export/assets/images/FaN3pV97eywk8vs0-E0rx-20260203-154010__328f8b2d1397.png`
  - `research/make-help-center-export/assets/images/Zusz0Qbp3EP67xJ3qK7cl-20251003-145143__30f711290366.png`

## Cross-Reference Map

### This file is grounded in (raw sources)

- `research/make-help-center-export/pages_markdown/` — Make module configuration panels: field layout, parameter groupings, and compact bottom operating strip visible in screenshot evidence
- `research/make-help-center-export/assets/images/E_5T95KsL1DhRC8IVy9xQ-20251010-125928__98e0efa41b6b.png` — Make canvas operating strip evidence
- `research/make-help-center-export/assets/images/FaN3pV97eywk8vs0-E0rx-20260203-154010__328f8b2d1397.png` — Make inspector compact grouping evidence
- `research/make-help-center-export/assets/images/Zusz0Qbp3EP67xJ3qK7cl-20251003-145143__30f711290366.png` — Make canvas controls evidence
- `research/n8n-docs-export/pages_markdown/integrations__builtin__core-nodes__n8n-nodes-base.httpRequest.md` — n8n HTTP Request node field structure and parameter groupings
- `research/n8n-docs-export/pages_markdown/integrations__builtin__core-nodes__n8n-nodes-base.if.md` — n8n If/branching node field definitions
- `research/n8n-docs-export/pages_markdown/integrations__builtin__core-nodes__n8n-nodes-base.set.md` — n8n Set/transform node field structure
- `backend/app/node_registry.py` — current FlowHolt node registry: node type definitions, field keys, group assignments

### Key n8n source code files

- `n8n-master/packages/nodes-base/nodes/HttpRequest/HttpRequest.node.ts` — HTTP request node: full property definitions including auth, pagination, and response handling fields
- `n8n-master/packages/nodes-base/nodes/If/V3/IfV3.node.ts` — conditional branching node: operator types, value comparison fields
- `n8n-master/packages/nodes-base/nodes/Set/v2/SetV2.node.ts` — data mapping/transform node: assignment mode, field key/value pairs
- `n8n-master/packages/nodes-base/nodes/Code/Code.node.ts` — code execution node: language mode, code field, sandbox configuration

### n8n/Make comparison

- Make: modules have fixed parameter panels per service app; no formal sensitivity classification system; secret credentials are handled via a separate Connections layer, not inline field tags
- n8n: node properties declare `typeOptions: { password: true }` for secret masking but use no multi-tier sensitivity model; all field sensitivity is binary (normal vs password)
- FlowHolt: introduces an explicit six-tier sensitivity taxonomy (M0, M1, M2, S1, S2, R1) applied to every field across all node types, driving inspector masking behavior, vault binding display, and runtime payload redaction rules

### This file feeds into

- `51-FLOWHOLT-NODE-RENDERER-IMPLEMENTATION.md` — node canvas renderer using field definitions and sensitivity classes
- `50-FLOWHOLT-INSPECTOR-PANEL-IMPLEMENTATION.md` — inspector panel field rendering, grouping, and masking behavior

## Goal

Move from broad node categories to an implementation-facing inventory:
- exact field keys by node type
- sensitivity classes
- baseline role-state behavior
- inspector grouping expectations

## Sensitivity legend

- `M0`: normal metadata or non-sensitive configuration
- `M1`: internal operational configuration
- `M2`: confidential business content or user-entered runtime content
- `S1`: secret reference to a Vault asset
- `S2`: raw secret material that must never render back in plaintext by default
- `R1`: runtime-derived or replay-derived data that should inherit execution visibility rules

## Inspector rules that apply to every node

- Standard node baseline remains `Parameters`, `Settings`, and `Test`.
- `Parameters` should mirror the registry `General` group first, then any secondary groups.
- `Settings` should hold advanced behavior, retry, branch, retention, and exposure controls.
- `Test` should stay present on executable nodes and should attach preview, sample output, warnings, and pinned-data provenance.
- Secret references stay visible as bound assets; raw secret values stay masked and write-only.
- The Make canvas evidence supports keeping operating actions low in the screen and keeping the inspector compact, grouped, and collapsible.

## 1. Start family

### `trigger`

Core fields:
- `source` `M0`

Chat trigger fields:
- `chat_public` `M1`
- `chat_mode` `M1`
- `chat_authentication` `M1`
- `chat_basic_username` `M2`
- `chat_basic_password` `S2`
- `chat_load_previous_session` `M1`
- `chat_response_mode` `M1`
- `chat_initial_messages` `M2`
- `chat_title` `M0`
- `chat_subtitle` `M0`
- `chat_input_placeholder` `M0`
- `chat_allowed_origins` `M1`
- `chat_require_button_click` `M1`

Webhook fields:
- `webhook_path` `M1`
- `webhook_method` `M1`
- `webhook_auth` `M1`
- `webhook_secret` `S2`
- `respond_immediately` `M1`

Schedule fields:
- `frequency` `M1`
- `time` `M1`
- `timezone` `M1`
- `cron_expression` `M1`
- `day_of_week` `M1`

Event, form, and email fields:
- `event_source` `M1`
- `event_filter` `M1`
- `form_title` `M0`
- `form_description` `M0`
- `form_fields` `M2`
- `form_submit_label` `M0`
- `imap_host` `M1`
- `imap_port` `M1`
- `email_credential` `S1`
- `email_folder` `M1`

Role-state notes:
- viewers can read trigger shape but not secret-bearing or public-exposure controls
- builders can edit draft trigger configuration but cannot reveal stored secrets
- publish-capable users control public trigger exposure and environment-specific activation

## 2. Data and logic family

### `transform`

General:
- `operation` `M0`
- `template` `M2`
- `fields_map` `M2`
- `rename_map` `M1`
- `remove_keys` `M1`
- `json_field` `M1`
- `output_key` `M1`

Options:
- `keep_only_set` `M1`
- `dot_notation` `M1`

### `condition`

General:
- `field` `M1`
- `operator` `M1`
- `equals` `M2`

Options:
- `data_type` `M1`
- `case_sensitive` `M1`
- `combine_conditions` `M1`
- `output_key` `M1`

### `filter`

General:
- `items` `M1`
- `field` `M1`
- `operator` `M1`
- `value` `M2`

Options:
- `keep_matches` `M1`
- `output_key` `M1`

### `merge`

General:
- `mode` `M1`
- `sources` `M1`
- `join_field` `M1`

Options:
- `prefer_source` `M1`
- `output_key` `M1`

### `loop`

General:
- `items` `M1`
- `item_variable` `M1`
- `index_variable` `M1`
- `sub_prompt` `M2`
- `sub_template` `M2`
- `max_iterations` `M1`

Options:
- `batch_size` `M1`
- `continue_on_error` `M1`
- `collect_results` `M1`
- `output_key` `M1`

### `code`

General:
- `language` `M1`
- `mode` `M1`
- `script` `M2`
- `timeout` `M1`

Options:
- `allowed_modules` `M1`
- `memory_limit_mb` `M1`
- `output_key` `M1`

Planning note:
- `script` is not a secret by default, but it can easily embed credentials or proprietary logic, so runtime previews for code nodes should inherit execution redaction policy.

## 3. Output and integration family

### `output`

General:
- `destination` `M1`
- `credential` `S1`
- `channel` `M1`
- `message` `M2`
- `webhook_url` `M1`

Options:
- `format` `M1`
- `headers` `M1`
- `include_metadata` `M1`

### `http_request`

General:
- `credential` `S1`
- `method` `M1`
- `url` `M1`
- `send_headers` `M1`
- `headers` `M1`
- `send_body` `M1`
- `body_content_type` `M1`
- `body` `M2`
- `send_query` `M1`
- `query_params` `M1`

Authentication:
- `auth_type` `M1`
- `token` `S2`
- `basic_user` `M2`
- `basic_password` `S2`
- `api_key_header` `M1`
- `api_key_value` `S2`

Response:
- `response_format` `M1`
- `output_key` `M1`

Options:
- `timeout` `M1`
- `follow_redirects` `M1`
- `ignore_ssl` `M1`
- `proxy_url` `M1`
- `retry_on_fail` `M1`
- `max_retries` `M1`
- `retry_wait_ms` `M1`

Planning note:
- `http_request` is the strongest case for separating asset use from secret reveal. Builders may bind credentials; only explicit reveal permissions may expose actual secret material.

### `callback`

General:
- `instructions` `M2`
- `expected_fields` `M1`
- `mode` `M1`
- `choices` `M2`

Options:
- `timeout_hours` `M1`
- `timeout_action` `M1`
- `validate_payload` `M1`

## 4. Pause and human-interaction family

### `delay`

General:
- `delay_type` `M1`
- `hours` `M1`
- `minutes` `M1`
- `seconds` `M1`
- `resume_at` `M1`
- `delay_expression` `M1`

Options:
- `webhook_resume` `M1`
- `resume_url` `M1`
- `timeout_action` `M1`

### `human`

General:
- `title` `M0`
- `instructions` `M2`
- `choices` `M2`
- `priority` `M1`
- `assignee_email` `M2`
- `assignee_role` `M1`
- `due_hours` `M1`

Options:
- `require_comment` `M1`
- `escalation_email` `M2`
- `show_context` `R1`
- `auto_approve_hours` `M1`

Planning note:
- pause-producing nodes need an additional operational badge in the inspector because their effect is not only structural; they also create runtime obligations and inbox work.

## 5. Core AI family

### `llm`

General:
- `credential` `S1`
- `provider` `M1`
- `operation` `M1`
- `model` `M1`
- `custom_model` `M1`
- `system_message` `M2`
- `messages` `M2`
- `prompt` `M2`

Model Parameters:
- `temperature` `M1`
- `max_tokens` `M1`
- `top_p` `M1`
- `frequency_penalty` `M1`
- `presence_penalty` `M1`
- `stop_sequences` `M1`
- `top_k` `M1`
- `max_retries` `M1`
- `timeout_ms` `M1`
- `safety_settings` `M1`

Output Options:
- `response_format` `M1`
- `output_key` `M1`
- `include_usage` `M1`

Advanced:
- `streaming` `M1`
- `timeout` `M1`
- `base_url` `M1`
- `api_key` `S2`
- `metadata` `M1`

### `ai_agent`

General:
- `agent_type` `M1`
- `prompt_source` `M1`
- `prompt` `M2`
- `require_specific_output` `M1`
- `provider` `M1`
- `credential_id` `S1`
- `model` `M1`
- `system_message` `M2`

Tools:
- `tools` `M1`
- `allow_code_execution` `M1`
- `allow_web_search` `M1`
- `allow_file_access` `M1`
- `allow_api_calls` `M1`

Options:
- `max_iterations` `M1`
- `return_intermediate_steps` `R1`
- `temperature` `M1`
- `max_tokens` `M1`
- `top_p` `M1`

Memory:
- `memory_enabled` `M1`
- `memory_type` `M1`
- `memory_window` `M1`
- `memory_session_key` `M2`

Cluster:
- `sub_agents_json` `M2`
- `delegation_strategy` `M1`

Output:
- `output_format` `M1`
- `output_key` `M1`

Planning note:
- `return_intermediate_steps` and agent traces should never automatically imply reasoning visibility. The plan must keep reasoning summary and raw chain detail as separate surfaces.

## 6. AI specialist family

### `ai_summarize`
- `data_source` `M1`
- `text` `M2`
- `provider` `M1`
- `credential` `S1`
- `model` `M1`
- `chunking_strategy` `M1`
- `characters_per_chunk` `M1`
- `chunk_overlap` `M1`
- `summarization_method` `M1`
- `individual_summary_prompt` `M2`
- `final_combine_prompt` `M2`
- `output_key` `M1`

### `ai_extract`
- `text` `M2`
- `extraction_type` `M1`
- `attributes` `M2`
- `json_schema` `M2`
- `provider` `M1`
- `credential` `S1`
- `model` `M1`
- `system_prompt` `M2`
- `output_key` `M1`

### `ai_classify`
- `text` `M2`
- `categories` `M2`
- `provider` `M1`
- `credential` `S1`
- `model` `M1`
- `system_prompt` `M2`
- `allow_multiple` `M1`
- `enable_autorouting` `M1`
- `output_key` `M1`

### `ai_sentiment`
- `text` `M2`
- `provider` `M1`
- `credential` `S1`
- `model` `M1`
- `include_explanation` `R1`
- `output_key` `M1`

### `ai_chat_model`
- `provider` `M1`
- `credential_name` `S1`
- `model` `M1`
- `temperature` `M1`
- `max_tokens` `M1`

### `ai_memory`
- `memory_type` `M1`
- `session_key` `M2`
- `context_window` `M1`
- `persist_history` `R1`

### `ai_tool`
- `tool_name` `M0`
- `tool_type` `M1`
- `description` `M2`
- `endpoint_url` `M1`
- `method` `M1`

### `ai_output_parser`
- `parser_type` `M1`
- `schema_json` `M2`
- `pattern` `M2`
- `strict_mode` `M1`

## 7. Role-state rules by field class

- `M0` and `M1` fields can be shown read-only to viewers when the parent object is visible.
- `M2` fields should respect object visibility and may require masking in execution-derived contexts.
- `S1` fields render as asset references, never raw secret payloads.
- `S2` fields are write-only and should re-render only as masked placeholders plus provenance metadata.
- `R1` fields inherit execution, replay, and environment confidentiality rules.

## 8. Build priorities

Implement these first:
- field sensitivity tags in the node editor response
- field-level masking for `password` and credential-bound fields
- per-node pause badges for `delay`, `human`, and `callback`
- AI-trace separation between visible result, intermediate summary, and hidden raw reasoning

## Remaining work

The final plan still needs:
- exact per-tab role-state rules by node type
- mapping-mode behavior per field type
- field-level validation ownership between frontend and backend

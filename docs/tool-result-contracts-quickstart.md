# Tool Result Contracts Quickstart

This is the next layer after connection-aware tools and agent tool-access controls.

Now FlowHolt tool steps return a more predictable result shape, so later steps do not have to guess how each external API responds.

## What changed

When a tool step succeeds, FlowHolt now keeps the raw response, but it also stores normalized fields like:

- `result_text`
- `result`
- `items`
- `result_contract`

Examples:

- `Knowledge lookup` becomes `document_matches`
- `CRM writeback` becomes `record_sync`
- `Spreadsheet row` becomes `sheet_write`
- `Webhook reply` becomes `callback_ack`
- `HTTP request` stays `raw_response`

## Why this matters

Before this, each tool returned its own custom shape.

That made future agent reasoning, chat explanations, monitoring, and multi-tool orchestration harder.

Now later steps can work with stable ideas like:

- `{{previous.result_text}}`
- `{{previous.result_contract.kind}}`
- `{{previous.items}}`
- `{{previous.result.record_id}}`

## Agent step update

Agent nodes now also have a `Tool strategy` field in Studio:

- `Workspace default`
- `Single tool step`
- `Read then write`
- `Fan out`

This is still groundwork, but it gives FlowHolt a clean place to store future orchestration rules.

## How to see it

1. Restart `flowholt-web`.
2. Restart `flowholt-engine`.
3. Open `/app/studio/[workflowId]`.
4. Click a `Tool` node.
5. You will now see the normalized output contract hint for that preset.
6. Click an `Agent` node.
7. You will now see both `Tool access` and `Tool strategy`.
8. Run the workflow and open `/app/runs/[runId]`.

## What you should notice

- tool runs now produce cleaner result summaries for live monitoring
- different tool presets feel more consistent
- agent steps now carry future-ready orchestration metadata
- this moves FlowHolt closer to a premium AI workflow platform where tools are understandable, not raw integration blobs

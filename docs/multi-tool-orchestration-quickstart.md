# Multi Tool Orchestration Quickstart

This is the next layer after tool presets, connection-aware contracts, and agent tool-access controls.

Now FlowHolt does not only store agent tool strategy. The engine also follows it when an agent step fans out to multiple downstream tool nodes.

## What works now

If one agent node connects to multiple tool nodes, FlowHolt now uses the agent's `Tool strategy` to decide how those tool paths continue.

Strategies:

- `Workspace default`
  Keeps the current graph order.
- `Single`
  Takes only the first allowed downstream tool path.
- `Read then write`
  Runs read-style tool steps like `Knowledge lookup` before write-style steps like `CRM writeback`, `Spreadsheet row`, or `Webhook reply`.
- `Fan out`
  Continues all allowed downstream tool branches.

## Tool permissions now matter in execution

If an agent is limited to selected tools only, and a downstream tool path points to a blocked preset, FlowHolt now:

- skips that blocked path
- logs that it was blocked
- fails clearly if no valid downstream path is left

## How to see it

1. Restart `flowholt-web`.
2. Restart `flowholt-engine`.
3. Open `/app/studio/[workflowId]`.
4. Click an `Agent` node.
5. Set:
   - `Tool access` to `Selected tools only`
   - pick one or two allowed tool presets
   - set `Tool strategy` to `Read then write` or `Fan out`
6. Connect that agent to multiple tool nodes.
7. Save and run the workflow.
8. Open `/app/runs/[runId]`.

## What you should notice

- the live logs now explain which downstream tool paths were selected
- blocked tool paths are reported clearly
- `Read then write` pushes lookup-style tools ahead of writeback-style tools
- `Single` only continues one tool branch from that agent step

## Why this matters

This is the first real execution behavior that makes FlowHolt feel closer to a premium AI workflow platform.

The system is no longer only drawing nodes. It is starting to understand how agents and tools should cooperate.

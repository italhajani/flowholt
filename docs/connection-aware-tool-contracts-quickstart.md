# Connection Aware Tool Contracts Quickstart

This is the next step after the tool preset registry.

Now FlowHolt does not only know tool names. It also knows:

- which presets need a saved connection
- which provider type they expect
- how to merge connection defaults and secrets into runtime safely
- how to adapt the starter HTTPBin demo connection so preset paths do not fail immediately during local testing

## What changed

Examples:

- `CRM writeback` now expects an active `http` connection
- `Spreadsheet row` now expects an active `http` connection
- `Knowledge lookup` now expects an active `http` connection
- `Webhook reply` does not need a saved connection by default
- `HTTP request` can run with or without a saved connection

## About the HTTPBin 404 you saw

Your error happened because the starter HTTP connection uses `https://httpbin.org`, but a preset like `Knowledge lookup` was calling `/v1/search`.

`httpbin.org` does not have a real `/v1/search` endpoint, so it returned `404`.

FlowHolt now adapts those preset demo requests to HTTPBin's `/anything/...` route during local/demo runs, so the starter connection behaves more helpfully.

## How to see it

1. Restart `flowholt-web`.
2. Restart `flowholt-engine`.
3. Open `/app/integrations` and create or edit an active HTTP connection.
4. Open a workflow in Studio.
5. Click a `Tool` node.
6. Choose a preset like `CRM writeback` or `Knowledge lookup`.
7. In the connection dropdown, attach your HTTP connection.
8. Save and run the workflow.

## What you should notice

- presets that need connections now clearly tell you that
- Studio filters the connection dropdown by compatible provider
- FlowHolt merges connection defaults like `base_url`, `default_headers`, and auth keys into runtime
- API key style connections now work for tool steps too, not only bearer tokens
- the starter HTTPBin connection no longer 404s on preset demo paths like `/v1/search`

## Important note

This is still groundwork, not the final marketplace yet.

The next layers after this are:

- map preset contracts to richer provider-specific integrations
- define tool permissions for agents
- normalize tool results for reasoning and monitoring
- build the future premium resources sidebar around these same contracts

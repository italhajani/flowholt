# Agent Tool Registry Quickstart

This is the first FlowHolt step into the real agent/tool architecture stage.

## What changed

Tool nodes are no longer only raw request boxes.

FlowHolt now has a shared tool preset registry that tells Studio and the workflow planner:

- what kind of tool this is
- what auth style it usually needs
- what output shape it returns
- what default request shape to start from

Current presets:

- HTTP request
- Webhook reply
- CRM writeback
- Spreadsheet row
- Knowledge lookup

## How to see it

1. Restart `flowholt-web`.
2. Open any workflow in Studio.
3. Click a `Tool` node.
4. In the right-side config panel, look for `Tool preset`.
5. Change the preset and watch the method, URL, and body defaults update.

## What it means in easy words

Before:
- a tool node was mostly just method + URL + body

Now:
- FlowHolt knows what kind of tool step it is supposed to be
- the AI planner gets better context for how to build the flow
- Studio can guide the user with cleaner presets instead of only technical fields

## Important note

This does not finish the final tool system yet.

It is the groundwork that lets us do the next real pieces safely:

- connect presets to real workspace integrations
- define which agents can use which tools
- normalize tool outputs for reasoning and monitoring
- build the future premium resources/tool sidebar

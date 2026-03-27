# Tool Marketplace Quickstart

This is the next layer after tool presets, result contracts, and multi-tool orchestration.

Now FlowHolt has a shared marketplace/resources model that groups tools into workspace-ready kits.

## What changed

Studio now has a `Resources` panel on the right side.

It shows categories like:

- `AI & Agents`
- `Search & Research`
- `CRM & Operations`
- `Delivery & Webhooks`
- `Custom HTTP`

Inside those categories, FlowHolt now shows provider-specific kits such as:

- `Groq agent kit`
- `Knowledge search kit`
- `CRM sync kit`
- `Spreadsheet ops kit`
- `Delivery webhook kit`
- `Custom API kit`

## What the panel tells you

For each kit, FlowHolt now shows:

- whether it is `Ready`, `Partial`, or `Missing`
- which provider connections it expects
- which saved workspace connections already match it
- which tool presets belong to that kit

## Why this matters

This is the real groundwork for the future premium right sidebar.

Later, when we redesign the full UI, this same shared marketplace model can power a cleaner tools/resources sidebar like the platforms you showed in your screenshots.

## How to see it

1. Restart `flowholt-web`.
2. Open `/app/studio/[workflowId]`.
3. Look at the new `Resources` card on the right side.
4. Open `/app/integrations` if you want to add missing connections.
5. Come back to Studio and refresh.

## What you should notice

- the right side now feels more like a real workflow platform, not just JSON/config panels
- FlowHolt can explain which kits are ready in this workspace
- the planner now also knows about these marketplace kits when generating workflow drafts

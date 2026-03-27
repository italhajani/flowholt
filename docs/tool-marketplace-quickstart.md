# Tool Marketplace Quickstart

This is the next layer after tool presets, result contracts, and multi-tool orchestration.

Now FlowHolt has a shared marketplace/resources model that groups tools into workspace-ready provider packs, workflow-ready packs, and vendor-aware profile hints.

## What changed

Studio now has a richer `Resources` panel on the right side.

It shows categories like:

- `AI & Agents`
- `Search & Research`
- `CRM & Operations`
- `Delivery & Webhooks`
- `Custom HTTP`

Inside those categories, FlowHolt now shows provider packs such as:

- `Groq agent kit`
- `Knowledge search kit`
- `CRM sync kit`
- `Spreadsheet ops kit`
- `Delivery webhook kit`
- `Custom API kit`

It also now shows workflow-ready packs such as:

- `Lead intake pack`
- `Support resolution pack`
- `Content ops pack`

And now it can recognize vendor-style profile hints such as:

- `HubSpot`
- `Notion`
- `Google Sheets`
- `Slack`
- `Generic HTTP`
- `Generic webhook`

## What the panel tells you now

For each pack, FlowHolt now shows:

- whether it is `Ready`, `Partial`, or `Missing`
- whether it is a `Provider pack` or `Workflow pack`
- which providers it expects
- which vendor-style profiles it wants
- which saved connections already match it
- which tool presets belong to that pack
- the best orchestration strategy for that pack
- a setup hint in beginner-friendly words

## Integrations page update

The Integrations page now also shows:

- `Recommended packs`
- `Vendor quick starts`

So you can see both the workflow patterns you are close to unlocking and the vendor-style config shapes that fit them best.

## Why this matters

This is the real groundwork for the future premium right sidebar.

Later, when we redesign the full UI, this same shared marketplace model can power a cleaner tools/resources panel like the platforms you showed in your screenshots, and it already starts thinking in terms of complete workflow solutions instead of only raw connections.

## How to see it

1. Restart `flowholt-web`.
2. Open `/app/studio/[workflowId]`.
3. Look at the richer `Resources` card on the right side.
4. Open `/app/integrations`.
5. Look for the new `Recommended packs` card.
6. Look at `Vendor quick starts`.
7. Add or edit connections if you want to complete more packs.
8. Come back to Studio and refresh.

## What you should notice

- the right side now feels more like a real workflow platform catalog
- FlowHolt can explain which packs are ready in this workspace
- vendor-aware hints now make the connection system feel less generic
- Integrations and Studio now speak the same resource language
- the planner also knows about these marketplace packs when generating workflow drafts
- the resources model now starts bridging from low-level provider setup toward complete solution packs

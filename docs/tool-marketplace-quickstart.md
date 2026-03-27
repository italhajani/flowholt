# Tool Marketplace Quickstart

This is the next layer after tool presets, result contracts, and multi-tool orchestration.

Now FlowHolt has a shared marketplace/resources model that groups tools into workspace-ready provider packs and workflow-ready packs.

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

## What the panel tells you now

For each pack, FlowHolt now shows:

- whether it is `Ready`, `Partial`, or `Missing`
- whether it is a `Provider pack` or `Workflow pack`
- which providers it expects
- which saved connections already match it
- which tool presets belong to that pack
- the best orchestration strategy for that pack
- a setup hint in beginner-friendly words

## Integrations page update

The Integrations page now also shows `Recommended packs`, so you can see what your current workspace is ready for before jumping back into Studio.

## Why this matters

This is the real groundwork for the future premium right sidebar.

Later, when we redesign the full UI, this same shared marketplace model can power a cleaner tools/resources panel like the platforms you showed in your screenshots, and it already starts thinking in terms of complete workflow solutions instead of only raw connections.

## How to see it

1. Restart `flowholt-web`.
2. Open `/app/studio/[workflowId]`.
3. Look at the richer `Resources` card on the right side.
4. Open `/app/integrations`.
5. Look for the new `Recommended packs` card.
6. Add missing connections if you want to complete more packs.
7. Come back to Studio and refresh.

## What you should notice

- the right side now feels more like a real workflow platform catalog
- FlowHolt can explain which packs are ready in this workspace
- Integrations and Studio now speak the same resource language
- the planner also knows about these marketplace packs when generating workflow drafts
- the resources model now starts bridging from low-level provider setup toward complete solution packs

# Tool Marketplace Quickstart

This is the next layer after tool presets, result contracts, and multi-tool orchestration.

Now FlowHolt has a shared marketplace/resources model that groups tools into workspace-ready provider packs, workflow-ready packs, vendor-aware profile hints, and assistant-ready pack suggestions.

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

## Assistant sidebar update

The Studio assistant sidebar now uses these packs too.

It shows `Suggested from your resources`, where you can:

- click `Use idea` to drop a pack-based prompt into the composer
- click `Preview from pack` to immediately ask FlowHolt to build a preview from that pack idea

This is one of the important bridges from "resource catalog" to "actually build the workflow for me".

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
4. In the assistant sidebar, look for `Suggested from your resources`.
5. Click `Preview from pack` on one suggestion.
6. Open `/app/integrations`.
7. Look for the `Recommended packs` and `Vendor quick starts` cards.
8. Add or edit connections if you want to complete more packs.
9. Come back to Studio and refresh.

## What you should notice

- the right side now feels more like a real workflow platform catalog
- FlowHolt can explain which packs are ready in this workspace
- vendor-aware hints now make the connection system feel less generic
- Integrations and Studio now speak the same resource language
- the assistant can now use the same resource language to start building workflow proposals faster
- the planner also knows about these marketplace packs when generating workflow drafts
- the resources model now starts bridging from low-level provider setup toward complete solution packs

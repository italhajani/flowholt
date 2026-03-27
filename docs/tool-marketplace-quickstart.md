# Tool Marketplace Quickstart

This is the next layer after tool presets, result contracts, and multi-tool orchestration.

Now FlowHolt has a shared marketplace/resources model that groups tools into workspace-ready provider packs, workflow-ready packs, vendor-aware profile hints, assistant-ready pack suggestions, and pack-aware generation rules.

## What changed

Studio now has a richer `Resources` panel on the right side, with a cleaner premium pack launcher layout.

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

## Assistant sidebar update

The Studio assistant sidebar now uses these packs too, and the Resources panel can launch them directly.

You can now:

- click `Use idea` from the assistant or the Resources panel to prefill a pack-based prompt
- click `Preview from pack` from the assistant or the Resources panel to immediately ask FlowHolt to build a preview from that pack idea
- switch between `Overview`, `Workflow packs`, and `Provider packs` inside the Resources panel

## New pack-aware generation behavior

When a preview starts from one of these pack suggestions, FlowHolt now passes the selected pack key through the composer and generator flow.

That means the generator can shape the workflow more intentionally around the pack instead of treating the request like a vague generic prompt.

Examples:

- `Lead intake pack` now prefers a knowledge lookup plus CRM writeback style flow
- `Support resolution pack` now prefers lookup plus callback delivery style flow
- `Content ops pack` now prefers a fan-out style content and reporting flow

## Integrations page update

The Integrations page now also shows:

- `Recommended packs`
- `Vendor quick starts`

So you can see both the workflow patterns you are close to unlocking and the vendor-style config shapes that fit them best.

## Why this matters

This is the real groundwork for the future premium right sidebar and the future "type the task, then watch the platform build the flow" experience.

Later, when we redesign the full UI, this same shared marketplace model can power a cleaner tools/resources panel like the platforms you showed in your screenshots, and it already starts thinking in terms of complete workflow solutions instead of only raw connections.

## How to see it

1. Restart `flowholt-web`.
2. Open `/app/studio/[workflowId]`.
3. In the right-side `Resources` panel, try `Overview`, `Workflow packs`, and `Provider packs`.
4. Click `Preview from pack` on any ready workflow pack.
5. Watch the assistant sidebar auto-open that pack idea and build a preview.
6. Review the proposed reasoning and planned graph changes.
7. Open `/app/integrations` if you want to improve vendor/profile readiness.
8. Refresh Studio and try another pack suggestion.

## What you should notice

- the right side now feels more like a guided premium resources sidebar instead of a plain list
- FlowHolt can explain which packs are ready in this workspace
- vendor-aware hints now make the connection system feel less generic
- resource packs can now launch assistant ideas directly from the sidebar
- pack-based previews now steer the generated graph more intentionally toward the selected solution pattern
- the planner also knows about these marketplace packs when generating workflow drafts
- the resources model now starts bridging from low-level provider setup toward complete solution packs

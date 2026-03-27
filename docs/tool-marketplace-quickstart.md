# Tool Marketplace Quickstart

This is the next layer after tool presets, result contracts, and multi-tool orchestration.

Now FlowHolt has a shared marketplace/resources model that groups tools into workspace-ready provider packs, workflow-ready packs, vendor-aware profile hints, assistant-ready pack suggestions, and pack-aware generation rules.

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

## Assistant sidebar update

The Studio assistant sidebar now uses these packs too.

It shows `Suggested from your resources`, where you can:

- click `Use idea` to drop a pack-based prompt into the composer
- click `Preview from pack` to immediately ask FlowHolt to build a preview from that pack idea

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
3. In the assistant sidebar, look for `Suggested from your resources`.
4. Click `Preview from pack`.
5. Review the proposed reasoning and planned graph changes.
6. Open `/app/integrations` if you want to improve vendor/profile readiness.
7. Refresh Studio and try another pack suggestion.

## What you should notice

- the right side now feels more like a real workflow platform catalog
- FlowHolt can explain which packs are ready in this workspace
- vendor-aware hints now make the connection system feel less generic
- the assistant can now use the same resource language to start building workflow proposals faster
- pack-based previews now steer the generated graph more intentionally toward the selected solution pattern
- the planner also knows about these marketplace packs when generating workflow drafts
- the resources model now starts bridging from low-level provider setup toward complete solution packs

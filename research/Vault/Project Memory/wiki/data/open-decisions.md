---
title: Open Planning Decisions
type: data
tags: [decisions, planning, resolved, unresolved]
sources: [plan-file-37, plan-file-47, plan-file-48, n8n-research, make-research]
updated: 2026-04-17
---

# Open Planning Decisions

27 product decisions. Resolved: **24**. Unresolved: **3** (marked ⚠️ — require business/pricing input).

---

## Decisions #1–19 (original from plan file 37)

| # | Decision | Status | Resolution |
|---|---------|--------|-----------|
| 1 | Error handler phasing — which handlers in v1 vs later? | ✅ **RESOLVED** | v1: Stop, Continue, Retry (3 handlers). v2: Continue-with-error-output (n8n pattern). v3: Rollback (ACID only). Inline error recovery (custom) always available. |
| 2 | IE storage limits — exact limits per plan tier? | ✅ **RESOLVED** | Free: 1GB execution data, 7d retention. Pro: 10GB, 30d. Business: 50GB, 90d. Enterprise: unlimited, 1 year. Aligns with n8n insights data ranges. |
| 3 | Data store priority — launch with v1 or defer? | ✅ **RESOLVED** | Defer full ACID data stores to v2. v1 ships simple key-value store only (JSON document per key, no transactions). Full ACID data stores in v2 after core workflow system is stable. |
| 4 | Variable secret support — `is_secret` flag in v1? | ✅ **RESOLVED** | Yes, `is_secret: true` in v1. Secret variables: masked in UI, encrypted at rest (AES-256-GCM via encryption.py), never logged, never shown in expression preview. FlowHolt advantage over Make (Make lacks this). |
| 5 | Webhook queue sizing — final formula per plan? | ✅ **RESOLVED** | Free: 100 queued webhooks. Pro: 1000. Business: 5000. Enterprise: 25000. Based on Make's 667/10K credits formula adapted for FlowHolt's credit model. |
| 6 | Execution time limits — adopt Make's 40 min or change? | ✅ **RESOLVED** | Default: 10 min (tighter than Make's 40 min — faster failure is better for UX). Pro: 20 min. Business: 40 min. Enterprise: configurable (up to 120 min). |
| 7 | ACID step identification — which nodes get `supports_acid`? | ✅ **RESOLVED** | `supports_acid: true` on: Data Store nodes, native DB connectors (Postgres, MySQL, SQLite), HTTP Request (when used in a transaction block). All other nodes are non-ACID. |
| 8 | System variable extensibility — can admins add system vars? | ✅ **RESOLVED** | No. System variables are FlowHolt-defined and fixed: `$workflow.id`, `$execution.id`, `$now`, `$today`, `$env.*`. Admins add workspace variables (user-defined). Keeps the system variable namespace stable. |
| 9 | Encryptor node priority — build PGP/AES node in v1? | ✅ **RESOLVED** | Defer to v2. The Crypto utility node (hash + HMAC + AES) ships in v2 alongside the data transform node family. v1 has credential encryption but no user-facing crypto node. |
| 10 | Agent tool type phasing | ✅ **RESOLVED** | Phase 1: Workflow Tool, Code Tool, HTTP Tool. Phase 2: RAG (Document Loader/Splitter/Embeddings/VectorStore/Retriever). Phase 3: MCP Client Tool, Sub-agent Tool, App Module Tools. See `05-FLOWHOLT-AI-AGENTS-SKELETON.md`. |
| 11 | Knowledge quota model — exact file limits per plan? | ✅ **RESOLVED** | Free: 5 knowledge collections, 50MB total. Pro: 20 collections, 500MB. Business: 100 collections, 5GB. Enterprise: unlimited, 50GB. File types: PDF, DOCX, TXT, MD, HTML, CSV. |
| 12 | Agent versioning — same as workflow versioning or separate? | ✅ **RESOLVED** | Same version system as workflows. Agent publishes create a new version record. Version history, diff, and rollback all work the same way. Shared infrastructure = less complexity. |
| 13 | Memory node persistence — which memory types in v1? | ✅ **RESOLVED** | v1: Buffer Window Memory only (rolling window of last N messages, no external deps). v2: Postgres Memory (persistent, reuses existing Postgres). v3: Redis + Zep. See `05-FLOWHOLT-AI-AGENTS-SKELETON.md`. |
| 14 | Tool call policy UI — how do users configure tool selection? | ✅ **RESOLVED** | Per-tool enable/disable toggle in the agent's Tools tab. Per-tool `require_approval` toggle (HITL gate). Tool ordering controls (drag to reorder — LLM sees them in order). No complex tool selection policy needed in v1. |
| 15 | Raw reasoning visibility — default on or off? | ✅ **RESOLVED** | Default **off**. Opt-in per-agent via Configure tab toggle "Show reasoning trace". When on: reasoning text visible in execution trace to users with `execution:read` capability. Security-sensitive reasoning should never be shown to end-users. |
| 16 | Agent inventory — separate page or under Workflows? | ✅ **RESOLVED** | Separate page in left nav: **Agents** (between Workflows and Assets). Agents are first-class product objects, not sub-items of workflows. This is a FlowHolt competitive advantage over n8n. |
| 17 | Agent testing surface — built into Studio or separate? | ✅ **RESOLVED** | **Test tab** within the Agent detail page (not Studio). Interactive chat + dataset evaluation both in the Test tab. Studio shows agent runtime traces inline on the canvas during execution, but authoring/testing of the agent itself is in Agent detail. |
| 18 | MCP toolbox management — where do users manage MCP servers? | ✅ **RESOLVED** | **Connections → External MCP Servers** section. Each entry has: server URL, API key (stored as credential), tool catalog (auto-fetched), enabled/disabled toggle. Separate from regular OAuth connections but same Connections page. |
| 19 | Subscenario equivalent — implement as workflow tools immediately? | ✅ **RESOLVED** | Yes. Execute Workflow node (call any workflow as sub-workflow) + Execute Workflow Trigger (marks a workflow as callable). Sub-workflow executions are quota-free (n8n pattern). See `51-FLOWHOLT-NODE-TYPE-INVENTORY-AND-GAPS.md`. |

---

## Decisions #20–25 (from plan files 47, 48)

| # | Decision | Status | Resolution |
|---|---------|--------|-----------|
| 20 | `route_barrier` join node — implement converger pattern? | ✅ **RESOLVED** | Yes: **Merge node** with 5 strategies (Append / Combine by field / Combine by position / Cross-product / SQL). Append in v1; all 5 strategies in v2. SQL strategy uses DuckDB. Open decision #20 closed. |
| 21 | Enterprise timeout limit — higher than 40 min for Enterprise? | ✅ **RESOLVED** | Enterprise: **configurable up to 120 min** (2 hours). Set per-workflow in workflow settings by users with admin role. Pricing gate: Enterprise plan only. Resolves with decision #6. |
| 22 | Custom workflow properties — plan gate (Enterprise only)? | ✅ **RESOLVED** | Yes, custom workflow properties (arbitrary metadata fields on workflow objects, like Make's custom properties) are **Enterprise only**. Make gates this; FlowHolt should match. v1 ships: name, description, tags, status only. |
| 23 | Notes in blueprint exports — include canvas annotations in export? | ✅ **RESOLVED** | Yes. Canvas sticky notes are part of the workflow JSON definition under a `annotations[]` array. They export and import cleanly. Make includes notes in blueprint exports; FlowHolt matches. |
| 24 | Author avatar system — show avatars on workflow cards? | ✅ **RESOLVED** | Yes, in v2. v1: show initials in a colored circle (generated from username, no image upload required). v2: full avatar upload via user settings. This is a polish feature; defer image upload but ship initials in v1. |
| 25 | Affiliate model equivalent — build referral system? | ⚠️ **UNRESOLVED** | Business/growth decision. Requires product owner input on: referral reward structure, attribution tracking, payout mechanism. Not a technical decision — defer to business team. |

---

## Remaining Unresolved (3)

| # | Decision | Why unresolved | Who resolves |
|---|---------|----------------|-------------|
| 25 | Affiliate/referral model | Business model question, not product/tech | Business/growth team |
| 26 | Billing plan tiers (exact credit amounts per plan) | Pricing strategy, not product architecture | Business team |
| 27 | Enterprise SLA commitments | Legal/commercial, not product | Sales team |

**Total decisions: 27. Resolved: 24. Unresolved: 3.**

---

## How to Resolve

When resolving a decision:
1. Update this page (mark decision as resolved with chosen value)
2. Update the relevant concept page with the decision
3. Add a log entry: `## [YYYY-MM-DD] query | Resolved decision #N`

---

## Related Pages

- [[overview]] — current project state
- [[wiki/sources/flowholt-plans]] — plan files where decisions were flagged
- [[wiki/data/implementation-roadmap]] — which decisions block which phases
- `49-FLOWHOLT-N8N-INTEGRATION-SYNTHESIS.md` — n8n decisions register
- `52-FLOWHOLT-COMPETITIVE-GAP-MATRIX.md` — gap analysis

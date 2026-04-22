---
title: Make.com
type: entity
tags: [make, competitor, pattern-source, control-plane]
sources: [make-help-center, make-pdf, make-advanced-ui]
updated: 2026-04-16
---

# Make.com

Primary competitor and the main pattern source for [[flowholt]]'s control plane, settings depth, runtime model, and collaboration design. Make is more mature than n8n in product management surfaces.

**Research status: COMPLETE** — all design-impacting sections absorbed into planning files 01–48.

---

## What Make Is

A no-code/low-code automation platform ("scenarios" instead of workflows). Acquired by Celonis. Enterprise-grade with strong org/team management, credit-based pricing, and a mature visual editor.

---

## Make's Key Design Patterns (Used in FlowHolt)

### Control Plane
- Organization → Team hierarchy (no workspace layer — FlowHolt adds this)
- 5 org roles, 5 team roles
- Credit allocation per team with threshold notifications (75/90/100%)
- Analytics dashboard per team

### Execution Model
- Initialization → Cycles (Operation → Commit/Rollback) → Finalization
- ACID tagging per module type
- Max 40-minute execution duration
- 5 MB max data per step
- 3200 max objects per search module

### Error Handling
- 5 handlers: Ignore, Resume, Commit, Rollback, Break
- Rollback is default when no handler configured
- 11 error types
- Consecutive error tracking → auto-deactivation
- Exponential auto-retry: 1m→10m→10m→30m→30m→30m→3h→3h (8 attempts)

### Webhook System
- 300 requests/10s rate limit
- Queue: 667 items per 10,000 credits (max 10,000)
- 5-day inactive expiry
- Parallel and sequential processing modes

### Data Model
- Data stores: key-value, ACID, 8 module types, 1MB per 1000 ops, 15MB max record
- Data structures: JSON schema generator, strict mode
- Variables: system (read-only), scenario (ephemeral), custom (org/team, plaintext — FlowHolt adds `is_secret`)
- Custom functions: ES6, 300ms, 5000 chars, sync only (Teams/Enterprise)

### AI Agents (new in Make)
- AI Agents app: configuration, conversation memory, response format
- MCP toolboxes: tool selection, key-based auth, 40-second timeout
- Subscenarios: sync/async, same-team restriction

---

## Where FlowHolt Intentionally Exceeds Make

See [[wiki/analyses/flowholt-advantages]] for full breakdown:

1. **Workspace layer** — FlowHolt adds workspace between org/team and workflow
2. **Environment pipeline** — draft→staging→production (Make has only version history)
3. **Deployment approvals** — formal review with role-based gates (Make has none)
4. **Human tasks** — pause-producing nodes with inbox (Make has none)
5. **Circuit breakers** — per-integration fault isolation (Make has none)
6. **Custom variable secrets** — `is_secret` flag for encrypted storage (Make stores in plaintext)
7. **Capability system** — explicit frontend `can*` objects + backend builders (Make hardcodes gates)

---

## Make Corpus Location

| Resource | Path | Pages |
|----------|------|-------|
| Help center markdown | `research/make-help-center-export/pages_markdown/` | 324 |
| Help center HTML | `research/make-help-center-export/raw_html/` | 324 |
| Help center assets | `research/make-help-center-export/assets/` | 875 images |
| PDF (full text) | `research/make-pdf-full.txt` | ~31K lines |
| PDF (extracted) | `research/make-pdf-extracted.txt` | 8KB key values |
| UI crawl data | `research/make-advanced/` | JSON + screenshots |
| UI analysis | `plan-introductionToMakeUi.prompt.md` (root) | 138KB |
| Domain index | `research/flowholt-ultimate-plan/make-domain-index.md` | Full index |

---

## Related Pages

- [[flowholt]] — what we're building
- [[n8n]] — secondary competitor
- [[wiki/analyses/make-vs-flowholt-gap]] — 12-domain gap matrix
- [[wiki/analyses/flowholt-advantages]] — where FlowHolt exceeds Make
- [[wiki/sources/make-help-center]] — source summary
- [[wiki/sources/make-pdf]] — PDF source summary
- [[wiki/concepts/execution-model]] — Make's execution model adopted by FlowHolt
- [[wiki/concepts/error-handling]] — Make's 5 error handlers adopted
- [[wiki/concepts/control-plane]] — Make's org/team model adapted

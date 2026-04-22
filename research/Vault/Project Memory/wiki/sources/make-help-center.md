---
title: Source — Make Help Center
type: source
tags: [make, source, help-center, scraped]
updated: 2026-04-16
---

# Make Help Center

**Location:** `research/make-help-center-export/pages_markdown/`
**Size:** 324 markdown pages, 324 HTML pages, 875 images, 2 file assets
**Status:** FULLY ABSORBED into planning files 01–48

---

## What This Source Contains

The complete scraped corpus of `help.make.com` as of April 2026. Covers every product area Make documents publicly.

### Key sections absorbed

| Domain | Coverage |
|--------|----------|
| Execution model | Initialization, cycles, commit/rollback, ACID tags |
| Error handling | All 5 handlers, error types, exponential backoff |
| Webhooks | Queue, rate limits, processing modes, expiry |
| Data stores | 8 module types, ACID, data structures, strict mode |
| Variables | System, scenario, custom, incremental |
| Custom functions | ES6 constraints, Teams/Enterprise gate |
| Connections | OAuth2, dynamic connections, credential requests |
| Analytics | Operations dashboard, credits per team, audit logs |
| AI Agents | Configuration, conversation memory, MCP toolboxes |
| Subscenarios | Sync/async, Call/Start/Return modules |
| Scenario settings | Sequential, auto-commit, max cycles, confidential data |
| Incomplete executions | Auto-retry backoff, storage limits, Break handler |
| Observability | History, replay, scenario recovery, blueprints |

### Make Domain Index
A structured index of which help center pages map to which planning domains is at:
`research/flowholt-ultimate-plan/make-domain-index.md`

---

## How to Use This Source

When you need to verify a Make behavior or find evidence for a design decision:
1. Check if the relevant planning file (01–48) already cites a Make page
2. If not, search `research/make-help-center-export/pages_markdown/` directly
3. The domain index (`make-domain-index.md`) groups pages by topic

**Do not re-absorb this corpus.** All design-impacting content is already in planning files. Remaining unabsorbed content (step-by-step tutorials, per-app module refs, release notes) is intentionally deferred.

---

## Related Pages

- [[wiki/entities/make]] — Make.com entity profile
- [[wiki/sources/make-pdf]] — PDF source (complementary)
- [[wiki/sources/make-advanced-ui]] — UI crawl data
- [[wiki/analyses/make-vs-flowholt-gap]] — gap analysis built from this source

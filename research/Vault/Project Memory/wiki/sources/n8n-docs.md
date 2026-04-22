---
title: Source — n8n Documentation
type: source
tags: [n8n, source, docs, scraped]
updated: 2026-04-16
---

# n8n Documentation

**Location:** `research/n8n-docs-export/pages_markdown/`
**Size:** 1499 markdown pages
**Scraping completed:** 2026-04-16 at ~16:09
**Status:** SCRAPED — deep wiki integration PENDING

---

## What This Source Contains

The complete scraped corpus of n8n's documentation site as of April 2026.

### Expected coverage (not yet fully mapped)
- Core concepts: workflows, nodes, executions, credentials
- Node reference: all built-in node types
- AI nodes: Agent, Chain, Memory, Tool nodes
- Expressions: JavaScript-based expression language
- Sub-workflows: Call Workflow node, workflow-as-tool patterns
- API reference: REST API for external workflow management
- Hosting: self-hosted configuration, scaling, worker topology
- Community nodes: how to build and publish

### Already researched (pre-scrape, in planning files)
- Source code research → `research/flowholt-ultimate-plan/41-N8N-SOURCE-CODE-RESEARCH-FINDINGS.md`
- UI element catalog → `research/flowholt-ultimate-plan/42-N8N-EXHAUSTIVE-UI-ELEMENT-CATALOG.md`
- n8n UI crawl findings → `research/flowholt-ultimate-plan/40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md`

---

## Pending Tasks

- [ ] Map n8n doc pages to planning domains (like `make-domain-index.md`)
- [ ] Deep read: AI agent patterns → update [[wiki/concepts/ai-agents]]
- [ ] Deep read: sub-workflow design → update [[wiki/concepts/execution-model]]
- [ ] Deep read: expression language → create new concept page
- [ ] Deep read: node ecosystem → update [[wiki/data/node-type-inventory]]
- [ ] Create `n8n-domain-index.md` equivalent to `make-domain-index.md`
- [ ] Add plan files 49+ covering n8n-influenced design decisions

---

## Related Pages

- [[wiki/entities/n8n]] — n8n entity profile
- [[wiki/analyses/n8n-research-findings]] — findings from source code and UI research
- [[wiki/concepts/ai-agents]] — primary area where n8n influences FlowHolt
- [[wiki/concepts/execution-model]] — sub-workflow patterns

---
title: n8n Research Findings
type: analysis
tags: [n8n, research, source-code, ui, findings]
sources: [plan-file-41, plan-file-42]
updated: 2026-04-16
---

# n8n Research Findings

Key findings from source code research (plan file 41) and exhaustive UI element catalog (plan file 42). Pre-dates the 1499-page doc scrape — deep integration pending.

---

## Source Code Findings (Plan File 41)

*(Summary — full detail in `research/flowholt-ultimate-plan/41-N8N-SOURCE-CODE-RESEARCH-FINDINGS.md`)*

Key architectural insights from reading n8n's codebase:
- Node type system is package-based (npm) — community nodes install as packages
- Execution engine uses a graph traversal model
- Expression evaluation is a separate service (supports full JS)
- Credential types are node-type-specific (not a separate vault)
- Sub-workflow execution: synchronous and asynchronous modes
- Error workflow: a separate workflow triggered on execution failure
- Pin data: stored per-node in workflow definition JSON
- Webhook system: each webhook has a unique path per node instance

---

## UI Element Catalog (Plan File 42)

*(Summary — full catalog in `research/flowholt-ultimate-plan/42-N8N-EXHAUSTIVE-UI-ELEMENT-CATALOG.md`)*

Key UI observations:
- Canvas uses minimap + zoom controls persistently in bottom-right
- Node creation via search panel (left sidebar) or double-click canvas
- Parameter panel is a right-side drawer (not a fixed panel)
- "Sticky note" nodes for canvas annotations
- Expression editor inline with field input (click `{{ }}` icon)
- Test output shown below each node after run (inline, collapsible)
- Workflow versions accessible from top bar dropdown
- AI assistant chat embedded in bottom panel

---

## Pending Deep Research

Using the 1499-page doc scrape:
- [ ] Agent node complete configuration reference
- [ ] Memory node types and persistence model
- [ ] Tool node calling patterns and error handling
- [ ] Sub-workflow typed inputs/outputs
- [ ] Expression language function library
- [ ] Community node development guide
- [ ] Self-hosted scaling and worker topology

---

## Related Pages

- [[wiki/entities/n8n]] — n8n entity profile
- [[wiki/sources/n8n-docs]] — 1499-page doc scrape
- [[wiki/concepts/ai-agents]] — primary impact area
- [[wiki/concepts/execution-model]] — sub-workflow patterns

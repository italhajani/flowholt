---
title: Automation Map
type: concept
tags: [automation-map, dependency-map, org-level, visualization]
sources: [plan-file-47]
updated: 2026-04-16
---

# Automation Map

The org-level dependency visualization. FlowHolt's equivalent of Make's Grid view — shows how all workflows, agents, connections, data stores, and webhooks in an organization relate to each other.

---

## 4 Layers

| Layer | What it shows |
|-------|--------------|
| **Explore** | Entity graph — what connects to what |
| **Credits** | Operation consumption by entity |
| **Operations** | Run frequency, error rate by entity |
| **Data Transfer** | Volume of data flowing through connections |

---

## Entity Types on the Map

- Workflows
- AI Agents
- Connections (vault credentials)
- Data Stores
- Webhooks
- External services (inferred from HTTP nodes)

---

## Key Features

- **Error indicators** — red/yellow badges on entities with recent failures
- **Presence cursors** — show which team members are actively editing (future)
- **Attribute-level dependency tracing** — which workflow reads from which data store field
- **Filter by team / workspace / entity type**

---

## 4-Phase Rollout

1. Static map (manual refresh, basic entity nodes)
2. Live data (real-time operation counts, error badges)
3. Dependency tracing (attribute-level links)
4. Presence and collaboration features

---

## Related Pages

- [[wiki/concepts/information-architecture]] — where it lives in navigation (Phase 2 sidebar)
- [[wiki/concepts/observability-analytics]] — credits and operations data feeding the map
- [[wiki/concepts/connections-integrations]] — connections shown on the map
- [[wiki/entities/make]] — Make Grid is the closest equivalent
- [[wiki/sources/flowholt-plans]] — plan file 47

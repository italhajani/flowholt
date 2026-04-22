---
title: Studio Anatomy
type: concept
tags: [studio, canvas, inspector, panels, tabs, nodes, editor]
sources: [plan-file-07, plan-file-11, plan-file-15, plan-file-23, plan-file-26, plan-file-27, plan-file-30, plan-file-33]
updated: 2026-04-16
---

# Studio Anatomy

The complete authoring surface where users build workflows. The canvas-based editor is the most visible part of [[wiki/entities/flowholt]] but not the whole product.

---

## Layout

```
┌─────────────────────────────────────────────────────┐
│  TopBar  [Workflow name | State | Version | Actions] │
├──────────┬──────────────────────────────┬────────────┤
│  Nodes   │                              │ Inspector  │
│  Panel   │         Canvas               │ Panel      │
│          │                              │            │
│  (search │  [nodes + edges]             │ Parameters │
│   node   │                              │ Settings   │
│   types) │                              │ Test       │
├──────────┴──────────────────────────────┴────────────┤
│  StatusBar / Run Strip                               │
└─────────────────────────────────────────────────────┘
```

---

## Inspector Panel

The panel that appears when a node is selected. Three tabs:

| Tab | Content |
|-----|---------|
| **Parameters** | Node-specific fields (inputs, config, mapping) |
| **Settings** | Retry, error handler, timeout, sensitivity class |
| **Test** | Run this node, view output, pin data |

### Per-Node-Family Tab Exceptions

| Family | Special rules |
|--------|--------------|
| Trigger | Parameters only (no Test tab — triggers are external) |
| Pause/Human | Settings show inbox config; Test shows last resume payload |
| Core AI | 5 section groups: Prompt & Instructions, Model & Provider, Tools & Capabilities, Memory, Cluster |
| AI Specialist | Embedding config, chunking config, vector store binding |

### Sensitivity Classes
Each field in the inspector has a sensitivity class:
- `public` — visible to all roles
- `masked` — visible as `***` to monitor/guest
- `hidden` — invisible to monitor/guest
- `approval_required` — requires approval workflow before change

---

## TopBar Actions

| Zone | Content |
|------|---------|
| Left | Workflow name, breadcrumb |
| Center | State badge (draft/staged/published), version selector |
| Right | Compare, Publish, Approve, Rollback |

State and compare live HIGH (TopBar). Run and replay live LOW (StatusBar). This separation is deliberate — operating actions stay persistent at the bottom.

---

## Node Families

| Family | Node Types |
|--------|-----------|
| Trigger | Manual, Webhook, Schedule, Chat, Event, Polling |
| Data/Logic | Transform, Filter, Branch (if-else), Merge, Iterator |
| Output/Integration | HTTP Request, app connectors (13+ integrations) |
| Pause/Human | Pause node, Human task inbox |
| Core AI | AI Agent node, LLM Call |
| AI Specialist | Embedder, Chunker, Vector Search |

---

## Release Actions

| Action | Location | Who |
|--------|----------|-----|
| Run | StatusBar | Builder, Operator |
| Replay | StatusBar | Builder, Operator |
| Save version | TopBar | Builder |
| Compare versions | TopBar | Builder |
| Publish to staging | TopBar | Builder |
| Request approval | TopBar | Builder |
| Approve/reject | TopBar | Admin, Publisher |
| Rollback | TopBar | Admin |

---

## Tab Role-State Rules

| Role | Parameters tab | Settings tab | Test tab |
|------|---------------|-------------|----------|
| Builder | Full edit | Full edit | Full access |
| Operator | Read-only | Read-only | Run only |
| Monitor | Masked fields | Hidden | No access |
| Guest | Hidden | Hidden | No access |

Pinned data is governed as confidential runtime-derived content — not harmless editor state.

---

## Related Pages

- [[wiki/concepts/design-system]] — visual tokens, component patterns, and layout specs for all Studio elements
- [[wiki/entities/flowholt]] — current Studio implementation
- [[wiki/concepts/permissions-governance]] — capability system gating Studio actions
- [[wiki/concepts/execution-model]] — what happens when Run is pressed
- [[wiki/concepts/environment-deployment]] — publish, approve, rollback flows
- [[wiki/concepts/expression-language]] — expression editor and autocomplete in inspector
- [[wiki/data/node-type-inventory]] — node types and their visual family classifications
- [[wiki/sources/flowholt-plans]] — plan files 07, 11, 15, 23, 26, 27, 30, 33, 59

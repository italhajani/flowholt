# FlowHolt — Session Changelog

> **Purpose:** Each AI session appends its work here so any future session immediately knows what changed and when.
> **Rule:** Every session that makes code changes MUST append a new entry below.

---

## Session 42 — Sprint 40-41 (Latest)

**Sprints completed:** 40, 41
**Commits:** `672c844` (Sprint 40), `30be329` (Fix: Studio circular dep), `728fded` (Sprint 41)
**Build:** 502 KB JS (main) + 164 KB vendor-react + 75 KB vendor-icons + 40 KB vendor-query | 0 errors
**Theme:** Webhook & Trigger Reliability (Phase 5)

### Sprint 40: Webhook Rate Limiting & Polling
| File | Change |
|------|--------|
| `backend/app/routers/webhooks.py` | Per-webhook rate limiting (sliding window), expiration enforcement, queue/polling/event endpoints |
| `backend/app/repository.py` | Webhook queue management, polling trigger CRUD, internal event bus |
| `backend/app/db.py` | Added `polling_triggers` and `internal_events` tables |
| `src/lib/api.ts` | Rewrote webhook types, added queue/polling/event API functions (~20 new) |
| `src/hooks/useApi.ts` | Added ~15 new hooks for webhooks, polling triggers, events |
| `src/pages/WebhooksPage.tsx` | Rewired from mock data to real API, queue tab with retry/drop |
| `src/pages/detail/WebhookDetailPage.tsx` | Rewired from mock data to real API |

### Fix: Studio Circular Dependency
| File | Change |
|------|--------|
| `src/components/studio/canvasTypes.ts` | NEW — extracted shared types to break useCanvasStore ↔ StudioCanvas cycle |
| `src/components/studio/StudioCanvas.tsx` | Re-exports from canvasTypes.ts |
| `src/components/studio/useCanvasStore.tsx` | Imports from canvasTypes.ts |
| `src/layouts/StudioLayout.tsx` | Split import paths |

### Sprint 41: Error Tracking & Incomplete Executions
| File | Change |
|------|--------|
| `backend/app/db.py` | Added `consecutive_errors` and `incomplete_executions` tables |
| `backend/app/repository.py` | Error tracking CRUD, Make-style retry schedule, incomplete execution management |
| `backend/app/scheduler.py` | Webhook queue processor, polling trigger processor, incomplete retry processor |
| `backend/app/routers/webhooks.py` | Webhook test, error tracking, incomplete execution endpoints |
| `src/lib/api.ts` | 10 new API functions + types |
| `src/hooks/useApi.ts` | 8 new React Query hooks |
| `src/pages/WebhooksPage.tsx` | Added Incomplete & Errors tabs with full UI |

---


**Sprints completed:** 34, 35, 36
**Commits:** `7b514ae` (Sprint 34), `20064db` (Sprint 35), `8b76e0c` (Sprint 36)
**Build:** 497 KB JS (main) + 164 KB vendor-react + 75 KB vendor-icons + 40 KB vendor-query | 97 KB CSS | 0 errors | 1,786 modules | 44 lazy chunks
**Theme:** Observability, Vault Polish, Production Readiness

### Sprint 34: Control Plane & Observability
| File | Change |
|------|--------|
| `backend/app/routers/system.py` | Added Prometheus `/metrics`, `/api/analytics/overview`, `/api/analytics/latency` (percentiles), `/api/analytics/timeline`, `/api/system/log-config` GET/POST |
| `backend/app/routers/webhooks.py` | Added RBAC + session context to all CRUD endpoints, audit logging on webhook create |
| `src/lib/api.ts` | Added AuditEventOut, AnalyticsOverview, LogConfig, LatencyPercentiles, TimelineEntry types + fetch functions |
| `src/hooks/useApi.ts` | Added useAuditEvents, useAnalyticsOverview, useLogConfig, useUpdateLogConfig, useLatencyPercentiles, useExecutionTimeline |
| `src/pages/OperationsPage.tsx` | Wired metric cards to real analytics, AuditTab uses real API with mock fallback |

### Sprint 35: Vault & Connections Polish
| File | Change |
|------|--------|
| `backend/app/routers/vault.py` | Added connection test endpoint, secret rotation, bulk export/import |
| `src/lib/api.ts` | Added ConnectionTestResult, testConnection, rotateSecret, exportVault, importVault |
| `src/hooks/useApi.ts` | Added useTestConnection, useRotateSecret, useExportVault, useImportVault |
| `src/pages/VaultPage.tsx` | Added Export/Import buttons using hooks |
| `src/pages/detail/ConnectionDetailPage.tsx` | Added Test Connection + Rotate Secret buttons with live results |

### Sprint 36: Production Readiness
| File | Change |
|------|--------|
| `src/App.tsx` | Converted 44 page imports to React.lazy() with Suspense/SkeletonPage fallbacks |
| `vite.config.ts` | Added manualChunks: vendor-react, vendor-icons, vendor-query, vendor-flow |
| `src/layouts/AppShellLayout.tsx` | Added responsive mobile sidebar: hamburger toggle, overlay drawer on <768px |
| `src/components/shell/AppSidebar.tsx` | Added onNavigate callback prop for mobile auto-close |

---

## Session 26 — Sprint 25-26

**Sprints completed:** 26
**Commits:** `766b3bb` (Sprint 25), `f84b79a` (Sprint 26)
**Theme:** Full API Integration — Studio + Assistant + Search + Webhooks + Human Tasks

### Sprint 25: Studio API Integration
| File | Change |
|------|--------|
| `src/lib/api.ts` | Added mutation helpers (workflow CRUD, execution, studio bundle/step) + TS interfaces |
| `src/hooks/useApi.ts` | 3 new query hooks + 9 mutation hooks with cache invalidation |
| `src/components/studio/useCanvasStore.tsx` | loadWorkflow(), familyFromType, stepToCanvasNode helpers |
| `src/components/studio/StudioCanvas.tsx` | workflowId prop, useStudioBundle hook, loadWorkflow useEffect |
| `src/components/studio/StudioHeader.tsx` | workflowId prop, publish button → usePublishWorkflow |
| `src/components/studio/StudioRuntimeBar.tsx` | workflowId prop, run→useRunWorkflow, save→useUpdateWorkflow |
| `src/components/studio/StudioInspector.tsx` | workflowId prop, test-step→testWorkflowStep, useStepEditor |
| `src/layouts/StudioLayout.tsx` | Pass workflowId to all Studio components |

### Sprint 26: Assistant & Search API Integration
| File | Change |
|------|--------|
| `src/lib/api.ts` | Added AI draft, global search, templates, notifications, webhooks, human tasks helpers + interfaces |
| `src/hooks/useApi.ts` | 14 new hooks (7 queries + 7 mutations) for all Sprint 26 features |
| `src/components/studio/StudioCopilotPanel.tsx` | Builder mode → POST /api/assistant/draft-workflow with mock fallback |
| `src/components/modals/UseTemplateWizardModal.tsx` | templateId prop, useInstantiateTemplate wiring |
| `src/pages/WebhooksPage.tsx` | useWebhookEndpoints hook wiring |
| `src/pages/HumanTasksPage.tsx` | useHumanTasks + useCompleteHumanTask hook wiring |

---

## Session 25 — Sprint 24

**Sprints completed:** 24
**Commit:** `92b3d22`
**Theme:** Real Data Integration — wire frontend mock data to live FastAPI backend

### Sprint 24: API Client + Page Wiring
| File | Change |
|------|--------|
| `src/lib/api.ts` | NEW — Centralized fetch wrapper, typed endpoint helpers, auth token management, ApiError class |
| `src/hooks/useApi.ts` | NEW — React Query hooks: useWorkflows, useExecutions, useNodeCatalog, useHealth, useWorkspaces |
| `src/hooks/useAuth.tsx` | NEW — AuthProvider context, devLogin/signup/login/logout, session persistence |
| `src/main.tsx` | MODIFIED — Wrapped App with QueryClientProvider + AuthProvider |
| `vite.config.ts` | MODIFIED — Fixed proxy target :8000→:8001, added /health proxy |
| `src/pages/WorkflowsPage.tsx` | MODIFIED — useWorkflows() hook, mapApiWorkflow(), loading spinner, fallback to mock |
| `src/pages/ExecutionsPage.tsx` | MODIFIED — useExecutions() hook, mapApiExecution(), getColumns(maxMs), loading states in MetricPills |
| `src/pages/HomePage.tsx` | MODIFIED — useWorkflows/useExecutions/useHealth hooks, live metrics, live recent executions |
| `src/components/studio/StudioInsertPane.tsx` | MODIFIED — useNodeCatalog() hook, mapCatalogToSections(), sections prop to NodesPane |

---

## Session 23 — Sprint 22-23

**Sprints completed:** 22, 23
**Commit range:** `6c5ae82` → `33cda95`
**Build:** 1,297 KB JS | 93 KB CSS | 0 errors | 1,738 modules

### Sprint 22: UI Polish
| File | Change |
|------|--------|
| `src/components/ui/keyboard-shortcuts-help.tsx` | NEW — 35 shortcuts, 4 contexts, search, `?` key toggle |
| `src/components/shell/ContextBreadcrumbs.tsx` | NEW — Workspace hierarchy, copy path, inline rename |
| `src/components/ui/toast.tsx` | ENHANCED — "pending" variant, `update()` API, stagger animations |
| `src/components/ui/data-display-mode-selector.tsx` | NEW — Table/JSON/Schema/HTML/Binary/Raw views |
| `src/components/ui/skeleton.tsx` | ENHANCED — Shimmer, stagger delays, SkeletonList, SkeletonPage, LoadingState |
| `src/components/ui/empty-state.tsx` | ENHANCED — 5 variants (no-data/no-results/no-permission/offline/error), auto CTAs |
| `src/styles/globals.css` | MODIFIED — Added `.skeleton-shimmer` + `@keyframes shimmer` |

### Sprint 23: Full-Stack Features
| File | Change |
|------|--------|
| `src/components/ui/command-palette.tsx` | REWRITTEN — Workflow/execution/agent search, filter tabs, recent searches |
| `src/components/studio/ExecutionTraceDrawer.tsx` | NEW — Timeline bars, per-node I/O inspection, error details |
| `src/components/ui/tag-manager.tsx` | NEW — TagManager CRUD modal + TagPicker inline dropdown, 14 colors |
| `src/components/shell/WorkspaceSwitcher.tsx` | NEW — Workspace dropdown, role badges, plan indicators |
| `src/components/settings/NotificationPreferencesPanel.tsx` | NEW — Channel toggles, event matrix, quiet hours, digest |
| `backend/app/routers/workflows.py` | MODIFIED — Added `GET /api/v1/search` + `GET /api/v1/workflows/{id}/diff` |
| `backend/app/routers/executions.py` | MODIFIED — Added `GET /api/v1/executions/{id}/trace` |

---

## Session 22 — Sprint 20-21

**Sprints completed:** 20, 21
**Commit range:** `828cb82` → `a8ed273`
**Build:** 1,289 KB JS | 91 KB CSS | 0 errors | 1,738 modules

### Sprint 20: Editor Tools
| File | Change |
|------|--------|
| `src/components/studio/CodeEditorPanel.tsx` | NEW — Syntax-highlighted code editor panel |
| `src/components/modals/WorkflowImportExportModal.tsx` | NEW — Import/export YAML/JSON workflow bundles |
| `src/components/studio/WorkflowOutlineSidebar.tsx` | NEW — Tree + map view, node filtering, jump-to-node |
| `src/components/studio/ErrorHandlingConfigPanel.tsx` | NEW — 4 error behaviors, retry backoff, circuit breaker |
| `src/components/studio/BulkOperationsToolbar.tsx` | NEW — Multi-select toolbar, primary/secondary actions |

### Sprint 21: Collaboration & Analytics
| File | Change |
|------|--------|
| `src/components/studio/CollaborationPresenceBar.tsx` | NEW — Live cursors, avatars, node locking, activity feed |
| `src/pages/WorkflowAnalyticsPage.tsx` | NEW — Execution charts, node heatmap, error hotspots |
| `src/pages/SourceControlPanel.tsx` | NEW — Git diff, push/pull, conflict resolution |
| `src/pages/ExecutionTimelinePage.tsx` | NEW — Gantt-style timing, critical path, branch viz |
| `src/components/modals/WorkflowSharingModal.tsx` | NEW — Share links, access scopes, publish, embed |
| `src/pages/LogStreamingPanel.tsx` | NEW — Real-time log stream, severity/node filtering |
| `src/App.tsx` | MODIFIED — Added 4 routes (analytics, source-control, timeline, logs) |

---

## Session 21 — Sprint 18-19

**Sprints completed:** 18, 19
**Commit range:** `0ccd884` → `7186d8e`

### Sprint 18: Version History, Onboarding, Schedule Builder
- `WorkflowVersionsPage.tsx` — Version history with diff
- `OnboardingWizard` component — New workspace setup flow
- Schedule builder UI for cron triggers

### Sprint 19: Expression Editor & Data Tools
- `ExpressionEditorModal.tsx` — `{{ }}` expression editing with context helpers
- Data pinning UI in inspector
- Input panel with data schema view
- `EnvironmentVariablesPage.tsx` — Workspace variable management
- Webhook URL management UI

---

## Sessions 1-20 — Sprints 1-17 (Foundation)

**Commit range:** Initial → `3c05e47`

### Sprint 1-4: Shell & Core
- AppShellLayout (sidebar, top bar, routing)
- HashRouter with all routes
- Theme provider (dark/light)
- Core UI components (Button, Card, Badge, Input, Modal, Tabs)

### Sprint 5-8: Studio & Canvas
- StudioCanvas (xyflow-based node editor)
- StudioInspector (6-tab right panel with node-specific params)
- StudioHeader, StudioTabBar, StudioLeftRail
- StudioInsertPane (node library sidebar)
- useCanvasStore (canvas state management)

### Sprint 9-12: Pages & Features
- All 27 main pages + 8 detail pages
- 13 settings pages
- ExecutionsPage, VaultPage, TemplatesPage, AIAgentsPage
- Canvas polish, inspector data views, template wizard

### Sprint 13-16: Advanced Studio
- Error handling, undo/redo, execution timeline, toast notifications
- Data pinning, activation toggle, execution compare, variables
- Sticky notes, replace node, webhook URLs, execution retry
- Node-specific parameter UIs (Form, Chat, Schedule, Code)

### Sprint 17: Evaluations & Community
- EvaluationsPage, credential sharing UI
- Debug console, community nodes marketplace

---

## Inventory Summary (Post-Sprint 23)

| Category | Count |
|----------|-------|
| UI Components (`src/components/ui/`) | 21 |
| Shell Components (`src/components/shell/`) | 5 |
| Studio Components (`src/components/studio/`) | 18 |
| Modal Components (`src/components/modals/`) | 11 |
| Settings Components (`src/components/settings/`) | 1 |
| Main Pages (`src/pages/`) | 27 |
| Detail Pages (`src/pages/detail/`) | 8 |
| Settings Pages (`src/pages/settings/`) | 13 |
| Backend Routers | 13 |
| Defined Routes | 50+ |
| Research Documents | 67+ numbered files |
| Total Sprint Todos | 228/228 done |

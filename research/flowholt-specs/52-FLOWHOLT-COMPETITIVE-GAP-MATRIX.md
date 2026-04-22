# FlowHolt Competitive Gap Matrix — Make.com + n8n

> **Status:** New file created 2026-04-16. Replaces `10-MAKE-TO-FLOWHOLT-GAP-MATRIX.md` (Make-only).  
> **Direction:** FlowHolt must exceed both Make and n8n. This matrix tracks where we stand.  
> **Vault:** [[wiki/analyses/make-vs-flowholt-gap]] | [[wiki/entities/n8n]] | [[wiki/entities/make]]  
> **Raw sources:**  
> - Make: `research/make-pdf-full.txt`, `research/make-help-center-export/pages_markdown/`  
> - n8n: `research/n8n-docs-export/pages_markdown/` (all domains complete)  
> **See also:** `49-FLOWHOLT-N8N-INTEGRATION-SYNTHESIS.md` | `51-FLOWHOLT-NODE-TYPE-INVENTORY-AND-GAPS.md`

---

## Cross-Reference Map

### This file is grounded in (raw sources per domain)

| Domain | Make raw evidence | n8n raw evidence |
|--------|------------------|-----------------|
| Expression Language | `research/make-pdf-full.txt` §Variables | `research/n8n-docs-export/pages_markdown/data/` (25 pages) |
| AI Agents | `research/make-help-center-export/pages_markdown/ai-agents.md` | `research/n8n-docs-export/pages_markdown/advanced-ai/` (~50 pages) |
| Node Ecosystem | `research/make-help-center-export/pages_markdown/` (app modules) | `research/n8n-docs-export/pages_markdown/integrations/builtin/core-nodes/` (28 pages) |
| Studio UX | `research/make-advanced/` (crawl) + `research/make-help-center-export/assets/images/` | `research/n8n-docs-export/pages_markdown/user-interface/` |
| Runtime + Execution | `research/make-help-center-export/pages_markdown/scenarios.md`, `scenario-execution-flow.md` | `research/n8n-docs-export/pages_markdown/workflows/` |
| Control Plane | `research/make-help-center-export/pages_markdown/organizations.md`, `teams.md` | `research/n8n-docs-export/pages_markdown/user-management/` |
| Deployment | `research/make-help-center-export/pages_markdown/versions.md` | `research/n8n-docs-export/pages_markdown/source-control-environments/` |
| Observability | `research/make-help-center-export/pages_markdown/analytics-dashboard.md`, `credits-and-operations.md` | `research/n8n-docs-export/pages_markdown/insights/` (4 pages) |
| Connections | `research/make-help-center-export/pages_markdown/connections.md` | `research/n8n-docs-export/pages_markdown/credentials/` |
| Backend Infra | Make API: `research/make-advanced/*/network-log*.json` | `research/n8n-docs-export/pages_markdown/hosting/scaling/` (10 pages) |

### Key n8n source code files per gap row

| Gap feature | n8n source file |
|-------------|----------------|
| Drag-to-expression INPUT panel | `n8n-master/packages/editor-ui/src/components/NDVInputPanel.vue` |
| Data pinning | `n8n-master/packages/editor-ui/src/stores/pinData.store.ts` |
| $fromAI() | `n8n-master/packages/core/src/execution-engine/node-execution-context/` |
| Buffer Window Memory | `n8n-master/packages/@n8n/n8n-nodes-langchain/nodes/memory/MemoryBufferWindow/` |
| Per-tool HITL | `n8n-master/packages/@n8n/n8n-nodes-langchain/nodes/agent/agents/ToolsAgent/` |
| MCP Client Tool | `n8n-master/packages/@n8n/n8n-nodes-langchain/nodes/mcp/McpClientTool.node.ts` |
| RAG pipeline | `n8n-master/packages/@n8n/n8n-nodes-langchain/nodes/vector_store/` |
| `continue_with_error` | `n8n-master/packages/workflow/src/Interfaces.ts` → `INodeParameters.onError` |
| Edit locking | `n8n-master/packages/editor-ui/src/composables/useCollaborationState.ts` |
| Visual diff | `n8n-master/packages/editor-ui/src/components/` |
| Chat Trigger | `n8n-master/packages/nodes-base/nodes/ChatTrigger/ChatTrigger.node.ts` |
| Publish permission | `n8n-master/packages/cli/src/permissions/global.roles.ts` |
| Time saved metric | `n8n-master/packages/cli/src/modules/insights/insights.service.ts` |
| Log streaming | `n8n-master/packages/cli/src/modules/insights/` |
| Health readiness | `n8n-master/packages/cli/src/health-check.controller.ts` |
| Prometheus metrics | `n8n-master/packages/cli/src/controllers/metrics.controller.ts` |

### This file feeds into (downstream planning files per row)

| Gap domain | Plan file |
|-----------|----------|
| Expression Language | `50-FLOWHOLT-EXPRESSION-AND-DATA-MODEL-SPEC.md` |
| AI Agents | `05-FLOWHOLT-AI-AGENTS-SKELETON.md`, `37-FLOWHOLT-AI-AGENT-ENTITY-AND-KNOWLEDGE.md` |
| Node Ecosystem | `51-FLOWHOLT-NODE-TYPE-INVENTORY-AND-GAPS.md` |
| Studio UX | `07-FLOWHOLT-STUDIO-SURFACE-SPEC-SKELETON.md`, `11-FLOWHOLT-STUDIO-ANATOMY-DRAFT.md` |
| Runtime | `44-FLOWHOLT-ERROR-HANDLING-AND-RESILIENCE-SPEC.md`, `22-FLOWHOLT-WORKER-TOPOLOGY-AND-QUEUE-OPS.md` |
| Control Plane | `36-FLOWHOLT-CONTROL-PLANE-ORG-TEAM-DESIGN.md` |
| Deployment | `43-FLOWHOLT-ENVIRONMENT-AND-DEPLOYMENT-LIFECYCLE.md` |
| Observability | `41-FLOWHOLT-OBSERVABILITY-AND-ANALYTICS-SPEC.md` |
| Connections | `46-FLOWHOLT-INTEGRATION-AND-CONNECTION-MANAGEMENT-SPEC.md` |
| Backend | `09-FLOWHOLT-BACKEND-ARCHITECTURE-SKELETON.md` |

### Peer research files

| File | What it provides |
|------|----------------|
| `49-FLOWHOLT-N8N-INTEGRATION-SYNTHESIS.md` | n8n decision register (detailed decisions per gap) |
| `51-FLOWHOLT-NODE-TYPE-INVENTORY-AND-GAPS.md` | Per-node status table |
| `10-MAKE-TO-FLOWHOLT-GAP-MATRIX.md` | Original Make-only gap analysis (now superseded) |
| `40-MAKE-EDITOR-UI-CRAWL-FINDINGS.md` | Live Make UI evidence for Domain 4 (Studio UX) |
| `41-N8N-SOURCE-CODE-RESEARCH-FINDINGS.md` | n8n source findings |
| `42-N8N-EXHAUSTIVE-UI-ELEMENT-CATALOG.md` | n8n UI element catalog |

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | FlowHolt has this and it's good |
| ⚠️ | FlowHolt has partial/weaker version |
| ❌ | FlowHolt does not have this |
| 🏆 | FlowHolt exceeds both Make and n8n here |
| → | FlowHolt's planned resolution |

---

## Domain 1: Expression Language and Data Model

| Feature | Make | n8n | FlowHolt | Plan |
|---------|------|-----|----------|------|
| Expression syntax | `{{variable}}` template, limited functions | `{{ }}` full JavaScript, 30+ context vars | ⚠️ Limited | → Adopt n8n's full `{{ }}` model (file 50) |
| Item-array data model | Bundles (similar) | `[{json, binary}]` items | ⚠️ Own model | → Adopt n8n's `FlowItem[]` exactly (file 50) |
| Drag-to-expression mapping | Click pill from panel | Drag from INPUT panel Schema/Table/JSON | ❌ | → Build INPUT panel with drag+click-to-insert 🏆 |
| Data pinning | No equivalent | Pin output, run with pinned data | ❌ | → Implement exactly per n8n model (file 07) |
| Luxon DateTime | No Luxon; limited date functions | Full Luxon library | ❌ | → Adopt Luxon as DateTime standard (file 50) |
| JMESPath | No equivalent | `$jmespath()` function | ❌ | → Implement `$jmespath()` (file 50) |
| $fromAI() in tool fields | No equivalent | `{{$fromAI(name, desc, type)}}` | ❌ | → Implement with AI agent system (file 05, 50) |
| Workspace variables | Yes (values visible) | Yes (global instance-level) | ⚠️ | → Add `is_secret` flag + workspace scope (file 50) |

---

## Domain 2: AI Agents and Cluster Nodes

| Feature | Make | n8n | FlowHolt | Plan |
|---------|------|-----|----------|------|
| Agent node type | AI Agents app (monolithic) | Agent root node (cluster) | ❌ | → Cluster node architecture (file 05) |
| Memory system | No memory | Buffer Window, Postgres, Redis, Zep | ❌ | → Phase 1: Buffer Window (file 05) |
| Tool calling interface | Limited | Tools Agent (tool-calling, not JSON parsing) | ❌ | → Tools Agent as single unified mode (file 05) |
| Per-tool HITL gates | Workflow-level pause only | Per-tool approval with proposed params visible | ❌ | → Per-tool `require_approval` flag (file 05) |
| RAG pipeline nodes | Knowledge base only | Full pipeline: Loader → Splitter → Embed → VectorStore → Retriever | ❌ | → Phase 2: full RAG cluster (file 05) |
| MCP client (call external tools) | No MCP | MCP Client Tool sub-node | ❌ | → Phase 3: MCP Client Tool (file 05) |
| MCP server (expose workflows) | No MCP | Workflows as MCP tools | ❌ | → Phase 3: MCP Server endpoint (file 05) 🏆 |
| Sub-agent calling | No equivalent | AI Agent Tool sub-node | ❌ | → Phase 3: AI Agent Tool (file 05) |
| Agent evaluation framework | No evaluation | Test datasets + metric-based eval | ❌ | → Evaluation tab in Agent detail (file 05) |
| Agent as managed product object | No agent entity | Runtime node only | ❌ | → Agents inventory page (file 05) 🏆 |
| Agent version history | No versioning | No versioning | ❌ | → Same as workflow versioning 🏆 |
| Chat Trigger + Agent pattern | No chat trigger | Chat Trigger → Agent → Chat Response | ❌ | → Implement both nodes (file 51) |

---

## Domain 3: Node Ecosystem

| Feature | Make | n8n | FlowHolt | Plan |
|---------|------|-----|----------|------|
| Manual Trigger | Yes | Yes | ✅ | — |
| Webhook Trigger | Yes | Yes | ✅ | — |
| Schedule Trigger | Yes | Yes | ✅ | — |
| Form Trigger | Yes (built-in form builder) | Yes | ❌ | → Must-Have (file 51) |
| Chat Trigger | No | Yes | ❌ | → Must-Have (file 51) |
| Error Trigger | Yes | Yes | ❌ | → Must-Have (file 51) |
| Wait node | Yes (resume on webhook/time) | Yes | ❌ | → Must-Have (file 51) |
| If node | Yes (filter) | Yes | ✅ | — |
| Switch node (multi-branch) | Yes (router) | Yes + Expression mode | ⚠️ Rules only | → Add Expression mode (file 51) |
| Merge node (multi-strategy) | Array aggregator only | 5 merge strategies | ⚠️ Append only | → Add 4 more strategies (file 51) |
| Sub-workflow pattern | Subscenarios (same team) | Execute Workflow + Trigger | ❌ | → Implement both nodes (file 51) |
| Summarize / aggregate | No equivalent | Yes | ❌ | → High-Value (file 51) |
| Compare Datasets | No equivalent | Yes | ❌ | → High-Value (file 51) |
| HTTP Request (full) | Yes | Yes + pagination + full auth | ⚠️ | → Add pagination + auth types |
| Code node (JS+Python) | Make Code (credits) | JS + Python | ✅ | — |
| Sticky Notes | Yes | Yes | ❌ | → High-Value |

---

## Domain 4: Studio Surface and UX

| Feature | Make | n8n | FlowHolt | Plan |
|---------|------|-----|----------|------|
| Visual canvas | Yes | Yes | ✅ | — |
| Node configuration inspector | Yes | Yes | ✅ | — |
| Auto-save + explicit publish | Yes | Yes | ⚠️ | → Align with n8n publish states (file 23) |
| Edit locking | No (last-write-wins) | Yes | ❌ | → Implement (file 07) |
| Version history with diff | Yes (basic) | Yes + visual node diff | ⚠️ | → Add visual diff (green/orange/red) (file 07) |
| Data pinning | No | Yes | ❌ | → Implement (file 07) |
| INPUT panel (upstream data) | Mapping panel (click) | Schema/Table/JSON + drag | ❌ | → Build full INPUT panel (file 07) 🏆 |
| Per-node output inspection | Limited | Click node → see output | ⚠️ | → Show in inspector OUTPUT tab (file 07) |
| Execution trace drawer | No inline trace | Yes | ❌ | → Implement (file 07) |
| Canvas annotations (notes) | Yes | Yes | ❌ | → Implement (file 07) |
| Node disable/bypass | Yes | Yes | ❌ | → High-Value |
| Zoom to node | Yes | Yes | ✅ | — |
| Mini-map | Yes | Yes | ❌ | → High-Value |

---

## Domain 5: Execution and Runtime

| Feature | Make | n8n | FlowHolt | Plan |
|---------|------|-----|----------|------|
| Execution history | Yes | Yes | ✅ | — |
| Execution replay | Yes | Yes | ⚠️ | — |
| Per-node step records | Yes | Yes | ⚠️ | — |
| Error output path (`continue_with_error`) | No | Yes | ❌ | → Add to node settings (file 44) |
| Execution time limits | 40 min (configurable per plan) | Configurable | ✅ 10 min default | Open decision #6/#21 |
| Dead-letter queue | Yes | n8n has failed execution recovery | ✅ | — |
| Manual execution (quota-free) | Yes | Yes | ✅ | — |
| Sub-workflow execution (quota-free) | No | Yes | → | → Implement (file 49) |
| Execution data pruning | Yes | TTL + count config | ✅ | → Add env vars (file 09) |
| Worker concurrency | Fixed per plan | Configurable per worker | ✅ | → Add env vars (file 09) |

---

## Domain 6: Control Plane

| Feature | Make | n8n | FlowHolt | Plan |
|---------|------|-----|----------|------|
| Organization | Yes | Instance = org equivalent | ✅ | — |
| Teams | Yes | No teams (projects only) | ✅ | 🏆 |
| Workspaces | Yes | Projects | ✅ | — |
| 5+5 role model | Yes (5 org + 5 workspace roles) | 3 project roles (Admin/Editor/Viewer) | ⚠️ | — |
| Team credit allocation | Yes | No credits (usage limits instead) | ✅ | 🏆 |
| Custom roles | Enterprise | Enterprise | ❌ | → Phase 3 |
| SSO (SAML/OIDC/LDAP) | Yes | Yes | ❌ | → Phase 2 |
| 2FA | Yes | Yes | ❌ | → Phase 2 |
| Member invitation flow | Yes | Yes | ⚠️ | — |
| Global variables | Yes (per Make account) | Yes (instance-global) | ⚠️ | — |

---

## Domain 7: Environment and Deployment

| Feature | Make | n8n | FlowHolt | Plan |
|---------|------|-----|----------|------|
| Built-in deployment pipeline | No (manual active/inactive) | No (Git-based, requires understanding) | 🏆 Draft→Staging→Prod | Keep and enhance |
| Approval gates for promotion | No | No | ✅ | 🏆 |
| Visual diff on version compare | No | Yes (Enterprise) | ❌ | → Implement green/orange/red diff (file 43) |
| Protected production environment | No | Yes (read-only instance flag) | ❌ | → High-Value (file 43) |
| Environment-scoped credentials | Yes | Yes (credential scoping) | ⚠️ | — |
| Rollback to previous version | Yes | Yes | ✅ | — |
| Workflow export/import (JSON) | Yes | Yes | ✅ | — |

---

## Domain 8: Observability and Analytics

| Feature | Make | n8n | FlowHolt | Plan |
|---------|------|-----|----------|------|
| Operations/credit tracking | Yes (7 surfaces) | No credits (time saved instead) | ✅ | — |
| Analytics dashboard | Yes | Yes (production executions only) | ✅ | → Production-only analytics (file 41) |
| "Time saved" metric | No | Yes (fixed + dynamic calc) | ❌ | → Implement on Overview dashboard (file 41) 🏆 |
| Log streaming (external) | No | Yes (45+ events → syslog/webhook/Sentry) | ❌ | → Enterprise feature (file 41) |
| Audit log | Yes | Yes | ✅ | — |
| Health check `/health/ready` | No | Yes | ❌ | → Add to system router (file 09) |
| Prometheus `/metrics` | No | Yes | ❌ | → Phase 2 (file 09) |
| Execution data retention config | No (plan-based) | TTL + count env vars | ✅ | → Expose via env vars (file 09) |

---

## Domain 9: Connections and Integrations

| Feature | Make | n8n | FlowHolt | Plan |
|---------|------|-----|----------|------|
| Credential vault | Yes | Yes | ✅ | — |
| OAuth2 integration flow | Yes | Yes | ✅ | — |
| Credential sharing across workspaces | Yes (with restrictions) | Yes (project-scoped) | ❌ | → Admin-gated cross-workspace share |
| Credential rotation | Yes | Yes | ✅ | — |
| MCP server connections | No | Yes | ❌ | → Connections → External MCP Servers (file 05) |
| Integration marketplace | Yes | Yes (n8n.io/integrations) | ❌ | → Phase 3 |
| Custom OAuth app registration | Yes | Yes | ❌ | → Phase 2 |

---

## Domain 10: Backend Infrastructure

| Feature | Make | n8n | FlowHolt | Plan |
|---------|------|-----|----------|------|
| Job queue | Proprietary | Redis + BullMQ | ✅ Postgres-as-queue | 🏆 |
| Code isolation | Proprietary | Task runner sidecar | ✅ sandbox.py subprocess | — |
| S3 binary data | Proprietary | S3 mode | ❌ | → Plan S3 mode (file 09) |
| Multi-worker deployment | Yes | Yes | ✅ | — |
| Backend modularization | N/A | Modular (n8n packages) | ⚠️ Monolith | → 13 domain modules (file 09) |
| Health readiness endpoint | N/A | `/healthz/readiness` | ❌ | → Add `/health/ready` (file 09) |
| Prometheus metrics | N/A | `/metrics` | ❌ | → Phase 2 (file 09) |

---

## FlowHolt Competitive Advantages (Keep and Expand)

| Advantage | Status |
|-----------|--------|
| Built-in Draft→Staging→Production pipeline (no Git required) | 🏆 Live |
| Team credit allocation and budget management | 🏆 Live |
| 5+5 role model (more granular than n8n's 3 project roles) | 🏆 Live |
| Approval gates for production promotion | 🏆 Live |
| Agents as managed product objects (not just runtime nodes) | 🏆 Planned |
| Agent version history | 🏆 Planned |
| Combined time-saved + credit analytics | 🏆 Planned |
| Per-tool HITL (more granular than Make's workflow-level pause) | 🏆 Planned |
| INPUT panel with drag-to-expression (better UX than both) | 🏆 Planned |

---

## Gap Closing Priority

### Phase 1 (v1.x)

1. Form Trigger (high user value, no-code capability)
2. Error Trigger (production reliability)
3. Wait node (HITL non-agent + rate limiting)
4. Execute Workflow + Trigger (sub-workflow pattern)
5. Agent cluster (entire AI system)
6. `{{ }}` expression engine + INPUT panel
7. Data pinning
8. Aggregate + Split Out nodes
9. `continue_with_error` node error mode
10. `/health/ready` endpoint

### Phase 2 (v2.x)

1. Chat Trigger + AI Chat Message
2. Merge node strategies (Combine by field/position/cross-product)
3. Summarize, Compare Datasets, Sort, Limit nodes
4. HTTP Request pagination + full auth types
5. Extract from File, Convert to File
6. Switch Expression mode
7. Edit locking
8. Visual diff on version compare
9. Prometheus metrics
10. Log streaming (Enterprise)

### Phase 3 (v3.x)

1. MCP Client Tool + MCP Server Trigger
2. Sub-agent (AI Agent Tool)
3. RAG pipeline cluster nodes
4. Custom roles (Enterprise)
5. SSO (SAML/OIDC)
6. Integration marketplace
7. S3 binary data mode

---

## Related Files

- `49-FLOWHOLT-N8N-INTEGRATION-SYNTHESIS.md` — n8n findings that inform this matrix
- `51-FLOWHOLT-NODE-TYPE-INVENTORY-AND-GAPS.md` — node-level gap analysis
- `05-FLOWHOLT-AI-AGENTS-SKELETON.md` — AI domain plan
- `07-FLOWHOLT-STUDIO-SURFACE-SPEC-SKELETON.md` — Studio UX gaps
- `09-FLOWHOLT-BACKEND-ARCHITECTURE-SKELETON.md` — infrastructure gaps
- `10-MAKE-TO-FLOWHOLT-GAP-MATRIX.md` — original Make-only gap matrix (now superseded)
- [[wiki/analyses/make-vs-flowholt-gap]] — vault synthesis
- [[wiki/entities/make]] — Make entity page
- [[wiki/entities/n8n]] — n8n entity page

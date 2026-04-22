---
title: n8n
type: entity
tags: [n8n, competitor, pattern-source, ai-orchestration, open-source]
sources: [n8n-docs, n8n-research-findings]
updated: 2026-04-16
---

# n8n

Secondary competitor and the future pattern source for [[flowholt]]'s logic style, AI-agent orchestration, and node ecosystem design. n8n is more developer-friendly and more powerful in workflow logic than [[make]].

**Research status: COMPLETE** — All 10 domains deep-read and integrated into vault. n8n research phase finished 2026-04-16.

---

## What n8n Is

An open-source workflow automation platform with a self-hosted option and a cloud offering. Strong in technical users, developer integrations, and increasingly in AI agent workflows. More flexible expression language than Make. Large community node ecosystem.

---

## Key Findings — Completed Domains


### Domain 1: AI Agents and Cluster Nodes

**Architecture:** Cluster Nodes = Root nodes (Agent, Chain, VectorStore) + Sub-nodes (Memory, Tools, Retriever, Embeddings) connected via typed connector slots — not sequential piping.

**Current agent standard (post-Feb 2025):** Single unified Agent node using Tools Agent mode. Older types (Conversational, ReAct, Plan+Execute) REMOVED. Tool-calling interface is more reliable than JSON parsing.

**Chains are stateless:** No memory on chains by design. Memory is agent-exclusive.

**Memory backends:** Simple (dev only, dies on restart, not queue-safe), Redis, Postgres, Zep. Chat Memory Manager enables injecting/trimming/manipulating messages.

**Tool types:** Workflow tool, AI Agent tool (sub-agent), Code tool, MCP Client tool, HTTP tool, 100+ app node tools. `$fromAI()` for dynamic AI-proposed parameters.

**HITL per tool:** Pause before specific tool executes. Reviewer sees AI-proposed parameters. Approval via Slack/Chat/Teams/email. `$tool.name` and `$tool.parameters` available in approval messages.

**RAG pipeline:** Data → Document Loader → Text Splitter (Recursive recommended) → Embeddings → Vector Store (PGVector recommended for FlowHolt). Token-saving: use Q&A tool to avoid passing raw chunks to LLM.

**MCP Bidirectionality:** n8n exposes itself as MCP server (workflows callable by Claude Desktop, Claude Code, etc.) AND can call external MCP servers as tools from within agents.

**Evaluation:** Light evaluation (dev, small dataset) + Metric-based evaluation (prod, regression testing). Non-deterministic outputs require measurement, not reasoning.

**Key FlowHolt design signals:** Adopt cluster node architecture with typed slots. Single unified Agent node. PGVector as memory/RAG default. Per-tool HITL gates (human inbox upgrade needed). `{{$fromAI(...)}}` expression in tool fields. Expose FlowHolt workflows as MCP tools.

### Domain 2 + 4: Flow Logic and Workflow Lifecycle

- **Execution order**: Depth-first (v1, default) vs breadth-first (v0, legacy). FlowHolt → use depth-first only.
- **Auto-save + publish separation**: Edits auto-save every 1-5s as drafts; publish button makes live. 6 publish button states.
- **Edit locking**: Single editor at a time; lock auto-releases on inactivity. Read-only for others while locked.
- **Node-level On Error**: Stop / Continue / Continue-with-error-output. The third mode passes error as data to next node — powerful for inline error recovery.
- **Sub-workflows**: Typed input schema (fields/JSON/accept-all), caller whitelist, executions outside quota, sub-workflow conversion (extract selected nodes).
- **Wait node**: Pause mid-execution, resume on duration or webhook. Great for rate limiting and human-in-loop.
- **Workflow settings** (per workflow): timezone, error workflow, timeout, save settings, data redaction, estimated time saved for analytics.
- **Quota rule**: Only production executions count. Manual/interactive and sub-workflow executions are free.
- **Collaboration**: Only one person can edit at a time (edit lock).

### Domain 5: Environments and Source Control

**n8n's approach is fundamentally different from FlowHolt:**
- n8n = Git branches + separate instances (no built-in pipeline)
- FlowHolt = built-in Draft→Staging→Production per workspace (major competitive advantage)
- n8n requires users to understand Git; FlowHolt is fully managed

**What gets committed to Git:**
- Workflow JSON (saved version, NOT published version)
- Credential stubs (ID, name, type only — no secrets)
- Variable stubs (ID, name only — no values)
- Data table schemas (structure only — no row data)
- Tags, projects, folders

**Workflow diff view (n8n Enterprise):**
- Visual comparison: Added = green + "N" icon, Modified = orange + "M" icon, Deleted = red + "D" icon
- Click modified node → JSON diff of exact parameter changes
- Available when pushing and when pulling

**FlowHolt implication:** FlowHolt's version comparison feature should implement this exact visual diff UX. Green/orange/red node highlighting with per-node JSON diff on click is the right design.

**Protected instance**: can be set to read-only to prevent editing on production instances.

### Domain 6: User Management and RBAC

**Two-tier model:**
1. **Account types** (instance-wide): Owner, Admin, Member
2. **Project roles** (project-scoped): Admin, Editor, Viewer, + Custom (Enterprise)

**Project roles:**
| Role | Can do |
|------|--------|
| Project Admin | Manage settings, members, all resources |
| Project Editor | View/create/update/delete workflows, credentials, executions |
| Project Viewer | Read-only, cannot execute workflows |

**Custom role scopes (Enterprise):** Full scope system covering workflow, execution, credential, project, folder, dataTable, projectVariable, secretsVaults, secrets, sourceControl. See [[wiki/concepts/permissions-governance]] for full list.

**Global resources:** Tags and Variables are instance-global, not project-scoped. n8n recommends owners create a member-level account for daily use.

**SSO options:** SAML (Business+), OIDC (Enterprise), LDAP (Business+/Enterprise), 2FA (all plans).

**Webhook uniqueness:** Paths must be unique across the entire instance.

---

## What FlowHolt Should Learn from n8n

### Logic and Expressions
- Rich expression language with full JavaScript support
- Better data mapping UX than Make's module-based approach
- Sub-workflow patterns (call workflow as a node) — see [[wiki/concepts/sub-workflows]]
- If/Else branching as a first-class node, not just router wiring

### AI Agent Orchestration
- Agent nodes that can loop, call tools, and decide next actions
- Memory node types (buffer, conversation, entity, summary, vector)
- Tool nodes that can be called by agents at runtime
- Chain nodes for structured LLM pipelines
- Sub-agent calling patterns

### Node Ecosystem
- Community nodes (npm packages) — large ecosystem
- Trigger diversity: webhook, schedule, form, chat, email, and more
- Code node for arbitrary JS/Python execution
- HTTP Request node with full flexibility

### Developer Experience
- In-app expression editor with autocomplete
- Debug output visible per-node inline
- Execution data pinning per node
- Workflow-level test data management

---

## n8n vs Make — Key Differences

| Dimension | Make | n8n |
|-----------|------|-----|
| Target user | Business/ops | Developers |
| Expressions | Template syntax | Full JavaScript |
| Sub-workflows | Subscenarios (same team) | Call Workflow node (any) |
| AI agents | AI Agents app | Agent, Chain, Memory, Tool nodes |
| Error handling | 5 structured handlers | Error Workflow + On Error node modes |
| Community nodes | Limited | Large npm ecosystem |
| Hosting | Cloud only | Cloud + self-hosted |
| Control plane | Mature (org/team) | Basic (instance/project) |
| Environments | None built-in | Git-based (Business+) |
| Publish model | Active/inactive toggle | Draft → Published with version history |

---

## n8n Corpus Location

| Resource | Path | Size |
|----------|------|------|
| Documentation markdown | `research/n8n-docs-export/pages_markdown/` | 1499 pages |
| Documentation JSON | `research/n8n-docs-export/pages_json/` | 1499 files |
| Raw HTML | `research/n8n-docs-export/raw_html/` | 1499 files |
| Source code research | `research/flowholt-ultimate-plan/41-N8N-SOURCE-CODE-RESEARCH-FINDINGS.md` | Full |
| UI element catalog | `research/flowholt-ultimate-plan/42-N8N-EXHAUSTIVE-UI-ELEMENT-CATALOG.md` | Full |
| Domain index | `wiki/data/n8n-domain-index.md` | 11 domains, 180 priority pages |

---

## Pending Research Tasks

- [x] Flow logic, workflow lifecycle (Domains 2+4)
- [x] Environments, source control (Domain 5)
- [x] User management, RBAC (Domain 6)
- [x] Deep read of n8n agent patterns → updated [[wiki/concepts/ai-agents]] (Domain 1 complete)
- [x] Deep read of n8n expression language → wrote new `wiki/concepts/expression-language.md` (Domain 3 complete)
- [x] Deep read of n8n core nodes → created/updated `wiki/data/node-type-inventory.md` (Domain 7 complete)
- [x] Deep read of n8n scaling/architecture → updated [[wiki/concepts/backend-architecture]] (Domain 8 complete)
- [x] Analytics + Community Nodes → updated [[wiki/concepts/observability-analytics]] (Domains 9+10 complete)
- [ ] Merge n8n insights into the master plan (plan files 49+)

---

## Related Pages

- [[flowholt]] — what we're building
- [[make]] — primary competitor
- [[wiki/analyses/n8n-research-findings]] — key findings from source code and UI research
- [[wiki/sources/n8n-docs]] — source summary
- [[wiki/data/n8n-domain-index]] — page index with priority tiers
- [[wiki/concepts/ai-agents]] — where n8n most influences FlowHolt
- [[wiki/concepts/sub-workflows]] — sub-workflow design informed by n8n
- [[wiki/concepts/execution-model]] — branch execution order, node-level controls
- [[wiki/concepts/permissions-governance]] — n8n scope reference

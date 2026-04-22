---
title: n8n Documentation Domain Index
type: data
tags: [n8n, index, domains, research]
sources: [n8n-docs]
updated: 2026-04-16
---

# n8n Documentation Domain Index

1283 content pages mapped to planning domains. Tells you exactly which pages to read for each FlowHolt design topic — and which to skip entirely.

**Priority tiers:**
- `P1` — Must deep-read. Directly impacts FlowHolt design decisions.
- `P2` — Skim. Relevant context but not design-blocking.
- `SKIP` — No design value for FlowHolt (per-app references, tutorials, release notes).

---

## Domain 1: AI Agents and Orchestration `P1`

**Impact:** [[wiki/concepts/ai-agents]] — the highest-priority n8n domain for FlowHolt.

**Page count:** ~30 design-relevant pages

| File | Topic |
|------|-------|
| `advanced-ai.md` | Overview of n8n's AI system |
| `advanced-ai__ai-workflow-builder.md` | AI workflow builder feature |
| `advanced-ai__chat-hub.md` | Chat interface |
| `advanced-ai__intro-tutorial.md` | End-to-end AI tutorial |
| `advanced-ai__rag-in-n8n.md` | RAG implementation |
| `advanced-ai__human-in-the-loop-tools.md` | Human-in-loop patterns |
| `advanced-ai__examples__understand-agents.md` | Agent internals |
| `advanced-ai__examples__understand-chains.md` | Chain patterns |
| `advanced-ai__examples__understand-memory.md` | Memory patterns |
| `advanced-ai__examples__understand-tools.md` | Tool patterns |
| `advanced-ai__examples__understand-vector-databases.md` | Vector DB patterns |
| `advanced-ai__examples__agent-chain-comparison.md` | When to use agent vs chain |
| `advanced-ai__examples__api-workflow-tool.md` | Workflow-as-tool pattern |
| `advanced-ai__examples__human-fallback.md` | Human fallback pattern |
| `advanced-ai__evaluations__overview.md` | Agent evaluation system |
| `advanced-ai__evaluations__light-evaluations.md` | Lightweight eval |
| `advanced-ai__evaluations__metric-based-evaluations.md` | Metric-based eval |
| `advanced-ai__mcp__accessing-n8n-mcp-server.md` | n8n as MCP server |
| `advanced-ai__mcp__mcp_tools_reference.md` | MCP tools reference |
| `advanced-ai__langchain__overview.md` | LangChain integration overview |
| `advanced-ai__langchain__langchain-n8n.md` | LangChain ↔ n8n mapping |

### AI Cluster Nodes (Root — Agent/Chain/Vector)
| File | Node |
|------|------|
| `integrations__builtin__cluster-nodes__root-nodes__n8n-nodes-langchain_agent.md` | Agent node |
| `integrations__builtin__cluster-nodes__root-nodes__n8n-nodes-langchain_agent__conversational-agent.md` | Conversational agent |
| `integrations__builtin__cluster-nodes__root-nodes__n8n-nodes-langchain_agent__tools-agent.md` | Tools agent |
| `integrations__builtin__cluster-nodes__root-nodes__n8n-nodes-langchain_agent__react-agent.md` | ReAct agent |
| `integrations__builtin__cluster-nodes__root-nodes__n8n-nodes-langchain_agent__plan-execute-agent.md` | Plan-and-execute agent |
| `integrations__builtin__cluster-nodes__root-nodes__n8n-nodes-langchain_chainllm.md` | LLM Chain node |
| `integrations__builtin__cluster-nodes__root-nodes__n8n-nodes-langchain_chainretrievalqa.md` | Retrieval QA chain |
| `integrations__builtin__cluster-nodes__root-nodes__n8n-nodes-langchain_chainsummarization.md` | Summarization chain |
| `integrations__builtin__cluster-nodes__root-nodes__n8n-nodes-langchain_information-extractor.md` | Info extractor |
| `integrations__builtin__cluster-nodes__root-nodes__n8n-nodes-langchain_sentimentanalysis.md` | Sentiment analysis |
| `integrations__builtin__cluster-nodes__root-nodes__n8n-nodes-langchain_text-classifier.md` | Text classifier |

### AI Cluster Nodes (Sub — Memory/Tools/Embeddings)
| File | Node |
|------|------|
| `integrations__builtin__cluster-nodes__sub-nodes__n8n-nodes-langchain_memorybufferwindow.md` | Buffer window memory |
| `integrations__builtin__cluster-nodes__sub-nodes__n8n-nodes-langchain_memorymanager.md` | Memory manager |
| `integrations__builtin__cluster-nodes__sub-nodes__n8n-nodes-langchain_memorymongochat.md` | MongoDB chat memory |
| `integrations__builtin__cluster-nodes__sub-nodes__n8n-nodes-langchain_memorypostgreschat.md` | Postgres chat memory |
| `integrations__builtin__cluster-nodes__sub-nodes__n8n-nodes-langchain_memoryredischat.md` | Redis chat memory |
| `integrations__builtin__cluster-nodes__sub-nodes__n8n-nodes-langchain_memoryzep.md` | Zep memory |
| `integrations__builtin__cluster-nodes__sub-nodes__n8n-nodes-langchain_toolworkflow.md` | Workflow tool node |
| `integrations__builtin__cluster-nodes__sub-nodes__n8n-nodes-langchain_toolaiagent.md` | Sub-agent tool |
| `integrations__builtin__cluster-nodes__sub-nodes__n8n-nodes-langchain_toolmcp.md` | MCP tool node |
| `integrations__builtin__cluster-nodes__sub-nodes__n8n-nodes-langchain_toolhttprequest.md` | HTTP tool |
| `integrations__builtin__cluster-nodes__sub-nodes__n8n-nodes-langchain_toolcode.md` | Code tool |
| `integrations__builtin__cluster-nodes__sub-nodes__n8n-nodes-langchain_retrieverworkflow.md` | Workflow retriever |
| `integrations__builtin__cluster-nodes__sub-nodes__n8n-nodes-langchain_retrievervectorstore.md` | Vector store retriever |
| `integrations__builtin__cluster-nodes__sub-nodes__n8n-nodes-langchain_outputparserstructured.md` | Structured output parser |

### Vector Stores
| File | Store |
|------|-------|
| `integrations__builtin__cluster-nodes__root-nodes__n8n-nodes-langchain_vectorstoreinmemory.md` | In-memory |
| `integrations__builtin__cluster-nodes__root-nodes__n8n-nodes-langchain_vectorstorepinecone.md` | Pinecone |
| `integrations__builtin__cluster-nodes__root-nodes__n8n-nodes-langchain_vectorstoreqdrant.md` | Qdrant |
| `integrations__builtin__cluster-nodes__root-nodes__n8n-nodes-langchain_vectorstorepgvector.md` | PGVector |
| `integrations__builtin__cluster-nodes__root-nodes__n8n-nodes-langchain_vectorstoresupabase.md` | Supabase |
| `integrations__builtin__cluster-nodes__root-nodes__n8n-nodes-langchain_vectorstorechroma.md` | Chroma |

---

## Domain 2: Flow Logic and Execution `P1`

**Impact:** [[wiki/concepts/execution-model]], [[wiki/concepts/error-handling]]

| File | Topic |
|------|-------|
| `flow-logic.md` | Overview |
| `flow-logic__error-handling.md` | Error workflow pattern (different from Make's handlers!) |
| `flow-logic__execution-order.md` | How n8n orders node execution |
| `flow-logic__looping.md` | Loop patterns (SplitInBatches) |
| `flow-logic__merging.md` | Merge node patterns |
| `flow-logic__splitting.md` | Split/branch patterns |
| `flow-logic__subworkflows.md` | Sub-workflow patterns (Execute Workflow node) |
| `flow-logic__waiting.md` | Wait node — pause/resume patterns |
| `workflows__executions__manual-partial-and-production-executions.md` | Execution modes |
| `workflows__executions__debug.md` | Debug mode |
| `workflows__executions__dirty-nodes.md` | Dirty state tracking |
| `workflows__executions__execution-data-redaction.md` | Data redaction in executions |

---

## Domain 3: Data Model and Expressions `P1`

**Impact:** New concept page: `wiki/concepts/expression-language.md`

| File | Topic |
|------|-------|
| `data.md` | Data model overview |
| `data__data-structure.md` | Items, lists, binary data |
| `data__data-mapping.md` | Data mapping overview |
| `data__data-mapping__data-mapping-ui.md` | Mapping UI patterns |
| `data__data-mapping__referencing-other-nodes.md` | Cross-node references |
| `data__data-pinning.md` | Pin data behavior |
| `data__data-filtering.md` | Filtering patterns |
| `data__data-tables.md` | Table data type |
| `data__transforming-data.md` | Transform patterns |
| `data__expressions.md` | Expression syntax overview |
| `data__expression-reference.md` | Full expression reference |
| `data__expression-reference__string.md` | String methods |
| `data__expression-reference__number.md` | Number methods |
| `data__expression-reference__datetime.md` | DateTime (Luxon) |
| `data__expression-reference__array.md` | Array methods |
| `data__expression-reference__object.md` | Object methods |
| `data__expression-reference__boolean.md` | Boolean methods |
| `data__expression-reference__item.md` | Item references |
| `data__expression-reference__workflowdata.md` | Workflow variables |
| `data__expression-reference__execdata.md` | Execution data |
| `data__expressions-for-transformation.md` | Expression transformation patterns |
| `data__specific-data-types__binary-data.md` | Binary data |
| `data__specific-data-types__jmespath.md` | JMESPath support |
| `data__specific-data-types__luxon.md` | Luxon date library |
| `code__expressions.md` | Code in expressions |
| `code__variables.md` | Variable types |

---

## Domain 4: Workflow Settings and Lifecycle `P1`

**Impact:** [[wiki/concepts/execution-model]], [[wiki/concepts/environment-deployment]]

| File | Topic |
|------|-------|
| `workflows.md` | Workflow overview |
| `workflows__settings.md` | Per-workflow settings |
| `workflows__create.md` | Workflow creation |
| `workflows__publish.md` | Activation/publish |
| `workflows__executions.md` | Executions overview |
| `workflows__executions__all-executions.md` | Execution history |
| `workflows__executions__single-workflow-executions.md` | Per-workflow execution view |
| `workflows__history.md` | Version history |
| `workflows__sharing.md` | Sharing and access |
| `workflows__export-import.md` | Export/import (blueprint model) |
| `workflows__tags.md` | Tagging/organization |
| `workflows__subworkflow-conversion.md` | Converting to sub-workflow |
| `workflows__streaming.md` | Streaming execution output |
| `workflows__components__nodes.md` | Node components |
| `workflows__components__connections.md` | Connections |
| `workflows__components__sticky-notes.md` | Canvas annotations |

---

## Domain 5: Environments and Source Control `P1`

**Impact:** [[wiki/concepts/environment-deployment]] — n8n uses git-based environments (very different from FlowHolt's approach)

| File | Topic |
|------|-------|
| `source-control-environments.md` | Overview |
| `source-control-environments__understand.md` | Concepts |
| `source-control-environments__understand__environments.md` | Environment model |
| `source-control-environments__understand__git.md` | Git branching model |
| `source-control-environments__understand__patterns.md` | Deployment patterns |
| `source-control-environments__setup.md` | Setup guide |
| `source-control-environments__create-environments.md` | Creating environments |
| `source-control-environments__using.md` | Using environments |
| `source-control-environments__using__push-pull.md` | Push/pull workflows |
| `source-control-environments__using__compare-changes.md` | Comparing changes |
| `source-control-environments__using__copy-work.md` | Copying between environments |

---

## Domain 6: User Management and RBAC `P1`

**Impact:** [[wiki/concepts/control-plane]], [[wiki/concepts/permissions-governance]]

| File | Topic |
|------|-------|
| `user-management.md` | Overview |
| `user-management__account-types.md` | Account types |
| `user-management__rbac.md` | RBAC overview |
| `user-management__rbac__projects.md` | Projects (n8n's workspace equivalent) |
| `user-management__rbac__role-types.md` | Role types |
| `user-management__rbac__custom-roles.md` | Custom roles (Enterprise) |
| `user-management__manage-users.md` | User management |
| `user-management__saml.md` | SAML SSO |
| `user-management__oidc.md` | OIDC SSO |
| `user-management__ldap.md` | LDAP |
| `user-management__two-factor-auth.md` | 2FA |
| `user-management__best-practices.md` | Best practices |

---

## Domain 7: Core Workflow Nodes `P1`

**Impact:** [[wiki/data/node-type-inventory]] — see exactly what FlowHolt's node families need

| File | Node | FlowHolt equivalent |
|------|------|-------------------|
| `integrations__builtin__core-nodes__n8n-nodes-base_if.md` | IF node | Branch (if-else) |
| `integrations__builtin__core-nodes__n8n-nodes-base_switch.md` | Switch | Router |
| `integrations__builtin__core-nodes__n8n-nodes-base_merge.md` | Merge | Merge/converge |
| `integrations__builtin__core-nodes__n8n-nodes-base_splitinbatches.md` | Split in Batches | Iterator |
| `integrations__builtin__core-nodes__n8n-nodes-base_splitout.md` | Split Out | Item splitter |
| `integrations__builtin__core-nodes__n8n-nodes-base_aggregate.md` | Aggregate | Aggregator |
| `integrations__builtin__core-nodes__n8n-nodes-base_filter.md` | Filter | Filter |
| `integrations__builtin__core-nodes__n8n-nodes-base_set.md` | Set | Set/Map |
| `integrations__builtin__core-nodes__n8n-nodes-base_code.md` | Code node | Code step |
| `integrations__builtin__core-nodes__n8n-nodes-base_executeworkflow.md` | Execute Workflow | Sub-workflow call |
| `integrations__builtin__core-nodes__n8n-nodes-base_executeworkflowtrigger.md` | Execute Workflow Trigger | Sub-workflow entry |
| `integrations__builtin__core-nodes__n8n-nodes-base_httprequest.md` | HTTP Request | HTTP Request |
| `integrations__builtin__core-nodes__n8n-nodes-base_webhook.md` | Webhook trigger | Webhook trigger |
| `integrations__builtin__core-nodes__n8n-nodes-base_scheduletrigger.md` | Schedule trigger | Schedule trigger |
| `integrations__builtin__core-nodes__n8n-nodes-base_wait.md` | Wait node | Pause node |
| `integrations__builtin__core-nodes__n8n-nodes-base_stopanderror.md` | Stop and Error | Error/throw node |
| `integrations__builtin__core-nodes__n8n-nodes-base_errortrigger.md` | Error trigger | Error workflow |
| `integrations__builtin__core-nodes__n8n-nodes-base_respondtowebhook.md` | Respond to Webhook | Webhook response |
| `integrations__builtin__core-nodes__n8n-nodes-base_form.md` | Form | Form trigger |
| `integrations__builtin__core-nodes__n8n-nodes-base_formtrigger.md` | Form trigger | Form trigger |
| `integrations__builtin__core-nodes__n8n-nodes-langchain_chattrigger.md` | Chat trigger | Chat trigger |
| `integrations__builtin__core-nodes__n8n-nodes-langchain_mcpClient.md` | MCP Client | MCP connector |
| `integrations__builtin__core-nodes__n8n-nodes-langchain_mcptrigger.md` | MCP trigger | MCP trigger |
| `integrations__builtin__core-nodes__n8n-nodes-base_aitransform.md` | AI Transform | AI data transform |
| `integrations__builtin__core-nodes__n8n-nodes-base_comparedatasets.md` | Compare datasets | Dataset compare |
| `integrations__builtin__core-nodes__n8n-nodes-base_summarize.md` | Summarize | Summarize/rollup |
| `integrations__builtin__core-nodes__n8n-nodes-base_executiondata.md` | Execution data | Execution metadata |
| `integrations__builtin__core-nodes__n8n-nodes-base_ssetrigger.md` | SSE trigger | Server-sent events |

---

## Domain 8: Scaling and Worker Topology `P2`

**Impact:** [[wiki/concepts/backend-architecture]], [[wiki/concepts/runtime-operations]]

| File | Topic |
|------|-------|
| `hosting__scaling__overview.md` | Scaling overview |
| `hosting__scaling__queue-mode.md` | Queue mode (workers) |
| `hosting__scaling__concurrency-control.md` | Concurrency limits |
| `hosting__scaling__execution-data.md` | Execution data storage |
| `hosting__scaling__binary-data.md` | Binary data at scale |
| `hosting__scaling__external-storage.md` | External storage |
| `hosting__architecture__overview.md` | Architecture overview |
| `hosting__architecture__database-structure.md` | DB schema |
| `hosting__configuration__environment-variables__queue-mode.md` | Queue env vars |
| `hosting__configuration__task-runners.md` | Task runner config |

---

## Domain 9: Analytics and Insights `P2`

**Impact:** [[wiki/concepts/observability-analytics]]

| File | Topic |
|------|-------|
| `insights.md` | Insights/analytics dashboard |
| `log-streaming.md` | Log streaming |
| `hosting__logging-monitoring__logging.md` | Logging |
| `hosting__logging-monitoring__monitoring.md` | Monitoring |

---

## Domain 10: Community Nodes Ecosystem `P2`

**Impact:** Informs FlowHolt's future plugin/extension model

| File | Topic |
|------|-------|
| `integrations__community-nodes__installation.md` | Installation |
| `integrations__community-nodes__build-community-nodes.md` | Building community nodes |
| `integrations__community-nodes__installation__verified-install.md` | Verified install process |
| `integrations__community-nodes__usage.md` | Usage |
| `integrations__community-nodes__risks.md` | Security risks |
| `integrations__community-nodes__blocklist.md` | Blocklist |

---

## Domain 11: Code Node and Built-ins `P2`

**Impact:** Informs FlowHolt's code step and expression engine

| File | Topic |
|------|-------|
| `code__code-node.md` | Code node overview |
| `code__ai-code.md` | AI-assisted code writing |
| `code__builtin__overview.md` | Built-in methods |
| `code__builtin__n8n-metadata.md` | $execution, $workflow etc |
| `code__builtin__http-node-variables.md` | HTTP vars |
| `code__builtin__jmespath.md` | JMESPath |
| `code__builtin__langchain-methods.md` | LangChain methods in code |

---

## SKIP (No FlowHolt Design Value)

| Section | Count | Reason |
|---------|-------|--------|
| `integrations__builtin__app-nodes__*` | ~280 pages | Per-app node reference only |
| `integrations__builtin__credentials__*` | ~320 pages | Credential config reference only |
| `integrations__builtin__trigger-nodes__*` | ~110 pages | Per-trigger reference only |
| `integrations__creating-nodes__*` | ~35 pages | Node dev guide — not product design |
| `courses__*` | ~20 pages | Tutorial content |
| `release-notes__*` | 3 pages | Changelog |
| `manage-cloud__*` | ~12 pages | Cloud ops only |
| `_images__*` | 216 pages | Images, no text content |

---

## Reading Priority Order for Phase 2

When starting Phase 2 deep reads, read domains in this order:

1. **Flow logic** (8 pages) — fastest, most concentrated design signal
2. **Workflow lifecycle** (16 pages) — settings, history, sub-workflows
3. **Environments/source control** (11 pages) — critical for deployment model comparison
4. **User management/RBAC** (12 pages) — critical for control plane decisions
5. **AI agents + cluster nodes** (50 pages) — heaviest, most important for AI spec
6. **Data + expressions** (25 pages) — informs expression language spec
7. **Core nodes** (28 pages) — informs node inventory
8. **Scaling/architecture** (10 pages) — informs backend architecture
9. **Analytics** (4 pages) — informs observability spec
10. **Community nodes** (6 pages) — informs extension model

**Total P1+P2 pages to read: ~180 pages** (vs 1283 total — skipping 86%)

---

## Related Pages

- [[wiki/entities/n8n]] — n8n entity profile
- [[wiki/sources/n8n-docs]] — source summary
- [[wiki/analyses/n8n-research-findings]] — existing pre-scrape findings
- [[wiki/concepts/ai-agents]] — primary destination for Domain 1 findings
- [[wiki/concepts/execution-model]] — primary destination for Domain 2 findings

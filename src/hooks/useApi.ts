/**
 * React Query hooks for FlowHolt data fetching and mutations.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchWorkflows,
  fetchWorkflow,
  fetchExecutions,
  fetchExecution,
  fetchNodeCatalog,
  fetchNodeDefinition,
  fetchNodeEditor,
  fetchHealth,
  fetchWorkspaces,
  fetchStudioBundle,
  fetchStepEditor,
  fetchWorkflowExecutions,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  runWorkflow,
  publishWorkflow,
  insertWorkflowStep,
  updateWorkflowStep,
  retryExecution,
  deleteExecution,
  draftWorkflowWithAI,
  fetchAssistantCapabilities,
  globalSearch,
  fetchTemplate,
  instantiateTemplate,
  fetchNotifications,
  markNotificationRead,
  fetchWebhookEndpoints,
  fetchWebhookEndpoint,
  createWebhookEndpoint,
  updateWebhookEndpoint,
  deleteWebhookEndpoint,
  fetchWebhookDeliveries,
  fetchWebhookQueue,
  retryQueueItem,
  dropQueueItem,
  fetchPollingTriggers,
  createPollingTrigger,
  updatePollingTrigger,
  deletePollingTrigger,
  emitInternalEvent,
  fetchInternalEvents,
  fetchHumanTasks,
  completeHumanTask,
  fetchAgents,
  fetchAgent,
  createAgent,
  updateAgent,
  deleteAgent,
  chatWithAgent,
  type AgentCreate,
  type AgentUpdate,
  type AgentChatRequest,
  type ExecutionStatus,
  type ExecutionEnvironment,
  type WorkflowCreatePayload,
  type WorkflowUpdatePayload,
  type StudioInsertStepPayload,
  type StudioUpdateStepPayload,
  type AssistantDraftRequest,
  type HumanTaskCompleteRequest,
  fetchAgentThreads,
  createAgentThread,
  deleteAgentThread,
  fetchThreadMessages,
  fetchKnowledgeBases,
  createKnowledgeBase,
  fetchKnowledgeBase,
  deleteKnowledgeBase,
  fetchKnowledgeDocuments,
  uploadKnowledgeDocument,
  deleteKnowledgeDocument,
  searchKnowledge,
  type KnowledgeBaseCreatePayload,
  triggerWorkflowRun,
  fetchAuditEvents,
  fetchAnalyticsOverview,
  fetchLogConfig,
  updateLogConfig,
  fetchLatencyPercentiles,
  fetchExecutionTimeline,
  testConnection,
  rotateSecret,
  exportVault,
  importVault,
  fetchAgentKnowledge,
  linkKnowledgeToAgent,
  unlinkKnowledgeFromAgent,
  fetchMCPServers,
  createMCPServer,
  deleteMCPServer,
  fetchEvalDatasets,
  createEvalDataset,
  deleteEvalDataset,
  fetchEvalRuns,
  createEvalRun,
  testExpression,
  fetchExpressionVariables,
  testWebhook,
  fetchWorkflowErrors,
  resetWorkflowErrors,
  fetchErrorTrackedWorkflows,
  fetchIncompleteExecutions,
  resolveIncompleteExecution,
  deleteIncompleteExecution,
  fetchDeadLetters,
  replayDeadLetter,
  purgeDeadLetters,
  purgeOldDeliveries,
  fetchRetentionInfo,
  fetchVaultOverview,
  fetchVaultCredentials,
  fetchVaultConnections,
  fetchVaultVariables,
  createVaultAsset,
  updateVaultAsset,
  deleteVaultAsset,
  verifyVaultAsset,
  type VaultAssetCreate,
  type VaultAssetUpdate,
  fetchProfile,
  updateProfile,
  fetchPreferences,
  updatePreferences,
  fetchApiKeys,
  createApiKey,
  deleteApiKey,
  type UserProfileUpdate,
  fetchOAuthProviders,
  startOAuthAuthorize,
  oauthCallback,
  refreshOAuthToken,
  type OAuthProvider,
  fetchWorkspaceMembers,
  inviteWorkspaceMember,
  updateMemberRole,
  removeMember,
  type WorkspaceRole,
  fetchWorkspaceSettings,
  updateWorkspaceSettings,
  fetchSystemStatus,
} from "@/lib/api";

// ── Queries ─────────────────────────────────────────────────────────

export function useWorkflows(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ["workflows", params],
    queryFn: () => fetchWorkflows(params),
    staleTime: 30_000,
  });
}

export function useWorkflow(id: string | undefined) {
  return useQuery({
    queryKey: ["workflow", id],
    queryFn: () => fetchWorkflow(id!),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useExecutions(params?: { limit?: number; offset?: number; status?: ExecutionStatus }) {
  return useQuery({
    queryKey: ["executions", params],
    queryFn: () => fetchExecutions(params),
    staleTime: 15_000,
  });
}

export function useExecution(id: string | undefined) {
  return useQuery({
    queryKey: ["execution", id],
    queryFn: () => fetchExecution(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useWorkflowExecutions(workflowId: string | undefined, params?: { limit?: number }) {
  return useQuery({
    queryKey: ["workflow-executions", workflowId, params],
    queryFn: () => fetchWorkflowExecutions(workflowId!, params),
    enabled: !!workflowId,
    staleTime: 15_000,
  });
}

export function useNodeCatalog() {
  return useQuery({
    queryKey: ["nodeCatalog"],
    queryFn: fetchNodeCatalog,
    staleTime: 5 * 60_000,
  });
}

export function useNodeDefinition(nodeType: string | undefined) {
  return useQuery({
    queryKey: ["node-definition", nodeType],
    queryFn: () => fetchNodeDefinition(nodeType!),
    enabled: !!nodeType,
    staleTime: 5 * 60_000,
  });
}

export function useNodeEditor(nodeType: string | undefined, opts?: { workflowId?: string; stepId?: string; triggerType?: string }) {
  return useQuery({
    queryKey: ["node-editor", nodeType, opts?.workflowId, opts?.stepId],
    queryFn: () => fetchNodeEditor(nodeType!, opts),
    enabled: !!nodeType,
    staleTime: 60_000,
  });
}

export function useStudioBundle(workflowId: string | undefined, stepId?: string) {
  return useQuery({
    queryKey: ["studio-bundle", workflowId, stepId],
    queryFn: () => fetchStudioBundle(workflowId!, stepId),
    enabled: !!workflowId,
    staleTime: 30_000,
  });
}

export function useStepEditor(workflowId: string | undefined, stepId: string | undefined) {
  return useQuery({
    queryKey: ["step-editor", workflowId, stepId],
    queryFn: () => fetchStepEditor(workflowId!, stepId!),
    enabled: !!workflowId && !!stepId,
    staleTime: 60_000,
  });
}

export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
    staleTime: 60_000,
    retry: 1,
  });
}

export function useWorkspaces() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: fetchWorkspaces,
    staleTime: 60_000,
  });
}

// ── Mutations ───────────────────────────────────────────────────────

export function useCreateWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: WorkflowCreatePayload) => createWorkflow(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["workflows"] }); },
  });
}

export function useUpdateWorkflow(workflowId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: WorkflowUpdatePayload) => updateWorkflow(workflowId, payload),
    onSuccess: (updated) => {
      qc.setQueryData(["workflow", workflowId], updated);
      qc.invalidateQueries({ queryKey: ["workflows"] });
      qc.invalidateQueries({ queryKey: ["studio-bundle", workflowId] });
    },
  });
}

export function useDeleteWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteWorkflow(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["workflows"] });
      qc.removeQueries({ queryKey: ["workflow", id] });
    },
  });
}

export function useRunWorkflow(workflowId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (opts?: { payload?: Record<string, unknown>; environment?: ExecutionEnvironment; pinnedData?: Record<string, unknown> }) =>
      runWorkflow(workflowId, opts?.payload ?? {}, opts?.environment ?? "draft", opts?.pinnedData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["executions"] });
      qc.invalidateQueries({ queryKey: ["workflow-executions", workflowId] });
    },
  });
}

export function usePublishWorkflow(workflowId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notes?: string) => publishWorkflow(workflowId, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workflow", workflowId] });
      qc.invalidateQueries({ queryKey: ["workflows"] });
    },
  });
}

export function useInsertWorkflowStep(workflowId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: StudioInsertStepPayload) => insertWorkflowStep(workflowId, payload),
    onSuccess: (bundle) => {
      qc.setQueryData(["studio-bundle", workflowId], bundle);
      qc.setQueryData(["workflow", workflowId], bundle.workflow);
    },
  });
}

export function useUpdateWorkflowStep(workflowId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (opts: { stepId: string; payload: StudioUpdateStepPayload }) =>
      updateWorkflowStep(workflowId, opts.stepId, opts.payload),
    onSuccess: (bundle) => {
      qc.setQueryData(["studio-bundle", workflowId], bundle);
      qc.setQueryData(["workflow", workflowId], bundle.workflow);
    },
  });
}

export function useRetryExecution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => retryExecution(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["executions"] }); },
  });
}

export function useDeleteExecution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteExecution(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["executions"] });
      qc.removeQueries({ queryKey: ["execution", id] });
    },
  });
}

// ── Sprint 26: Assistant / AI ───────────────────────────────────────

export function useDraftWorkflowWithAI() {
  return useMutation({
    mutationFn: (payload: AssistantDraftRequest) => draftWorkflowWithAI(payload),
  });
}

export function useAssistantCapabilities() {
  return useQuery({
    queryKey: ["assistant-capabilities"],
    queryFn: fetchAssistantCapabilities,
    staleTime: 5 * 60_000,
  });
}

// ── Sprint 26: Global Search ────────────────────────────────────────

export function useGlobalSearch(query: string) {
  return useQuery({
    queryKey: ["globalSearch", query],
    queryFn: () => globalSearch(query),
    enabled: query.length >= 2,
    staleTime: 10_000,
  });
}

// ── Sprint 26: Templates ────────────────────────────────────────────

export function useTemplate(templateId: string | undefined) {
  return useQuery({
    queryKey: ["template", templateId],
    queryFn: () => fetchTemplate(templateId!),
    enabled: !!templateId,
    staleTime: 60_000,
  });
}

export function useInstantiateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (opts: { templateId: string; name: string; folder?: string }) =>
      instantiateTemplate(opts.templateId, { name: opts.name, folder: opts.folder }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["workflows"] }); },
  });
}

// ── Sprint 26: Notifications ────────────────────────────────────────

export function useNotifications(params?: { limit?: number; offset?: number; read?: boolean }) {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: () => fetchNotifications(params),
    staleTime: 15_000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notifications"] }); },
  });
}

// ── Sprint 26: Webhooks ─────────────────────────────────────────────

export function useWebhookEndpoints() {
  return useQuery({
    queryKey: ["webhookEndpoints"],
    queryFn: fetchWebhookEndpoints,
    staleTime: 30_000,
  });
}

export function useWebhookEndpoint(id: string | undefined) {
  return useQuery({
    queryKey: ["webhookEndpoint", id],
    queryFn: () => fetchWebhookEndpoint(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useWebhookDeliveries(webhookId: string | undefined, limit?: number, offset?: number) {
  return useQuery({
    queryKey: ["webhookDeliveries", webhookId, limit, offset],
    queryFn: () => fetchWebhookDeliveries(webhookId!, limit, offset),
    enabled: !!webhookId,
    staleTime: 15_000,
  });
}

export function useWebhookQueue(status?: string, webhookId?: string) {
  return useQuery({
    queryKey: ["webhookQueue", status, webhookId],
    queryFn: () => fetchWebhookQueue(status, webhookId),
    staleTime: 10_000,
  });
}

export function useCreateWebhookEndpoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      createWebhookEndpoint(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["webhookEndpoints"] }); },
  });
}

export function useUpdateWebhookEndpoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (opts: { id: string; payload: Record<string, unknown> }) =>
      updateWebhookEndpoint(opts.id, opts.payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["webhookEndpoints"] });
      qc.invalidateQueries({ queryKey: ["webhookEndpoint"] });
    },
  });
}

export function useDeleteWebhookEndpoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteWebhookEndpoint(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["webhookEndpoints"] }); },
  });
}

export function useRetryQueueItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (queueId: string) => retryQueueItem(queueId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["webhookQueue"] }); },
  });
}

export function useDropQueueItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (queueId: string) => dropQueueItem(queueId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["webhookQueue"] }); },
  });
}

// ── Sprint 40: Polling Triggers & Event Bus ─────────────────────────

export function usePollingTriggers() {
  return useQuery({
    queryKey: ["pollingTriggers"],
    queryFn: fetchPollingTriggers,
    staleTime: 30_000,
  });
}

export function useCreatePollingTrigger() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => createPollingTrigger(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pollingTriggers"] }); },
  });
}

export function useUpdatePollingTrigger() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (opts: { id: string; payload: Record<string, unknown> }) =>
      updatePollingTrigger(opts.id, opts.payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pollingTriggers"] }); },
  });
}

export function useDeletePollingTrigger() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePollingTrigger(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pollingTriggers"] }); },
  });
}

export function useInternalEvents(eventType?: string) {
  return useQuery({
    queryKey: ["internalEvents", eventType],
    queryFn: () => fetchInternalEvents(eventType),
    staleTime: 15_000,
  });
}

export function useEmitEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { event_type: string; payload?: Record<string, unknown> }) =>
      emitInternalEvent(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["internalEvents"] }); },
  });
}

// ── Sprint 41: Webhook Test, Error Tracking, Incomplete Executions ──

export function useTestWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => testWebhook(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["webhookDeliveries"] });
      qc.invalidateQueries({ queryKey: ["webhookQueue"] });
    },
  });
}

export function useWorkflowErrors(workflowId: string | undefined) {
  return useQuery({
    queryKey: ["workflowErrors", workflowId],
    queryFn: () => fetchWorkflowErrors(workflowId!),
    enabled: !!workflowId,
    staleTime: 30_000,
  });
}

export function useResetWorkflowErrors() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (workflowId: string) => resetWorkflowErrors(workflowId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["workflowErrors"] }); },
  });
}

export function useErrorTrackedWorkflows() {
  return useQuery({
    queryKey: ["errorTrackedWorkflows"],
    queryFn: () => fetchErrorTrackedWorkflows(),
    staleTime: 30_000,
  });
}

export function useIncompleteExecutions(opts?: { workflow_id?: string; status?: string }) {
  return useQuery({
    queryKey: ["incompleteExecutions", opts],
    queryFn: () => fetchIncompleteExecutions(opts),
    staleTime: 15_000,
  });
}

export function useResolveIncompleteExecution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resolveIncompleteExecution(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["incompleteExecutions"] }); },
  });
}

export function useDeleteIncompleteExecution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteIncompleteExecution(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["incompleteExecutions"] }); },
  });
}

// ── Sprint 26: Human Tasks / Inbox ──────────────────────────────────

export function useHumanTasks(params?: { mine?: boolean; status?: string }) {
  return useQuery({
    queryKey: ["humanTasks", params],
    queryFn: () => fetchHumanTasks(params),
    staleTime: 15_000,
  });
}

export function useCompleteHumanTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (opts: { taskId: string; payload: HumanTaskCompleteRequest }) =>
      completeHumanTask(opts.taskId, opts.payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["humanTasks"] });
      qc.invalidateQueries({ queryKey: ["executions"] });
    },
  });
}

// ── Agent hooks ─────────────────────────────────────────────────────

export function useAgents() {
  return useQuery({
    queryKey: ["agents"],
    queryFn: () => fetchAgents(),
    staleTime: 30_000,
  });
}

export function useAgent(id: string | undefined) {
  return useQuery({
    queryKey: ["agent", id],
    queryFn: () => fetchAgent(id!),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useCreateAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AgentCreate) => createAgent(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}

export function useUpdateAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (opts: { agentId: string; payload: AgentUpdate }) =>
      updateAgent(opts.agentId, opts.payload),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["agents"] });
      qc.invalidateQueries({ queryKey: ["agent", vars.agentId] });
    },
  });
}

export function useDeleteAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (agentId: string) => deleteAgent(agentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}

export function useAgentChat() {
  return useMutation({
    mutationFn: (opts: { agentId: string; payload: AgentChatRequest }) =>
      chatWithAgent(opts.agentId, opts.payload),
  });
}

// ── Chat Thread hooks ──

export function useAgentThreads(agentId: string) {
  return useQuery({ queryKey: ["agent-threads", agentId], queryFn: () => fetchAgentThreads(agentId), enabled: !!agentId });
}

export function useCreateThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (opts: { agentId: string; title?: string }) => createAgentThread(opts.agentId, opts.title),
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ["agent-threads", v.agentId] }),
  });
}

export function useDeleteThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (threadId: string) => deleteAgentThread(threadId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agent-threads"] }),
  });
}

export function useThreadMessages(threadId: string) {
  return useQuery({ queryKey: ["thread-messages", threadId], queryFn: () => fetchThreadMessages(threadId), enabled: !!threadId });
}

// ── Knowledge Base hooks ──

export function useKnowledgeBases() {
  return useQuery({ queryKey: ["knowledge-bases"], queryFn: fetchKnowledgeBases });
}

export function useKnowledgeBase(kbId: string) {
  return useQuery({ queryKey: ["knowledge-base", kbId], queryFn: () => fetchKnowledgeBase(kbId), enabled: !!kbId });
}

export function useCreateKnowledgeBase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: KnowledgeBaseCreatePayload) => createKnowledgeBase(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["knowledge-bases"] }),
  });
}

export function useDeleteKnowledgeBase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (kbId: string) => deleteKnowledgeBase(kbId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["knowledge-bases"] }),
  });
}

export function useKnowledgeDocuments(kbId: string) {
  return useQuery({ queryKey: ["knowledge-docs", kbId], queryFn: () => fetchKnowledgeDocuments(kbId), enabled: !!kbId });
}

export function useUploadKnowledgeDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (opts: { kbId: string; filename: string; content: string }) =>
      uploadKnowledgeDocument(opts.kbId, opts.filename, opts.content),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["knowledge-docs", v.kbId] });
      qc.invalidateQueries({ queryKey: ["knowledge-bases"] });
    },
  });
}

export function useDeleteKnowledgeDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (docId: string) => deleteKnowledgeDocument(docId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["knowledge-docs"] });
      qc.invalidateQueries({ queryKey: ["knowledge-bases"] });
    },
  });
}

export function useSearchKnowledge() {
  return useMutation({
    mutationFn: (opts: { kbId: string; query: string; topK?: number }) =>
      searchKnowledge(opts.kbId, opts.query, opts.topK),
  });
}

// ── Agent-Knowledge Linking Hooks ──

export function useAgentKnowledge(agentId: string) {
  return useQuery({
    queryKey: ["agent-knowledge", agentId],
    queryFn: () => fetchAgentKnowledge(agentId),
    enabled: !!agentId,
    staleTime: 30_000,
  });
}

export function useLinkKnowledge(agentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (kbId: string) => linkKnowledgeToAgent(agentId, kbId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agent-knowledge", agentId] });
      qc.invalidateQueries({ queryKey: ["agent", agentId] });
    },
  });
}

export function useUnlinkKnowledge(agentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (kbId: string) => unlinkKnowledgeFromAgent(agentId, kbId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agent-knowledge", agentId] });
      qc.invalidateQueries({ queryKey: ["agent", agentId] });
    },
  });
}

// ── Workflow Run Hook ──

export function useTriggerWorkflowRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (opts: { workflowId: string; payload?: Record<string, unknown> }) =>
      triggerWorkflowRun(opts.workflowId, opts.payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["executions"] }),
  });
}


// ── Audit & Analytics Hooks ──

export function useAuditEvents() {
  return useQuery({
    queryKey: ["audit-events"],
    queryFn: fetchAuditEvents,
    staleTime: 15_000,
  });
}

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ["analytics-overview"],
    queryFn: fetchAnalyticsOverview,
    staleTime: 30_000,
  });
}

export function useLogConfig() {
  return useQuery({
    queryKey: ["log-config"],
    queryFn: fetchLogConfig,
    staleTime: 60_000,
  });
}

export function useUpdateLogConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateLogConfig,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["log-config"] }),
  });
}

export function useLatencyPercentiles() {
  return useQuery({
    queryKey: ["analytics-latency"],
    queryFn: fetchLatencyPercentiles,
    staleTime: 30_000,
  });
}

export function useExecutionTimeline(days = 7) {
  return useQuery({
    queryKey: ["analytics-timeline", days],
    queryFn: () => fetchExecutionTimeline(days),
    staleTime: 30_000,
  });
}


// ── Vault Connection Hooks ──

export function useVaultOverview() {
  return useQuery({
    queryKey: ["vault", "overview"],
    queryFn: fetchVaultOverview,
    staleTime: 30_000,
  });
}

export function useVaultCredentials() {
  return useQuery({
    queryKey: ["vault", "credentials"],
    queryFn: fetchVaultCredentials,
    staleTime: 30_000,
  });
}

export function useVaultConnections() {
  return useQuery({
    queryKey: ["vault", "connections"],
    queryFn: fetchVaultConnections,
    staleTime: 30_000,
  });
}

export function useVaultVariables() {
  return useQuery({
    queryKey: ["vault", "variables"],
    queryFn: fetchVaultVariables,
    staleTime: 30_000,
  });
}

export function useCreateVaultAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: VaultAssetCreate) => createVaultAsset(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vault"] }),
  });
}

export function useUpdateVaultAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: VaultAssetUpdate }) => updateVaultAsset(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vault"] }),
  });
}

export function useDeleteVaultAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteVaultAsset(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vault"] }),
  });
}

export function useVerifyVaultAsset() {
  return useMutation({
    mutationFn: (assetId: string) => verifyVaultAsset(assetId),
  });
}

export function useTestConnection() {
  return useMutation({
    mutationFn: (assetId: string) => testConnection(assetId),
  });
}

export function useRotateSecret() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assetId: string) => rotateSecret(assetId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vault"] }),
  });
}

export function useExportVault() {
  return useMutation({ mutationFn: exportVault });
}

export function useImportVault() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assets: Record<string, unknown>[]) => importVault(assets),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vault"] }),
  });
}


// ── MCP Server Hooks ──

export function useMCPServers() {
  return useQuery({
    queryKey: ["mcp-servers"],
    queryFn: fetchMCPServers,
    staleTime: 30_000,
  });
}

export function useCreateMCPServer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createMCPServer,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mcp-servers"] }),
  });
}

export function useDeleteMCPServer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (serverId: string) => deleteMCPServer(serverId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mcp-servers"] }),
  });
}


// ── Evaluation Hooks ──

export function useEvalDatasets(agentId?: string) {
  return useQuery({
    queryKey: ["eval-datasets", agentId],
    queryFn: () => fetchEvalDatasets(agentId),
    staleTime: 30_000,
  });
}

export function useCreateEvalDataset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createEvalDataset,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["eval-datasets"] }),
  });
}

export function useDeleteEvalDataset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (datasetId: string) => deleteEvalDataset(datasetId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["eval-datasets"] }),
  });
}

export function useEvalRuns(agentId?: string, datasetId?: string) {
  return useQuery({
    queryKey: ["eval-runs", agentId, datasetId],
    queryFn: () => fetchEvalRuns(agentId, datasetId),
    staleTime: 15_000,
  });
}

export function useCreateEvalRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (opts: { datasetId: string; agentId: string }) =>
      createEvalRun(opts.datasetId, opts.agentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["eval-runs"] }),
  });
}

// ── Expression Engine ──

export function useExpressionVariables() {
  return useQuery({
    queryKey: ["expression-variables"],
    queryFn: fetchExpressionVariables,
    staleTime: 300_000,
  });
}

export function useTestExpression() {
  return useMutation({
    mutationFn: (opts: { expression: string; contextData?: Record<string, unknown>; mode?: string }) =>
      testExpression(opts.expression, opts.contextData, opts.mode),
  });
}

// ── Sprint 43: Dead Letter Queue, Retention ──

export function useDeadLetters(limit = 50, offset = 0) {
  return useQuery({
    queryKey: ["dead-letters", limit, offset],
    queryFn: () => fetchDeadLetters(limit, offset),
    staleTime: 10_000,
  });
}

export function useReplayDeadLetter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (queueId: string) => replayDeadLetter(queueId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dead-letters"] }),
  });
}

export function usePurgeDeadLetters() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => purgeDeadLetters(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dead-letters"] }),
  });
}

export function usePurgeOldDeliveries() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (days?: number) => purgeOldDeliveries(days),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["webhook-deliveries"] }),
  });
}

export function useRetentionInfo() {
  return useQuery({
    queryKey: ["webhook-retention"],
    queryFn: fetchRetentionInfo,
    staleTime: 300_000,
  });
}

// ── Settings: Profile, Preferences, API Keys ─────────────────────────

export function useProfile() {
  return useQuery({ queryKey: ["profile"], queryFn: fetchProfile, staleTime: 120_000 });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UserProfileUpdate) => updateProfile(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["profile"] }); qc.invalidateQueries({ queryKey: ["session"] }); },
  });
}

export function usePreferences() {
  return useQuery({ queryKey: ["preferences"], queryFn: fetchPreferences, staleTime: 120_000 });
}

export function useUpdatePreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Record<string, unknown>>) => updatePreferences(data as any),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["preferences"] }),
  });
}

export function useApiKeys() {
  return useQuery({ queryKey: ["api-keys"], queryFn: fetchApiKeys, staleTime: 60_000 });
}

export function useCreateApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name?: string) => createApiKey(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["api-keys"] }),
  });
}

export function useDeleteApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (keyId: string) => deleteApiKey(keyId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["api-keys"] }),
  });
}

// ── OAuth / Integrations ────────────────────────────────────────────

export function useOAuthProviders() {
  return useQuery({
    queryKey: ["oauth-providers"],
    queryFn: fetchOAuthProviders,
    staleTime: 60_000,
  });
}

export function useStartOAuth() {
  return useMutation({
    mutationFn: (opts: { provider: string; clientId: string; redirectUri: string; scopes?: string[] }) =>
      startOAuthAuthorize(opts.provider, opts.clientId, opts.redirectUri, opts.scopes),
  });
}

export function useOAuthCallback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (opts: { provider: string; code: string; state: string; redirectUri: string }) =>
      oauthCallback(opts.provider, opts.code, opts.state, opts.redirectUri),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["oauth-providers"] });
      qc.invalidateQueries({ queryKey: ["vault-connections"] });
    },
  });
}

export function useRefreshOAuth() {
  return useMutation({
    mutationFn: (connectionId: string) => refreshOAuthToken(connectionId),
  });
}

// ── Workspace Members ──

export function useWorkspaceMembers() {
  return useQuery({
    queryKey: ["workspace-members"],
    queryFn: () => fetchWorkspaceMembers(),
    staleTime: 30_000,
  });
}

export function useInviteMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, role }: { email: string; role: WorkspaceRole }) => inviteWorkspaceMember(email, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workspace-members"] }),
  });
}

export function useUpdateMemberRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: WorkspaceRole }) => updateMemberRole(userId, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workspace-members"] }),
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => removeMember(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workspace-members"] }),
  });
}

// ── Workspace Settings ──

export function useWorkspaceSettings() {
  return useQuery({
    queryKey: ["workspace-settings"],
    queryFn: () => fetchWorkspaceSettings(),
    staleTime: 60_000,
  });
}

export function useUpdateWorkspaceSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<import("@/lib/api").WorkspaceSettingsData>) => updateWorkspaceSettings(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workspace-settings"] }),
  });
}

// ── System Status ──

export function useSystemStatus() {
  return useQuery({
    queryKey: ["system-status"],
    queryFn: () => fetchSystemStatus(),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

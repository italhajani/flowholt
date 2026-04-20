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
  type ExecutionStatus,
  type ExecutionEnvironment,
  type WorkflowCreatePayload,
  type WorkflowUpdatePayload,
  type StudioInsertStepPayload,
  type StudioUpdateStepPayload,
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
    mutationFn: (opts?: { payload?: Record<string, unknown>; environment?: ExecutionEnvironment }) =>
      runWorkflow(workflowId, opts?.payload ?? {}, opts?.environment ?? "draft"),
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

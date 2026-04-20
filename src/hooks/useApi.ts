/**
 * React Query hooks for FlowHolt data fetching.
 */
import { useQuery } from "@tanstack/react-query";
import {
  fetchWorkflows,
  fetchWorkflow,
  fetchExecutions,
  fetchExecution,
  fetchNodeCatalog,
  fetchHealth,
  fetchWorkspaces,
  type ExecutionStatus,
} from "@/lib/api";

// Workflows
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

// Executions
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

// Studio
export function useNodeCatalog() {
  return useQuery({
    queryKey: ["nodeCatalog"],
    queryFn: fetchNodeCatalog,
    staleTime: 5 * 60_000, // node catalog rarely changes
  });
}

// System
export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
    staleTime: 60_000,
    retry: 1,
  });
}

// Workspaces
export function useWorkspaces() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: fetchWorkspaces,
    staleTime: 60_000,
  });
}

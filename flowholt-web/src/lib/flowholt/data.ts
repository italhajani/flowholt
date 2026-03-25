import { createClient } from "@/lib/supabase/server";
import type {
  DashboardSnapshot,
  WorkflowGraph,
  WorkflowLibrarySnapshot,
  WorkflowRecord,
  WorkflowRunRecord,
  WorkspaceRecord,
} from "@/lib/flowholt/types";

export const starterGraph: WorkflowGraph = {
  nodes: [
    { id: "trigger", type: "trigger", label: "Webhook trigger" },
    { id: "research", type: "agent", label: "Research agent" },
    { id: "qualify", type: "condition", label: "Qualification branch" },
    { id: "email", type: "agent", label: "Email agent" },
    { id: "crm", type: "tool", label: "CRM writeback" },
    { id: "output", type: "output", label: "Report output" },
  ],
  edges: [
    { source: "trigger", target: "research" },
    { source: "research", target: "qualify" },
    { source: "qualify", target: "email" },
    { source: "email", target: "crm" },
    { source: "crm", target: "output" },
  ],
};

const demoWorkflow: WorkflowRecord = {
  id: "demo-workflow",
  workspace_id: "demo-workspace",
  created_by_user_id: "demo-user",
  name: "Lead intake autopilot",
  description: "Demo workflow until the database has real rows.",
  status: "draft",
  graph: starterGraph,
  settings: {},
  created_at: new Date(0).toISOString(),
  updated_at: new Date(0).toISOString(),
};

function emptySnapshot(): DashboardSnapshot {
  return {
    schemaReady: false,
    workspaces: [],
    activeWorkspace: null,
    recentWorkflows: [],
    recentRuns: [],
    workflowCount: 0,
    runCount: 0,
    successRate: 0,
  };
}

async function getWorkspaceState() {
  const supabase = await createClient();
  const { data: workspaces, error } = await supabase
    .from("workspaces")
    .select("id, name, slug, description, created_at, updated_at")
    .order("created_at", { ascending: true });

  if (error) {
    return {
      schemaReady: false,
      workspaces: [] as WorkspaceRecord[],
      activeWorkspace: null as WorkspaceRecord | null,
      supabase,
    };
  }

  const workspaceList = (workspaces ?? []) as WorkspaceRecord[];

  return {
    schemaReady: true,
    workspaces: workspaceList,
    activeWorkspace: workspaceList[0] ?? null,
    supabase,
  };
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const workspaceState = await getWorkspaceState();

  if (!workspaceState.schemaReady) {
    return emptySnapshot();
  }

  if (!workspaceState.activeWorkspace) {
    return {
      ...emptySnapshot(),
      schemaReady: true,
      workspaces: workspaceState.workspaces,
    };
  }

  const { data: workflows, error: workflowsError } = await workspaceState.supabase
    .from("workflows")
    .select(
      "id, workspace_id, created_by_user_id, name, description, status, graph, settings, created_at, updated_at",
    )
    .eq("workspace_id", workspaceState.activeWorkspace.id)
    .order("updated_at", { ascending: false })
    .limit(5);

  const { data: runs, error: runsError } = await workspaceState.supabase
    .from("workflow_runs")
    .select(
      "id, workflow_id, workspace_id, status, trigger_source, output, error_message, started_at, finished_at, created_at",
    )
    .eq("workspace_id", workspaceState.activeWorkspace.id)
    .order("created_at", { ascending: false })
    .limit(5);

  if (workflowsError || runsError) {
    return {
      ...emptySnapshot(),
      schemaReady: true,
      workspaces: workspaceState.workspaces,
      activeWorkspace: workspaceState.activeWorkspace,
    };
  }

  const recentWorkflows = (workflows ?? []) as WorkflowRecord[];
  const recentRuns = (runs ?? []) as WorkflowRunRecord[];
  const succeededRuns = recentRuns.filter((run) => run.status === "succeeded").length;
  const successRate = recentRuns.length
    ? Math.round((succeededRuns / recentRuns.length) * 100)
    : 0;

  return {
    schemaReady: true,
    workspaces: workspaceState.workspaces,
    activeWorkspace: workspaceState.activeWorkspace,
    recentWorkflows,
    recentRuns,
    workflowCount: recentWorkflows.length,
    runCount: recentRuns.length,
    successRate,
  };
}

export async function getWorkflowLibrarySnapshot(): Promise<WorkflowLibrarySnapshot> {
  const workspaceState = await getWorkspaceState();

  if (!workspaceState.schemaReady) {
    return {
      schemaReady: false,
      workspaces: [],
      activeWorkspace: null,
      workflows: [],
    };
  }

  if (!workspaceState.activeWorkspace) {
    return {
      schemaReady: true,
      workspaces: workspaceState.workspaces,
      activeWorkspace: null,
      workflows: [],
    };
  }

  const { data, error } = await workspaceState.supabase
    .from("workflows")
    .select(
      "id, workspace_id, created_by_user_id, name, description, status, graph, settings, created_at, updated_at",
    )
    .eq("workspace_id", workspaceState.activeWorkspace.id)
    .order("updated_at", { ascending: false });

  return {
    schemaReady: true,
    workspaces: workspaceState.workspaces,
    activeWorkspace: workspaceState.activeWorkspace,
    workflows: error ? [] : ((data ?? []) as WorkflowRecord[]),
  };
}

export async function getWorkflowForStudio(workflowId: string) {
  if (workflowId === demoWorkflow.id) {
    return demoWorkflow;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workflows")
    .select(
      "id, workspace_id, created_by_user_id, name, description, status, graph, settings, created_at, updated_at",
    )
    .eq("id", workflowId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as WorkflowRecord;
}

export function getDemoWorkflow() {
  return demoWorkflow;
}

import type { SupabaseClient } from "@supabase/supabase-js";

import { getEngineUrl } from "@/lib/flowholt/engine";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type ReadinessStatus = "ok" | "warn" | "error";

export type PlatformReadinessCheck = {
  id: string;
  label: string;
  status: ReadinessStatus;
  detail: string;
};

export type PlatformReadinessReport = {
  overall: "ready" | "needs_attention";
  generated_at: string;
  checks: PlatformReadinessCheck[];
};

type AssessOptions = {
  supabase?: SupabaseClient;
  includeAuthCheck?: boolean;
};

function envHasValue(value: string | undefined | null) {
  return Boolean(value && value.trim());
}

function maskError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
}

function timeoutSignal(ms: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);

  return {
    signal: controller.signal,
    done: () => clearTimeout(timer),
  };
}

function summarize(checks: PlatformReadinessCheck[]): PlatformReadinessReport["overall"] {
  return checks.some((check) => check.status === "error") ? "needs_attention" : "ready";
}

export async function assessPlatformReadiness(
  options: AssessOptions = {},
): Promise<PlatformReadinessReport> {
  const checks: PlatformReadinessCheck[] = [];

  const hasSupabaseUrl = envHasValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasPublishable =
    envHasValue(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
    envHasValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const hasServiceRole = envHasValue(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const hasSchedulerKey = envHasValue(process.env.FLOWHOLT_SCHEDULER_KEY);
  const hasWorkerKey =
    envHasValue(process.env.FLOWHOLT_WORKER_KEY) || envHasValue(process.env.FLOWHOLT_SCHEDULER_KEY);
  const hasEngineUrl =
    envHasValue(process.env.FLOWHOLT_ENGINE_URL) ||
    envHasValue(process.env.NEXT_PUBLIC_ENGINE_URL);
  const hasProviderKey =
    envHasValue(process.env.GROQ_API_KEY) || envHasValue(process.env.HUGGINGFACE_API_KEY);

  checks.push({
    id: "supabase-url",
    label: "Supabase URL",
    status: hasSupabaseUrl ? "ok" : "error",
    detail: hasSupabaseUrl
      ? "Configured"
      : "Missing NEXT_PUBLIC_SUPABASE_URL",
  });

  checks.push({
    id: "supabase-publishable",
    label: "Supabase publishable key",
    status: hasPublishable ? "ok" : "error",
    detail: hasPublishable
      ? "Configured"
      : "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)",
  });

  checks.push({
    id: "supabase-service-role",
    label: "Supabase service role key",
    status: hasServiceRole ? "ok" : "error",
    detail: hasServiceRole
      ? "Configured"
      : "Missing SUPABASE_SERVICE_ROLE_KEY in flowholt-web/.env.local",
  });

  checks.push({
    id: "scheduler-key",
    label: "Scheduler secret",
    status: hasSchedulerKey ? "ok" : "warn",
    detail: hasSchedulerKey
      ? "Configured"
      : "Missing FLOWHOLT_SCHEDULER_KEY (required for /api/scheduler/tick)",
  });

  checks.push({
    id: "worker-key",
    label: "Queue worker secret",
    status: hasWorkerKey ? "ok" : "warn",
    detail: hasWorkerKey
      ? "Configured"
      : "Missing FLOWHOLT_WORKER_KEY (recommended for /api/queue/worker)",
  });

  checks.push({
    id: "engine-url",
    label: "Engine URL",
    status: hasEngineUrl ? "ok" : "warn",
    detail: hasEngineUrl
      ? `Configured as ${getEngineUrl()}`
      : "Missing FLOWHOLT_ENGINE_URL or NEXT_PUBLIC_ENGINE_URL",
  });

  checks.push({
    id: "provider-key",
    label: "AI provider key",
    status: hasProviderKey ? "ok" : "warn",
    detail: hasProviderKey
      ? "At least one provider key is configured"
      : "No GROQ_API_KEY or HUGGINGFACE_API_KEY found; generation will use fallback mode",
  });

  const supabase = options.supabase ?? (await createClient());

  if (options.includeAuthCheck ?? true) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    checks.push({
      id: "auth-session",
      label: "Authenticated session",
      status: user ? "ok" : "error",
      detail: user ? "Authenticated" : "No active authenticated session",
    });
  }

  try {
    const { error } = await supabase
      .from("workspaces")
      .select("id")
      .limit(1);

    checks.push({
      id: "supabase-rls-access",
      label: "Supabase app access",
      status: error ? "error" : "ok",
      detail: error ? `Query failed: ${error.message}` : "Query access is healthy",
    });
  } catch (error) {
    checks.push({
      id: "supabase-rls-access",
      label: "Supabase app access",
      status: "error",
      detail: `Query failed: ${maskError(error)}`,
    });
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("workflows")
      .select("id")
      .limit(1);

    checks.push({
      id: "supabase-admin-access",
      label: "Supabase admin access",
      status: error ? "error" : "ok",
      detail: error ? `Admin query failed: ${error.message}` : "Admin query is healthy",
    });
  } catch (error) {
    checks.push({
      id: "supabase-admin-access",
      label: "Supabase admin access",
      status: "error",
      detail: `Admin query failed: ${maskError(error)}`,
    });
  }

  const engineUrl = getEngineUrl();

  try {
    const timeout = timeoutSignal(4_000);
    const response = await fetch(`${engineUrl}/health`, {
      method: "GET",
      cache: "no-store",
      signal: timeout.signal,
    });
    timeout.done();

    checks.push({
      id: "engine-health",
      label: "Engine health",
      status: response.ok ? "ok" : "error",
      detail: response.ok
        ? `Engine reachable at ${engineUrl}`
        : `Engine returned ${response.status}`,
    });
  } catch (error) {
    checks.push({
      id: "engine-health",
      label: "Engine health",
      status: "error",
      detail: `Engine not reachable at ${engineUrl}: ${maskError(error)}`,
    });
  }

  return {
    overall: summarize(checks),
    generated_at: new Date().toISOString(),
    checks,
  };
}

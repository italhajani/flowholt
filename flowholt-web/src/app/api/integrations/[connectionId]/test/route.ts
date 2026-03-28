import { NextResponse } from "next/server";

import { testIntegrationConnection } from "@/lib/flowholt/integration-tester";
import type { IntegrationProvider } from "@/lib/flowholt/types";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ connectionId: string }> | { connectionId: string };
};

export async function POST(_: Request, context: RouteContext) {
  const { connectionId } = await Promise.resolve(context.params);

  if (!connectionId) {
    return NextResponse.json({ error: "Missing connection id." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("integration_connections")
    .select("id, provider, label, status, config, secrets")
    .eq("id", connectionId)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Integration connection not found." }, { status: 404 });
  }

  const connection = {
    id: String(data.id),
    provider: String(data.provider) as IntegrationProvider,
    label: String(data.label),
    status: String(data.status),
    config: (data.config as Record<string, unknown>) ?? {},
    secrets: (data.secrets as Record<string, unknown>) ?? {},
  };

  const test = await testIntegrationConnection(connection);

  await supabase
    .from("integration_connections")
    .update({
      last_test_status: test.status,
      last_test_message: test.message,
      last_test_details: test.details,
      last_tested_at: test.checked_at,
    })
    .eq("id", connection.id);

  return NextResponse.json({
    connection: {
      id: connection.id,
      provider: connection.provider,
      label: connection.label,
      status: connection.status,
    },
    test,
  });
}

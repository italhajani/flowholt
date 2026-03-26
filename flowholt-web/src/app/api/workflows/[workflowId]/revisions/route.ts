import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ workflowId: string }> | { workflowId: string };
};

function parseLimit(value: string | null) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return 20;
  }

  return Math.min(100, Math.max(1, Math.floor(parsed)));
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { workflowId } = await Promise.resolve(context.params);

  if (!workflowId) {
    return NextResponse.json({ error: "Missing workflow id." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: workflow, error: workflowError } = await supabase
    .from("workflows")
    .select("id, name, workspace_id, status, updated_at")
    .eq("id", workflowId)
    .maybeSingle();

  if (workflowError || !workflow) {
    return NextResponse.json({ error: "Workflow not found." }, { status: 404 });
  }

  const limit = parseLimit(request.nextUrl.searchParams.get("limit"));

  const { data, error } = await supabase
    .from("workflow_revisions")
    .select(
      "id, workflow_id, workspace_id, created_by_user_id, source, message, before_name, before_description, after_name, after_description, change_summary, created_at",
    )
    .eq("workflow_id", workflowId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    workflow,
    revisions: data ?? [],
  });
}

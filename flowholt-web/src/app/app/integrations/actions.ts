"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { recordWorkspaceAuditLog } from "@/lib/flowholt/audit";
import { createClient } from "@/lib/supabase/server";

function getValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parseJsonObject(raw: string, fieldName: string) {
  if (!raw) {
    return {};
  }

  const parsed = JSON.parse(raw) as Record<string, unknown>;
  if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
    throw new Error(`${fieldName} must be a JSON object.`);
  }

  return parsed;
}

function bounce(message: string, type: "message" | "error" = "error"): never {
  redirect(`/app/integrations?${type}=${encodeURIComponent(message)}`);
}

export async function createIntegrationConnection(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const workspaceId = getValue(formData, "workspaceId");
  const provider = getValue(formData, "provider");
  const label = getValue(formData, "label");
  const description = getValue(formData, "description");
  const status = getValue(formData, "status") || "active";
  const configRaw = getValue(formData, "config");
  const secretsRaw = getValue(formData, "secrets");

  if (!workspaceId) {
    bounce("Create a workspace before adding integrations");
  }

  if (!provider) {
    bounce("Choose an integration provider");
  }

  if (!label) {
    bounce("Connection label is required");
  }

  let config: Record<string, unknown> = {};
  let secrets: Record<string, unknown> = {};

  try {
    config = parseJsonObject(configRaw, "Config");
    secrets = parseJsonObject(secretsRaw, "Secrets");
  } catch (error) {
    bounce(error instanceof Error ? error.message : "Invalid integration JSON");
  }

  const { data, error } = await supabase
    .from("integration_connections")
    .insert({
      workspace_id: workspaceId,
      created_by_user_id: user.id,
      provider,
      label,
      description,
      status,
      config,
      secrets,
    })
    .select("id, workspace_id, provider, label, status")
    .single();

  if (error || !data) {
    bounce(error?.message ?? "Unable to save integration");
  }

  const savedConnection = data;

  await recordWorkspaceAuditLog({
    supabase,
    workspaceId,
    actorUserId: user.id,
    action: "integration.created",
    targetType: "integration_connection",
    targetId: savedConnection.id,
    summary: `Created ${savedConnection.provider} connection ${savedConnection.label}`,
    payload: {
      provider: savedConnection.provider,
      status: savedConnection.status,
    },
  });

  revalidatePath("/app/integrations");
  revalidatePath("/app/settings");
  bounce("Integration saved", "message");
}

export async function rotateIntegrationSecrets(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const connectionId = getValue(formData, "connectionId");
  const secretsRaw = getValue(formData, "secrets");
  const note = getValue(formData, "note");

  if (!connectionId) {
    bounce("Missing integration id");
  }

  if (!secretsRaw) {
    bounce("Paste the new secrets JSON first");
  }

  let secrets: Record<string, unknown> = {};
  try {
    secrets = parseJsonObject(secretsRaw, "Secrets");
  } catch (error) {
    bounce(error instanceof Error ? error.message : "Invalid secrets JSON");
  }

  const { data: connection, error: lookupError } = await supabase
    .from("integration_connections")
    .select("id, workspace_id, provider, label, secret_version")
    .eq("id", connectionId)
    .maybeSingle();

  if (lookupError || !connection) {
    bounce(lookupError?.message ?? "Integration connection not found");
  }

  const existingConnection = connection;
  const nextVersion = (Number(existingConnection.secret_version) || 1) + 1;
  const rotatedAt = new Date().toISOString();

  const { error } = await supabase
    .from("integration_connections")
    .update({
      secrets,
      secret_version: nextVersion,
      last_secret_rotation_at: rotatedAt,
    })
    .eq("id", connectionId);

  if (error) {
    bounce(error.message);
  }

  await recordWorkspaceAuditLog({
    supabase,
    workspaceId: existingConnection.workspace_id,
    actorUserId: user.id,
    action: "integration.secret_rotated",
    targetType: "integration_connection",
    targetId: existingConnection.id,
    summary: `Rotated secrets for ${existingConnection.label}`,
    payload: {
      provider: existingConnection.provider,
      secret_version: nextVersion,
      note,
      rotated_at: rotatedAt,
    },
  });

  revalidatePath("/app/integrations");
  revalidatePath("/app/settings");
  bounce("Secrets rotated", "message");
}

export async function deleteIntegrationConnection(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const connectionId = getValue(formData, "connectionId");

  if (!connectionId) {
    bounce("Missing integration id");
  }

  const { data: connection, error: lookupError } = await supabase
    .from("integration_connections")
    .select("id, workspace_id, provider, label")
    .eq("id", connectionId)
    .maybeSingle();

  if (lookupError || !connection) {
    bounce(lookupError?.message ?? "Integration connection not found");
  }

  const existingConnection = connection;
  const { error } = await supabase.from("integration_connections").delete().eq("id", connectionId);

  if (error) {
    bounce(error.message);
  }

  await recordWorkspaceAuditLog({
    supabase,
    workspaceId: existingConnection.workspace_id,
    actorUserId: user.id,
    action: "integration.deleted",
    targetType: "integration_connection",
    targetId: existingConnection.id,
    summary: `Deleted ${existingConnection.provider} connection ${existingConnection.label}`,
    payload: {
      provider: existingConnection.provider,
    },
  });

  revalidatePath("/app/integrations");
  revalidatePath("/app/settings");
  bounce("Integration removed", "message");
}


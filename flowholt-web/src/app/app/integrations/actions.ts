"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

function bounce(message: string, type: "message" | "error" = "error") {
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

  let config: Record<string, unknown>;
  let secrets: Record<string, unknown>;

  try {
    config = parseJsonObject(configRaw, "Config");
    secrets = parseJsonObject(secretsRaw, "Secrets");
  } catch (error) {
    bounce(error instanceof Error ? error.message : "Invalid integration JSON");
  }

  const { error } = await supabase.from("integration_connections").insert({
    workspace_id: workspaceId,
    created_by_user_id: user.id,
    provider,
    label,
    description,
    status,
    config,
    secrets,
  });

  if (error) {
    bounce(error.message);
  }

  revalidatePath("/app/integrations");
  bounce("Integration saved", "message");
}

export async function deleteIntegrationConnection(formData: FormData) {
  const supabase = await createClient();
  const connectionId = getValue(formData, "connectionId");

  if (!connectionId) {
    bounce("Missing integration id");
  }

  const { error } = await supabase.from("integration_connections").delete().eq("id", connectionId);

  if (error) {
    bounce(error.message);
  }

  revalidatePath("/app/integrations");
  bounce("Integration removed", "message");
}

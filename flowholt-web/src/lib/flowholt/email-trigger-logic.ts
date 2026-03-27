import type { WorkflowNode, WorkflowRecord } from "@/lib/flowholt/types";

export type WorkspaceEmailInput = {
  workspaceId: string;
  to: string;
  from?: string;
  subject?: string;
  text?: string;
  html?: string;
  headers?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  providerMessageId?: string;
};

export type MatchingEmailTrigger = {
  nodeId: string;
  nodeLabel: string;
  emailAddress: string;
  subjectContains: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function normalizeEmailAddress(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function normalizeSubjectToken(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function readEmailTriggerConfig(node: WorkflowNode) {
  const config = asRecord(node.config);
  const emailAddress =
    typeof config.email_address === "string"
      ? config.email_address
      : typeof config.emailAddress === "string"
        ? config.emailAddress
        : "";
  const subjectContains =
    typeof config.subject_contains === "string"
      ? config.subject_contains
      : typeof config.subjectContains === "string"
        ? config.subjectContains
        : "";

  return {
    mode: typeof config.mode === "string" ? config.mode.trim().toLowerCase() : "manual",
    emailAddress,
    subjectContains,
  };
}

export function isEmailTriggerNode(node: WorkflowNode): boolean {
  return node.type === "trigger" && readEmailTriggerConfig(node).mode === "email";
}

export function doesEmailTriggerMatch(node: WorkflowNode, email: WorkspaceEmailInput): boolean {
  if (!isEmailTriggerNode(node)) {
    return false;
  }

  const config = readEmailTriggerConfig(node);
  if (!config.emailAddress) {
    return false;
  }

  if (normalizeEmailAddress(config.emailAddress) !== normalizeEmailAddress(email.to)) {
    return false;
  }

  const subjectToken = normalizeSubjectToken(config.subjectContains);
  if (!subjectToken) {
    return true;
  }

  return normalizeSubjectToken(email.subject).includes(subjectToken);
}

export function findMatchingEmailTriggers(
  workflow: Pick<WorkflowRecord, "graph">,
  email: WorkspaceEmailInput,
): MatchingEmailTrigger[] {
  return workflow.graph.nodes
    .filter((node) => doesEmailTriggerMatch(node, email))
    .map((node) => {
      const config = readEmailTriggerConfig(node);
      return {
        nodeId: node.id,
        nodeLabel: node.label,
        emailAddress: config.emailAddress,
        subjectContains: config.subjectContains,
      };
    });
}

export function buildEmailTriggerMeta(
  email: WorkspaceEmailInput,
  matches: MatchingEmailTrigger[],
) {
  return {
    email_to: email.to,
    email_from: email.from ?? "",
    email_subject: email.subject ?? "",
    provider_message_id: email.providerMessageId ?? "",
    email_metadata: asRecord(email.metadata),
    matched_trigger_ids: matches.map((match) => match.nodeId),
    matched_trigger_labels: matches.map((match) => match.nodeLabel),
    matched_trigger_count: matches.length,
  };
}
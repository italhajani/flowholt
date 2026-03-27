import { timingSafeEqual } from "node:crypto";

import type {
  SecurityCheckItem,
  SecurityCheckStatus,
  SecurityCheckSummary,
} from "@/lib/flowholt/types";

const WEAK_SECRET_VALUES = new Set([
  "changeme",
  "default",
  "demo",
  "password",
  "secret",
  "test",
  "your-secret",
  "your-long-random-secret",
  "your-another-long-random-secret",
]);

export const MIN_ENDPOINT_SECRET_LENGTH = 24;
export const MIN_SERVICE_ROLE_SECRET_LENGTH = 32;

type SecretCheckOptions = {
  key: string;
  label: string;
  secret: unknown;
  minLength: number;
  missingStatus?: SecurityCheckStatus;
};

type SecretEvaluation = {
  normalized: string;
  issues: string[];
};

type ProtectedEndpointSecretValidation = {
  ok: boolean;
  value: string;
  message: string;
};

function normalizeSecret(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function hasEnoughEntropy(secret: string): boolean {
  if (!secret) {
    return false;
  }

  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z\d]/].filter((pattern) => pattern.test(secret)).length;
  return classes >= 3;
}

function evaluateSecretValue(secret: unknown, minLength: number): SecretEvaluation {
  const normalized = normalizeSecret(secret);
  const issues: string[] = [];

  if (!normalized) {
    issues.push("missing");
    return { normalized, issues };
  }

  if (normalized.length < minLength) {
    issues.push(`shorter than ${minLength} characters`);
  }

  if (WEAK_SECRET_VALUES.has(normalized.toLowerCase())) {
    issues.push("uses a placeholder or common secret value");
  }

  if (!hasEnoughEntropy(normalized)) {
    issues.push("does not look random enough");
  }

  return { normalized, issues };
}

export function compareSecretsConstantTime(provided: unknown, expected: unknown): boolean {
  const left = normalizeSecret(provided);
  const right = normalizeSecret(expected);

  if (!left || !right) {
    return false;
  }

  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function validateProtectedEndpointSecret(
  secret: unknown,
  envLabel: string,
): ProtectedEndpointSecretValidation {
  const assessment = evaluateSecretValue(secret, MIN_ENDPOINT_SECRET_LENGTH);

  if (!assessment.normalized) {
    return {
      ok: false,
      value: "",
      message: `${envLabel} is not configured.`,
    };
  }

  if (assessment.issues.length) {
    return {
      ok: false,
      value: "",
      message: `${envLabel} is too weak: ${assessment.issues.join(", ")}. Use a long random secret.`,
    };
  }

  return {
    ok: true,
    value: assessment.normalized,
    message: "",
  };
}

function summarizeSecretCheck({
  key,
  label,
  secret,
  minLength,
  missingStatus = "error",
}: SecretCheckOptions): SecurityCheckItem {
  const assessment = evaluateSecretValue(secret, minLength);

  if (!assessment.normalized) {
    return {
      key,
      label,
      status: missingStatus,
      detail: `${label} is missing.`,
    };
  }

  if (assessment.issues.length) {
    return {
      key,
      label,
      status: "warn",
      detail: `${label} is configured but ${assessment.issues.join(", ")}.`,
    };
  }

  return {
    key,
    label,
    status: "ok",
    detail: `${label} looks configured with a strong value.`,
  };
}

export function buildSecurityChecks(
  env: Record<string, string | undefined> = process.env,
): SecurityCheckItem[] {
  const schedulerKey = normalizeSecret(env.FLOWHOLT_SCHEDULER_KEY);
  const workerKey = normalizeSecret(env.FLOWHOLT_WORKER_KEY);
  const eventKey = normalizeSecret(env.FLOWHOLT_EVENT_KEY);
  const emailKey = normalizeSecret(env.FLOWHOLT_EMAIL_KEY);
  const serviceRoleKey = normalizeSecret(env.SUPABASE_SERVICE_ROLE_KEY);
  const databaseUrl = normalizeSecret(env.FLOWHOLT_DATABASE_URL || env.SUPABASE_DB_URL || env.DATABASE_URL);

  const checks: SecurityCheckItem[] = [
    summarizeSecretCheck({
      key: "service-role-key",
      label: "Supabase service role key",
      secret: serviceRoleKey,
      minLength: MIN_SERVICE_ROLE_SECRET_LENGTH,
      missingStatus: "error",
    }),
    summarizeSecretCheck({
      key: "scheduler-key",
      label: "Scheduler endpoint key",
      secret: schedulerKey,
      minLength: MIN_ENDPOINT_SECRET_LENGTH,
      missingStatus: "warn",
    }),
    summarizeSecretCheck({
      key: "worker-key",
      label: "Worker endpoint key",
      secret: workerKey || schedulerKey,
      minLength: MIN_ENDPOINT_SECRET_LENGTH,
      missingStatus: "warn",
    }),
    summarizeSecretCheck({
      key: "event-key",
      label: "Event ingest key",
      secret: eventKey,
      minLength: MIN_ENDPOINT_SECRET_LENGTH,
      missingStatus: "warn",
    }),
    summarizeSecretCheck({
      key: "email-key",
      label: "Email ingest key",
      secret: emailKey,
      minLength: MIN_ENDPOINT_SECRET_LENGTH,
      missingStatus: "warn",
    }),
    {
      key: "deploy-db-url",
      label: "Deploy database URL",
      status: databaseUrl ? "ok" : "warn",
      detail: databaseUrl
        ? "Database URL is present for migration and backup runners."
        : "Database URL is missing for migration and backup runners.",
    },
  ];

  if (!workerKey && schedulerKey) {
    checks.push({
      key: "worker-fallback",
      label: "Worker key fallback",
      status: "warn",
      detail: "FLOWHOLT_WORKER_KEY is missing, so the worker falls back to FLOWHOLT_SCHEDULER_KEY.",
    });
  }

  const endpointSecrets = [
    ["scheduler", schedulerKey],
    ["worker", workerKey || schedulerKey],
    ["event", eventKey],
    ["email", emailKey],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  const bySecret = new Map<string, string[]>();
  for (const [label, secret] of endpointSecrets) {
    const current = bySecret.get(secret) ?? [];
    current.push(label);
    bySecret.set(secret, current);
  }

  for (const [, labels] of bySecret.entries()) {
    if (labels.length > 1) {
      checks.push({
        key: `reused-${labels.join("-")}`,
        label: "Endpoint key reuse",
        status: "warn",
        detail: `These protected endpoints share the same secret: ${labels.join(", ")}.`,
      });
    }
  }

  if (serviceRoleKey && endpointSecrets.some(([, secret]) => secret === serviceRoleKey)) {
    checks.push({
      key: "service-role-reuse",
      label: "Service role key reuse",
      status: "error",
      detail: "A protected endpoint is reusing the Supabase service role key. Use separate secrets.",
    });
  }

  return checks;
}

export function summarizeSecurityChecks(checks: SecurityCheckItem[]): SecurityCheckSummary {
  return checks.reduce(
    (summary: SecurityCheckSummary, check: SecurityCheckItem) => {
      summary[check.status] += 1;
      return summary;
    },
    { ok: 0, warn: 0, error: 0 },
  );
}

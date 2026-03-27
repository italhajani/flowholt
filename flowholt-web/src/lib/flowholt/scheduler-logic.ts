import { randomUUID } from "node:crypto";

export type SchedulePattern =
  | {
      kind: "interval";
      intervalMinutes: number;
    }
  | {
      kind: "daily";
      hour: number;
      minute: number;
    }
  | {
      kind: "weekdays";
      hour: number;
      minute: number;
      days: number[];
    };

export type ScheduleClaimPlan = {
  reclaimed: boolean;
  claimDueAt: string;
  nextRunAt: string;
  lockUntil: string;
  leaseToken: string;
  update: {
    claim_due_at: string;
    next_run_at: string;
    lock_until: string;
    lock_token: string;
    last_claimed_at: string;
  };
};

export type ScheduleCompletionResult = "queued" | "failed" | "skipped";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function clampHour(value: unknown, fallback = 9) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(23, Math.max(0, Math.floor(parsed)));
}

function clampMinute(value: unknown, fallback = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(59, Math.max(0, Math.floor(parsed)));
}

function normalizeWeekdayList(value: unknown) {
  const values = Array.isArray(value) ? value : [];
  const days = values
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item))
    .map((item) => Math.min(6, Math.max(0, Math.floor(item))));
  const unique = [...new Set(days)].sort((left, right) => left - right);
  return unique.length ? unique : [1, 2, 3, 4, 5];
}

export function toIntervalMinutes(value: unknown, fallback = 60) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  const intValue = Math.floor(parsed);
  return Math.min(10080, Math.max(1, intValue));
}

export function normalizeSchedulePattern(value: unknown, fallbackInterval = 60): SchedulePattern {
  const record = asRecord(value);
  const kind = typeof record.kind === "string" ? record.kind.trim().toLowerCase() : "interval";

  if (kind === "daily") {
    return {
      kind: "daily",
      hour: clampHour(record.hour, 9),
      minute: clampMinute(record.minute, 0),
    };
  }

  if (kind === "weekdays") {
    return {
      kind: "weekdays",
      hour: clampHour(record.hour, 9),
      minute: clampMinute(record.minute, 0),
      days: normalizeWeekdayList(record.days),
    };
  }

  return {
    kind: "interval",
    intervalMinutes: toIntervalMinutes(record.intervalMinutes ?? fallbackInterval, fallbackInterval),
  };
}

export function inferredIntervalMinutesFromPattern(pattern: SchedulePattern) {
  switch (pattern.kind) {
    case "daily":
      return 1440;
    case "weekdays":
      return 1440;
    default:
      return pattern.intervalMinutes;
  }
}

export function nextRunAtFrom(baseTime: Date, intervalMinutes: number) {
  return new Date(baseTime.getTime() + intervalMinutes * 60_000).toISOString();
}

export function nextPatternRunAtFrom(baseTime: Date, pattern: SchedulePattern) {
  if (pattern.kind === "interval") {
    return nextRunAtFrom(baseTime, pattern.intervalMinutes);
  }

  const candidate = new Date(baseTime);
  candidate.setUTCSeconds(0, 0);
  candidate.setUTCHours(pattern.hour, pattern.minute, 0, 0);

  if (pattern.kind === "daily") {
    if (candidate.getTime() <= baseTime.getTime()) {
      candidate.setUTCDate(candidate.getUTCDate() + 1);
    }
    return candidate.toISOString();
  }

  for (let offset = 0; offset <= 7; offset += 1) {
    const weekdayCandidate = new Date(candidate);
    weekdayCandidate.setUTCDate(candidate.getUTCDate() + offset);
    if (weekdayCandidate.getTime() <= baseTime.getTime()) {
      continue;
    }
    if (pattern.days.includes(weekdayCandidate.getUTCDay())) {
      return weekdayCandidate.toISOString();
    }
  }

  const fallback = new Date(candidate);
  fallback.setUTCDate(candidate.getUTCDate() + 7);
  return fallback.toISOString();
}

export function scheduleLockUntilFrom(baseTime: Date, minutes = 5) {
  return new Date(baseTime.getTime() + minutes * 60_000).toISOString();
}

export function createScheduleLeaseToken(prefix = "fh_sched_lease") {
  return `${prefix}_${randomUUID().replace(/-/g, "")}`;
}

export function isScheduleClaimable(lockUntil: string | null | undefined, now: Date) {
  if (!lockUntil) {
    return true;
  }

  return new Date(lockUntil).getTime() <= now.getTime();
}

export function isStaleClaimRecoverable(
  claimDueAt: string | null | undefined,
  lockUntil: string | null | undefined,
  now: Date,
) {
  return Boolean(claimDueAt) && isScheduleClaimable(lockUntil, now);
}

export function shouldInspectScheduleNow(input: {
  nextRunAt: string;
  claimDueAt?: string | null;
  lockUntil?: string | null;
  now: Date;
}) {
  return (
    new Date(input.nextRunAt).getTime() <= input.now.getTime() ||
    isStaleClaimRecoverable(input.claimDueAt, input.lockUntil, input.now)
  );
}

export function shouldRenewScheduleLease(
  lockUntil: string | null | undefined,
  now: Date,
  renewWindowSeconds = 60,
) {
  if (!lockUntil) {
    return true;
  }

  return new Date(lockUntil).getTime() - now.getTime() <= renewWindowSeconds * 1000;
}

export function buildScheduleClaimPlan(input: {
  currentNextRunAt: string;
  currentClaimDueAt?: string | null;
  intervalMinutes: number;
  pattern?: unknown;
  now: Date;
  lockMinutes?: number;
  leaseToken?: string;
}) {
  const reclaimed = Boolean(input.currentClaimDueAt);
  const claimDueAt = input.currentClaimDueAt?.trim() || input.currentNextRunAt;
  const normalizedPattern = normalizeSchedulePattern(input.pattern, toIntervalMinutes(input.intervalMinutes));
  const nextRunAt = reclaimed
    ? input.currentNextRunAt
    : normalizedPattern.kind === "interval"
      ? nextRunAtFrom(input.now, normalizedPattern.intervalMinutes)
      : nextPatternRunAtFrom(new Date(claimDueAt), normalizedPattern);
  const lockUntil = scheduleLockUntilFrom(input.now, input.lockMinutes ?? 5);
  const leaseToken = input.leaseToken?.trim() || createScheduleLeaseToken();
  const lastClaimedAt = input.now.toISOString();

  return {
    reclaimed,
    claimDueAt,
    nextRunAt,
    lockUntil,
    leaseToken,
    update: {
      claim_due_at: claimDueAt,
      next_run_at: nextRunAt,
      lock_until: lockUntil,
      lock_token: leaseToken,
      last_claimed_at: lastClaimedAt,
    },
  } satisfies ScheduleClaimPlan;
}

export function buildScheduleLeaseRenewal(input: {
  now: Date;
  lockMinutes?: number;
}) {
  const lockUntil = scheduleLockUntilFrom(input.now, input.lockMinutes ?? 5);
  return {
    lockUntil,
    update: {
      lock_until: lockUntil,
      last_claimed_at: input.now.toISOString(),
    },
  };
}

export function buildScheduleCompletionUpdate(input: {
  result: ScheduleCompletionResult;
  runCount: number;
  finishedAt: Date;
  errorMessage?: string;
  queuedJobId?: string;
}) {
  return {
    lock_until: null,
    lock_token: null,
    claim_due_at: null,
    last_run_at: input.finishedAt.toISOString(),
    last_run_status: input.result === "queued" ? null : "failed",
    last_error: input.result === "queued" ? "Queued for execution." : input.errorMessage ?? "",
    run_count: input.runCount + 1,
    last_queued_job_id: input.queuedJobId ?? null,
  };
}
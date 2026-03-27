import { randomUUID } from "node:crypto";

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

export function toIntervalMinutes(value: unknown, fallback = 60) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  const intValue = Math.floor(parsed);
  return Math.min(10080, Math.max(1, intValue));
}

export function nextRunAtFrom(baseTime: Date, intervalMinutes: number) {
  return new Date(baseTime.getTime() + intervalMinutes * 60_000).toISOString();
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
  now: Date;
  lockMinutes?: number;
  leaseToken?: string;
}) {
  const reclaimed = Boolean(input.currentClaimDueAt);
  const claimDueAt = input.currentClaimDueAt?.trim() || input.currentNextRunAt;
  const nextRunAt = reclaimed
    ? input.currentNextRunAt
    : nextRunAtFrom(input.now, toIntervalMinutes(input.intervalMinutes));
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

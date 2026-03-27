import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildScheduleClaimPlan,
  buildScheduleCompletionUpdate,
  buildScheduleLeaseRenewal,
  createScheduleLeaseToken,
  inferredIntervalMinutesFromPattern,
  isScheduleClaimable,
  isStaleClaimRecoverable,
  nextPatternRunAtFrom,
  nextRunAtFrom,
  normalizeSchedulePattern,
  scheduleLockUntilFrom,
  shouldInspectScheduleNow,
  shouldRenewScheduleLease,
  toIntervalMinutes,
} from '../../src/lib/flowholt/scheduler-logic.ts';

test('toIntervalMinutes uses fallback and clamps invalid values safely', () => {
  assert.equal(toIntervalMinutes(undefined, 30), 30);
  assert.equal(toIntervalMinutes('0'), 1);
  assert.equal(toIntervalMinutes('100000'), 10080);
  assert.equal(toIntervalMinutes('15.8'), 15);
});

test('normalizeSchedulePattern supports interval, daily, and weekday presets safely', () => {
  assert.deepEqual(normalizeSchedulePattern({}, 45), { kind: 'interval', intervalMinutes: 45 });
  assert.deepEqual(normalizeSchedulePattern({ kind: 'daily', hour: 9, minute: 30 }, 60), {
    kind: 'daily',
    hour: 9,
    minute: 30,
  });
  assert.deepEqual(normalizeSchedulePattern({ kind: 'weekdays', hour: 8, minute: 15, days: [1, 3, 5] }, 60), {
    kind: 'weekdays',
    hour: 8,
    minute: 15,
    days: [1, 3, 5],
  });
});

test('inferredIntervalMinutesFromPattern keeps scheduler limits compatible', () => {
  assert.equal(inferredIntervalMinutesFromPattern({ kind: 'interval', intervalMinutes: 45 }), 45);
  assert.equal(inferredIntervalMinutesFromPattern({ kind: 'daily', hour: 9, minute: 0 }), 1440);
  assert.equal(inferredIntervalMinutesFromPattern({ kind: 'weekdays', hour: 9, minute: 0, days: [1, 2, 3, 4, 5] }), 1440);
});

test('nextRunAtFrom advances schedule using interval minutes', () => {
  const nextRun = nextRunAtFrom(new Date('2026-03-27T10:00:00.000Z'), 45);

  assert.equal(nextRun, '2026-03-27T10:45:00.000Z');
});

test('nextPatternRunAtFrom advances daily and weekday presets correctly', () => {
  assert.equal(
    nextPatternRunAtFrom(new Date('2026-03-27T10:00:00.000Z'), { kind: 'daily', hour: 14, minute: 30 }),
    '2026-03-27T14:30:00.000Z',
  );
  assert.equal(
    nextPatternRunAtFrom(new Date('2026-03-27T18:00:00.000Z'), { kind: 'daily', hour: 14, minute: 30 }),
    '2026-03-28T14:30:00.000Z',
  );
  assert.equal(
    nextPatternRunAtFrom(new Date('2026-03-27T18:00:00.000Z'), { kind: 'weekdays', hour: 9, minute: 0, days: [1, 2, 3, 4, 5] }),
    '2026-03-30T09:00:00.000Z',
  );
});

test('scheduleLockUntilFrom sets a lease window into the future', () => {
  assert.equal(
    scheduleLockUntilFrom(new Date('2026-03-27T10:00:00.000Z'), 5),
    '2026-03-27T10:05:00.000Z',
  );
});

test('createScheduleLeaseToken returns a stable prefixed token', () => {
  assert.match(createScheduleLeaseToken(), /^fh_sched_lease_[a-f0-9]+$/i);
});

test('isScheduleClaimable respects expired and active locks', () => {
  const now = new Date('2026-03-27T10:00:00.000Z');

  assert.equal(isScheduleClaimable(null, now), true);
  assert.equal(isScheduleClaimable('2026-03-27T09:59:59.000Z', now), true);
  assert.equal(isScheduleClaimable('2026-03-27T10:05:00.000Z', now), false);
});

test('isStaleClaimRecoverable only becomes true for expired claimed leases', () => {
  const now = new Date('2026-03-27T10:00:00.000Z');

  assert.equal(isStaleClaimRecoverable(null, '2026-03-27T09:59:00.000Z', now), false);
  assert.equal(isStaleClaimRecoverable('2026-03-27T09:45:00.000Z', '2026-03-27T10:05:00.000Z', now), false);
  assert.equal(isStaleClaimRecoverable('2026-03-27T09:45:00.000Z', '2026-03-27T09:59:00.000Z', now), true);
});

test('shouldInspectScheduleNow includes fresh due schedules and stale claims', () => {
  const now = new Date('2026-03-27T10:00:00.000Z');

  assert.equal(
    shouldInspectScheduleNow({
      nextRunAt: '2026-03-27T09:59:00.000Z',
      claimDueAt: null,
      lockUntil: null,
      now,
    }),
    true,
  );
  assert.equal(
    shouldInspectScheduleNow({
      nextRunAt: '2026-03-27T11:00:00.000Z',
      claimDueAt: '2026-03-27T09:50:00.000Z',
      lockUntil: '2026-03-27T09:55:00.000Z',
      now,
    }),
    true,
  );
  assert.equal(
    shouldInspectScheduleNow({
      nextRunAt: '2026-03-27T11:00:00.000Z',
      claimDueAt: null,
      lockUntil: null,
      now,
    }),
    false,
  );
});

test('buildScheduleClaimPlan advances fresh schedules and preserves stale claim timing', () => {
  const fresh = buildScheduleClaimPlan({
    currentNextRunAt: '2026-03-27T10:00:00.000Z',
    intervalMinutes: 30,
    now: new Date('2026-03-27T10:05:00.000Z'),
    lockMinutes: 5,
    leaseToken: 'lease-fresh',
  });

  assert.equal(fresh.reclaimed, false);
  assert.equal(fresh.claimDueAt, '2026-03-27T10:00:00.000Z');
  assert.equal(fresh.nextRunAt, '2026-03-27T10:35:00.000Z');
  assert.equal(fresh.update.lock_token, 'lease-fresh');

  const daily = buildScheduleClaimPlan({
    currentNextRunAt: '2026-03-27T09:00:00.000Z',
    intervalMinutes: 1440,
    pattern: { kind: 'daily', hour: 9, minute: 0 },
    now: new Date('2026-03-27T09:05:00.000Z'),
  });

  assert.equal(daily.nextRunAt, '2026-03-28T09:00:00.000Z');

  const reclaimed = buildScheduleClaimPlan({
    currentNextRunAt: '2026-03-27T10:35:00.000Z',
    currentClaimDueAt: '2026-03-27T10:00:00.000Z',
    intervalMinutes: 30,
    now: new Date('2026-03-27T10:10:00.000Z'),
    leaseToken: 'lease-reclaim',
  });

  assert.equal(reclaimed.reclaimed, true);
  assert.equal(reclaimed.claimDueAt, '2026-03-27T10:00:00.000Z');
  assert.equal(reclaimed.nextRunAt, '2026-03-27T10:35:00.000Z');
  assert.equal(reclaimed.update.lock_token, 'lease-reclaim');
});

test('shouldRenewScheduleLease renews missing or nearly expired leases', () => {
  const now = new Date('2026-03-27T10:00:00.000Z');

  assert.equal(shouldRenewScheduleLease(null, now), true);
  assert.equal(shouldRenewScheduleLease('2026-03-27T10:00:20.000Z', now), true);
  assert.equal(shouldRenewScheduleLease('2026-03-27T10:03:00.000Z', now), false);
});

test('buildScheduleLeaseRenewal extends the current lease safely', () => {
  const renewal = buildScheduleLeaseRenewal({
    now: new Date('2026-03-27T10:00:00.000Z'),
    lockMinutes: 7,
  });

  assert.equal(renewal.lockUntil, '2026-03-27T10:07:00.000Z');
  assert.equal(renewal.update.last_claimed_at, '2026-03-27T10:00:00.000Z');
});

test('buildScheduleCompletionUpdate clears lease fields and records queue result', () => {
  const queued = buildScheduleCompletionUpdate({
    result: 'queued',
    runCount: 4,
    finishedAt: new Date('2026-03-27T10:00:00.000Z'),
    queuedJobId: 'job-1',
  });

  assert.equal(queued.lock_until, null);
  assert.equal(queued.lock_token, null);
  assert.equal(queued.claim_due_at, null);
  assert.equal(queued.last_run_status, null);
  assert.equal(queued.last_error, 'Queued for execution.');
  assert.equal(queued.run_count, 5);
  assert.equal(queued.last_queued_job_id, 'job-1');

  const failed = buildScheduleCompletionUpdate({
    result: 'failed',
    runCount: 1,
    finishedAt: new Date('2026-03-27T10:00:00.000Z'),
    errorMessage: 'Workflow not found.',
  });

  assert.equal(failed.last_run_status, 'failed');
  assert.equal(failed.last_error, 'Workflow not found.');
  assert.equal(failed.last_queued_job_id, null);
});
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  isScheduleClaimable,
  nextRunAtFrom,
  toIntervalMinutes,
} from '../../src/lib/flowholt/scheduler-logic.ts';

test('toIntervalMinutes uses fallback and clamps invalid values safely', () => {
  assert.equal(toIntervalMinutes(undefined, 30), 30);
  assert.equal(toIntervalMinutes('0'), 1);
  assert.equal(toIntervalMinutes('100000'), 10080);
  assert.equal(toIntervalMinutes('15.8'), 15);
});

test('nextRunAtFrom advances schedule using interval minutes', () => {
  const nextRun = nextRunAtFrom(new Date('2026-03-27T10:00:00.000Z'), 45);

  assert.equal(nextRun, '2026-03-27T10:45:00.000Z');
});

test('isScheduleClaimable respects expired and active locks', () => {
  const now = new Date('2026-03-27T10:00:00.000Z');

  assert.equal(isScheduleClaimable(null, now), true);
  assert.equal(isScheduleClaimable('2026-03-27T09:59:59.000Z', now), true);
  assert.equal(isScheduleClaimable('2026-03-27T10:05:00.000Z', now), false);
});

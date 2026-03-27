import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildEnqueueRunJobPayload,
  lockUntilFrom,
  nextAvailableAtFrom,
  planJobFailure,
  resolveJobCorrelationId,
  retryDelaySeconds,
  shouldRetryJob,
} from '../../src/lib/flowholt/run-queue-logic.ts';

test('buildEnqueueRunJobPayload injects correlation id and omits null trigger payload', () => {
  const { insertPayload, requestCorrelationId, triggerMeta } = buildEnqueueRunJobPayload({
    workflowId: 'wf-1',
    workspaceId: 'ws-1',
    triggerSource: 'manual',
    triggerPayload: null,
    triggerMeta: {
      request_correlation_id: '  fh_manual_existing  ',
      initiated_by: 'studio',
    },
    createdByUserId: 'user-1',
    maxAttempts: 0,
    availableAt: '2026-03-27T10:00:00.000Z',
  });

  assert.equal(requestCorrelationId, 'fh_manual_existing');
  assert.equal(triggerMeta.request_correlation_id, 'fh_manual_existing');
  assert.equal(insertPayload.request_correlation_id, 'fh_manual_existing');
  assert.equal(insertPayload.max_attempts, 1);
  assert.equal(insertPayload.available_at, '2026-03-27T10:00:00.000Z');
  assert.equal('trigger_payload' in insertPayload, false);
});

test('shouldRetryJob classifies retryable and non-retryable failures', () => {
  assert.equal(shouldRetryJob('Workflow graph is invalid: trigger missing'), false);
  assert.equal(shouldRetryJob('Missing or inactive integration connection for groq'), false);
  assert.equal(shouldRetryJob('Groq request failed with 429 rate limit'), true);
});

test('planJobFailure queues retryable failures with next attempt time', () => {
  const baseTime = new Date('2026-03-27T10:00:00.000Z');
  const result = planJobFailure({
    errorMessage: 'Temporary upstream timeout',
    errorClass: 'TimeoutError',
    attemptCount: 2,
    maxAttempts: 3,
    requestCorrelationId: 'fh_job_123',
    runId: 'run-1',
    baseTime,
  });

  assert.equal(result.shouldRetry, true);
  assert.equal(result.nextAvailableAt, nextAvailableAtFrom(baseTime, retryDelaySeconds(2)));
  assert.equal(result.update.status, 'queued');
  assert.equal(result.update.run_id, 'run-1');
  assert.equal(result.update.lock_until, null);
  assert.equal(result.update.request_correlation_id, 'fh_job_123');
});

test('planJobFailure marks final failures finished once max attempts are reached', () => {
  const baseTime = new Date('2026-03-27T10:00:00.000Z');
  const result = planJobFailure({
    errorMessage: 'Workflow not found.',
    errorClass: 'NotFoundError',
    attemptCount: 3,
    maxAttempts: 3,
    requestCorrelationId: resolveJobCorrelationId(''),
    baseTime,
  });

  assert.equal(result.shouldRetry, false);
  assert.equal(result.update.status, 'failed');
  assert.equal(result.update.finished_at, '2026-03-27T10:00:00.000Z');
  assert.equal(result.update.lock_until, null);
});

test('lockUntilFrom returns a bounded future lock timestamp', () => {
  const lockedUntil = lockUntilFrom(new Date('2026-03-27T10:00:00.000Z'), 5);

  assert.equal(lockedUntil, '2026-03-27T10:05:00.000Z');
});

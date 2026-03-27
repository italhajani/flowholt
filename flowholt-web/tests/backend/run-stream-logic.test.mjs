import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildRunStreamHeaders,
  isTerminalRunStatus,
  parsePositiveInt,
  sseEvent,
} from '../../src/lib/flowholt/run-stream-logic.ts';

test('parsePositiveInt clamps polling and timeout values safely', () => {
  assert.equal(parsePositiveInt(null, 1500, 500, 5000), 1500);
  assert.equal(parsePositiveInt('100', 1500, 500, 5000), 500);
  assert.equal(parsePositiveInt('999999', 1500, 500, 5000), 5000);
  assert.equal(parsePositiveInt('1700.8', 1500, 500, 5000), 1700);
});

test('isTerminalRunStatus recognizes finished run states', () => {
  assert.equal(isTerminalRunStatus('queued'), false);
  assert.equal(isTerminalRunStatus('running'), false);
  assert.equal(isTerminalRunStatus('failed'), true);
  assert.equal(isTerminalRunStatus('cancelled'), true);
});

test('sseEvent serializes named server-sent events correctly', () => {
  const chunk = sseEvent('run', { id: 'run-1', status: 'running' });

  assert.equal(chunk, 'event: run\ndata: {"id":"run-1","status":"running"}\n\n');
});

test('buildRunStreamHeaders returns stable SSE headers', () => {
  const headers = buildRunStreamHeaders();

  assert.equal(headers['Content-Type'], 'text/event-stream');
  assert.equal(headers['Cache-Control'], 'no-cache, no-transform');
  assert.equal(headers.Connection, 'keep-alive');
  assert.equal(headers['X-Accel-Buffering'], 'no');
});

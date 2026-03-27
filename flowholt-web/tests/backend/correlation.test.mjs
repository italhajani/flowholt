import test from 'node:test';
import assert from 'node:assert/strict';

import { createCorrelationId, readCorrelationId } from '../../src/lib/flowholt/correlation.ts';

test('createCorrelationId uses the requested prefix', () => {
  const value = createCorrelationId('fh_test');

  assert.match(value, /^fh_test_[a-f0-9]+$/i);
});

test('readCorrelationId trims provided values and generates fallback ids', () => {
  assert.equal(readCorrelationId('  trace-123  ', 'fh_test'), 'trace-123');
  assert.match(readCorrelationId('', 'fh_test'), /^fh_test_[a-f0-9]+$/i);
});

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildSecurityChecks,
  compareSecretsConstantTime,
  summarizeSecurityChecks,
  validateProtectedEndpointSecret,
} from '../../src/lib/flowholt/security.ts';

test('compareSecretsConstantTime only matches identical secrets', () => {
  assert.equal(compareSecretsConstantTime('abc123!XYZ789secret', 'abc123!XYZ789secret'), true);
  assert.equal(compareSecretsConstantTime('abc123!XYZ789secret', 'abc123!XYZ789secret-no'), false);
  assert.equal(compareSecretsConstantTime('', 'abc123!XYZ789secret'), false);
});

test('validateProtectedEndpointSecret rejects missing and weak secrets', () => {
  assert.deepEqual(validateProtectedEndpointSecret('', 'FLOWHOLT_EVENT_KEY'), {
    ok: false,
    value: '',
    message: 'FLOWHOLT_EVENT_KEY is not configured.',
  });

  assert.equal(
    validateProtectedEndpointSecret('your-secret', 'FLOWHOLT_EVENT_KEY').ok,
    false,
  );

  const strong = validateProtectedEndpointSecret('StrongFlowHoltKey!2026$Alpha', 'FLOWHOLT_EVENT_KEY');
  assert.equal(strong.ok, true);
  assert.equal(strong.value, 'StrongFlowHoltKey!2026$Alpha');
});

test('buildSecurityChecks reports reused endpoint keys and service-role reuse', () => {
  const checks = buildSecurityChecks({
    SUPABASE_SERVICE_ROLE_KEY: 'StrongServiceRole!2026$AlphaBeta',
    FLOWHOLT_SCHEDULER_KEY: 'StrongEndpointKey!2026$Alpha',
    FLOWHOLT_WORKER_KEY: 'StrongEndpointKey!2026$Alpha',
    FLOWHOLT_EVENT_KEY: 'StrongEventKey!2026$Alpha',
    FLOWHOLT_EMAIL_KEY: 'StrongServiceRole!2026$AlphaBeta',
    FLOWHOLT_DATABASE_URL: 'postgres://flowholt-db',
  });

  assert.equal(checks.some((check) => check.key.includes('reused-scheduler-worker')), true);
  assert.equal(checks.some((check) => check.key === 'service-role-reuse'), true);

  const summary = summarizeSecurityChecks(checks);
  assert.equal(summary.warn >= 1, true);
  assert.equal(summary.error >= 1, true);
});

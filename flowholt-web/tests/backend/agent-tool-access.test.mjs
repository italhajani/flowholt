import test from 'node:test';
import assert from 'node:assert/strict';

import {
  canAgentUseToolKey,
  normalizeAgentToolAccessConfig,
  normalizeAgentToolPolicyConfig,
  summarizeAgentToolAccess,
  summarizeAgentToolStrategy,
} from '../../src/lib/flowholt/agent-tool-access.ts';

test('normalizeAgentToolAccessConfig keeps valid selected tool lists only when needed', () => {
  const normalized = normalizeAgentToolAccessConfig({
    tool_access_mode: 'selected',
    allowed_tool_keys: ['knowledge-lookup', 'missing-key', 'knowledge-lookup'],
  });

  assert.equal(normalized.tool_access_mode, 'selected');
  assert.deepEqual(normalized.allowed_tool_keys, ['knowledge-lookup']);
});

test('normalizeAgentToolPolicyConfig keeps valid orchestration strategy values', () => {
  const normalized = normalizeAgentToolPolicyConfig({
    tool_access_mode: 'selected',
    tool_call_strategy: 'read_then_write',
    allowed_tool_keys: ['crm-upsert'],
  });

  assert.equal(normalized.tool_access_mode, 'selected');
  assert.equal(normalized.tool_call_strategy, 'read_then_write');
  assert.deepEqual(normalized.allowed_tool_keys, ['crm-upsert']);
});

test('canAgentUseToolKey respects none, all, and selected modes', () => {
  assert.equal(canAgentUseToolKey({ tool_access_mode: 'none' }, 'http-request'), false);
  assert.equal(canAgentUseToolKey({ tool_access_mode: 'all' }, 'crm-upsert'), true);
  assert.equal(
    canAgentUseToolKey({ tool_access_mode: 'selected', allowed_tool_keys: ['crm-upsert'] }, 'crm-upsert'),
    true,
  );
  assert.equal(
    canAgentUseToolKey({ tool_access_mode: 'selected', allowed_tool_keys: ['crm-upsert'] }, 'knowledge-lookup'),
    false,
  );
});

test('summary helpers give simple UI friendly labels', () => {
  assert.equal(summarizeAgentToolAccess({ tool_access_mode: 'workspace_default' }), 'Workspace default');
  assert.equal(summarizeAgentToolAccess({ tool_access_mode: 'none' }), 'No tools');
  assert.equal(
    summarizeAgentToolAccess({ tool_access_mode: 'selected', allowed_tool_keys: ['http-request', 'crm-upsert'] }),
    'Selected tools (2)',
  );
  assert.equal(summarizeAgentToolStrategy({ tool_call_strategy: 'workspace_default' }), 'Workspace default strategy');
  assert.equal(summarizeAgentToolStrategy({ tool_call_strategy: 'fan_out' }), 'Fan out to multiple tool steps');
});

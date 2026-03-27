import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applyToolPreset,
  getDefaultToolConfig,
  getToolRegistryItem,
  getToolRegistryPromptLines,
} from '../../src/lib/flowholt/tool-registry.ts';

test('getToolRegistryItem falls back to generic http request preset', () => {
  assert.equal(getToolRegistryItem('crm-upsert').capability, 'crm_writeback');
  assert.equal(getToolRegistryItem('crm-upsert').requiresConnection, true);
  assert.equal(getToolRegistryItem('crm-upsert').resultContract, 'record_sync');
  assert.equal(getToolRegistryItem('crm-upsert').marketplaceCategory, 'crm_operations');
  assert.equal(getToolRegistryItem('missing-preset').key, 'http-request');
});

test('getDefaultToolConfig returns a cloned preset config', () => {
  const first = getDefaultToolConfig('knowledge-lookup');
  const second = getDefaultToolConfig('knowledge-lookup');

  assert.notEqual(first, second);
  first.body.limit = 2;
  assert.equal(second.body.limit, 5);
});

test('applyToolPreset keeps connection fields but replaces the main request shape', () => {
  const config = applyToolPreset('crm-upsert', {
    tool_key: 'http-request',
    method: 'GET',
    url: 'https://old.example.com',
    body: { old: true },
    connection_id: 'conn-123',
    headers: { 'x-demo': '1' },
  });

  assert.equal(config.tool_key, 'crm-upsert');
  assert.equal(config.method, 'POST');
  assert.equal(config.url, '/v1/records/upsert');
  assert.equal(config.connection_id, 'conn-123');
  assert.deepEqual(config.headers, { 'x-demo': '1' });
  assert.deepEqual(config.body, {
    external_id: '{{trigger.payload.id}}',
    summary: '{{previous.text}}',
    status: 'qualified',
  });
});

test('planner lines include capability and contract context for the AI planner', () => {
  const toolLines = getToolRegistryPromptLines();

  assert.equal(toolLines.length >= 5, true);
  assert.equal(toolLines.some((line) => line.includes('capability:crm_writeback')), true);
  assert.equal(toolLines.some((line) => line.includes('capability:knowledge_lookup')), true);
  assert.equal(toolLines.some((line) => line.includes('contract:document_matches')), true);
});

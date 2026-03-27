import test from 'node:test';
import assert from 'node:assert/strict';

import {
  expectedConnectionProviderForNode,
  readNodeConnectionId,
  requiresConnectionForNode,
  resolveNodeConfigWithConnection,
} from '../../src/lib/flowholt/integration-runtime.ts';

test('tool and trigger presets resolve the expected connection provider', () => {
  assert.equal(expectedConnectionProviderForNode('agent', {}), 'groq');
  assert.equal(expectedConnectionProviderForNode('tool', { tool_key: 'crm-upsert' }), 'http');
  assert.equal(expectedConnectionProviderForNode('tool', { tool_key: 'webhook-reply' }), null);
  assert.equal(expectedConnectionProviderForNode('trigger', { mode: 'webhook' }), 'webhook');
  assert.equal(expectedConnectionProviderForNode('trigger', { mode: 'manual' }), null);
});

test('requiresConnectionForNode respects preset contracts and explicit connection ids', () => {
  assert.equal(requiresConnectionForNode('tool', { tool_key: 'crm-upsert' }), true);
  assert.equal(requiresConnectionForNode('tool', { tool_key: 'http-request' }), false);
  assert.equal(requiresConnectionForNode('tool', { tool_key: 'webhook-reply' }), false);
  assert.equal(requiresConnectionForNode('agent', { connection_id: 'conn-1' }), true);
  assert.equal(readNodeConnectionId({ connection_id: 'conn-1' }), 'conn-1');
});

test('resolveNodeConfigWithConnection merges http connection defaults for tool presets', () => {
  const resolved = resolveNodeConfigWithConnection(
    'tool',
    {
      tool_key: 'knowledge-lookup',
      body: { query: '{{workflow.original_prompt}}', limit: 3 },
      headers: { 'x-node-header': '1' },
    },
    {
      id: 'http-1',
      provider: 'http',
      label: 'Knowledge API',
      config: {
        base_url: 'https://knowledge.example.com',
        default_method: 'POST',
        default_headers: { accept: 'application/json' },
        api_key_header: 'x-knowledge-key',
      },
      secrets: {
        api_key: 'secret-123',
      },
    },
  );

  assert.equal(resolved.connection_id, 'http-1');
  assert.equal(resolved.connection_provider, 'http');
  assert.equal(resolved.connection_label, 'Knowledge API');
  assert.equal(resolved.base_url, 'https://knowledge.example.com');
  assert.equal(resolved.default_method, 'POST');
  assert.equal(resolved.api_key, 'secret-123');
  assert.equal(resolved.api_key_header, 'x-knowledge-key');
  assert.deepEqual(resolved.headers, {
    accept: 'application/json',
    'x-node-header': '1',
  });
});

test('resolveNodeConfigWithConnection keeps optional presets runnable without a saved connection', () => {
  const resolved = resolveNodeConfigWithConnection('tool', {
    tool_key: 'webhook-reply',
    url: '{{trigger.reply_url}}',
  });

  assert.equal(resolved.tool_key, 'webhook-reply');
  assert.equal(resolved.capability, 'webhook_reply');
  assert.equal(resolved.auth_kind, 'none');
  assert.equal(resolved.url, '{{trigger.reply_url}}');
});

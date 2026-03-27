import test from 'node:test';
import assert from 'node:assert/strict';

import { buildPackAwareFallbackDraft } from '../../src/lib/flowholt/pack-aware-workflow.ts';

test('buildPackAwareFallbackDraft creates lead intake graph with research and CRM writeback', () => {
  const draft = buildPackAwareFallbackDraft('Create a better lead qualification flow.', 'lead-intake-pack');

  const toolKeys = draft?.graph.nodes
    .filter((node) => node.type === 'tool')
    .map((node) => String((node.config ?? {}).tool_key || ''));
  const qualifyNode = draft?.graph.nodes.find((node) => node.id === 'qualify-lead');

  assert.equal(draft?.name, 'Lead intake workflow');
  assert.equal(toolKeys?.includes('knowledge-lookup'), true);
  assert.equal(toolKeys?.includes('crm-upsert'), true);
  assert.equal(qualifyNode?.config?.tool_call_strategy, 'read_then_write');
});

test('buildPackAwareFallbackDraft creates content ops fan-out graph', () => {
  const draft = buildPackAwareFallbackDraft('Create a content workflow for publishing and reporting.', 'content-ops-pack');

  const creatorNode = draft?.graph.nodes.find((node) => node.id === 'create-content');
  const outgoing = draft?.graph.edges.filter((edge) => edge.source === 'create-content') ?? [];

  assert.equal(draft?.name, 'Content operations workflow');
  assert.equal(creatorNode?.config?.tool_call_strategy, 'fan_out');
  assert.equal(outgoing.length >= 2, true);
});

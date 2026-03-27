import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildComposerAssistantMessage,
  buildComposerProposalSummary,
  buildWorkflowRevisionInsert,
  parseComposerMode,
  sanitizeComposerHistory,
  withComposerSettings,
} from '../../src/lib/flowholt/composer-logic.ts';

const sampleProposal = {
  name: 'Lead intake assistant',
  description: 'Qualify incoming leads and prepare a response.',
  graph: {
    nodes: [
      { id: 'trigger', type: 'trigger', label: 'New lead', config: { mode: 'webhook' } },
      { id: 'agent', type: 'agent', label: 'Qualify lead', config: { instruction: 'Check fit' } },
      { id: 'tool', type: 'tool', label: 'CRM lookup', config: { method: 'POST' } },
      { id: 'output', type: 'output', label: 'Reply', config: { result: '{{previous}}' } },
    ],
    edges: [
      { source: 'trigger', target: 'agent' },
      { source: 'agent', target: 'tool' },
      { source: 'tool', target: 'output' },
    ],
  },
  reasoning: [
    'Added qualification before outreach.',
    'Kept the flow short and runnable.',
    'Prepared a final response output.',
  ],
  changes: [
    {
      kind: 'add',
      node_id: 'tool',
      label: 'CRM lookup',
      node_type: 'tool',
      reason: 'Need account context before response.',
    },
  ],
  generation: {
    provider: 'groq',
    model: 'llama-3.3-70b-versatile',
    notes: 'Generated from prompt',
    originalPrompt: 'add crm lookup before reply',
  },
};

test('parseComposerMode defaults safely to preview', () => {
  assert.equal(parseComposerMode('apply'), 'apply');
  assert.equal(parseComposerMode('PREVIEW'), 'preview');
  assert.equal(parseComposerMode('something-else'), 'preview');
});

test('sanitizeComposerHistory filters empty rows and keeps latest 25 items', () => {
  const history = sanitizeComposerHistory(
    Array.from({ length: 30 }, (_, index) => ({
      at: `2026-03-27T10:${String(index).padStart(2, '0')}:00.000Z`,
      mode: index % 2 === 0 ? 'preview' : 'apply',
      message: index === 0 ? '' : `message-${index}`,
      proposal: {
        name: `Workflow ${index}`,
        description: '',
        node_count: index,
        edge_count: index - 1,
        provider: 'groq',
        model: 'test-model',
      },
    })),
  );

  assert.equal(history.length, 25);
  assert.equal(history[0].message, 'message-5');
  assert.equal(history.at(-1)?.message, 'message-29');
});

test('buildComposerProposalSummary reports counts for premium assistant UI', () => {
  const summary = buildComposerProposalSummary(sampleProposal);

  assert.equal(summary.summary.node_count, 4);
  assert.equal(summary.summary.edge_count, 3);
  assert.equal(summary.summary.tool_count, 1);
  assert.equal(summary.summary.condition_count, 0);
});

test('buildComposerAssistantMessage changes wording between preview and apply', () => {
  assert.match(
    buildComposerAssistantMessage('preview', sampleProposal, true),
    /Prepared valid proposal: Lead intake assistant/,
  );
  assert.match(
    buildComposerAssistantMessage('apply', sampleProposal, true, 'rev-123'),
    /Revision saved: rev-123/,
  );
});

test('withComposerSettings stores the latest plan and appends capped history', () => {
  const settings = withComposerSettings(
    {
      composer_history: Array.from({ length: 24 }, (_, index) => ({
        at: `2026-03-27T09:${String(index).padStart(2, '0')}:00.000Z`,
        mode: 'preview',
        message: `old-${index}`,
        proposal: { name: 'Old', description: '', node_count: 1, edge_count: 0, provider: 'fallback', model: 'local' },
      })),
    },
    'apply',
    'add crm lookup before reply',
    sampleProposal,
  );

  assert.equal(settings.composer.last_message, 'add crm lookup before reply');
  assert.equal(settings.composer.last_mode, 'apply');
  assert.equal(settings.composer.last_plan.summary.node_count, 4);
  assert.equal(settings.composer_history.length, 25);
  assert.equal(settings.composer_history.at(-1)?.proposal.model, 'llama-3.3-70b-versatile');
});

test('buildWorkflowRevisionInsert captures before and after workflow state', () => {
  const revision = buildWorkflowRevisionInsert(
    {
      id: 'wf-1',
      workspace_id: 'ws-1',
      created_by_user_id: 'user-1',
      name: 'Old workflow',
      description: 'Before',
      status: 'draft',
      graph: {
        nodes: [{ id: 'trigger', type: 'trigger', label: 'Start', config: {} }],
        edges: [],
      },
      settings: {},
      created_at: '2026-03-27T10:00:00.000Z',
      updated_at: '2026-03-27T10:00:00.000Z',
    },
    'user-1',
    'add crm lookup before reply',
    sampleProposal,
    { valid: true },
  );

  assert.equal(revision.source, 'compose_apply');
  assert.equal(revision.after_name, 'Lead intake assistant');
  assert.equal(revision.change_summary.summary.node_count, 4);
  assert.deepEqual(revision.change_summary.validation, { valid: true });
});

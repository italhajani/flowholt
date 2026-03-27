import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildEventTriggerMeta,
  doesEventTriggerMatch,
  eventPatternMatches,
  findMatchingEventTriggers,
  normalizeEventToken,
} from '../../src/lib/flowholt/event-trigger-logic.ts';

test('normalizeEventToken lowercases and trims strings safely', () => {
  assert.equal(normalizeEventToken('  Lead.Created  '), 'lead.created');
  assert.equal(normalizeEventToken(null), '');
});

test('eventPatternMatches supports exact names and wildcard prefixes', () => {
  assert.equal(eventPatternMatches('lead.created', 'lead.created'), true);
  assert.equal(eventPatternMatches('invoice.*', 'invoice.paid'), true);
  assert.equal(eventPatternMatches('invoice.*', 'lead.created'), false);
});

test('doesEventTriggerMatch respects mode, event name, and optional source', () => {
  const node = {
    id: 'trigger-1',
    type: 'trigger',
    label: 'Lead created',
    config: {
      mode: 'event',
      event_name: 'lead.created',
      event_source: 'crm',
    },
  };

  assert.equal(
    doesEventTriggerMatch(node, { workspaceId: 'ws-1', eventName: 'lead.created', eventSource: 'crm' }),
    true,
  );
  assert.equal(
    doesEventTriggerMatch(node, { workspaceId: 'ws-1', eventName: 'lead.created', eventSource: 'forms' }),
    false,
  );
});

test('findMatchingEventTriggers only returns matching event trigger nodes', () => {
  const workflow = {
    graph: {
      nodes: [
        {
          id: 'trigger-1',
          type: 'trigger',
          label: 'Lead event',
          config: { mode: 'event', event_name: 'lead.*', event_source: 'crm' },
        },
        {
          id: 'trigger-2',
          type: 'trigger',
          label: 'Webhook entry',
          config: { mode: 'webhook', method: 'POST' },
        },
        {
          id: 'agent-1',
          type: 'agent',
          label: 'Summarize',
          config: {},
        },
      ],
      edges: [],
    },
  };

  const matches = findMatchingEventTriggers(workflow, {
    workspaceId: 'ws-1',
    eventName: 'lead.created',
    eventSource: 'crm',
  });

  assert.deepEqual(matches, [
    {
      nodeId: 'trigger-1',
      nodeLabel: 'Lead event',
      eventName: 'lead.*',
      eventSource: 'crm',
    },
  ]);
});

test('buildEventTriggerMeta summarizes matched trigger details', () => {
  const meta = buildEventTriggerMeta(
    {
      workspaceId: 'ws-1',
      eventName: 'invoice.paid',
      eventSource: 'billing',
      metadata: { source_id: 'evt_1' },
    },
    [
      {
        nodeId: 'trigger-9',
        nodeLabel: 'Invoice paid',
        eventName: 'invoice.*',
        eventSource: 'billing',
      },
    ],
  );

  assert.deepEqual(meta, {
    event_name: 'invoice.paid',
    event_source: 'billing',
    event_metadata: { source_id: 'evt_1' },
    matched_trigger_ids: ['trigger-9'],
    matched_trigger_labels: ['Invoice paid'],
    matched_trigger_count: 1,
  });
});

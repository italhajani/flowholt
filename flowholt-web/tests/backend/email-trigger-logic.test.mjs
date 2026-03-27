import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildEmailTriggerMeta,
  doesEmailTriggerMatch,
  findMatchingEmailTriggers,
  normalizeEmailAddress,
  normalizeSubjectToken,
} from '../../src/lib/flowholt/email-trigger-logic.ts';

test('normalizeEmailAddress and normalizeSubjectToken trim safely', () => {
  assert.equal(normalizeEmailAddress('  Leads@FlowHolt.app '), 'leads@flowholt.app');
  assert.equal(normalizeSubjectToken('  New Lead  '), 'new lead');
});

test('doesEmailTriggerMatch respects mode, inbox address, and optional subject filter', () => {
  const node = {
    id: 'trigger-email',
    type: 'trigger',
    label: 'Inbound lead email',
    config: {
      mode: 'email',
      email_address: 'leads@flowholt.app',
      subject_contains: 'new lead',
    },
  };

  assert.equal(
    doesEmailTriggerMatch(node, {
      workspaceId: 'ws-1',
      to: 'Leads@FlowHolt.app',
      subject: 'New lead from website',
    }),
    true,
  );
  assert.equal(
    doesEmailTriggerMatch(node, {
      workspaceId: 'ws-1',
      to: 'support@flowholt.app',
      subject: 'New lead from website',
    }),
    false,
  );
});

test('findMatchingEmailTriggers only returns matching email trigger nodes', () => {
  const workflow = {
    graph: {
      nodes: [
        {
          id: 'trigger-email',
          type: 'trigger',
          label: 'Inbound lead email',
          config: { mode: 'email', email_address: 'leads@flowholt.app', subject_contains: 'lead' },
        },
        {
          id: 'trigger-event',
          type: 'trigger',
          label: 'Lead event',
          config: { mode: 'event', event_name: 'lead.created' },
        },
      ],
      edges: [],
    },
  };

  const matches = findMatchingEmailTriggers(workflow, {
    workspaceId: 'ws-1',
    to: 'leads@flowholt.app',
    subject: 'Lead from demo form',
  });

  assert.deepEqual(matches, [
    {
      nodeId: 'trigger-email',
      nodeLabel: 'Inbound lead email',
      emailAddress: 'leads@flowholt.app',
      subjectContains: 'lead',
    },
  ]);
});

test('buildEmailTriggerMeta summarizes matched email trigger details', () => {
  const meta = buildEmailTriggerMeta(
    {
      workspaceId: 'ws-1',
      to: 'support@flowholt.app',
      from: 'customer@example.com',
      subject: 'Support request',
      providerMessageId: 'msg_1',
      metadata: { mailbox: 'support' },
    },
    [
      {
        nodeId: 'trigger-1',
        nodeLabel: 'Support inbox',
        emailAddress: 'support@flowholt.app',
        subjectContains: 'support',
      },
    ],
  );

  assert.deepEqual(meta, {
    email_to: 'support@flowholt.app',
    email_from: 'customer@example.com',
    email_subject: 'Support request',
    provider_message_id: 'msg_1',
    email_metadata: { mailbox: 'support' },
    matched_trigger_ids: ['trigger-1'],
    matched_trigger_labels: ['Support inbox'],
    matched_trigger_count: 1,
  });
});
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  normalizeToolResponse,
  summarizeToolResultContract,
} from '../../src/lib/flowholt/tool-result-contract.ts';

test('normalizeToolResponse reshapes knowledge lookup responses into document matches', () => {
  const normalized = normalizeToolResponse({
    toolKey: 'knowledge-lookup',
    capability: 'knowledge_lookup',
    method: 'POST',
    url: 'https://knowledge.example.com/v1/search',
    statusCode: 200,
    responsePayload: {
      documents: [
        { title: 'Refund policy', summary: 'Customers can request refunds within 30 days.' },
        { title: 'Shipping policy', summary: 'Express delivery takes 2 business days.' },
      ],
    },
    connectionLabel: 'Knowledge API',
  });

  assert.equal(normalized.contract_kind, 'document_matches');
  assert.equal(normalized.item_count, 2);
  assert.equal(normalized.primary_text, 'Refund policy');
  assert.equal(normalized.data.source_count, 2);
  assert.equal(normalized.connection_label, 'Knowledge API');
});

test('normalizeToolResponse reshapes crm writeback responses into a stable record sync contract', () => {
  const normalized = normalizeToolResponse({
    toolKey: 'crm-upsert',
    capability: 'crm_writeback',
    method: 'POST',
    url: 'https://crm.example.com/v1/records/upsert',
    statusCode: 201,
    responsePayload: {
      id: 'lead-42',
      status: 'updated',
      message: 'Lead synced',
    },
  });

  assert.equal(normalized.contract_kind, 'record_sync');
  assert.equal(normalized.data.record_id, 'lead-42');
  assert.equal(normalized.data.sync_status, 'updated');
  assert.equal(normalized.primary_text, 'Lead synced');
});

test('summarizeToolResultContract gives UI-friendly contract labels', () => {
  assert.equal(summarizeToolResultContract('knowledge-lookup'), 'document matches output');
  assert.equal(summarizeToolResultContract('webhook-reply'), 'callback ack output');
});

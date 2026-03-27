import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildToolMarketplace,
  buildToolMarketplaceSummary,
  getToolMarketplacePromptLines,
} from '../../src/lib/flowholt/tool-marketplace.ts';

test('buildToolMarketplace marks kits ready when matching providers exist', () => {
  const categories = buildToolMarketplace([
    { id: 'conn-groq', provider: 'groq', label: 'Groq Production' },
    { id: 'conn-http', provider: 'http', label: 'Ops API' },
  ]);

  const aiCategory = categories.find((category) => category.key === 'ai_agents');
  const crmCategory = categories.find((category) => category.key === 'crm_operations');

  assert.equal(aiCategory?.kits[0]?.readiness, 'ready');
  assert.equal(crmCategory?.kits.some((kit) => kit.readiness === 'ready'), true);
});

test('buildToolMarketplace marks delivery kit partial when only one provider path is available', () => {
  const categories = buildToolMarketplace([
    { id: 'conn-http', provider: 'http', label: 'HTTP Demo' },
  ]);

  const deliveryCategory = categories.find((category) => category.key === 'delivery_webhooks');
  const deliveryKit = deliveryCategory?.kits.find((kit) => kit.key === 'delivery-webhook-kit');

  assert.equal(deliveryKit?.readiness, 'partial');
  assert.equal(deliveryKit?.matchingConnectionCount, 1);
  assert.equal(deliveryKit?.readinessDetail.includes('Still missing provider'), true);
});

test('buildToolMarketplaceSummary exposes provider packs, workflow packs, and featured packs', () => {
  const summary = buildToolMarketplaceSummary(
    buildToolMarketplace([
      { id: 'conn-groq', provider: 'groq', label: 'Groq Production' },
      { id: 'conn-http', provider: 'http', label: 'Ops API' },
    ]),
  );

  assert.equal(summary.totalKits >= 9, true);
  assert.equal(summary.providerPacks >= 6, true);
  assert.equal(summary.workflowPacks >= 3, true);
  assert.equal(summary.featuredKits.some((kit) => kit.key === 'groq-agent-kit'), true);
  assert.equal(summary.featuredWorkflowPacks.some((kit) => kit.key === 'lead-intake-pack'), true);
});

test('marketplace prompt lines include provider-specific kit context for the planner', () => {
  const lines = getToolMarketplacePromptLines();

  assert.equal(lines.some((line) => line.includes('Groq agent kit')), true);
  assert.equal(lines.some((line) => line.includes('providers:groq')), true);
  assert.equal(lines.some((line) => line.includes('Knowledge search kit')), true);
  assert.equal(lines.some((line) => line.includes('family:workflow_pack')), true);
  assert.equal(lines.some((line) => line.includes('strategy:')), true);
});

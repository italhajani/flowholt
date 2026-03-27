import test from 'node:test';
import assert from 'node:assert/strict';

import { compareWorkflowRevision } from '../../src/lib/flowholt/revision-compare.ts';

test('compareWorkflowRevision summarizes graph, metadata, and node changes', () => {
  const result = compareWorkflowRevision({
    before_name: 'Lead intake',
    before_description: 'Initial version',
    before_graph: {
      nodes: [
        { id: 'trigger', type: 'trigger', label: 'Start trigger', config: {} },
        { id: 'output', type: 'output', label: 'Final output', config: {} },
      ],
      edges: [{ source: 'trigger', target: 'output' }],
    },
    after_name: 'Lead intake v2',
    after_description: 'Now with review step',
    after_graph: {
      nodes: [
        { id: 'trigger', type: 'trigger', label: 'Webhook trigger', config: { mode: 'webhook' } },
        { id: 'review', type: 'agent', label: 'Review lead', config: { instruction: 'Check the lead' } },
        { id: 'output', type: 'output', label: 'Final output', config: {} },
      ],
      edges: [
        { source: 'trigger', target: 'review' },
        { source: 'review', target: 'output' },
      ],
    },
  });

  assert.equal(result.flags.name_changed, true);
  assert.equal(result.flags.description_changed, true);
  assert.equal(result.added_nodes.length, 1);
  assert.equal(result.added_nodes[0].id, 'review');
  assert.ok(result.changed_nodes.some((node) => node.id === 'trigger'));
  assert.equal(result.removed_nodes.length, 0);
  assert.ok(result.summary_lines.some((line) => line.includes('Workflow name changed')));
});

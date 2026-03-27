import test from 'node:test';
import assert from 'node:assert/strict';

import { validateWorkflowGraph, validationFailureMessage } from '../../src/lib/flowholt/graph-validator.ts';

const validGraph = {
  nodes: [
    { id: 'trigger', type: 'trigger', label: 'Start trigger' },
    { id: 'agent', type: 'agent', label: 'Summarize task' },
    { id: 'output', type: 'output', label: 'Final output' },
  ],
  edges: [
    { source: 'trigger', target: 'agent' },
    { source: 'agent', target: 'output' },
  ],
};

test('validateWorkflowGraph accepts a clean runnable graph', () => {
  const report = validateWorkflowGraph(validGraph);

  assert.equal(report.valid, true);
  assert.equal(report.score, 100);
  assert.deepEqual(report.summary.root_nodes, ['trigger']);
  assert.deepEqual(report.summary.unreachable_nodes, []);
  assert.equal(report.summary.error_count, 0);
  assert.equal(validationFailureMessage(report), '');
});

test('validateWorkflowGraph flags cycles and missing output nodes', () => {
  const report = validateWorkflowGraph({
    nodes: [
      { id: 'trigger', type: 'trigger', label: 'Start trigger' },
      { id: 'loop', type: 'agent', label: 'Loop step' },
    ],
    edges: [
      { source: 'trigger', target: 'loop' },
      { source: 'loop', target: 'trigger' },
    ],
  });

  assert.equal(report.valid, false);
  assert.ok(report.issues.some((issue) => issue.code === 'cycle_detected'));
  assert.ok(report.issues.some((issue) => issue.code === 'missing_output'));
  assert.match(validationFailureMessage(report), /Workflow graph is invalid:/);
});

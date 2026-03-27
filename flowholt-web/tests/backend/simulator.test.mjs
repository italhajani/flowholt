import test from 'node:test';
import assert from 'node:assert/strict';

import { simulateWorkflowGraph } from '../../src/lib/flowholt/simulator.ts';

const branchingGraph = {
  nodes: [
    { id: 'trigger', type: 'trigger', label: 'Start trigger' },
    { id: 'condition', type: 'condition', label: 'Qualify lead' },
    { id: 'agent', type: 'agent', label: 'Write reply' },
    { id: 'output', type: 'output', label: 'Final output' },
  ],
  edges: [
    { source: 'trigger', target: 'condition' },
    { source: 'condition', target: 'agent', branch: 'true', label: 'True' },
    { source: 'condition', target: 'output', branch: 'false', label: 'False' },
    { source: 'agent', target: 'output' },
  ],
};

test('simulateWorkflowGraph reports execution shape and possible paths', () => {
  const report = simulateWorkflowGraph(branchingGraph);

  assert.equal(report.executable, true);
  assert.deepEqual(report.root_nodes, ['trigger']);
  assert.deepEqual(report.terminal_nodes, ['output']);
  assert.equal(report.estimated_step_count, 4);
  assert.equal(report.possible_path_count, 2);
  assert.equal(report.notes.length, 0);
  assert.deepEqual(report.execution_order, ['trigger', 'condition', 'agent', 'output']);
});

test('simulateWorkflowGraph records disconnected cycles as unreachable', () => {
  const report = simulateWorkflowGraph({
    nodes: [
      ...branchingGraph.nodes,
      { id: 'orphan-a', type: 'memory', label: 'Unused memory' },
      { id: 'orphan-b', type: 'agent', label: 'Unused agent' },
    ],
    edges: [
      ...branchingGraph.edges,
      { source: 'orphan-a', target: 'orphan-b' },
      { source: 'orphan-b', target: 'orphan-a' },
    ],
  });

  assert.ok(report.skipped_nodes.includes('orphan-a'));
  assert.ok(report.skipped_nodes.includes('orphan-b'));
  assert.ok(report.notes.some((note) => note.includes('orphan-a')));
});

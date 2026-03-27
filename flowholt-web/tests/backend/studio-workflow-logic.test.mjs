import test from 'node:test';
import assert from 'node:assert/strict';

import {
  normalizeAgentNode,
  normalizeWorkflowGraph,
  parseWorkflowGraphInput,
} from '../../src/lib/flowholt/studio-workflow-logic.ts';

test('normalizeAgentNode removes the placeholder default model', () => {
  const node = normalizeAgentNode({
    id: 'agent-1',
    type: 'agent',
    label: 'Summarize',
    config: {
      model: 'default',
      instruction: 'Summarize the post',
    },
  });

  assert.equal(node.config.model, undefined);
  assert.equal(node.config.instruction, 'Summarize the post');
});

test('normalizeWorkflowGraph strips blank agent models but preserves other node config', () => {
  const graph = normalizeWorkflowGraph({
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        label: 'New post',
        config: { source: 'manual' },
      },
      {
        id: 'agent-1',
        type: 'agent',
        label: 'Summarize',
        config: { model: '   ', instruction: 'Summarize the post' },
      },
    ],
    edges: [{ source: 'trigger-1', target: 'agent-1' }],
  });

  assert.equal(graph.nodes[0].config.source, 'manual');
  assert.equal(graph.nodes[1].config.model, undefined);
  assert.equal(graph.nodes[1].config.instruction, 'Summarize the post');
});

test('parseWorkflowGraphInput throws when graph JSON is missing nodes or edges arrays', () => {
  assert.throws(
    () => parseWorkflowGraphInput('{"nodes":{}}'),
    /Graph JSON must include nodes and edges arrays\./,
  );
});

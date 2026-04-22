# Dirty nodes | n8n Docs

Source: https://docs.n8n.io/workflows/executions/dirty-nodes
Lastmod: 2026-04-14
Description: What dirty nodes are and how they affect workflow execution.
# Dirty nodes[#](#dirty-nodes "Permanent link")

A **dirty node** is a node that executed successfully in the past, but whose output n8n now considers stale or unreliable. They're labeled like this to indicate that if the node executes again, the output may be different. It may also be the point where a [partial execution](../manual-partial-and-production-executions/#partial-executions) starts from.

## How to recognize dirty node data[#](#how-to-recognize-dirty-node-data "Permanent link")

In the canvas of the workflow editor, you can identify dirty notes by their different-colored border and a yellow triangle in place of the previous green tick symbol. For example:

[!["Image of node displayed with yellow border"](../../../_images/workflows/executions/dirty-node-canvas.png)](https://docs.n8n.io/_images/workflows/executions/dirty-node-canvas.png)

In the node editor view, the output panel also displays a yellow triangle on the output panel. If you hover over the triangle, a tooltip appears with more information about why n8n considers the data stale:

[!["Image of node displayed with yellow border"](../../../_images/workflows/executions/dirty-node-editor.png)](https://docs.n8n.io/_images/workflows/executions/dirty-node-editor.png)

## Why n8n marks nodes dirty[#](#why-n8n-marks-nodes-dirty "Permanent link")

There are several reasons why n8n might flag execution data as stale. For example:

* Inserting or deleting a node: labels the first node that follows the inserted node dirty.
* Modifying node parameters: labels the modified node dirty.
* Adding a connector: labels the destination node of the new connector dirty.
* Deactivating a node: labels the first node that follows the deactivated node dirty.

Other reasons n8n marks nodes dirty

* Unpinning a node: labels the unpinned node dirty.
* Modifying pinned data: labels the node that comes after the pinned data dirty.
* If any of the above actions occur inside a loop, also labels the first node of the loop dirty.

For sub-nodes, also labels any executed parent nodes (up to and including the root) when:

* Editing an executed sub-node
* Adding a new sub-node
* Disconnecting or deleting a sub-node
* Deactivating a sub-node
* Activating a sub-node

* When deleting a connected node in a workflow:

  [!["Image of node displayed with yellow border"](../../../_images/workflows/executions/dirty-before.png)](https://docs.n8n.io/_images/workflows/executions/dirty-before.png)
* The next node in the sequence becomes dirty:

  [!["Image of node displayed with yellow border"](../../../_images/workflows/executions/dirty-after.png)](https://docs.n8n.io/_images/workflows/executions/dirty-after.png)

When using loops (with the [Loop over Items](../../../integrations/builtin/core-nodes/n8n-nodes-base.splitinbatches/) node), when any node within the loop is dirty, the initial node of the loop is also considered dirty:

[!["Image of node displayed with yellow border"](../../../_images/workflows/executions/dirty-loop.png)](https://docs.n8n.io/_images/workflows/executions/dirty-loop.png)

## Resolving dirty nodes[#](#resolving-dirty-nodes "Permanent link")

Executing a node again clears its dirty status. You can do this manually by triggering the whole workflow, or by running a [partial execution](../manual-partial-and-production-executions/#partial-executions) with **Execute step** on the individual node or any node which follows it.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

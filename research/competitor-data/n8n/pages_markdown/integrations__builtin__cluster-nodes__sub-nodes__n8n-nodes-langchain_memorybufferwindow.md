# Simple Memory node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.memorybufferwindow
Lastmod: 2026-04-14
Description: Learn how to use the Simple Memory node in n8n. Follow technical documentation to integrate Simple Memory node into your workflows.
# Simple Memory node[#](#simple-memory-node "Permanent link")

Use the Simple Memory node to [persist](../../../../../glossary/#ai-memory) chat history in your workflow.

On this page, you'll find a list of operations the Simple Memory node supports, and links to more resources.

Don't use this node if running n8n in queue mode

If your n8n instance uses [queue mode](../../../../../hosting/scaling/queue-mode/), this node doesn't work in an active production workflow. This is because n8n can't guarantee that every call to Simple Memory will go to the same worker.

Parameter resolution in sub-nodes

Sub-nodes behave differently to other nodes when processing multiple items using an expression.

Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `{{ $json.name }}` resolves to each name in turn.

In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `{{ $json.name }}` always resolves to the first name.

## Node parameters[#](#node-parameters "Permanent link")

Configure these parameters to configure the node:

* **Session Key**: Enter the key to use to store the memory in the workflow data.
* **Context Window Length**: Enter the number of previous interactions to consider for context.

## Templates and examples[#](#templates-and-examples "Permanent link")

[Browse Simple Memory node documentation integration templates](https://n8n.io/integrations/window-buffer-memory/), or [search all templates](https://n8n.io/workflows/)

## Related resources[#](#related-resources "Permanent link")

Refer to [LangChain's Buffer Window Memory documentation](https://v03.api.js.langchain.com/classes/langchain.memory.BufferWindowMemory.html) for more information about the service.

View n8n's [Advanced AI](../../../../../advanced-ai/) documentation.

## Common issues[#](#common-issues "Permanent link")

For common questions or issues and suggested solutions, refer to [Common issues](common-issues/).

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

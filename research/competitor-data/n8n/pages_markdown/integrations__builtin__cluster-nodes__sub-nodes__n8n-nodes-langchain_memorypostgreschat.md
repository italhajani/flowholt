# Postgres Chat Memory node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.memorypostgreschat
Lastmod: 2026-04-14
Description: Learn how to use the Postgres Chat Memory node in n8n. Follow technical documentation to integrate Postgres Chat Memory node into your workflows.
# Postgres Chat Memory node[#](#postgres-chat-memory-node "Permanent link")

Use the Postgres Chat Memory node to use Postgres as a [memory](../../../../../glossary/#ai-memory) server for storing chat history.

On this page, you'll find a list of operations the Postgres Chat Memory node supports, and links to more resources.

Credentials

You can find authentication information for this node [here](../../../credentials/postgres/).

Parameter resolution in sub-nodes

Sub-nodes behave differently to other nodes when processing multiple items using an expression.

Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `{{ $json.name }}` resolves to each name in turn.

In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `{{ $json.name }}` always resolves to the first name.

## Node parameters[#](#node-parameters "Permanent link")

* **Session Key**: Enter the key to use to store the memory in the workflow data.
* **Table Name**: Enter the name of the table to store the chat history in. The system will create the table if doesn't exist.
* **Context Window Length**: Enter the number of previous interactions to consider for context.

## Related resources[#](#related-resources "Permanent link")

Refer to [LangChain's Postgres Chat Message History documentation](https://js.langchain.com/docs/integrations/memory/postgres) for more information about the service.

View n8n's [Advanced AI](../../../../../advanced-ai/) documentation.

## Single memory instance[#](#single-memory-instance "Permanent link")

If you add more than one Postgres Chat Memory node to your workflow, all nodes access the same memory instance by default. Be careful when doing destructive actions that override existing memory contents, such as the override all messages operation in the [Chat Memory Manager](../n8n-nodes-langchain.memorymanager/) node. If you want more than one memory instance in your workflow, set different session IDs in different memory nodes.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

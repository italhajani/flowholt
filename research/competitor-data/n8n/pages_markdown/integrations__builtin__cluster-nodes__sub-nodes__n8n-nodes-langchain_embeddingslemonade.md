# Embeddings Lemonade node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.embeddingslemonade
Lastmod: 2026-04-14
Description: Learn how to use the Embeddings Lemonade node in n8n. Follow technical documentation to integrate Embeddings Lemonade node into your workflows.
# Embeddings Lemonade node[#](#embeddings-lemonade-node "Permanent link")

Use the Embeddings Lemonade node to generate vector embeddings using models hosted and managed by a Lemonade server. This node is useful for workflows that perform semantic search, clustering, similarity matching, or any task that requires numerical vector representations of text.

On this page, you'll find a list of operations the Embeddings Lemonade node supports, and links to more resources.

Credentials

You can find authentication information for this node [here](../../../credentials/lemonade/).

Parameter resolution in sub-nodes

Sub-nodes behave differently to other nodes when processing multiple items using an expression.

Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `{{ $json.name }}` resolves to each name in turn.

In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `{{ $json.name }}` always resolves to the first name.

## Node parameters[#](#node-parameters "Permanent link")

Configure the node with the following parameters.

### Model[#](#model "Permanent link")

The model which will generate the embeddings. Models are loaded and managed through the Lemonade server configured for this node. Select the desired model from the list of available options served by your Lemonade instance.

## Templates and examples[#](#templates-and-examples "Permanent link")

**Building Your First WhatsApp Chatbot**

by Jimleuk

[View template details](https://n8n.io/workflows/2465-building-your-first-whatsapp-chatbot/)

**Ask questions about a PDF using AI**

by David Roberts

[View template details](https://n8n.io/workflows/1960-ask-questions-about-a-pdf-using-ai/)

**Chat with PDF docs using AI (quoting sources)**

by David Roberts

[View template details](https://n8n.io/workflows/2165-chat-with-pdf-docs-using-ai-quoting-sources/)

[Browse Embeddings Lemonade integration templates](https://n8n.io/integrations/embeddings-lemonade/), or [search all templates](https://n8n.io/workflows/)

## Related resources[#](#related-resources "Permanent link")

Refer to [Lemonade Server's documentation](https://lemonade-server.ai/docs/) for more information about the service.

View n8n's [Advanced AI](../../../../../advanced-ai/) documentation.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

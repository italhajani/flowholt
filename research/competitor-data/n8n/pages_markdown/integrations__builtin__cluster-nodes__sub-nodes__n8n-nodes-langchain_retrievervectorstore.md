# Vector Store Retriever node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.retrievervectorstore
Lastmod: 2026-04-14
Description: Learn how to use the Vector Store Retriever node in n8n. Follow technical documentation to integrate Vector Store Retriever node into your workflows.
# Vector Store Retriever node[#](#vector-store-retriever-node "Permanent link")

Use the Vector Store Retriever node to retrieve documents from a [vector store](../../../../../glossary/#ai-vector-store).

On this page, you'll find the node parameters for the Vector Store Retriever node, and links to more resources.

Parameter resolution in sub-nodes

Sub-nodes behave differently to other nodes when processing multiple items using an expression.

Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `{{ $json.name }}` resolves to each name in turn.

In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `{{ $json.name }}` always resolves to the first name.

## Node parameters[#](#node-parameters "Permanent link")

* **Limit**: Enter the maximum number of results to return.

## Templates and examples[#](#templates-and-examples "Permanent link")

**Ask questions about a PDF using AI**

by David Roberts

[View template details](https://n8n.io/workflows/1960-ask-questions-about-a-pdf-using-ai/)

**AI Crew to Automate Fundamental Stock Analysis - Q&A Workflow**

by Derek Cheung

[View template details](https://n8n.io/workflows/2183-ai-crew-to-automate-fundamental-stock-analysis-qanda-workflow/)

**Advanced AI Demo (Presented at AI Developers #14 meetup)**

by Max Tkacz

[View template details](https://n8n.io/workflows/2358-advanced-ai-demo-presented-at-ai-developers-14-meetup/)

[Browse Vector Store Retriever integration templates](https://n8n.io/integrations/vector-store-retriever/), or [search all templates](https://n8n.io/workflows/)

## Related resources[#](#related-resources "Permanent link")

Refer to [LangChain's vector store retriever documentation](https://js.langchain.com/docs/how_to/vectorstore_retriever/) for more information about the service.

View n8n's [Advanced AI](../../../../../advanced-ai/) documentation.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

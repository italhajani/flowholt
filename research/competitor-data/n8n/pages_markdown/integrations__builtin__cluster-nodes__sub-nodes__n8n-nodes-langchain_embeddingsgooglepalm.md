# Embeddings Google PaLM node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.embeddingsgooglepalm
Lastmod: 2026-04-14
Description: Learn how to use the Embeddings Google PaLM node in n8n. Follow technical documentation to integrate Embeddings Google PaLM node into your workflows.
# Embeddings Google PaLM node[#](#embeddings-google-palm-node "Permanent link")

Use the Embeddings Google PaLM node to generate [embeddings](../../../../../glossary/#ai-embedding) for a given text.

On this page, you'll find the node parameters for the Embeddings Google PaLM node, and links to more resources.

Credentials

You can find authentication information for this node [here](../../../credentials/googleai/).

Parameter resolution in sub-nodes

Sub-nodes behave differently to other nodes when processing multiple items using an expression.

Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `{{ $json.name }}` resolves to each name in turn.

In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `{{ $json.name }}` always resolves to the first name.

## Node parameters[#](#node-parameters "Permanent link")

* **Model**: Select the model to use to generate the embedding.

n8n dynamically loads models from the Google PaLM API and you'll only see the models available to your account.

## Templates and examples[#](#templates-and-examples "Permanent link")

**Ask questions about a PDF using AI**

by David Roberts

[View template details](https://n8n.io/workflows/1960-ask-questions-about-a-pdf-using-ai/)

**Chat with PDF docs using AI (quoting sources)**

by David Roberts

[View template details](https://n8n.io/workflows/2165-chat-with-pdf-docs-using-ai-quoting-sources/)

**RAG Chatbot for Company Documents using Google Drive and Gemini**

by Mihai Farcas

[View template details](https://n8n.io/workflows/2753-rag-chatbot-for-company-documents-using-google-drive-and-gemini/)

[Browse Embeddings Google PaLM integration templates](https://n8n.io/integrations/embeddings-google-palm/), or [search all templates](https://n8n.io/workflows/)

## Related resources[#](#related-resources "Permanent link")

Refer to [Langchain's Google PaLM embeddings documentation](https://js.langchain.com/v0.2/docs/integrations/text_embedding/google_palm/) for more information about the service.

View n8n's [Advanced AI](../../../../../advanced-ai/) documentation.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

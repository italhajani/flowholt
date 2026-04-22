# Embeddings Google Gemini node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.embeddingsgooglegemini
Lastmod: 2026-04-14
Description: Learn how to use the Embeddings Google Gemini node in n8n. Follow technical documentation to integrate Embeddings Google Gemini node into your workflows.
# Embeddings Google Gemini node[#](#embeddings-google-gemini-node "Permanent link")

Use the Embeddings Google Gemini node to generate [embeddings](../../../../../glossary/#ai-embedding) for a given text.

On this page, you'll find the node parameters for the Embeddings Google Gemini node, and links to more resources.

Credentials

You can find authentication information for this node [here](../../../credentials/googleai/).

Parameter resolution in sub-nodes

Sub-nodes behave differently to other nodes when processing multiple items using an expression.

Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `{{ $json.name }}` resolves to each name in turn.

In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `{{ $json.name }}` always resolves to the first name.

## Node parameters[#](#node-parameters "Permanent link")

* **Model**: Select the model to use to generate the embedding.

Learn more about available models in [Google Gemini's models documentation](https://ai.google.dev/models/gemini).

## Templates and examples[#](#templates-and-examples "Permanent link")

**RAG Chatbot for Company Documents using Google Drive and Gemini**

by Mihai Farcas

[View template details](https://n8n.io/workflows/2753-rag-chatbot-for-company-documents-using-google-drive-and-gemini/)

**🤖 AI Powered RAG Chatbot for Your Docs + Google Drive + Gemini + Qdrant**

by Joseph LePage

[View template details](https://n8n.io/workflows/2982-ai-powered-rag-chatbot-for-your-docs-google-drive-gemini-qdrant/)

**🤖 Create a Documentation Expert Bot with RAG, Gemini, and Supabase**

by Lucas Peyrin

[View template details](https://n8n.io/workflows/5993-create-a-documentation-expert-bot-with-rag-gemini-and-supabase/)

[Browse Embeddings Google Gemini integration templates](https://n8n.io/integrations/embeddings-google-gemini/), or [search all templates](https://n8n.io/workflows/)

## Related resources[#](#related-resources "Permanent link")

Refer to [Langchain's Google Generative AI embeddings documentation](https://js.langchain.com/docs/integrations/text_embedding/google_generativeai) for more information about the service.

View n8n's [Advanced AI](../../../../../advanced-ai/) documentation.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

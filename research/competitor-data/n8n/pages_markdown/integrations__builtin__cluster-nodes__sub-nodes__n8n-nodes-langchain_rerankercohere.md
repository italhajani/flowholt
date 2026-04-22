# Reranker Cohere | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.rerankercohere
Lastmod: 2026-04-14
Description: Learn how to use the Reranker Cohere node in n8n. Follow technical documentation to integrate Cohere reranking into your workflows.
# Reranker Cohere[#](#reranker-cohere "Permanent link")

The Reranker Cohere node allows you to [rerank](../../../../../glossary/#ai-reranking) the resulting chunks from a [vector store](../../../../../glossary/#ai-vector-store). You can connect this node to a vector store.

The reranker reorders the list of documents retrieved from a vector store for a given query in order of descending relevance.

On this page, you'll find the node parameters for the Reranker Cohere node, and links to more resources.

Credentials

You can find authentication information for this node [here](../../../credentials/cohere/).

Parameter resolution in sub-nodes

Sub-nodes behave differently to other nodes when processing multiple items using an expression.

Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `{{ $json.name }}` resolves to each name in turn.

In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `{{ $json.name }}` always resolves to the first name.

## Node parameters[#](#node-parameters "Permanent link")

### Model[#](#model "Permanent link")

Choose the reranking model to use. You can find out more about the available models in [Cohere's model documentation](https://docs.cohere.com/docs/models#rerank).

## Templates and examples[#](#templates-and-examples "Permanent link")

**Automate sales cold calling pipeline with Apify, GPT-4o, and WhatsApp**

by Khairul Muhtadin

[View template details](https://n8n.io/workflows/5449-automate-sales-cold-calling-pipeline-with-apify-gpt-4o-and-whatsapp/)

**Create a Multi-Modal Telegram Support Bot with GPT-4 and Supabase RAG**

by Ezema Kingsley Chibuzo

[View template details](https://n8n.io/workflows/5589-create-a-multi-modal-telegram-support-bot-with-gpt-4-and-supabase-rag/)

**Chat with Google Drive documents using OpenAI and Pinecone RAG search**

by Pinecone

[View template details](https://n8n.io/workflows/11870-chat-with-google-drive-documents-using-openai-and-pinecone-rag-search/)

[Browse Reranker Cohere integration templates](https://n8n.io/integrations/reranker-cohere/), or [search all templates](https://n8n.io/workflows/)

## Related resources[#](#related-resources "Permanent link")

View n8n's [Advanced AI](../../../../../advanced-ai/) documentation.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

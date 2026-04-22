# Embeddings Cohere node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.embeddingscohere
Lastmod: 2026-04-14
Description: Learn how to use the Embeddings Cohere node in n8n. Follow technical documentation to integrate Embeddings Cohere node into your workflows.
# Embeddings Cohere node[#](#embeddings-cohere-node "Permanent link")

Use the Embeddings Cohere node to generate [embeddings](../../../../../glossary/#ai-embedding) for a given text.

On this page, you'll find the node parameters for the Embeddings Cohere node, and links to more resources.

Credentials

You can find authentication information for this node [here](../../../credentials/cohere/).

Parameter resolution in sub-nodes

Sub-nodes behave differently to other nodes when processing multiple items using an expression.

Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `{{ $json.name }}` resolves to each name in turn.

In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `{{ $json.name }}` always resolves to the first name.

## Node parameters[#](#node-parameters "Permanent link")

* **Model**: Select the model to use to generate the embedding. Choose from:
  + **Embed-English-v2.0(4096 Dimensions)**
  + **Embed-English-Light-v2.0(1024 Dimensions)**
  + **Embed-Multilingual-v2.0(768 Dimensions)**

Learn more about available models in [Cohere's models documentation](https://docs.cohere.com/docs/models).

## Templates and examples[#](#templates-and-examples "Permanent link")

**Automate sales cold calling pipeline with Apify, GPT-4o, and WhatsApp**

by Khairul Muhtadin

[View template details](https://n8n.io/workflows/5449-automate-sales-cold-calling-pipeline-with-apify-gpt-4o-and-whatsapp/)

**Create a Multi-Modal Telegram Support Bot with GPT-4 and Supabase RAG**

by Ezema Kingsley Chibuzo

[View template details](https://n8n.io/workflows/5589-create-a-multi-modal-telegram-support-bot-with-gpt-4-and-supabase-rag/)

**Build a Document QA System with RAG using Milvus, Cohere, and OpenAI for Google Drive**

by Aitor | 1Node

[View template details](https://n8n.io/workflows/3848-build-a-document-qa-system-with-rag-using-milvus-cohere-and-openai-for-google-drive/)

[Browse Embeddings Cohere integration templates](https://n8n.io/integrations/embeddings-cohere/), or [search all templates](https://n8n.io/workflows/)

## Related resources[#](#related-resources "Permanent link")

Refer to [Langchain's Cohere embeddings documentation](https://js.langchain.com/docs/integrations/text_embedding/cohere/) for more information about the service.

View n8n's [Advanced AI](../../../../../advanced-ai/) documentation.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

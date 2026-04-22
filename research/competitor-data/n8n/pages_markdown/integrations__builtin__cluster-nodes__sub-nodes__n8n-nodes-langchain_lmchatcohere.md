# Cohere Chat Model node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatcohere
Lastmod: 2026-04-14
Description: Learn how to use the Cohere Chat Model node in n8n. Follow technical documentation to integrate Cohere Chat Model node into your workflows.
# Cohere Chat Model node[#](#cohere-chat-model-node "Permanent link")

Use the Cohere Chat Model node to access Cohere's large language models for conversational AI and text generation tasks.

On this page, you'll find the node parameters for the Cohere Chat Model node, and links to more resources.

Credentials

You can find authentication information for this node [here](../../../credentials/cohere/).

Parameter resolution in sub-nodes

Sub-nodes behave differently to other nodes when processing multiple items using an expression.

Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `{{ $json.name }}` resolves to each name in turn.

In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `{{ $json.name }}` always resolves to the first name.

## Node parameters[#](#node-parameters "Permanent link")

* **Model**: Select the model which will generate the completion. n8n dynamically loads available models from the Cohere API. Learn more in the [Cohere model documentation](https://docs.cohere.com/v2/docs/models#command).

## Node options[#](#node-options "Permanent link")

* **Sampling Temperature**: Use this option to control the randomness of the sampling process. A higher temperature creates more diverse sampling, but increases the risk of hallucinations.
* **Max Retries**: Enter the maximum number of times to retry a request.

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

[Browse Cohere Chat Model integration templates](https://n8n.io/integrations/cohere-chat-model/), or [search all templates](https://n8n.io/workflows/)

## Related resources[#](#related-resources "Permanent link")

Refer to [Cohere's API documentation](https://docs.cohere.com/v2/reference/about) for more information about the service.

View n8n's [Advanced AI](../../../../../advanced-ai/) documentation.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

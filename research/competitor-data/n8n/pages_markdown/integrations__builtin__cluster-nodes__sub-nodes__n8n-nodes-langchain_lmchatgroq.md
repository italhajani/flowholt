# Groq Chat Model node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatgroq
Lastmod: 2026-04-14
Description: Learn how to use the Groq Chat Model node in n8n. Follow technical documentation to integrate Groq Chat Model node into your workflows.
# Groq Chat Model node[#](#groq-chat-model-node "Permanent link")

Use the Groq Chat Model node to access Groq's large language models for conversational AI and text generation tasks.

On this page, you'll find the node parameters for the Groq Chat Model node, and links to more resources.

Credentials

You can find authentication information for this node [here](../../../credentials/groq/).

Parameter resolution in sub-nodes

Sub-nodes behave differently to other nodes when processing multiple items using an expression.

Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `{{ $json.name }}` resolves to each name in turn.

In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `{{ $json.name }}` always resolves to the first name.

## Node parameters[#](#node-parameters "Permanent link")

* **Model**: Select the model which will generate the completion. n8n dynamically loads available models from the Groq API. Learn more in the [Groq model documentation](https://console.groq.com/docs/models).

## Node options[#](#node-options "Permanent link")

* **Maximum Number of Tokens**: Enter the maximum number of tokens used, which sets the completion length.
* **Sampling Temperature**: Use this option to control the randomness of the sampling process. A higher temperature creates more diverse sampling, but increases the risk of hallucinations.

## Templates and examples[#](#templates-and-examples "Permanent link")

**Conversational Interviews with AI Agents and n8n Forms**

by Jimleuk

[View template details](https://n8n.io/workflows/2566-conversational-interviews-with-ai-agents-and-n8n-forms/)

**Telegram chat with PDF**

by felipe biava cataneo

[View template details](https://n8n.io/workflows/2392-telegram-chat-with-pdf/)

**Build an AI-Powered Tech Radar Advisor with SQL DB, RAG, and Routing Agents**

by Sean Lon

[View template details](https://n8n.io/workflows/3151-build-an-ai-powered-tech-radar-advisor-with-sql-db-rag-and-routing-agents/)

[Browse Groq Chat Model integration templates](https://n8n.io/integrations/groq-chat-model/), or [search all templates](https://n8n.io/workflows/)

## Related resources[#](#related-resources "Permanent link")

Refer to [Groq's API documentation](https://console.groq.com/docs/quickstart) for more information about the service.

View n8n's [Advanced AI](../../../../../advanced-ai/) documentation.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

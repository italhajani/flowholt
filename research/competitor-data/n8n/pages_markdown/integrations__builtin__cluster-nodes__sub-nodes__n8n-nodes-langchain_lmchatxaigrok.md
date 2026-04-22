# xAI Grok Chat Model node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatxaigrok
Lastmod: 2026-04-14
Description: Learn how to use the xAI Grok Chat Model node in n8n. Follow technical documentation to integrate xAI Grok Chat Model node into your workflows.
# xAI Grok Chat Model node[#](#xai-grok-chat-model-node "Permanent link")

Use the xAI Grok Chat Model node to access xAI Grok's large language models for conversational AI and text generation tasks.

On this page, you'll find the node parameters for the xAI Grok Chat Model node, and links to more resources.

Credentials

You can find authentication information for this node [here](../../../credentials/xai/).

Parameter resolution in sub-nodes

Sub-nodes behave differently to other nodes when processing multiple items using an expression.

Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `{{ $json.name }}` resolves to each name in turn.

In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `{{ $json.name }}` always resolves to the first name.

## Node parameters[#](#node-parameters "Permanent link")

* **Model**: Select the model which will generate the completion. n8n dynamically loads available models from the xAI Grok API. Learn more in the [xAI Grok model documentation](https://docs.x.ai/docs/models).

## Node options[#](#node-options "Permanent link")

* **Frequency Penalty**: Use this option to control the chances of the model repeating itself. Higher values reduce the chance of the model repeating itself.
* **Maximum Number of Tokens**: Enter the maximum number of tokens used, which sets the completion length. Most models have a context length of 2048 tokens with the newest models supporting up to 32,768 tokens.
* **Response Format**: Choose **Text** or **JSON**. **JSON** ensures the model returns valid JSON.
* **Presence Penalty**: Use this option to control the chances of the model talking about new topics. Higher values increase the chance of the model talking about new topics.
* **Sampling Temperature**: Use this option to control the randomness of the sampling process. A higher temperature creates more diverse sampling, but increases the risk of hallucinations.
* **Timeout**: Enter the maximum request time in milliseconds.
* **Max Retries**: Enter the maximum number of times to retry a request.
* **Top P**: Use this option to set the probability the completion should use. Use a lower value to ignore less probable options.

## Templates and examples[#](#templates-and-examples "Permanent link")

**🤖 AI content generation for Auto Service 🚘 Automate your social media📲!**

by N8ner

[View template details](https://n8n.io/workflows/4600-ai-content-generation-for-auto-service-automate-your-social-media/)

**AI Chatbot Call Center: Demo Call Center (Production-Ready, Part 2)**

by ChatPayLabs

[View template details](https://n8n.io/workflows/4045-ai-chatbot-call-center-demo-call-center-production-ready-part-2/)

**Homey Pro - Smarthouse integration with LLM**

by Ole Andre Torjussen

[View template details](https://n8n.io/workflows/4058-homey-pro-smarthouse-integration-with-llm/)

[Browse xAI Grok Chat Model integration templates](https://n8n.io/integrations/xai-grok-chat-model/), or [search all templates](https://n8n.io/workflows/)

## Related resources[#](#related-resources "Permanent link")

Refer to [xAI Grok's API documentation](https://docs.x.ai/docs/api-reference) for more information about the service.

View n8n's [Advanced AI](../../../../../advanced-ai/) documentation.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

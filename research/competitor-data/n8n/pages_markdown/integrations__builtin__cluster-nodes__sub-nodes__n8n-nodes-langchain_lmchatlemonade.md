# Lemonade Chat Model node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatlemonade
Lastmod: 2026-04-14
Description: Learn how to use the Lemonade Chat Model node in n8n. Follow technical documentation to integrate Lemonade Chat Model node into your workflows.
# Lemonade Chat Model node[#](#lemonade-chat-model-node "Permanent link")

Use the Lemonade Chat Model node to run chat-capable language models managed by a Lemonade server from within n8n. This node functions as a LangChain-compatible chat model root node and is suitable for chat-style workloads. It lets you select a model hosted on your Lemonade server, and control generation behavior using common sampling and decoding options.

On this page, you'll find a list of the node parameters, and available options to refine generation.

Credentials

You can find authentication information for this node [here](../../../credentials/lemonade/).

Parameter resolution in sub-nodes

Sub-nodes behave differently to other nodes when processing multiple items using an expression.

Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `{{ $json.name }}` resolves to each name in turn.

In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `{{ $json.name }}` always resolves to the first name.

## Node parameters[#](#node-parameters "Permanent link")

### Model[#](#model "Permanent link")

The model which will generate the completion. Models are loaded and managed through the Lemonade server. This parameter is required. Select the model name made available by your Lemonade server (for example, a model alias like "gpt-4", or any custom model name exposed by Lemonade).

Models are provided by the Lemonade server; if you don't see the model you expect, verify your Lemonade server configuration and credentials.

## Node options[#](#node-options "Permanent link")

Use these options to further refine the node's behavior.

### Sampling Temperature[#](#sampling-temperature "Permanent link")

Controls the randomness of the generated text. Lower values make the output more focused and deterministic, while higher values make it more diverse and random.

| Property | Value |
| --- | --- |
| Type | number |
| Required | no |
| Default | 0.7 |

### Top P[#](#top-p "Permanent link")

Controls which words the model can choose from when generating text. Lower values progressively remove the least likely options, so the model can only pick from a smaller, higher-confidence pool.

| Property | Value |
| --- | --- |
| Type | number |
| Required | no |
| Default | 1 |

### Frequency Penalty[#](#frequency-penalty "Permanent link")

Adjusts the penalty for tokens that have already appeared in the generated text. Positive values discourage repetition, negative values encourage it.

| Property | Value |
| --- | --- |
| Type | number |
| Required | no |
| Default | 0 |

### Presence Penalty[#](#presence-penalty "Permanent link")

Adjusts the penalty for tokens based on their presence in the generated text so far. Positive values penalize tokens that have already appeared, encouraging diversity.

| Property | Value |
| --- | --- |
| Type | number |
| Required | no |
| Default | 0 |

### Max Tokens to Generate[#](#max-tokens-to-generate "Permanent link")

The maximum number of tokens to generate. Set to -1 for no limit. Be cautious when setting this to a large value, as it can lead to long outputs.

| Property | Value |
| --- | --- |
| Type | number |
| Required | no |
| Default | -1 |

### Stop Sequences[#](#stop-sequences "Permanent link")

Comma-separated list of sequences where the model will stop generating text. Use this to define explicit termination strings for responses.

| Property | Value |
| --- | --- |
| Type | string |
| Required | no |
| Default | "" |

## Templates and examples[#](#templates-and-examples "Permanent link")

**AI agent chat**

by n8n Team

[View template details](https://n8n.io/workflows/1954-ai-agent-chat/)

**Building Your First WhatsApp Chatbot**

by Jimleuk

[View template details](https://n8n.io/workflows/2465-building-your-first-whatsapp-chatbot/)

**Scrape and summarize webpages with AI**

by n8n Team

[View template details](https://n8n.io/workflows/1951-scrape-and-summarize-webpages-with-ai/)

[Browse Lemonade Chat Model integration templates](https://n8n.io/integrations/lemonade-chat-model/), or [search all templates](https://n8n.io/workflows/)

## Related resources[#](#related-resources "Permanent link")

Refer to [Lemonade Server's documentation](https://lemonade-server.ai/docs/) for more information about the service.

View n8n's [Advanced AI](../../../../../advanced-ai/) documentation.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

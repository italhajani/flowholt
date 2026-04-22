# Vercel AI Gateway Chat Model node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatvercel
Lastmod: 2026-04-14
Description: Learn how to use the Vercel AI Gateway Chat Model node in n8n. Follow technical documentation to integrate Vercel AI Gateway Chat Model node into your workflows.
# Vercel AI Gateway Chat Model node[#](#vercel-ai-gateway-chat-model-node "Permanent link")

Use the Vercel AI Gateway Chat Model node to use AI Gateway chat models with conversational agents.

On this page, you'll find the node parameters for the Vercel AI Gateway Chat Model node and links to more resources.

Credentials

You can find authentication information for this node [here](../../../credentials/vercel/).

Parameter resolution in sub-nodes

Sub-nodes behave differently to other nodes when processing multiple items using an expression.

Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `{{ $json.name }}` resolves to each name in turn.

In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `{{ $json.name }}` always resolves to the first name.

## Node parameters[#](#node-parameters "Permanent link")

### Model[#](#model "Permanent link")

Select the model to use to generate the completion.

n8n dynamically loads models from the AI Gateway and you'll only see the models available to your account.

## Node options[#](#node-options "Permanent link")

Use these options to further refine the node's behavior.

### Frequency Penalty[#](#frequency-penalty "Permanent link")

Use this option to control the chance of the model repeating itself. Higher values reduce the chance of the model repeating itself.

### Maximum Number of Tokens[#](#maximum-number-of-tokens "Permanent link")

Enter the maximum number of tokens used, which sets the completion length.

### Response Format[#](#response-format "Permanent link")

Choose **Text** or **JSON**. **JSON** ensures the model returns valid JSON.

### Presence Penalty[#](#presence-penalty "Permanent link")

Use this option to control the chance of the model talking about new topics. Higher values increase the chance of the model talking about new topics.

### Sampling Temperature[#](#sampling-temperature "Permanent link")

Use this option to control the randomness of the sampling process. A higher temperature creates more diverse sampling, but increases the risk of hallucinations.

### Timeout[#](#timeout "Permanent link")

Enter the maximum request time in milliseconds.

### Max Retries[#](#max-retries "Permanent link")

Enter the maximum number of times to retry a request.

### Top P[#](#top-p "Permanent link")

Use this option to set the probability the completion should use. Use a lower value to ignore less probable options.

## Templates and examples[#](#templates-and-examples "Permanent link")

[Browse Vercel AI Gateway Chat Model integration templates](https://n8n.io/integrations/vercel-ai-gateway-chat-model/), or [search all templates](https://n8n.io/workflows/)

## Related resources[#](#related-resources "Permanent link")

As the Vercel AI Gateway is API-compatible with OpenAI, you can refer to [LangChains's OpenAI documentation](https://js.langchain.com/docs/integrations/chat/openai/) for more information about the service.

View n8n's [Advanced AI](../../../../../advanced-ai/) documentation.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

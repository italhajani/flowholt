# Ollama Model node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmollama
Lastmod: 2026-04-14
Description: Learn how to use the Ollama Model node in n8n. Follow technical documentation to integrate Ollama Model node into your workflows.
# Ollama Model node[#](#ollama-model-node "Permanent link")

The Ollama Model node allows you use local Llama 2 models.

On this page, you'll find the node parameters for the Ollama Model node, and links to more resources.

This node lacks tools support, so it won't work with the [AI Agent](../../root-nodes/n8n-nodes-langchain.agent/) node. Instead, connect it with the [Basic LLM Chain](../../root-nodes/n8n-nodes-langchain.chainllm/) node.

Credentials

You can find authentication information for this node [here](../../../credentials/ollama/).

Parameter resolution in sub-nodes

Sub-nodes behave differently to other nodes when processing multiple items using an expression.

Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `{{ $json.name }}` resolves to each name in turn.

In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `{{ $json.name }}` always resolves to the first name.

## Node parameters[#](#node-parameters "Permanent link")

* **Model**: Select the model that generates the completion. Choose from:
  + **Llama2**
  + **Llama2 13B**
  + **Llama2 70B**
  + **Llama2 Uncensored**

Refer to the Ollama [Models Library documentation](https://ollama.com/library) for more information about available models.

## Node options[#](#node-options "Permanent link")

* **Sampling Temperature**: Use this option to control the randomness of the sampling process. A higher temperature creates more diverse sampling, but increases the risk of hallucinations.
* **Top K**: Enter the number of token choices the model uses to generate the next token.
* **Top P**: Use this option to set the probability the completion should use. Use a lower value to ignore less probable options.

## Templates and examples[#](#templates-and-examples "Permanent link")

**Chat with local LLMs using n8n and Ollama**

by Mihai Farcas

[View template details](https://n8n.io/workflows/2384-chat-with-local-llms-using-n8n-and-ollama/)

**🔐🦙🤖 Private & Local Ollama Self-Hosted AI Assistant**

by Joseph LePage

[View template details](https://n8n.io/workflows/2729-private-and-local-ollama-self-hosted-ai-assistant/)

**Auto Categorise Outlook Emails with AI**

by Wayne Simpson

[View template details](https://n8n.io/workflows/2454-auto-categorise-outlook-emails-with-ai/)

[Browse Ollama Model integration templates](https://n8n.io/integrations/ollama-model/), or [search all templates](https://n8n.io/workflows/)

## Related resources[#](#related-resources "Permanent link")

Refer to [LangChains's Ollama documentation](https://js.langchain.com/docs/integrations/llms/ollama/) for more information about the service.

View n8n's [Advanced AI](../../../../../advanced-ai/) documentation.

## Common issues[#](#common-issues "Permanent link")

For common questions or issues and suggested solutions, refer to [Common issues](common-issues/).

## Self-hosted AI Starter Kit[#](#self-hosted-ai-starter-kit "Permanent link")

New to working with AI and using self-hosted n8n? Try n8n's [self-hosted AI Starter Kit](../../../../../hosting/starter-kits/ai-starter-kit/) to get started with a proof-of-concept or demo playground using Ollama, Qdrant, and PostgreSQL.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

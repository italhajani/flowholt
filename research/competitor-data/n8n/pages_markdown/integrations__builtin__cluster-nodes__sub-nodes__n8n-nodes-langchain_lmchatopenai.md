# OpenAI Chat Model node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatopenai
Lastmod: 2026-04-14
Description: Learn how to use the OpenAI Chat Model node in n8n. Follow technical documentation to integrate OpenAI Chat Model node into your workflows.
# OpenAI Chat Model node[#](#openai-chat-model-node "Permanent link")

Use the OpenAI Chat Model node to use OpenAI's chat models with conversational [agents](../../../../../glossary/#ai-agent).

On this page, you'll find the node parameters for the OpenAI Chat Model node and links to more resources.

Credentials

You can find authentication information for this node [here](../../../credentials/openai/).

Parameter resolution in sub-nodes

Sub-nodes behave differently to other nodes when processing multiple items using an expression.

Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `{{ $json.name }}` resolves to each name in turn.

In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `{{ $json.name }}` always resolves to the first name.

## Node parameters[#](#node-parameters "Permanent link")

### Model[#](#model "Permanent link")

Select the model to use to generate the completion.

n8n dynamically loads models from OpenAI, and you'll only see the models available to your account.

### Use Responses API[#](#use-responses-api "Permanent link")

OpenAI provides two endpoints for generating output from a model:
- **Chat Completions**: The Chat Completions API endpoint generates a model response from a list of messages that comprise a conversation. The API requires the user to handle conversation state manually, for example by adding a [Simple Memory](../n8n-nodes-langchain.memorybufferwindow/) subnode. For new projects, OpenAI recommends to use the Responses API.
- **Responses**: The Responses API is an agentic loop, allowing the model to call multiple built-in tools within the span of one API request. It also supports persistent conversations by passing a `conversation_id`.

Toggle to **Use Responses API** if you want the model to generate output using the Responses API. Otherwise, the OpenAI Chat Model node will default to using the Chat Completions API.

Refer to the OpenAI documentation for a [comparison of the Chat Completions and Responses APIs](https://platform.openai.com/docs/guides/migrate-to-responses).

### Built-in Tools[#](#built-in-tools "Permanent link")

The OpenAI Responses API provides a range of [built-in tools](https://platform.openai.com/docs/guides/tools) to enrich the model's response. Toggle to **Use Responses API** if you want the model to have access to the following built-in tools:

* **Web Search**: Allows models to search the web for the latest information before generating a response.
* **File Search**: Allow models to search your knowledgebase from previously uploaded files for relevant information before generating a response. Refer to the [OpenAI documentation](https://platform.openai.com/docs/guides/tools-file-search) for more information.
* **Code Interpreter**: Allows models to write and run Python code in a sandboxed environment.

Use with AI Agent node

Built-in tools are only supported when using the OpenAI Chat Model node in combination with the AI Agent node. Built-in tools aren't available when using the OpenAI Chat Model node in combination with a Basic LLM Chain node, for example.

## Node options[#](#node-options "Permanent link")

Use these options to further refine the node's behavior. The following options are available whether you use the Responses API to generate model output or not.

### Frequency Penalty[#](#frequency-penalty "Permanent link")

Use this option to control the chances of the model repeating itself. Higher values reduce the chance of the model repeating itself.

### Maximum Number of Tokens[#](#maximum-number-of-tokens "Permanent link")

Enter the maximum number of tokens used, which sets the completion length.

### Presence Penalty[#](#presence-penalty "Permanent link")

Use this option to control the chances of the model talking about new topics. Higher values increase the chance of the model talking about new topics.

### Sampling Temperature[#](#sampling-temperature "Permanent link")

Use this option to control the randomness of the sampling process. A higher temperature creates more diverse sampling, but increases the risk of hallucinations.

### Timeout[#](#timeout "Permanent link")

Enter the maximum request time in milliseconds.

### Max Retries[#](#max-retries "Permanent link")

Enter the maximum number of times to retry a request.

### Top P[#](#top-p "Permanent link")

Use this option to set the probability the completion should use. Use a lower value to ignore less probable options.

## Additional node options (Responses API only)[#](#additional-node-options-responses-api-only "Permanent link")

The following, additional options are available when toggling to **Use Responses API**.

### Conversation ID[#](#conversation-id "Permanent link")

The conversation that this response belongs to. Input items and output items from this response are automatically added to this conversation after this response completes.

### Prompt Cache Key[#](#prompt-cache-key "Permanent link")

Use this key for caching similar requests to optimize cache hit rates.

### Safety Identifier[#](#safety-identifier "Permanent link")

Apply an identifier to track users who may violate usage policies.

### Service Tier[#](#service-tier "Permanent link")

Select the service tier that fits your needs: Auto, Flex, Default, or Priority.

### Metadata[#](#metadata "Permanent link")

A set of key-value pairs for storing structured information. You can attach up to 16 pairs to an object, which is useful for adding custom data that can be used for searching by the API or in the dashboard.

### Top Logprobs[#](#top-logprobs "Permanent link")

Define an integer between 0 and 20 specifying the number of most likely tokens to return at each token position, each with an associated log probability.

### Output Format[#](#output-format "Permanent link")

Choose a response format: Text, JSON Schema, or JSON Object. Use of JSON Schema is recommended, if you want to receive data in JSON format.

### Prompt[#](#prompt "Permanent link")

Configure the prompt filled with a unique ID, its version, and substitutable variables. Prompts are configured through the OpenAI dashboard.

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

[Browse OpenAI Chat Model integration templates](https://n8n.io/integrations/openai-chat-model/), or [search all templates](https://n8n.io/workflows/)

## Related resources[#](#related-resources "Permanent link")

Refer to [LangChains's OpenAI documentation](https://js.langchain.com/docs/integrations/chat/openai/) for more information about the service.

Refer to [OpenAI documentation](https://platform.openai.com/docs/api-reference/responses/create) for more information about the parameters.

View n8n's [Advanced AI](../../../../../advanced-ai/) documentation.

## Common issues[#](#common-issues "Permanent link")

For common questions or issues and suggested solutions, refer to [Common issues](common-issues/).

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

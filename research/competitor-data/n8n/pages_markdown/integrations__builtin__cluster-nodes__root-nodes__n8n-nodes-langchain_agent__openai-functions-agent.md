# OpenAI Functions Agent node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/openai-functions-agent
Lastmod: 2026-04-14
Description: Learn how to use the OpenAI Functions Agent of the AI Agent node in n8n. Follow technical documentation to integrate the OpenAI Functions Agent into your workflows.
# OpenAI Functions Agent node[#](#openai-functions-agent-node "Permanent link")

Use the OpenAI Functions Agent node to use an [OpenAI functions model](https://platform.openai.com/docs/guides/function-calling). These are models that detect when a function should be called and respond with the inputs that should be passed to the function.

Refer to [AI Agent](../) for more information on the AI Agent node itself.

You can use this agent with the [Chat Trigger](../../../../core-nodes/n8n-nodes-langchain.chattrigger/) node. Attach a memory sub-node so that users can have an ongoing conversation with multiple queries. Memory doesn't persist between sessions.

OpenAI Chat Model required

You must use the [OpenAI Chat Model](../../../sub-nodes/n8n-nodes-langchain.lmchatopenai/) with this agent.

## Node parameters[#](#node-parameters "Permanent link")

Configure the OpenAI Functions Agent using the following parameters.

### Prompt[#](#prompt "Permanent link")

Select how you want the node to construct the prompt (also known as the user's query or input from the chat).

Choose from:

* **Take from previous node automatically**: If you select this option, the node expects an input from a previous node called `chatInput`.
* **Define below**: If you select this option, provide either static text or an expression for dynamic content to serve as the prompt in the **Prompt (User Message)** field.

### Require Specific Output Format[#](#require-specific-output-format "Permanent link")

This parameter controls whether you want the node to require a specific output format. When turned on, n8n prompts you to connect one of these output parsers to the node:

* [Auto-fixing Output Parser](../../../sub-nodes/n8n-nodes-langchain.outputparserautofixing/)
* [Item List Output Parser](../../../sub-nodes/n8n-nodes-langchain.outputparseritemlist/)
* [Structured Output Parser](../../../sub-nodes/n8n-nodes-langchain.outputparserstructured/)

## Node options[#](#node-options "Permanent link")

Refine the OpenAI Functions Agent node's behavior using these options:

### System Message[#](#system-message "Permanent link")

If you'd like to send a message to the agent before the conversation starts, enter the message you'd like to send.

Use this option to guide the agent's decision-making.

### Max Iterations[#](#max-iterations "Permanent link")

Enter the number of times the model should run to try and generate a good answer from the user's prompt.

Defaults to `10`.

### Return Intermediate Steps[#](#return-intermediate-steps "Permanent link")

Select whether to include intermediate steps the agent took in the final output (turned on) or not (turned off).

This could be useful for further refining the agent's behavior based on the steps it took.

### Tracing Metadata[#](#tracing-metadata "Permanent link")

Add custom key-value metadata to tracing events for this agent. This is useful for filtering and debugging runs in tracing tools like [LangSmith](../../../../../../advanced-ai/langchain/langsmith/).

Entries with empty keys or values are ignored.

## Templates and examples[#](#templates-and-examples "Permanent link")

Refer to the main AI Agent node's [Templates and examples](../#templates-and-examples) section.

## Common issues[#](#common-issues "Permanent link")

For common questions or issues and suggested solutions, refer to [Common issues](../common-issues/).

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

# Plan and Execute AI Agent node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/plan-execute-agent
Lastmod: 2026-04-14
Description: Learn how to use the Plan and Execute Agent of the AI Agent node in n8n. Follow technical documentation to integrate the Plan and Execute Agent into your workflows.
# Plan and Execute Agent node[#](#plan-and-execute-agent-node "Permanent link")

The Plan and Execute Agent is like the [ReAct agent](../react-agent/) but with a focus on planning. It first creates a high-level plan to solve the given task and then executes the plan step by step. This agent is most useful for tasks that require a structured approach and careful planning.

Refer to [AI Agent](../) for more information on the AI Agent node itself.

## Node parameters[#](#node-parameters "Permanent link")

Configure the Plan and Execute Agent using the following parameters.

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

Refine the Plan and Execute Agent node's behavior using these options:

### Human Message Template[#](#human-message-template "Permanent link")

Enter a message that n8n will send to the agent during each step execution.

Available LangChain expressions:

* `{previous_steps}`: Contains information about the previous steps the agent's already completed.
* `{current_step}`: Contains information about the current step.
* `{agent_scratchpad}`: Information to remember for the next iteration.

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

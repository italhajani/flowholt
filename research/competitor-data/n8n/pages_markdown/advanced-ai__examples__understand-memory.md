# What's memory in AI? | n8n Docs

Source: https://docs.n8n.io/advanced-ai/examples/understand-memory
Lastmod: 2026-04-14
Description: Understand memory in the context of AI. Learn what's special about memory in n8n.
# What's memory in AI?[#](#whats-memory-in-ai "Permanent link")

Memory is a key part of AI chat services. The [memory](../../../glossary/#ai-memory) keeps a history of previous messages, allowing for an ongoing conversation with the AI, rather than every interaction starting fresh.

## AI memory in n8n[#](#ai-memory-in-n8n "Permanent link")

To add memory to your AI workflow you can use either:

* [Simple Memory](../../../integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.memorybufferwindow/): stores a customizable length of chat history for the current session. This is the easiest to get started with.
* One of the memory services that n8n provides nodes for. These include:
  + [Motorhead](../../../integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.memorymotorhead/)
  + [Redis Chat Memory](../../../integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.memoryredischat/)
  + [Postgres Chat Memory](../../../integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.memorypostgreschat/)
  + [Xata](../../../integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.memoryxata/)
  + [Zep](../../../integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.memoryzep/)

If you need to do advanced AI memory management in your workflows, use the [Chat Memory Manager](../../../integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.memorymanager/) node.

This node is useful when you:

* Can't add a memory node directly.
* Need to do more complex memory management, beyond what the memory nodes offer. For example, you can add this node to check the memory size of the Agent node's response, and reduce it if needed.
* Want to inject messages to the AI that look like user messages, to give the AI more context.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

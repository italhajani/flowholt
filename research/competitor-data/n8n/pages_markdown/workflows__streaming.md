# Streaming responses | n8n Docs

Source: https://docs.n8n.io/workflows/streaming
Lastmod: 2026-04-14
Description: Build a workflow with streaming responses
# Streaming responses[#](#streaming-responses "Permanent link")

Feature availability

Available on all plans.

Streaming responses let you send data back to users as an AI Agent node generates it. This is useful for chatbots, where you want to show the user the answer as it's generated to provide a better user experience.

You can enable streaming using either:

* The [Chat Trigger](../../integrations/builtin/core-nodes/n8n-nodes-langchain.chattrigger/)
* The [Webhook node](../../integrations/builtin/core-nodes/n8n-nodes-base.webhook/)

In both cases, set the node's **Response Mode** to **Streaming**.

## Configure nodes for streaming[#](#configure-nodes-for-streaming "Permanent link")

To stream data, you need to add nodes to the workflow that support streaming output. Not all nodes support this feature.

1. Choose a node that supports streaming, such as:
   * [AI agent](../../integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/)
   * [Respond to Webhook](../../integrations/builtin/core-nodes/n8n-nodes-base.respondtowebhook/)
2. You can disable streaming in the options of these nodes. By default, they stream data whenever the executed trigger has its `Response Mode` set to `Streaming response`.

## Important information[#](#important-information "Permanent link")

Keep in mind the following details when configuring streaming responses:

* **Trigger**: Your trigger node must support streaming and have streaming configured. Without this, the workflow behaves according to your response mode settings.
* **Node configuration**: Even with streaming enabled on the trigger, you need at least one node configured to stream data. Otherwise, your workflow will send no data.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

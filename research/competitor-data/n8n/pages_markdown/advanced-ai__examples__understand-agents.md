# What's an agent in AI? | n8n Docs

Source: https://docs.n8n.io/advanced-ai/examples/understand-agents
Lastmod: 2026-04-14
Description: Understand agents in the context of AI. Learn how n8n provides agents.
# What's an agent in AI?[#](#whats-an-agent-in-ai "Permanent link")

One way to think of an [agent](../../../glossary/#ai-agent) is as a [chain](../understand-chains/) that knows how to make decisions. Where a chain follows a predetermined sequence of calls to different AI components, an agent uses a language model to determine which actions to take.

Agents are the part of AI that act as decision-makers. They can interact with other agents and [tools](../../../glossary/#ai-tool). When you send a query to an agent, it tries to choose the best tools to use to answer. Agents adapt to your specific queries, as well as the prompts that configure their behavior.

## Agents in n8n[#](#agents-in-n8n "Permanent link")

n8n provides one Agent node, which can act as different types of agent depending on the settings you choose. Refer to the [Agent node documentation](../../../integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/) for details on the available agent types.

When you execute a workflow containing an agent, the agent runs multiple times. For example, it may do an initial setup, followed by a run to call a tool, then another run to evaluate the tool response and respond to the user.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

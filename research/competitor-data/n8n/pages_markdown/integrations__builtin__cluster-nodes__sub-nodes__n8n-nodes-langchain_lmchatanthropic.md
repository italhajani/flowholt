# Anthropic Chat Model node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatanthropic
Lastmod: 2026-04-14
Description: Learn how to use the Anthropic Chat Model node in n8n. Follow technical documentation to integrate Anthropic Chat Model node into your workflows.
# Anthropic Chat Model node[#](#anthropic-chat-model-node "Permanent link")

Use the Anthropic Chat Model node to use Anthropic's Claude family of chat models with conversational [agents](../../../../../glossary/#ai-agent).

On this page, you'll find the node parameters for the Anthropic Chat Model node, and links to more resources.

Credentials

You can find authentication information for this node [here](../../../credentials/anthropic/).

Parameter resolution in sub-nodes

Sub-nodes behave differently to other nodes when processing multiple items using an expression.

Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `{{ $json.name }}` resolves to each name in turn.

In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `{{ $json.name }}` always resolves to the first name.

## Node parameters[#](#node-parameters "Permanent link")

* **Model**: Select the model that generates the completion. Choose from:
  + **Claude**
  + **Claude Instant**

Learn more in the [Anthropic model documentation](https://docs.anthropic.com/claude/reference/selecting-a-model).

## Node options[#](#node-options "Permanent link")

* **Maximum Number of Tokens**: Enter the maximum number of tokens used, which sets the completion length.
* **Sampling Temperature**: Use this option to control the randomness of the sampling process. A higher temperature creates more diverse sampling, but increases the risk of hallucinations.
* **Top K**: Enter the number of token choices the model uses to generate the next token.
* **Top P**: Use this option to set the probability the completion should use. Use a lower value to ignore less probable options.

## Templates and examples[#](#templates-and-examples "Permanent link")

**Notion AI Assistant Generator**

by Max Tkacz

[View template details](https://n8n.io/workflows/2415-notion-ai-assistant-generator/)

**Gmail AI Email Manager**

by Max Mitcham

[View template details](https://n8n.io/workflows/4722-gmail-ai-email-manager/)

**🤖 AI content generation for Auto Service 🚘 Automate your social media📲!**

by N8ner

[View template details](https://n8n.io/workflows/4600-ai-content-generation-for-auto-service-automate-your-social-media/)

[Browse Anthropic Chat Model integration templates](https://n8n.io/integrations/anthropic-chat-model/), or [search all templates](https://n8n.io/workflows/)

## Related resources[#](#related-resources "Permanent link")

Refer to [LangChains's Anthropic documentation](https://js.langchain.com/docs/integrations/chat/anthropic/) for more information about the service.

View n8n's [Advanced AI](../../../../../advanced-ai/) documentation.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

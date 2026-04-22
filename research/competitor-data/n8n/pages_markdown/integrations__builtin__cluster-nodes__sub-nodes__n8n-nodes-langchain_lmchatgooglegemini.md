# Google Gemini Chat Model node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatgooglegemini
Lastmod: 2026-04-14
Description: Learn how to use the Google Gemini Chat Model node in n8n. Follow technical documentation to integrate Google Gemini Chat Model node into your workflows.
# Google Gemini Chat Model node[#](#google-gemini-chat-model-node "Permanent link")

Use the Google Gemini Chat Model node to use Google's Gemini chat models with conversational agents.

On this page, you'll find the node parameters for the Google Gemini Chat Model node, and links to more resources.

Credentials

You can find authentication information for this node [here](../../../credentials/googleai/).

Parameter resolution in sub-nodes

Sub-nodes behave differently to other nodes when processing multiple items using an expression.

Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `{{ $json.name }}` resolves to each name in turn.

In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `{{ $json.name }}` always resolves to the first name.

## Node parameters[#](#node-parameters "Permanent link")

* **Model**: Select the model to use to generate the completion.

n8n dynamically loads models from the Google Gemini API and you'll only see the models available to your account.

## Node options[#](#node-options "Permanent link")

* **Maximum Number of Tokens**: Enter the maximum number of tokens used, which sets the completion length.
* **Sampling Temperature**: Use this option to control the randomness of the sampling process. A higher temperature creates more diverse sampling, but increases the risk of hallucinations.
* **Top K**: Enter the number of token choices the model uses to generate the next token.
* **Top P**: Use this option to set the probability the completion should use. Use a lower value to ignore less probable options.
* **Safety Settings**: Gemini supports adjustable safety settings. Refer to Google's [Gemini API safety settings](https://ai.google.dev/docs/safety_setting_gemini) for information on the available filters and levels.

## Limitations[#](#limitations "Permanent link")

### No proxy support[#](#no-proxy-support "Permanent link")

The Google Gemini Chat Model node uses Google's SDK, which doesn't support proxy configuration.

If you need to proxy your connection, as a work around, you can set up a dedicated reverse proxy for Gemini requests and change the **Host** parameter in your [Google Gemini credentials](../../../credentials/googleai/) to point to your proxy address:

[![Google Gemini credentials proxy configuration](../../../../../_images/integrations/builtin/cluster-nodes/google-gemini-proxy-config.png)](https://docs.n8n.io/_images/integrations/builtin/cluster-nodes/google-gemini-proxy-config.png)

## Templates and examples[#](#templates-and-examples "Permanent link")

**✨🤖Automate Multi-Platform Social Media Content Creation with AI**

by Joseph LePage

[View template details](https://n8n.io/workflows/3066-automate-multi-platform-social-media-content-creation-with-ai/)

**AI-Powered Social Media Content Generator & Publisher**

by Amjid Ali

[View template details](https://n8n.io/workflows/2950-ai-powered-social-media-content-generator-and-publisher/)

**Build Your First AI Agent**

by Lucas Peyrin

[View template details](https://n8n.io/workflows/6270-build-your-first-ai-agent/)

[Browse Google Gemini Chat Model integration templates](https://n8n.io/integrations/google-gemini-chat-model/), or [search all templates](https://n8n.io/workflows/)

## Related resources[#](#related-resources "Permanent link")

Refer to [LangChain's Google Gemini documentation](https://js.langchain.com/docs/integrations/chat/google_generativeai) for more information about the service.

View n8n's [Advanced AI](../../../../../advanced-ai/) documentation.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

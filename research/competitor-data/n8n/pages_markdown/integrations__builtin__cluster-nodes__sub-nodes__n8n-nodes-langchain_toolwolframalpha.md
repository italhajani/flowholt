# Wolfram|Alpha tool node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.toolwolframalpha
Lastmod: 2026-04-14
Description: Learn how to use the Wolfram|Alpha tool node in n8n. Follow technical documentation to integrate Wolfram|Alpha tool node into your workflows.
# Wolfram|Alpha tool node[#](#wolframalpha-tool-node "Permanent link")

Use the Wolfram|Alpha tool node to connect your [agents](../../../../../glossary/#ai-agent) and [chains](../../../../../glossary/#ai-chain) to Wolfram|Alpha's computational intelligence engine.

Credentials

You can find authentication information for this node [here](../../../credentials/wolframalpha/).

Parameter resolution in sub-nodes

Sub-nodes behave differently to other nodes when processing multiple items using an expression.

Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `{{ $json.name }}` resolves to each name in turn.

In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `{{ $json.name }}` always resolves to the first name.

## Templates and examples[#](#templates-and-examples "Permanent link")

[Browse Wolfram|Alpha integration templates](https://n8n.io/integrations/wolframoralpha/), or [search all templates](https://n8n.io/workflows/)

## Related resources[#](#related-resources "Permanent link")

Refer to [Wolfram|Alpha's documentation](https://products.wolframalpha.com/api) for more information about the service. You can also view [LangChain's documentation on their WolframAlpha Tool](https://js.langchain.com/docs/integrations/tools/wolframalpha/).

View n8n's [Advanced AI](../../../../../advanced-ai/) documentation.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

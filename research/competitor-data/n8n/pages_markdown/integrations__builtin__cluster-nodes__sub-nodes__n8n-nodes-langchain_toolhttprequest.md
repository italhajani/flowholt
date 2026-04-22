# HTTP Request Tool node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.toolhttprequest
Lastmod: 2026-04-14
Description: Learn how to use the HTTP Request Tool node in n8n. Follow technical documentation to integrate HTTP Request Tool node into your workflows.
# HTTP Request Tool node[#](#http-request-tool-node "Permanent link")

Legacy tool version

New instances of the HTTP Request tool node that you add to workflows use the standard [HTTP Request](../../../core-nodes/n8n-nodes-base.httprequest/) node as a tool. This page is describes the legacy, standalone HTTP Request tool node.

You can identify which tool version is in your workflow by checking if the node has an **Add option** property when you open the node on the canvas. If that button is present, you're using the new version, not the one described on this page.

The HTTP Request tool works just like the [HTTP Request](../../../core-nodes/n8n-nodes-base.httprequest/) node, but it's designed to be used with an [AI agent](../../../../../glossary/#ai-agent) as a tool to collect information from a website or API.

On this page, you'll find a list of operations the HTTP Request node supports and links to more resources.

Credentials

Refer to [HTTP Request credentials](../../../credentials/httprequest/) for guidance on setting up authentication.

Parameter resolution in sub-nodes

Sub-nodes behave differently to other nodes when processing multiple items using an expression.

Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `{{ $json.name }}` resolves to each name in turn.

In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `{{ $json.name }}` always resolves to the first name.

## Templates and examples[#](#templates-and-examples "Permanent link")

[Browse HTTP Request Tool node documentation integration templates](https://n8n.io/integrations/http-request-tool/), or [search all templates](https://n8n.io/workflows/)

## Related resources[#](#related-resources "Permanent link")

Refer to [LangChain's documentation on tools](https://langchain-ai.github.io/langgraphjs/how-tos/tool-calling/) for more information about tools in LangChain.

View n8n's [Advanced AI](../../../../../advanced-ai/) documentation.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

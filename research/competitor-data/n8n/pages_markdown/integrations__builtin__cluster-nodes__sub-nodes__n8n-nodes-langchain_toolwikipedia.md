# Wikipedia node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.toolwikipedia
Lastmod: 2026-04-14
Description: Learn how to use the Wikipedia node in n8n. Follow technical documentation to integrate Wikipedia node into your workflows.
# Wikipedia node[#](#wikipedia-node "Permanent link")

The Wikipedia node is a [tool](../../../../../glossary/#ai-tool) that allows an [agent](../../../../../glossary/#ai-agent) to search and return information from Wikipedia.

Parameter resolution in sub-nodes

Sub-nodes behave differently to other nodes when processing multiple items using an expression.

Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `{{ $json.name }}` resolves to each name in turn.

In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `{{ $json.name }}` always resolves to the first name.

## Templates and examples[#](#templates-and-examples "Permanent link")

**Respond to WhatsApp Messages with AI Like a Pro!**

by Jimleuk

[View template details](https://n8n.io/workflows/2466-respond-to-whatsapp-messages-with-ai-like-a-pro/)

**AI chatbot that can search the web**

by n8n Team

[View template details](https://n8n.io/workflows/1959-ai-chatbot-that-can-search-the-web/)

**Write a WordPress post with AI (starting from a few keywords)**

by Giulio

[View template details](https://n8n.io/workflows/2187-write-a-wordpress-post-with-ai-starting-from-a-few-keywords/)

[Browse Wikipedia integration templates](https://n8n.io/integrations/wikipedia/), or [search all templates](https://n8n.io/workflows/)

## Related resources[#](#related-resources "Permanent link")

Refer to [LangChain's documentation on tools](https://langchain-ai.github.io/langgraphjs/how-tos/tool-calling/) for more information about tools in LangChain.

View n8n's [Advanced AI](../../../../../advanced-ai/) documentation.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

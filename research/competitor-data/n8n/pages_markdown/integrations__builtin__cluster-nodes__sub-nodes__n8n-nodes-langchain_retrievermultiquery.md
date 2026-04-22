# MultiQuery Retriever node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.retrievermultiquery
Lastmod: 2026-04-14
Description: Learn how to use the MultiQuery Retriever node in n8n. Follow technical documentation to integrate MultiQuery Retriever node into your workflows.
# MultiQuery Retriever node[#](#multiquery-retriever-node "Permanent link")

The MultiQuery Retriever node automates the process of prompt tuning by using an LLM to generate multiple queries from different perspectives for a given user input query.

On this page, you'll find the node parameters for the MultiQuery Retriever node, and links to more resources.

Parameter resolution in sub-nodes

Sub-nodes behave differently to other nodes when processing multiple items using an expression.

Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `{{ $json.name }}` resolves to each name in turn.

In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `{{ $json.name }}` always resolves to the first name.

## Node options[#](#node-options "Permanent link")

* **Query Count**: Enter how many different versions of the query to generate.

## Templates and examples[#](#templates-and-examples "Permanent link")

[Browse MultiQuery Retriever integration templates](https://n8n.io/integrations/multiquery-retriever/), or [search all templates](https://n8n.io/workflows/)

## Related resources[#](#related-resources "Permanent link")

Refer to [LangChain's retriever conceptual documentation](https://js.langchain.com/docs/concepts/retrievers) and [LangChain's multiquery retriever API documentation](https://v03.api.js.langchain.com/classes/langchain.retrievers_multi_query.MultiQueryRetriever.html) for more information about the service.

View n8n's [Advanced AI](../../../../../advanced-ai/) documentation.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

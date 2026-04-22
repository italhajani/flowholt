# GitHub Document Loader node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.documentgithubloader
Lastmod: 2026-04-14
Description: Learn how to use the GitHub Document Loader node in n8n. Follow technical documentation to integrate GitHub Document Loader node into your workflows.
# GitHub Document Loader node[#](#github-document-loader-node "Permanent link")

Deprecated

This node is deprecated, and will be removed in a future version.

Use the GitHub Document Loader node to load data from a GitHub repository for [vector stores](../../../../../glossary/#ai-vector-store) or summarization.

On this page, you'll find the node parameters for the GitHub Document Loader node, and links to more resources.

Credentials

You can find authentication information for this node [here](../../../credentials/github/). This node doesn't support OAuth for authentication.

Parameter resolution in sub-nodes

Sub-nodes behave differently to other nodes when processing multiple items using an expression.

Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `{{ $json.name }}` resolves to each name in turn.

In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `{{ $json.name }}` always resolves to the first name.

## Node parameters[#](#node-parameters "Permanent link")

* **Text Splitting**: Choose from:
  + **Simple**: Uses the [Recursive Character Text Splitter](../n8n-nodes-langchain.textsplitterrecursivecharactertextsplitter/) with a chunk size of 1000 and an overlap of 200.
  + **Custom**: Allows you to connect a text splitter of your choice.
* **Repository Link**: Enter the URL of your GitHub repository.
* **Branch**: Enter the branch name to use.

## Node options[#](#node-options "Permanent link")

* **Recursive**: Select whether to include sub-folders and files (turned on) or not (turned off).
* **Ignore Paths**: Enter directories to ignore.

## Templates and examples[#](#templates-and-examples "Permanent link")

[Browse GitHub Document Loader integration templates](https://n8n.io/integrations/github-document-loader/), or [search all templates](https://n8n.io/workflows/)

## Related resources[#](#related-resources "Permanent link")

Refer to [LangChain's documentation on document loaders](https://js.langchain.com/docs/modules/data_connection/document_loaders/integrations/file_loaders/) for more information about the service.

View n8n's [Advanced AI](../../../../../advanced-ai/) documentation.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

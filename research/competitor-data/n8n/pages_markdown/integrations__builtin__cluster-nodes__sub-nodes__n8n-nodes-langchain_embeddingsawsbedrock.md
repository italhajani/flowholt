# Embeddings AWS Bedrock node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.embeddingsawsbedrock
Lastmod: 2026-04-14
Description: Learn how to use the Embeddings AWS Bedrock node in n8n. Follow technical documentation to integrate Embeddings AWS Bedrock node into your workflows.
# Embeddings AWS Bedrock node[#](#embeddings-aws-bedrock-node "Permanent link")

Use the Embeddings AWS Bedrock node to generate [embeddings](../../../../../glossary/#ai-embedding) for a given text.

On this page, you'll find the node parameters for the Embeddings AWS Bedrock node, and links to more resources.

Credentials

You can find authentication information for this node [here](../../../credentials/aws/).

Parameter resolution in sub-nodes

Sub-nodes behave differently to other nodes when processing multiple items using an expression.

Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `{{ $json.name }}` resolves to each name in turn.

In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `{{ $json.name }}` always resolves to the first name.

## Node parameters[#](#node-parameters "Permanent link")

* **Model**: Select the model to use to generate the embedding.

Learn more about available models in the [Amazon Bedrock documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html).

## Templates and examples[#](#templates-and-examples "Permanent link")

[Browse Embeddings AWS Bedrock integration templates](https://n8n.io/integrations/embeddings-aws-bedrock/), or [search all templates](https://n8n.io/workflows/)

## Related resources[#](#related-resources "Permanent link")

Refer to [LangChains's AWS Bedrock embeddings documentation](https://js.langchain.com/docs/integrations/platforms/aws/#text-embedding-models) and the [AWS Bedrock documentation](https://docs.aws.amazon.com/bedrock/) for more information about AWS Bedrock.

View n8n's [Advanced AI](../../../../../advanced-ai/) documentation.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

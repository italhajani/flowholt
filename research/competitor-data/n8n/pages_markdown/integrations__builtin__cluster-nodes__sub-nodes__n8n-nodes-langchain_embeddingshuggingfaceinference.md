# Embeddings HuggingFace Inference node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.embeddingshuggingfaceinference
Lastmod: 2026-04-14
Description: Learn how to use the Embeddings HuggingFace Inference node in n8n. Follow technical documentation to integrate Embeddings HuggingFace Inference node into your workflows.
# Embeddings HuggingFace Inference node[#](#embeddings-huggingface-inference-node "Permanent link")

Use the Embeddings HuggingFace Inference node to generate [embeddings](../../../../../glossary/#ai-embedding) for a given text.

On this page, you'll find the node parameters for the Embeddings HuggingFace Inference, and links to more resources.

Credentials

You can find authentication information for this node [here](../../../credentials/huggingface/).

Parameter resolution in sub-nodes

Sub-nodes behave differently to other nodes when processing multiple items using an expression.

Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `{{ $json.name }}` resolves to each name in turn.

In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `{{ $json.name }}` always resolves to the first name.

## Node parameters[#](#node-parameters "Permanent link")

* **Model**: Select the model to use to generate the embedding.

Refer to the [Hugging Face models documentation](https://huggingface.co/models?other=embeddings) for available models.

## Node options[#](#node-options "Permanent link")

* **Custom Inference Endpoint**: Enter the URL of your deployed model, hosted by HuggingFace. If you set this, n8n ignores the **Model Name**.

Refer to [HuggingFace's guide to inference](https://huggingface.co/inference-endpoints) for more information.

## Templates and examples[#](#templates-and-examples "Permanent link")

[Browse Embeddings HuggingFace Inference integration templates](https://n8n.io/integrations/embeddings-hugging-face-inference/), or [search all templates](https://n8n.io/workflows/)

## Related resources[#](#related-resources "Permanent link")

Refer to [Langchain's HuggingFace Inference embeddings documentation](https://js.langchain.com/docs/integrations/text_embedding/hugging_face_inference/) for more information about the service.

View n8n's [Advanced AI](../../../../../advanced-ai/) documentation.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

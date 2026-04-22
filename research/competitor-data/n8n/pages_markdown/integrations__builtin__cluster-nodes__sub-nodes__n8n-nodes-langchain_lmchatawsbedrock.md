# AWS Bedrock Chat Model node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatawsbedrock
Lastmod: 2026-04-14
Description: Learn how to use the AWS Bedrock Chat Model node in n8n. Follow technical documentation to integrate AWS Bedrock Chat Model node into your workflows.
# AWS Bedrock Chat Model node[#](#aws-bedrock-chat-model-node "Permanent link")

The AWS Bedrock Chat Model node allows you use LLM models utilising AWS Bedrock platform.

On this page, you'll find the node parameters for the AWS Bedrock Chat Model node, and links to more resources.

Credentials

You can find authentication information for this node [here](../../../credentials/aws/).

Parameter resolution in sub-nodes

Sub-nodes behave differently to other nodes when processing multiple items using an expression.

Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `{{ $json.name }}` resolves to each name in turn.

In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `{{ $json.name }}` always resolves to the first name.

## Node parameters[#](#node-parameters "Permanent link")

* **Model**: Select the model that generates the completion.

Learn more about available models in the [Amazon Bedrock model documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/models-supported.html).

## Node options[#](#node-options "Permanent link")

* **Maximum Number of Tokens**: Enter the maximum number of tokens used, which sets the completion length.
* **Sampling Temperature**: Use this option to control the randomness of the sampling process. A higher temperature creates more diverse sampling, but increases the risk of hallucinations.

## Proxy limitations[#](#proxy-limitations "Permanent link")

This node doesn't support the [`NO_PROXY` environment variable](../../../../../hosting/configuration/environment-variables/deployment/).

## Templates and examples[#](#templates-and-examples "Permanent link")

**💅 AI Agents Generate Content & Automate Posting for Beauty Salon Social Media 📲**

by N8ner

[View template details](https://n8n.io/workflows/12834-ai-agents-generate-content-and-automate-posting-for-beauty-salon-social-media/)

**💾 Generate Blog Posts on Autopilot with GPT‑5, Tavily and WordPress**

by N8ner

[View template details](https://n8n.io/workflows/12858-generate-blog-posts-on-autopilot-with-gpt5-tavily-and-wordpress/)

**Create a Business Model Canvas and infographic image with Gemini**

by Ryosuke Mori

[View template details](https://n8n.io/workflows/12833-create-a-business-model-canvas-and-infographic-image-with-gemini/)

[Browse AWS Bedrock Chat Model integration templates](https://n8n.io/integrations/aws-bedrock-chat-model/), or [search all templates](https://n8n.io/workflows/)

## Related resources[#](#related-resources "Permanent link")

Refer to [LangChains's AWS Bedrock Chat Model documentation](https://js.langchain.com/docs/integrations/chat/bedrock/) for more information about the service.

View n8n's [Advanced AI](../../../../../advanced-ai/) documentation.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

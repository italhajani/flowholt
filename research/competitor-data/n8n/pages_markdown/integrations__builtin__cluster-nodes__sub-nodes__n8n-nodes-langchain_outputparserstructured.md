# Structured Output Parser node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.outputparserstructured
Lastmod: 2026-04-14
Description: Learn how to use the Structured Output Parser node in n8n. Follow technical documentation to integrate Structured Output Parser node into your workflows.
# Structured Output Parser node[#](#structured-output-parser-node "Permanent link")

Use the Structured Output Parser node to return fields based on a JSON Schema.

On this page, you'll find the node parameters for the Structured Output Parser node, and links to more resources.

Parameter resolution in sub-nodes

Sub-nodes behave differently to other nodes when processing multiple items using an expression.

Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `{{ $json.name }}` resolves to each name in turn.

In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `{{ $json.name }}` always resolves to the first name.

## Node parameters[#](#node-parameters "Permanent link")

* **Schema Type**: Define the output structure and validation. You have two options to provide the schema:

1. **Generate from JSON Example**: Input an example JSON object to automatically generate the schema. The node uses the object property types and names. It ignores the actual values. n8n treats every field as mandatory when generating schemas from JSON examples.
2. **Define using JSON Schema**: Manually input the JSON schema. Read the JSON Schema [guides and examples](https://json-schema.org/learn/miscellaneous-examples) for help creating a valid JSON schema. Please note that we don't support references (using `$ref`) in JSON schemas.

## Templates and examples[#](#templates-and-examples "Permanent link")

**Generate AI Viral Videos with Seedance and Upload to TikTok, YouTube & Instagram**

by Dr. Firas

[View template details](https://n8n.io/workflows/5338-generate-ai-viral-videos-with-seedance-and-upload-to-tiktok-youtube-and-instagram/)

**✨🤖Automate Multi-Platform Social Media Content Creation with AI**

by Joseph LePage

[View template details](https://n8n.io/workflows/3066-automate-multi-platform-social-media-content-creation-with-ai/)

**AI-Powered Social Media Content Generator & Publisher**

by Amjid Ali

[View template details](https://n8n.io/workflows/2950-ai-powered-social-media-content-generator-and-publisher/)

[Browse Structured Output Parser integration templates](https://n8n.io/integrations/structured-output-parser/), or [search all templates](https://n8n.io/workflows/)

## Related resources[#](#related-resources "Permanent link")

Refer to [LangChain's output parser documentation](https://js.langchain.com/docs/concepts/output_parsers) for more information about the service.

View n8n's [Advanced AI](../../../../../advanced-ai/) documentation.

## Common issues[#](#common-issues "Permanent link")

For common questions or issues and suggested solutions, refer to [Common issues](common-issues/).

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

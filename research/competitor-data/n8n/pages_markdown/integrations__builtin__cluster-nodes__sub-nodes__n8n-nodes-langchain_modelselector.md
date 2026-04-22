# Model Selector | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.modelselector
Lastmod: 2026-04-14
Description: Learn how to use the Model Selector node in n8n. Follow technical documentation to integrate Model Selector node into your workflows.
# Model Selector[#](#model-selector "Permanent link")

The Model Selector node dynamically selects one of the connected language models during workflow execution based on a set of defined conditions. This enables implementing fallback mechanisms for error handling or choosing the optimal model for specific tasks.

This page covers node parameters for the Model Selector node and includes links to related resources.

Parameter resolution in sub-nodes

Sub-nodes behave differently to other nodes when processing multiple items using an expression.

Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `{{ $json.name }}` resolves to each name in turn.

In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `{{ $json.name }}` always resolves to the first name.

## Node parameters[#](#node-parameters "Permanent link")

### Number of Inputs[#](#number-of-inputs "Permanent link")

Specifies the number of input connections available for attaching language models.

### Rules[#](#rules "Permanent link")

Each rule defines the model to use when specific conditions match.

The Model Selector node evaluates rules sequentially, starting from the first input, and stops evaluation as soon as it finds a match. This means that if multiple rules would match, n8n will only use the model defined by the first matching rule.

## Templates and examples[#](#templates-and-examples "Permanent link")

**AI Orchestrator: dynamically Selects Models Based on Input Type**

by Davide Boizza

[View template details](https://n8n.io/workflows/7004-ai-orchestrator-dynamically-selects-models-based-on-input-type/)

**Analyze Google Ads search terms with AI and send wastage alerts**

by SpaGreen Creative

[View template details](https://n8n.io/workflows/14449-analyze-google-ads-search-terms-with-ai-and-send-wastage-alerts/)

**Dynamic AI Model Selector with GDPR Compliance via Requesty and Google Sheets**

by Stefan

[View template details](https://n8n.io/workflows/5862-dynamic-ai-model-selector-with-gdpr-compliance-via-requesty-and-google-sheets/)

[Browse Model Selector integration templates](https://n8n.io/integrations/model-selector/), or [search all templates](https://n8n.io/workflows/)

## Related resources[#](#related-resources "Permanent link")

View n8n's [Advanced AI](../../../../../advanced-ai/) documentation.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

# Auto-fixing Output Parser node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.outputparserautofixing
Lastmod: 2026-04-14
Description: Learn how to use the Auto-fixing Output Parser node in n8n. Follow technical documentation to integrate Auto-fixing Output Parser node into your workflows.
# Auto-fixing Output Parser node[#](#auto-fixing-output-parser-node "Permanent link")

The Auto-fixing Output Parser node wraps another output parser. If the first one fails, it calls out to another LLM to fix any errors.

Parameter resolution in sub-nodes

Sub-nodes behave differently to other nodes when processing multiple items using an expression.

Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `{{ $json.name }}` resolves to each name in turn.

In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `{{ $json.name }}` always resolves to the first name.

## Templates and examples[#](#templates-and-examples "Permanent link")

**Notion AI Assistant Generator**

by Max Tkacz

[View template details](https://n8n.io/workflows/2415-notion-ai-assistant-generator/)

**Proxmox AI Agent with n8n and Generative AI Integration**

by Amjid Ali

[View template details](https://n8n.io/workflows/2749-proxmox-ai-agent-with-n8n-and-generative-ai-integration/)

**Handling Appointment Leads and Follow-up With Twilio, Cal.com and AI**

by Jimleuk

[View template details](https://n8n.io/workflows/2342-handling-appointment-leads-and-follow-up-with-twilio-calcom-and-ai/)

[Browse Auto-fixing Output Parser integration templates](https://n8n.io/integrations/auto-fixing-output-parser/), or [search all templates](https://n8n.io/workflows/)

## Related resources[#](#related-resources "Permanent link")

Refer to [LangChain's output parser documentation](https://js.langchain.com/docs/concepts/output_parsers/) for more information about the service.

View n8n's [Advanced AI](../../../../../advanced-ai/) documentation.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

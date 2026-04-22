# Limit | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.limit
Lastmod: 2026-04-14
Description: Documentation for the Limit node in n8n, a workflow automation platform. Includes guidance on usage, and links to examples.
# Limit[#](#limit "Permanent link")

Use the Limit node to remove items beyond a defined maximum number. You can choose whether n8n takes the items from the beginning or end of the input data.

## Node parameters[#](#node-parameters "Permanent link")

Configure this node using the following parameters.

### Max Items[#](#max-items "Permanent link")

Enter the maximum number of items that n8n should keep. If the input data contains more than this value, n8n removes the items.

### Keep[#](#keep "Permanent link")

If the node has to remove items, select where it keeps the input items from:

* **First Items**: Keeps the **Max Items** number of items from the beginning of the input data.
* **Last Items**: Keeps the **Max Items** number of items from the end of the input data.

## Templates and examples[#](#templates-and-examples "Permanent link")

**Scrape and summarize webpages with AI**

by n8n Team

[View template details](https://n8n.io/workflows/1951-scrape-and-summarize-webpages-with-ai/)

**Generate Leads with Google Maps**

by Alex Kim

[View template details](https://n8n.io/workflows/2605-generate-leads-with-google-maps/)

**Chat with OpenAI Assistant (by adding a memory)**

by David Roberts

[View template details](https://n8n.io/workflows/2098-chat-with-openai-assistant-by-adding-a-memory/)

[Browse Limit integration templates](https://n8n.io/integrations/limit/), or [search all templates](https://n8n.io/workflows/)

## Related resources[#](#related-resources "Permanent link")

Learn more about [data structure and data flow](../../../../data/) in n8n workflows.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

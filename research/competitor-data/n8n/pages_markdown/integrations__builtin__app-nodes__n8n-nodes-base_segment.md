# Segment node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.segment
Lastmod: 2026-04-14
Description: Learn how to use the Segment node in n8n. Follow technical documentation to integrate Segment node into your workflows.
# Segment node[#](#segment-node "Permanent link")

Use the Segment node to automate work in Segment, and integrate Segment with other applications. n8n has built-in support for a wide range of Segment features, including adding users to groups, creating identities, and tracking activities.

On this page, you'll find a list of operations the Segment node supports and links to more resources.

Credentials

Refer to [Segment credentials](../../credentials/segment/) for guidance on setting up authentication.

## Operations[#](#operations "Permanent link")

* Group
  + Add a user to a group
* Identify
  + Create an identity
* Track
  + Record the actions your users perform. Every action triggers an event, which can also have associated properties.
  + Record page views on your website, along with optional extra information about the page being viewed.

## Templates and examples[#](#templates-and-examples "Permanent link")

**Auto-Scrape TikTok User Data via Dumpling AI and Segment in Airtable**

by Yang

[View template details](https://n8n.io/workflows/4326-auto-scrape-tiktok-user-data-via-dumpling-ai-and-segment-in-airtable/)

**Weekly Google Search Console SEO Pulse: Catch Top Movers Across Keyword Segments**

by MattF

[View template details](https://n8n.io/workflows/6006-weekly-google-search-console-seo-pulse-catch-top-movers-across-keyword-segments/)

**Create a customer and add them to a segment in Customer.io**

by Harshil Agrawal

[View template details](https://n8n.io/workflows/646-create-a-customer-and-add-them-to-a-segment-in-customerio/)

[Browse Segment integration templates](https://n8n.io/integrations/segment/), or [search all templates](https://n8n.io/workflows/)

## What to do if your operation isn't supported[#](#what-to-do-if-your-operation-isnt-supported "Permanent link")

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](../../core-nodes/n8n-nodes-base.httprequest/) to call the service's API.

You can use the credential you created for this service in the HTTP Request node:

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
2. Select the service you want to connect to.
3. Select your credential.

Refer to [Custom API operations](../../../custom-operations/) for more information.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

# Medium node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.medium
Lastmod: 2026-04-14
Description: Learn how to use the Medium node in n8n. Follow technical documentation to integrate Medium node into your workflows.
# Medium node[#](#medium-node "Permanent link")

Use the Medium node to automate work in Medium, and integrate Medium with other applications. n8n has built-in support for a wide range of Medium features, including creating posts, and getting publications.

On this page, you'll find a list of operations the Medium node supports and links to more resources.

Medium API no longer supported

Medium has stopped supporting the Medium API. The Medium node still appears within n8n, but you won't be able to configure new API keys to authenticate with.

Refer to [Medium credentials](../../credentials/medium/) for guidance on setting up existing API keys.

This node can be used as an AI tool

This node can be used to enhance the capabilities of an AI agent. When used in this way, many parameters can be set automatically, or with information directed by AI - find out more in the [AI tool parameters documentation](../../../../advanced-ai/examples/using-the-fromai-function/).

## Operations[#](#operations "Permanent link")

* Post
  + Create a post
* Publication
  + Get all publications

## Templates and examples[#](#templates-and-examples "Permanent link")

**Cross-post your blog posts**

by amudhan

[View template details](https://n8n.io/workflows/418-cross-post-your-blog-posts/)

**Posting from Wordpress to Medium**

by Zacharia Kimotho

[View template details](https://n8n.io/workflows/2062-posting-from-wordpress-to-medium/)

**Publish a post to a publication on Medium**

by Harshil Agrawal

[View template details](https://n8n.io/workflows/594-publish-a-post-to-a-publication-on-medium/)

[Browse Medium integration templates](https://n8n.io/integrations/medium/), or [search all templates](https://n8n.io/workflows/)

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

# Google Cloud Firestore node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlecloudfirestore
Lastmod: 2026-04-14
Description: Learn how to use the Google Cloud Firestore node in n8n. Follow technical documentation to integrate Google Cloud Firestore node into your workflows.
# Google Cloud Firestore node[#](#google-cloud-firestore-node "Permanent link")

Use the Google Cloud Firestore node to automate work in Google Cloud Firestore, and integrate Google Cloud Firestore with other applications. n8n has built-in support for a wide range of Google Cloud Firestore features, including creating, deleting, and getting documents.

On this page, you'll find a list of operations the Google Cloud Firestore node supports and links to more resources.

Credentials

Refer to [Google credentials](../../credentials/google/) for guidance on setting up authentication.

This node can be used as an AI tool

This node can be used to enhance the capabilities of an AI agent. When used in this way, many parameters can be set automatically, or with information directed by AI - find out more in the [AI tool parameters documentation](../../../../advanced-ai/examples/using-the-fromai-function/).

## Operations[#](#operations "Permanent link")

* Document
  + Create a document
  + Create/Update a document
  + Delete a document
  + Get a document
  + Get all documents from a collection
  + Runs a query against your documents
* Collection
  + Get all root collections

## Templates and examples[#](#templates-and-examples "Permanent link")

**Create, update, and get a document in Google Cloud Firestore**

by Harshil Agrawal

[View template details](https://n8n.io/workflows/839-create-update-and-get-a-document-in-google-cloud-firestore/)

**🛠️ Google Cloud Firestore Tool MCP Server 💪 all 7 operations**

by David Ashby

[View template details](https://n8n.io/workflows/5252-google-cloud-firestore-tool-mcp-server-all-7-operations/)

**Automated AI News Curation and LinkedIn Posting with GPT-5 and Firebase**

by Arthur Dimeglio

[View template details](https://n8n.io/workflows/9886-automated-ai-news-curation-and-linkedin-posting-with-gpt-5-and-firebase/)

[Browse Google Cloud Firestore integration templates](https://n8n.io/integrations/google-cloud-firestore/), or [search all templates](https://n8n.io/workflows/)

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

# Databricks node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.databricks
Lastmod: 2026-04-14
Description: Learn how to use the Databricks node in n8n. Follow technical documentation to integrate Databricks node into your workflows.
# Databricks node[#](#databricks-node "Permanent link")

Use the Databricks node to automate work in Databricks, and integrate Databricks with other applications. n8n has built-in support for a wide range of Databricks features, including executing SQL queries, managing Unity Catalog objects, querying ML model serving endpoints, and working with vector search indexes.

On this page, you'll find a list of operations the Databricks node supports and links to more resources.

Credentials

Refer to [Databricks credentials](../../credentials/databricks/) for guidance on setting up authentication.

This node can be used as an AI tool

This node can be used to enhance the capabilities of an AI agent. When used in this way, many parameters can be set automatically, or with information directed by AI - find out more in the [AI tool parameters documentation](../../../../advanced-ai/examples/using-the-fromai-function/).

## Operations[#](#operations "Permanent link")

* Databricks SQL
  + Execute Query
* File
  + Create Directory
  + Delete Directory
  + Delete File
  + Download File
  + Get File Metadata
  + List Directory
  + Upload File
* Genie
  + Create Conversation Message
  + Execute Message SQL Query
  + Get Conversation Message
  + Get Genie Space
  + Get Query Results
  + Start Conversation
* Model Serving
  + Query Endpoint
* Unity Catalog
  + Create Catalog
  + Create Function
  + Create Volume
  + Delete Catalog
  + Delete Function
  + Delete Volume
  + Get Catalog
  + Get Function
  + Get Table
  + Get Volume
  + List Catalogs
  + List Functions
  + List Tables
  + List Volumes
  + Update Catalog
* Vector Search
  + Create Index
  + Get Index
  + List Indexes
  + Query Index

## Templates and examples[#](#templates-and-examples "Permanent link")

[Browse Databricks integration templates](https://n8n.io/integrations/databricks/), or [search all templates](https://n8n.io/workflows/)

## Related resources[#](#related-resources "Permanent link")

Refer to [Databricks' REST API documentation](https://docs.databricks.com/api/) for details about their API.

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

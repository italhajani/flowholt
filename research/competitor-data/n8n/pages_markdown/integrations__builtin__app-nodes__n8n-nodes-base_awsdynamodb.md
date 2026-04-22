# AWS DynamoDB node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.awsdynamodb
Lastmod: 2026-04-14
Description: Learn how to use the AWS DynamoDB node in n8n. Follow technical documentation to integrate AWS DynamoDB node into your workflows.
# AWS DynamoDB node[#](#aws-dynamodb-node "Permanent link")

Use the AWS DynamoDB node to automate work in AWS DynamoDB, and integrate AWS DynamoDB with other applications. n8n has built-in support for a wide range of AWS DynamoDB features, including creating, reading, updating, deleting items, and records on a database.

On this page, you'll find a list of operations the AWS DynamoDB node supports and links to more resources.

Credentials

Refer to [AWS credentials](../../credentials/aws/) for guidance on setting up authentication.

## Operations[#](#operations "Permanent link")

* Item
  + Create a new record, or update the current one if it already exists (upsert/put)
  + Delete an item
  + Get an item
  + Get all items

## Templates and examples[#](#templates-and-examples "Permanent link")

[Browse AWS DynamoDB integration templates](https://n8n.io/integrations/aws-dynamodb/), or [search all templates](https://n8n.io/workflows/)

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

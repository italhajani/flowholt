# Azure Storage node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.azurestorage
Lastmod: 2026-04-14
Description: Learn how to use the Azure Storage node in n8n. Follow technical documentation to integrate Azure Storage node into your workflows.
# Azure Storage node[#](#azure-storage-node "Permanent link")

The Azure Storage node has built-in support for a wide range of features, which includes creating, getting, and deleting blobs and containers. Use this node to automate work within the Azure Storage service or integrate it with other services in your workflow.

On this page, you'll find a list of operations the Azure Storage node supports, and links to more resources.

Credentials

You can find authentication information for this node [here](../../credentials/azurestorage/).

## Operations[#](#operations "Permanent link")

* **Blob**
  + **Create blob**: Create a new blob or replace an existing one.
  + **Delete blob**: Delete an existing blob.
  + **Get blob**: Retrieve data for a specific blob.
  + **Get many blobs**: Retrieve a list of blobs.
* **Container**
  + **Create container**: Create a new container.
  + **Delete container**: Delete an existing container.
  + **Get container**: Retrieve data for a specific container.
  + **Get many containers**: Retrieve a list of containers.

## Templates and examples[#](#templates-and-examples "Permanent link")

**Automated AWS S3 / Azure / Google to local MinIO Object Backup with Scheduling**

by SIENNA

[View template details](https://n8n.io/workflows/7284-automated-aws-s3-azure-google-to-local-minio-object-backup-with-scheduling/)

**Generate and Store AI Images with DALL-E and Azure Blob Storage**

by Trung Tran

[View template details](https://n8n.io/workflows/7648-generate-and-store-ai-images-with-dall-e-and-azure-blob-storage/)

**Qualify and email literary agents with GPT‑4.1, Gmail and Google Sheets**

by malcolm

[View template details](https://n8n.io/workflows/12651-qualify-and-email-literary-agents-with-gpt41-gmail-and-google-sheets/)

[Browse Azure Storage integration templates](https://n8n.io/integrations/azure-storage/), or [search all templates](https://n8n.io/workflows/)

## Related resources[#](#related-resources "Permanent link")

Refer to [Microsoft's Azure Storage documentation](https://learn.microsoft.com/en-us/rest/api/storageservices/) for more information about the service.

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

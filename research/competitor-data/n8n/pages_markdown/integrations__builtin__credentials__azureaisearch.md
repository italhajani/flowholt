# Azure AI Search credentials | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/credentials/azureaisearch
Lastmod: 2026-04-14
Description: Documentation for Azure AI Search credentials. Use these credentials to authenticate Azure AI Search in n8n, a workflow automation platform.
# Azure AI Search credentials[#](#azure-ai-search-credentials "Permanent link")

You can use these credentials to authenticate the following nodes:

* [Azure AI Search Vector Store](../../cluster-nodes/root-nodes/n8n-nodes-langchain.vectorstoreazureaisearch/)

## Prerequisites[#](#prerequisites "Permanent link")

* An [Azure subscription](https://azure.microsoft.com)
* An Azure AI Search service created in the [Azure Portal](https://portal.azure.com/)

## Supported authentication methods[#](#supported-authentication-methods "Permanent link")

This node uses API key authentication.

## Related resources[#](#related-resources "Permanent link")

Refer to [Azure AI Search documentation](https://learn.microsoft.com/azure/search/) for more information about the service.

## Using API key[#](#using-api-key "Permanent link")

To configure this credential, you'll need:

* **Endpoint**: Your Azure AI Search service URL (format: `https://your-service.search.windows.net`)
* **API Key**: Admin key (read-write) or query key (read-only)

To get these values:

1. Navigate to your Azure AI Search service in the [Azure Portal](https://portal.azure.com/)
2. Copy the **URL** from the **Overview** section
3. Go to **Settings** > **Keys** and copy:
   - **Admin key** for full read-write access, or
   - **Query key** for read-only querying
4. Enter these values in n8n

API key permissions

Admin keys provide full access including index creation and deletion. Query keys provide read-only access. Choose based on your workflow requirements.

## Troubleshooting[#](#troubleshooting "Permanent link")

### Authentication errors[#](#authentication-errors "Permanent link")

**API key authentication fails**:
- Verify the API key is correct and hasn't been regenerated in Azure Portal
- Confirm you're using an admin key for write operations (insert/update)
- Check that the key hasn't expired or been rotated

### Connection issues[#](#connection-issues "Permanent link")

* Verify endpoint URL format: `https://your-service.search.windows.net`
* Confirm your Azure AI Search service is running
* Check network security rules and firewall settings allow access from your n8n instance

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

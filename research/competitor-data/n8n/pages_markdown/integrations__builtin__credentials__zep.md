# Zep credentials | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/credentials/zep
Lastmod: 2026-04-14
Description: Documentation for the Zep credentials. Use these credentials to authenticate Zep in n8n, a workflow automation platform.
# Zep credentials[#](#zep-credentials "Permanent link")

You can use these credentials to authenticate the following nodes:

* [Zep](../../cluster-nodes/sub-nodes/n8n-nodes-langchain.memoryzep/)
* [Zep Vector Store](../../cluster-nodes/root-nodes/n8n-nodes-langchain.vectorstorezep/)

## Supported authentication methods[#](#supported-authentication-methods "Permanent link")

* API key

## Related resources[#](#related-resources "Permanent link")

Refer to [Zep's Cloud SDK documentation](https://help.getzep.com/install-sdks) for more information about the service. Refer to [Zep's REST API documentation](https://getzep.github.io/zep/) for information about the API.

View n8n's [Advanced AI](../../../../advanced-ai/) documentation.

## Using API key[#](#using-api-key "Permanent link")

To configure this credential, you'll need a [Zep server](https://www.getzep.com/) with at least one project and:

* An **API URL**
* An **API Key**

Setup depends on whether you're using Zep Cloud or self-hosted Zep Open Source.

### Zep Cloud setup[#](#zep-cloud-setup "Permanent link")

Follow these instructions if you're using [Zep Cloud](https://app.getzep.com):

1. In Zep, open the **Project Settings**.
2. In the **Project Keys** section, select **Add Key**.
3. Enter a **Key Name**, like `n8n integration`.
4. Select **Create**.
5. Copy the key and enter it in your n8n integration as the **API Key**.
6. Turn on the **Cloud** toggle.

### Self-hosted Zep Open Source setup[#](#self-hosted-zep-open-source-setup "Permanent link")

Deprecated

The Zep team [deprecated the open source Zep Community Edition](https://blog.getzep.com/announcing-a-new-direction-for-zeps-open-source-strategy/) in April, 2025. These instructions may not work in the future.

Follow these instructions if you're self-hosting Zep Open Source:

1. Enter the JWT token for your Zep server as the **API Key** in n8n.
2. Make sure the **Cloud** toggle is off.
3. Enter the URL for your Zep server as the **API URL**.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

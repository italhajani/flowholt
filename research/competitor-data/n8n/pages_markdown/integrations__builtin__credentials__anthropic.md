# Anthropic credentials | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/credentials/anthropic
Lastmod: 2026-04-14
Description: Documentation for the Anthropic credentials. Use these credentials to authenticate Anthropic in n8n, a workflow automation platform.
# Anthropic credentials[#](#anthropic-credentials "Permanent link")

You can use these credentials to authenticate the following nodes:

* [Anthropic](../../app-nodes/n8n-nodes-langchain.anthropic/)
* [Anthropic Chat Model](../../cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatanthropic/)

## Supported authentication methods[#](#supported-authentication-methods "Permanent link")

* API key

## Related resources[#](#related-resources "Permanent link")

Refer to [Anthropic's documentation](https://docs.anthropic.com/claude/reference/getting-started-with-the-api) for more information about the service.

View n8n's [Advanced AI](../../../../advanced-ai/) documentation.

## Using API key[#](#using-api-key "Permanent link")

To configure this credential, you'll need an [Anthropic Console account](https://console.anthropic.com) with access to Claude.

Then:

1. In the Anthropic Console, open **Settings >** [**API Keys**](https://console.anthropic.com/settings/keys).
2. Select **+ Create Key**.
3. Give your key a **Name**, like `n8n-integration`.
4. Select **Copy Key** to copy the key.
5. Enter this as the **API Key** in your n8n credential.
6. (Optional) To add custom headers to your API requests:
   1. Enable the **Add Custom Header** toggle.
   2. Enter the **Header Name** for your custom header.
   3. Enter the **Header Value** for your custom header.

Refer to Anthropic's [Intro to Claude](https://docs.anthropic.com/en/docs/intro-to-claude) and [Quickstart](https://docs.anthropic.com/en/docs/quickstart) for more information.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

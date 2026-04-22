# Vercel AI Gateway credentials | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/credentials/vercel
Lastmod: 2026-04-14
Description: Documentation for the Vercel AI Gateway credentials. Use these credentials to authenticate the Vercel AI Gateway in n8n, a workflow automation platform.
# Vercel AI Gateway credentials[#](#vercel-ai-gateway-credentials "Permanent link")

You can use these credentials to authenticate the following nodes:

* [Chat Vercel AI Gateway](../../cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatvercel/)

## Prerequisites[#](#prerequisites "Permanent link")

Create a [Vercel](https://vercel.com/) account.

## Supported authentication methods[#](#supported-authentication-methods "Permanent link")

* API key
* OIDC token

## Related resources[#](#related-resources "Permanent link")

Refer to the [Vercel AI Gateway documentation](https://vercel.com/docs/ai-gateway) for more information about the service.

## Using API key[#](#using-api-key "Permanent link")

To configure this credential, you'll need:

* An **API Key**

To generate your API Key:

1. [Login to Vercel](https://vercel.com/login) or [create an account](https://vercel.com/signup).
2. Go to the Vercel dashboard and select the **AI Gateway** tab.
3. Select **API keys** on the left side bar.
4. Select **Add key** and proceed with **Create key** from the Dialog.
5. Copy your key and add it as the **API Key** in n8n.

## Using OIDC token[#](#using-oidc-token "Permanent link")

To configure this credential, you'll need:

* An **OIDC token**

To generate your OIDC token:

1. In local development, link your application to a Vercel project with the `vc link` command.
2. Run the `vercel env pull` command to pull the environment variables from Vercel.
3. Copy your token and add it as the **OIDC TOKEN** in n8n.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

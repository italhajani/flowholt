# Contentful credentials | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/credentials/contentful
Lastmod: 2026-04-14
Description: Documentation for Contentful credentials. Use these credentials to authenticate Contentful in n8n, a workflow automation platform.
# Contentful credentials[#](#contentful-credentials "Permanent link")

You can use these credentials to authenticate the following nodes:

* [Contentful](../../app-nodes/n8n-nodes-base.contentful/)

## Prerequisites[#](#prerequisites "Permanent link")

* Create a [Contentful](https://www.contentful.com/) account.
* Create a [Contentful space](https://www.contentful.com/help/getting-started/contentful-101/#step-2-create-a-space).

## Supported authentication methods[#](#supported-authentication-methods "Permanent link")

* API access token

## Related resources[#](#related-resources "Permanent link")

Refer to [Contentful's API documentation](https://www.contentful.com/developers/docs/references/) for more information about the service.

## Using API access token[#](#using-api-access-token "Permanent link")

To configure this credential, you'll need:

* Your Contentful **Space ID**: The Space ID displays as you generate the tokens; You can also refer to the [Contentful Find space ID documentation](https://www.contentful.com/help/spaces/find-space-id/) to view the Space ID.
* A **Content Delivery API Access Token**: Required if you want to use the [Content Delivery API](https://www.contentful.com/developers/docs/references/content-delivery-api/). Leave blank if you don't intend to use this API.
* A **Content Preview API Access Token**: Required if you want to use the [Content Preview API](https://www.contentful.com/developers/docs/references/content-preview-api/). Leave blank if you don't intend to use this API.

View and generate access tokens in Contentful in **Settings > API keys**. Contentful generates tokens for both Content Delivery API and Content Preview API as part of a single key. Refer to the [Contentful API authentication documentation](https://www.contentful.com/developers/docs/references/authentication/) for detailed instructions.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

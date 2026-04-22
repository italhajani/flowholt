# HighLevel credentials | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/credentials/highlevel
Lastmod: 2026-04-14
Description: Documentation for HighLevel credentials. Use these credentials to authenticate HighLevel in n8n, a workflow automation platform.
# HighLevel credentials[#](#highlevel-credentials "Permanent link")

You can use these credentials to authenticate the following nodes:

* [HighLevel node](../../app-nodes/n8n-nodes-base.highlevel/)

## Prerequisites[#](#prerequisites "Permanent link")

Create a [HighLevel developer](https://marketplace.gohighlevel.com/) account.

## Supported authentication methods[#](#supported-authentication-methods "Permanent link")

* API key: Use with API v1
* OAuth2: Use with API v2

API 1.0 deprecation

HighLevel deprecated API v1.0 and no longer maintains it. Use OAuth2 to set up new credentials.

## Related resources[#](#related-resources "Permanent link")

Refer to [HighLevel's API 2.0 documentation](https://highlevel.stoplight.io/docs/integrations/0443d7d1a4bd0-overview) for more information about the service.

For existing integrations with the API v1.0, refer to [HighLevel's API 1.0 documentation](https://help.gohighlevel.com/support/solutions/articles/48001060529-highlevel-api).

## Using API key[#](#using-api-key "Permanent link")

To configure this credential, you'll need:

* An **API Key**: Refer to the [HighLevel API 1.0 Welcome documentation](https://help.gohighlevel.com/support/solutions/articles/48001060529-highlevel-api) for instructions on getting your API key.

## Using OAuth2[#](#using-oauth2 "Permanent link")

To configure this credential, you'll need:

* A **Client ID**
* A **Client Secret**

To generate both, create an app in **My Apps > Create App**. Use these settings:

1. Set **Distribution Type** to **Sub-Account**.
2. Add these **Scopes**:
   * `locations.readonly`
   * `contacts.readonly`
   * `contacts.write`
   * `opportunities.readonly`
   * `opportunities.write`
   * `users.readonly`
3. Copy the **OAuth Redirect URL** from n8n and add it as a **Redirect URL** in your HighLevel app.
4. Copy the **Client ID** and **Client Secret** from HighLevel and add them to your n8n credential.
5. Add the same scopes added above to your n8n credential in a space-separated list. For example:

   `locations.readonly contacts.readonly contacts.write opportunities.readonly opportunities.write users.readonly`

Refer to HighLevel's [API Authorization documentation](https://highlevel.stoplight.io/docs/integrations/a04191c0fabf9-authorization) for more details. Refer to HighLevel's [API Scopes documentation](https://highlevel.stoplight.io/docs/integrations/vcctp9t1w8hja-scopes) for more information about available scopes.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

# Linear credentials | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/credentials/linear
Lastmod: 2026-04-14
Description: Documentation for Linear credentials. Use these credentials to authenticate Linear in n8n, a workflow automation platform.
# Linear credentials[#](#linear-credentials "Permanent link")

You can use these credentials to authenticate the following nodes:

* [Linear Trigger](../../trigger-nodes/n8n-nodes-base.lineartrigger/)
* [Linear](../../app-nodes/n8n-nodes-base.linear/)

## Prerequisites[#](#prerequisites "Permanent link")

Create a [Linear](https://linear.app/) account.

## Supported authentication methods[#](#supported-authentication-methods "Permanent link")

* API key
* OAuth2

## Related resources[#](#related-resources "Permanent link")

Refer to [Linear's API documentation](https://developers.linear.app/docs/graphql/working-with-the-graphql-api) for more information about the service.

## Using API key[#](#using-api-key "Permanent link")

To configure this credential, you'll need:

* A personal **API Key**: Create a dedicated personal API key in your [**Settings** > **Security & access**](https://linear.app/n8n/settings/account/security). Refer to the [Linear Personal API keys documentation](https://linear.app/developers/graphql#personal-api-keys) for more information.

## Using OAuth2[#](#using-oauth2 "Permanent link")

To configure this credential, you'll need:

* A **Client ID**: Generated when you create a new OAuth2 application.
* A **Client Secret**: Generated when you create a new OAuth2 application.
* Select the **Actor**: The actor defines how the OAuth2 application should create issues, comments and other changes. Options include:
  + **User** (Linear's default): The application creates resources as the authorizing user. Use this option if you want each user to do their own authentication.
  + **Application**: The application creates resources as itself. Use this option if you have only one user (like an admin) authorizing the application.
* To use this credential with the [Linear Trigger](../../trigger-nodes/n8n-nodes-base.lineartrigger/) node, you must enable the **Include Admin Scope** toggle.

Refer to the [Linear OAuth2 Authentication documentation](https://developers.linear.app/docs/oauth/authentication) for more detailed instructions and explanations. Use the n8n **OAuth Redirect URL** as the **Redirect callback URL** in your Linear OAuth2 application.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

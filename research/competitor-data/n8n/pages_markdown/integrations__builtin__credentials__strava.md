# Strava credentials | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/credentials/strava
Lastmod: 2026-04-14
Description: Documentation for Strava credentials. Use these credentials to authenticate Strava in n8n, a workflow automation platform.
# Strava credentials[#](#strava-credentials "Permanent link")

You can use these credentials to authenticate the following nodes:

* [Strava](../../app-nodes/n8n-nodes-base.strava/)
* [Strava Trigger](../../trigger-nodes/n8n-nodes-base.stravatrigger/)

## Prerequisites[#](#prerequisites "Permanent link")

* Create a [Strava](https://strava.com) account.
* Create a Strava application in [**Settings > API**](https://www.strava.com/settings/api). Refer to [Using OAuth2](#using-oauth2) for more information.

## Supported authentication methods[#](#supported-authentication-methods "Permanent link")

* OAuth2

## Related resources[#](#related-resources "Permanent link")

Refer to [Strava's API documentation](https://developers.strava.com/docs/reference/) for more information about the service.

## Using OAuth2[#](#using-oauth2 "Permanent link")

To configure this credential, you'll need:

* A **Client ID**: Generated when you [create a Strava app](https://developers.strava.com/docs/getting-started/#account).
* A **Client Secret**: Generated when you [create a Strava app](https://developers.strava.com/docs/getting-started/#account).

Use these settings for your Strava app:

* In n8n, copy the **OAuth Callback URL**. Paste this URL into your Strava app's **Authorization Callback Domain**.
* Remove the protocol (`https://` or `http://`) and the relative URL (`/oauth2/callback` or `/rest/oauth2-credential/callback`) from the **Authorization Callback Domain**. For example, if the OAuth Redirect URL was originally `https://oauth.n8n.cloud/oauth2/callback`, the **Authorization Callback Domain** would be `oauth.n8n.cloud`.
* Copy the **Client ID** and **Client Secret** from your app and add them to your n8n credential.

Refer to [Authentication](https://developers.strava.com/docs/authentication/) for more information about Strava's OAuth flow.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

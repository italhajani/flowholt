# Asana credentials | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/credentials/asana
Lastmod: 2026-04-14
Description: Documentation for Asana credentials. Use these credentials to authenticate Asana in n8n, a workflow automation platform.
# Asana credentials[#](#asana-credentials "Permanent link")

You can use these credentials to authenticate the following nodes:

* [Asana](../../app-nodes/n8n-nodes-base.asana/)
* [Asana Trigger](../../trigger-nodes/n8n-nodes-base.asanatrigger/)

## Supported authentication methods[#](#supported-authentication-methods "Permanent link")

* Access token
* OAuth2

## Related resources[#](#related-resources "Permanent link")

Refer to [Asana's Developer Guides](https://developers.asana.com/docs/overview) for more information about working with the service.

## Using Access token[#](#using-access-token "Permanent link")

To configure this credential, you'll need an [Asana](https://asana.com/) account and:

* A Personal **Access Token** (PAT)

To get your PAT:

1. Open the Asana [developer console](https://app.asana.com/0/my-apps).
2. In the **Personal access tokens** section, select **Create new token**.
3. Enter a **Token name**, like `n8n integration`.
4. Check the box to agree to the **Asana API terms**.
5. Select **Create token**.
6. Copy the token and enter it as the **Access Token** in your n8n credential.

Refer to the [Asana Quick start guide](https://developers.asana.com/docs/quick-start#setup) for more information.

## Using OAuth2[#](#using-oauth2 "Permanent link")

To configure this credential, you'll need an [Asana](https://asana.com/) account.

Note for n8n Cloud users

Cloud users don't need to provide connection details. Select **Connect my account** to connect through your browser.

If you're [self-hosting](../../../../hosting/) n8n, you'll need to register an application to set up OAuth:

1. Open the Asana [developer console](https://app.asana.com/0/my-apps).
2. In the **My apps** section, select **Create new app**.
3. Enter an **App name** for your application, like `n8n integration`.
4. Select a purpose for your app.
5. Check the box to agree to the **Asana API terms**.
6. Select **Create app**. The page opens to the app's **Basic Information**.
7. Select **OAuth** from the left menu.
8. In n8n, copy the **OAuth Redirect URL**.
9. In Asana, select **Add redirect URL** and enter the URL you copied from n8n.
10. Copy the **Client ID** from Asana and enter it in your n8n credential.
11. Copy the **Client Secret** from Asana and enter it in your n8n credential.

Refer to the [Asana OAuth register an application documentation](https://developers.asana.com/docs/oauth#register-an-application) for more information.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

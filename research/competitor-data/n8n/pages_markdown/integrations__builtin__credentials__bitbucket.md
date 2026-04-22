# Bitbucket credentials | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/credentials/bitbucket
Lastmod: 2026-04-14
Description: Documentation for Bitbucket credentials. Use these credentials to authenticate Bitbucket in n8n, a workflow automation platform.
# Bitbucket credentials[#](#bitbucket-credentials "Permanent link")

You can use these credentials to authenticate the following nodes:

* [Bitbucket Trigger](../../trigger-nodes/n8n-nodes-base.bitbuckettrigger/)

## Prerequisites[#](#prerequisites "Permanent link")

Create a [Bitbucket](https://www.bitbucket.com/) account.

## Supported authentication methods[#](#supported-authentication-methods "Permanent link")

* Access token

## Related resources[#](#related-resources "Permanent link")

Refer to [Bitbucket's API documentation](https://developer.atlassian.com/cloud/bitbucket/rest/intro/#authentication) for more information about the service.

## Configuring Bitbucket access token[#](#configuring-bitbucket-access-token "Permanent link")

1. Log in to Bitbucket and open your account or personal settings.
2. Find the section for API tokens or security settings.
3. Create a new API token, giving it a name and expiry date that matches your use case.
4. Select Bitbucket as the app, then choose the required scopes (permissions):

   |  |  |
   | --- | --- |
   | ``` 1 2 3 4 5 6 ``` | ``` read:user:bitbucket read:workspace:bitbucket read:repository:bitbucket read:webhook:bitbucket write:webhook:bitbucket delete:webhook:bitbucket ``` |
5. Review and create the token. Copy the generated token and add it to n8n. Bitbucket only shows the token once.

For detailed instructions, see [Create an API token](https://support.atlassian.com/bitbucket-cloud/docs/create-an-api-token/).

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

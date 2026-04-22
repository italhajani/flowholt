# Gmail Trigger node common issues | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.gmailtrigger/common-issues
Lastmod: 2026-04-14
Description: Documentation for common issues and questions in the Gmail Trigger node in n8n, a workflow automation platform. Includes details of the issue and suggested solutions.
# Gmail Trigger node common issues[#](#gmail-trigger-node-common-issues "Permanent link")

Here are some common errors and issues with the [Gmail Trigger node](../) and steps to resolve or troubleshoot them.

## 401 unauthorized error[#](#401-unauthorized-error "Permanent link")

The full text of the error looks like this:

|  |  |
| --- | --- |
| ``` 1 ``` | ``` 401 - {"error":"unauthorized_client","error_description":"Client is unauthorized to retrieve access tokens using this method, or client not authorized for any of the scopes requested."} ``` |

This error occurs when there's an issue with the credential you're using and its scopes or permissions.

To resolve:

1. For [OAuth2](../../../credentials/google/oauth-single-service/) credentials, make sure you've enabled the Gmail API in **APIs & Services > Library**. Refer to [Google OAuth2 Single Service - Enable APIs](../../../credentials/google/oauth-single-service/#enable-apis) for more information.
2. For [Service Account](../../../credentials/google/service-account/) credentials:
   1. [Enable domain-wide delegation](../../../credentials/google/service-account/#enable-domain-wide-delegation).
   2. Make sure you add the Gmail API as part of the domain-wide delegation configuration.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

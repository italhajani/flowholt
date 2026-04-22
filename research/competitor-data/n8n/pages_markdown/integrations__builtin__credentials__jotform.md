# Jotform credentials | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/credentials/jotform
Lastmod: 2026-04-14
Description: Documentation for Jotform credentials. Use these credentials to authenticate Jotform in n8n, a workflow automation platform.
# Jotform credentials[#](#jotform-credentials "Permanent link")

You can use these credentials to authenticate the following nodes:

* [Jotform Trigger](../../trigger-nodes/n8n-nodes-base.jotformtrigger/)

## Supported authentication methods[#](#supported-authentication-methods "Permanent link")

* API key

## Related resources[#](#related-resources "Permanent link")

Refer to [Jotform's API documentation](https://api.jotform.com/docs/) for more information about the service.

## Using API key[#](#using-api-key "Permanent link")

To configure this credential, you'll need a [Jotform](https://www.jotform.com/) account and:

* An **API Key**
* The **API Domain**

To set it up:

1. Go to **Settings >** [**API**](https://www.jotform.com/myaccount/api).
2. Select **Create New Key**.
3. Select the **Name** in Jotform to update the API key name to something meaningful, like `n8n integration`.
4. Copy the **API Key** and enter it in your n8n credential.
5. In n8n, select the **API Domain** that applies to you based on the forms you're using:
   * **api.jotform.com**: Use this unless the other form types apply to you.
   * **eu-api.jotform.com**: Select this if you're using Jotform [EU Safe Forms](https://www.jotform.com/eu-safe-forms/).
   * **hipaa-api.jotform.com**: Select this if you're using Jotform [HIPAA forms](https://www.jotform.com/hipaa/).

Refer to the [Jotform API documentation](https://api.jotform.com/docs/) for more information on creating keys and API domains.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

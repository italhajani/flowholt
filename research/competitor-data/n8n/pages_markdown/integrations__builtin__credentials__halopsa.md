# HaloPSA credentials | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/credentials/halopsa
Lastmod: 2026-04-14
Description: Documentation for HaloPSA credentials. Use these credentials to authenticate HaloPSA in n8n, a workflow automation platform.
# HaloPSA credentials[#](#halopsa-credentials "Permanent link")

You can use these credentials to authenticate the following nodes:

* [HaloPSA](../../app-nodes/n8n-nodes-base.halopsa/)

## Prerequisites[#](#prerequisites "Permanent link")

Create a [HaloPSA](https://halopsa.com/) account.

## Supported authentication methods[#](#supported-authentication-methods "Permanent link")

* API key

## Related resources[#](#related-resources "Permanent link")

Refer to [HaloPSA's API documentation](https://usehalo.com/halopsa/guides/1823/) for more information about the service.

## Using API key[#](#using-api-key "Permanent link")

To configure this credential, you'll need:

* To select your **Hosting Type**:
  + **On Premise Solution**: Choose this option if you're hosting the Halo application on your own server
  + **Hosted Solution Of Halo**: Choose this option if your application is hosted by Halo. If this option is selected, you'll need to provide your **Tenant**.
* The **HaloPSA Authorisation Server URL**: Your Authorisation Server URL is displayed within HaloPSA in **Configuration > Integrations > Halo API** in [API Details](https://halopsa.com/guides/article/?kbid=1737).
* The **Resource Server** URL: Your Resource Server is displayed within HaloPSA in **Configuration > Integrations > Halo API** in [API Details](https://halopsa.com/guides/article/?kbid=1737).
* A **Client ID**: Obtained by registering the application in the Halo API settings. Refer to [HaloPSA's Authorisation documentation](https://usehalo.com/halopsa/guides/1823/) for detailed instructions. n8n recommends using these settings:
  + Choose `Client Credentials` as your **Authentication Method**.
  + Use the `all` permission.
* A **Client Secret**: Obtained by registering the application in the Halo API settings.
* Your **Tenant** name: If **Hosted Solution of Halo** is selected as the **Hosting Type**, you must provide your tenant name. Your tenant name is displayed within HaloPSA in **Configuration > Integrations > Halo API** in [API Details](https://halopsa.com/guides/article/?kbid=1737).

HaloPSA uses both the application permissions and the agent's permissions to determine API access.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

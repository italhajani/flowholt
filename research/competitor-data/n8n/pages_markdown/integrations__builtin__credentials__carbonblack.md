# Carbon Black credentials | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/credentials/carbonblack
Lastmod: 2026-04-14
Description: Documentation for the Carbon Black credentials. Use these credentials to authenticate Carbon Black in n8n, a workflow automation platform.
# Carbon Black credentials[#](#carbon-black-credentials "Permanent link")

You can use these credentials to authenticate when using the [HTTP Request node](../../core-nodes/n8n-nodes-base.httprequest/) to make a [Custom API call](../../../custom-operations/).

## Prerequisites[#](#prerequisites "Permanent link")

* Create a [Carbon Black subscription](https://www.broadcom.com/products/carbon-black/threat-prevention/carbon-black-cloud).
* Create a [Carbon Black developer account](https://developer.carbonblack.com/).

## Authentication methods[#](#authentication-methods "Permanent link")

* API key

## Related resources[#](#related-resources "Permanent link")

Refer to [Carbon Black's documentation](https://developer.carbonblack.com/reference/carbon-black-cloud/cb-defense/latest/rest-api/) for more information about the service.

This is a credential-only node. Refer to [Custom API operations](../../../custom-operations/) to learn more. View [example workflows and related content](https://n8n.io/integrations/carbon-black/) on n8n's website.

## Using API key[#](#using-api-key "Permanent link")

To configure this credential, you'll need:

* A **URL**: This URL is determined by the environment/product URL you use. You can find it by looking at the web address of your Carbon Black Cloud console. Refer to [Carbon Black's URL Parts documentation](https://developer.carbonblack.com/reference/carbon-black-cloud/authentication#the-url-parts) for more information.
* An **Access Token**: Refer to the [Carbon Black Create an API key documentation](https://developer.carbonblack.com/reference/carbon-black-cloud/authentication#carbon-black-cloud-manages-identities-and-roles) to create an API key. Add the **API Secret Key** as the **Access Token** in n8n.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

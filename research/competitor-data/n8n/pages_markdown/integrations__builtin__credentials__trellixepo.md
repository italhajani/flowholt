# Trellix ePO credentials | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/credentials/trellixepo
Lastmod: 2026-04-14
Description: Documentation for the Trellix ePO credentials. Use these credentials to authenticate Trellix ePO in n8n, a workflow automation platform.
# Trellix ePO credentials[#](#trellix-epo-credentials "Permanent link")

You can use these credentials to authenticate when using the [HTTP Request node](../../core-nodes/n8n-nodes-base.httprequest/) to make a [Custom API call](../../../custom-operations/).

## Prerequisites[#](#prerequisites "Permanent link")

Create a [Trellix ePolicy Orchestrator](https://www.trellix.com/products/epo/) account.

## Supported authentication methods[#](#supported-authentication-methods "Permanent link")

* Basic auth

## Related resources[#](#related-resources "Permanent link")

Refer to [Trellix ePO's documentation](https://docs.trellix.com/bundle/epolicy-orchestrator-web-api-reference-guide/page/GUID-D87A6839-AED2-47B0-BE93-5BF83F710278.html) for more information about the service.

This is a credential-only node. Refer to [Custom API operations](../../../custom-operations/) to learn more. View [example workflows and related content](https://n8n.io/integrations/trellix-epo/) on n8n's website.

## Using basic auth[#](#using-basic-auth "Permanent link")

To configure this credential, you'll need:

* A **Username** to connect as.
* A **Password** for that user account.

n8n uses These fields to build the `-u` parameter in the format of `-u username:pw`. Refer to [Web API basics](https://docs.trellix.com/bundle/epolicy-orchestrator-web-api-reference-guide/page/GUID-2503B69D-2BCE-4491-9969-041838B39C1F.html) for more information.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

# Xero node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.xero
Lastmod: 2026-04-14
Description: Learn how to use the Xero node in n8n. Follow technical documentation to integrate Xero node into your workflows.
# Xero node[#](#xero-node "Permanent link")

Use the Xero node to automate work in Xero, and integrate Xero with other applications. n8n has built-in support for a wide range of Xero features, including creating, updating, and getting contacts and invoices.

On this page, you'll find a list of operations the Xero node supports and links to more resources.

Credentials

Refer to [Xero credentials](../../credentials/xero/) for guidance on setting up authentication.

## Operations[#](#operations "Permanent link")

* Contact
  + Create a contact
  + Get a contact
  + Get all contacts
  + Update a contact
* Invoice
  + Create a invoice
  + Get a invoice
  + Get all invoices
  + Update a invoice

## Templates and examples[#](#templates-and-examples "Permanent link")

**Get invoices from Xero**

by amudhan

[View template details](https://n8n.io/workflows/543-get-invoices-from-xero/)

**Integrate Xero with FileMaker using Webhooks**

by Stathis Askaridis

[View template details](https://n8n.io/workflows/2499-integrate-xero-with-filemaker-using-webhooks/)

**Automate Invoice Processing with Gmail, OCR.space, Slack & Xero**

by Abi Odedeyi

[View template details](https://n8n.io/workflows/9905-automate-invoice-processing-with-gmail-ocrspace-slack-and-xero/)

[Browse Xero integration templates](https://n8n.io/integrations/xero/), or [search all templates](https://n8n.io/workflows/)

## Related resources[#](#related-resources "Permanent link")

Refer to [Xero's API documentation](https://developer.xero.com/documentation/api/accounting/overview) for more information about the service.

## What to do if your operation isn't supported[#](#what-to-do-if-your-operation-isnt-supported "Permanent link")

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](../../core-nodes/n8n-nodes-base.httprequest/) to call the service's API.

You can use the credential you created for this service in the HTTP Request node:

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
2. Select the service you want to connect to.
3. Select your credential.

Refer to [Custom API operations](../../../custom-operations/) for more information.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

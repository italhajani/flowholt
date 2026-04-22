# Invoice Ninja node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.invoiceninja
Lastmod: 2026-04-14
Description: Learn how to use the Invoice Ninja node in n8n. Follow technical documentation to integrate Invoice Ninja node into your workflows.
# Invoice Ninja node[#](#invoice-ninja-node "Permanent link")

Use the Invoice Ninja node to automate work in Invoice Ninja, and integrate Invoice Ninja with other applications. n8n has built-in support for a wide range of Invoice Ninja features, including creating, updating, deleting, and getting clients, expense, invoice, payments and quotes.

On this page, you'll find a list of operations the Invoice Ninja node supports and links to more resources.

Credentials

Refer to [Invoice Ninja credentials](../../credentials/invoiceninja/) for guidance on setting up authentication.

## Operations[#](#operations "Permanent link")

* Client
  + Create a new client
  + Delete a client
  + Get data of a client
  + Get data of all clients
* Expense
  + Create a new expense
  + Delete an expense
  + Get data of an expense
  + Get data of all expenses
* Invoice
  + Create a new invoice
  + Delete a invoice
  + Email an invoice
  + Get data of a invoice
  + Get data of all invoices
* Payment
  + Create a new payment
  + Delete a payment
  + Get data of a payment
  + Get data of all payments
* Quote
  + Create a new quote
  + Delete a quote
  + Email an quote
  + Get data of a quote
  + Get data of all quotes
* Task
  + Create a new task
  + Delete a task
  + Get data of a task
  + Get data of all tasks

## Templates and examples[#](#templates-and-examples "Permanent link")

**Receive updates on a new invoice via Invoice Ninja**

by amudhan

[View template details](https://n8n.io/workflows/535-receive-updates-on-a-new-invoice-via-invoice-ninja/)

**Get multiple clients' data from Invoice Ninja**

by amudhan

[View template details](https://n8n.io/workflows/534-get-multiple-clients-data-from-invoice-ninja/)

**Automate Invoice Creation and Delivery with Google Sheets, Invoice Ninja and Gmail**

by Marth - Business Automation

[View template details](https://n8n.io/workflows/6447-automate-invoice-creation-and-delivery-with-google-sheets-invoice-ninja-and-gmail/)

[Browse Invoice Ninja integration templates](https://n8n.io/integrations/invoice-ninja/), or [search all templates](https://n8n.io/workflows/)

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

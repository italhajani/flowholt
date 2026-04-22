# AWS Certificate Manager node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.awscertificatemanager
Lastmod: 2026-04-14
Description: Learn how to use the AWS Certificate Manager node in n8n. Follow technical documentation to integrate AAWS Certificage Manager node into your workflows.
# AWS Certificate Manager node[#](#aws-certificate-manager-node "Permanent link")

Use the AWS Certificate Manager node to automate work in AWS Certificate Manager, and integrate AWS Certificate Manager with other applications. n8n has built-in support for a wide range of AWS Certificate Manager features, including creating, deleting, getting, and renewing SSL certificates.

On this page, you'll find a list of operations the AWS Certificate Manager node supports and links to more resources.

Credentials

Refer to [AWS Certificate Manager credentials](../../credentials/aws/) for guidance on setting up authentication.

## Operations[#](#operations "Permanent link")

* Certificate
  + Delete
  + Get
  + Get Many
  + Get Metadata
  + Renew

## Templates and examples[#](#templates-and-examples "Permanent link")

[Browse AWS Certificate Manager integration templates](https://n8n.io/integrations/aws-certificate-manager/), or [search all templates](https://n8n.io/workflows/)

## Related resources[#](#related-resources "Permanent link")

Refer to [AWS Certificate Manager's documentation](https://docs.aws.amazon.com/acm/latest/userguide/acm-overview.html) for more information on this service.

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

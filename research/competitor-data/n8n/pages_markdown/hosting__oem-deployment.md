# OEM deployment | n8n Docs

Source: https://docs.n8n.io/hosting/oem-deployment
Lastmod: 2026-04-14
Description: Overview of OEM deployment - surfacing n8n's interface inside your own product's UI under an OEM agreement.
# OEM deployment[#](#oem-deployment "Permanent link")

OEM agreement required

OEM deployment of n8n requires a separate commercial agreement with n8n. [Contact n8n](mailto:license@n8n.io) for more information.

n8n's OEM deployment option lets you embed and surface n8n's interface inside your own product's UI. This allows your users to build workflows, configure connections, and run workflow automation without leaving your product. n8n branding is required as part of an OEM integration.

This is distinct from [using n8n as a backend](../), where workflows execute behind the scenes and end users never see n8n. In that model, your product calls n8n using a webhook or the [API](../../api/) to trigger workflows, and n8n behaves like any other self-hosted service in your infrastructure - your users never see any n8n UI. This is available on all paid plans under the standard license, with no separate agreement needed. OEM deployment is only necessary when you want your users to interact with the n8n editor directly.

## What's covered[#](#whats-covered "Permanent link")

* [Prerequisites](prerequisites/): Guidance on CPU, memory, and database requirements for planning your deployment.
* [Managing workflows](managing-workflows/): Patterns for managing workflows across multiple users or organizations within an embedded deployment.
* [Workflow templates](../configuration/configuration-examples/custom-templates/): Configure a custom workflow template library for your users.
* [Credential overwrites](../configuration/credential-overwrites/): Set OAuth credentials globally so your users can authenticate without seeing or entering client secrets.

## Support[#](#support "Permanent link")

Contact [n8n support](mailto:support@n8n.io) using the email provided when you signed your OEM agreement. The [community forum](https://community.n8n.io/) is also available for general questions.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

# MISP credentials | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/credentials/misp
Lastmod: 2026-04-14
Description: Documentation for MISP credentials. Use these credentials to authenticate MISP in n8n, a workflow automation platform.
# MISP credentials[#](#misp-credentials "Permanent link")

You can use these credentials to authenticate the following nodes:

* [MISP](../../app-nodes/n8n-nodes-base.misp/)

## Prerequisites[#](#prerequisites "Permanent link")

Install and run a [MISP](https://misp.github.io/MISP/) instance.

## Supported authentication methods[#](#supported-authentication-methods "Permanent link")

* API key

## Related resources[#](#related-resources "Permanent link")

Refer to [MISP's Automation API documentation](https://www.circl.lu/doc/misp/automation) for more information about the service.

## Using API key[#](#using-api-key "Permanent link")

To configure this credential, you'll need:

* An **API Key**: In MISP, these are called Automation keys. Get an automation key from **Event Actions > Automation**. Refer to [MISP's automation keys documentation](https://www.circl.lu/doc/misp/automation/#automation-key) for instructions on generating more keys.
* A **Base URL**: Your MISP URL.
* Select whether to **Allow Unauthorized Certificates**: If turned on, the credential will connect even if SSL certificate validation fails.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

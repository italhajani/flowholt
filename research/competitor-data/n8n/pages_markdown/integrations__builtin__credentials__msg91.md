# MSG91 credentials | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/credentials/msg91
Lastmod: 2026-04-14
Description: Documentation for MSG91 credentials. Use these credentials to authenticate MSG91 in n8n, a workflow automation platform.
# MSG91 credentials[#](#msg91-credentials "Permanent link")

You can use these credentials to authenticate the following nodes:

* [MSG91](../../app-nodes/n8n-nodes-base.msg91/)

## Prerequisites[#](#prerequisites "Permanent link")

Create a [MSG91](https://msg91.com/) account.

## Supported authentication methods[#](#supported-authentication-methods "Permanent link")

* API key

## Related resources[#](#related-resources "Permanent link")

Refer to [MSG91's API documentation](https://docs.msg91.com/overview) for more information about the service.

## Using API key[#](#using-api-key "Permanent link")

To configure this credential, you'll need:

* An **Authentication Key**: To get your Authentication Key, go to the user menu and select **Authkey**. Refer to MSG91's [Where can I find my authentication key? documentation](https://msg91.com/help/api/where-can-i-find-my-authentication-ke) for more information.

## IP Security[#](#ip-security "Permanent link")

MSG91 enables [IP Security](https://msg91.com/help/api/what-do-you-mean-by-api-security) by default for authkeys.

For the n8n credentials to function with this setting enabled, add all the [n8n IP addresses](../../../../manage-cloud/cloud-ip/) as whitelisted IPs in MSG91. You can add them in one of two places, depending on your desired security level:

* To allow any/all authkeys in the account to work with n8n, add the n8n IP addresses in the **Company's whitelisted IPs** section of the **Authkey** page.
* To allow only specific authkeys to work with n8n, add the n8n IP addresses in the **Whitelisted IPs** section of an authkey's details.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

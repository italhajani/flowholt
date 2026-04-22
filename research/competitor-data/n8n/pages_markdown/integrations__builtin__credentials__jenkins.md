# Jenkins credentials | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/credentials/jenkins
Lastmod: 2026-04-14
Description: Documentation for Jenkins credentials. Use these credentials to authenticate Jenkins in n8n, a workflow automation platform.
# Jenkins credentials[#](#jenkins-credentials "Permanent link")

You can use these credentials to authenticate the following nodes:

* [Jenkins](../../app-nodes/n8n-nodes-base.jenkins/)

## Prerequisites[#](#prerequisites "Permanent link")

Create an account on a [Jenkins](https://www.jenkins.io/) instance.

## Supported authentication methods[#](#supported-authentication-methods "Permanent link")

* API token

## Related resources[#](#related-resources "Permanent link")

Jenkins doesn't provide public API documentation; API documentation for each page is available from the user interface in the bottom right. Refer to those detailed pages for more information about the service. Refer to [Jenkins Remote Access API](https://www.jenkins.io/doc/book/using/remote-access-api/) for information on the API and API wrappers.

## Using API token[#](#using-api-token "Permanent link")

To configure this credential, you'll need:

* The **Jenkins Username**: For the user whom the token belongs to
* A **Personal API Token**: Generate this from the user's **profile details > Configure > Add new token**. Refer to [these Stack Overflow instructions](https://stackoverflow.com/questions/45466090/how-to-get-the-api-token-for-jenkins) for more detail.
* The **Jenkins Instance URL**

Jenkins rebuilt their API token setup in 2018. If you're working with an older Jenkins instance, be sure you're using a non-legacy API token. Refer to [Security Hardening: New API token system in Jenkins 2.129+](https://www.jenkins.io/blog/2018/07/02/new-api-token-system/) for more information.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

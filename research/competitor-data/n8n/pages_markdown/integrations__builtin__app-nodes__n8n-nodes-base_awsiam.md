# AWS IAM node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.awsiam
Lastmod: 2026-04-14
Description: Learn how to use the AWS IAM node in n8n. Follow technical documentation to integrate AWS IAM node into your workflows.
# AWS IAM node[#](#aws-iam-node "Permanent link")

Use the AWS IAM node to automate work in AWS Identity and Access Management (IAM) and integrate AWS IAM with other applications. n8n has built-in support for a wide range of AWS IAM features, which includes creating, updating, getting and deleting users and groups as well as managing group membership.

On this page, you'll find a list of operations the AWS IAM node supports, and links to more resources.

Credentials

You can find authentication information for this node [here](../../credentials/aws/).

## Operations[#](#operations "Permanent link")

* **User**:
  + **Add to Group**: Add an existing user to a group.
  + **Create**: Create a new user.
  + **Delete**: Delete a user.
  + **Get**: Retrieve a user.
  + **Get Many**: Retrieve a list of users.
  + **Remove From Group**: Remove a user from a group.
  + **Update**: Update an existing user.
* **Group**:
  + **Create**: Create a new group.
  + **Delete**: Create a new group.
  + **Get**: Retrieve a group.
  + **Get Many**: Retrieve a list of groups.
  + **Update**: Update an existing group.

## Templates and examples[#](#templates-and-examples "Permanent link")

**Automated GitHub Scanner for Exposed AWS IAM Keys**

by Niranjan G

[View template details](https://n8n.io/workflows/5021-automated-github-scanner-for-exposed-aws-iam-keys/)

**Automated AWS IAM Key Compromise Response with Slack & Claude AI**

by Niranjan G

[View template details](https://n8n.io/workflows/5123-automated-aws-iam-key-compromise-response-with-slack-and-claude-ai/)

**Send Slack Alerts for AWS IAM Access Keys Older Than 365 Days**

by Trung Tran

[View template details](https://n8n.io/workflows/7501-send-slack-alerts-for-aws-iam-access-keys-older-than-365-days/)

[Browse AWS IAM integration templates](https://n8n.io/integrations/aws-iam/), or [search all templates](https://n8n.io/workflows/)

## Related resources[#](#related-resources "Permanent link")

Refer to the [AWS IAM documentation](https://docs.aws.amazon.com/IAM/latest/APIReference/welcome.html) for more information about the service.

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

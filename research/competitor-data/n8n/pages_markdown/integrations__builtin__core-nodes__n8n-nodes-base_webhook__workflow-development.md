# Webhook node workflow development documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/workflow-development
Lastmod: 2026-04-14
Description: Learn how to build, test, and use the Webhook node in your workflows in n8n.
# Workflow development[#](#workflow-development "Permanent link")

The [Webhook node](../) works a bit differently from other core nodes. n8n recommends following these processes for building, testing, and using your Webhook node in production.

n8n generates two **Webhook URLs** for each Webhook node: a **Test URL** and a **Production URL**.

## Build and test workflows[#](#build-and-test-workflows "Permanent link")

While building or testing a workflow, use the **Test** webhook URL.

Using a test webhook ensures that you can view the incoming data in the editor UI, which is useful for debugging. Select **Listen for test event** to register the webhook before sending the data to the test webhook. The test webhook stays active for 120 seconds.

When using the Webhook node on localhost on a [self-hosted](../../../../../hosting/) n8n instance, run n8n in tunnel mode:

* [npm with tunnel](../../../../../hosting/installation/npm/#n8n-with-tunnel)
* [Docker with tunnel](../../../../../hosting/installation/docker/#n8n-with-tunnel)

[](/_video/integrations/builtin/core-nodes/webhook/webhook-node-intro.mp4)

## Production workflows[#](#production-workflows "Permanent link")

When your workflow is ready, switch to using the **Production** webhook URL. You can then publish your workflow, and n8n runs it automatically when an external service calls the webhook URL.

When working with a Production webhook, ensure that you have saved and published the workflow. Data flowing through the webhook isn't visible in the editor UI with the production webhook.

Refer to [Create a workflow](../../../../../workflows/create/) for more information on publishing workflows.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

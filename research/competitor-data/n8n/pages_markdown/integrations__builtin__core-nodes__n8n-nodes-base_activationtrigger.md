# Activation Trigger node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.activationtrigger
Lastmod: 2026-04-14
Description: Learn how to use the Activation Trigger node in n8n. Follow technical documentation to integrate Activation Trigger node into your workflows.
# Activation Trigger node[#](#activation-trigger-node "Permanent link")

The Activation Trigger node gets triggered when an event gets fired by n8n or a workflow.

Warning

n8n has deprecated the Activation Trigger node and replaced it with two new nodes: the [n8n Trigger node](../n8n-nodes-base.n8ntrigger/) and the [Workflow Trigger node](../n8n-nodes-base.workflowtrigger/). For more details, check out the entry in the [breaking changes](https://github.com/n8n-io/n8n/blob/master/packages/cli/BREAKING-CHANGES.md#01170) page.

Keep in mind

If you want to use the Activation Trigger node for a workflow, add the node to the workflow. You don't have to create a separate workflow.

The Activation Trigger node gets triggered for the workflow that it gets added to. You can use the Activation Trigger node to trigger a workflow to notify the state of the workflow.

## Node parameters[#](#node-parameters "Permanent link")

* Events
  + **Activation**: Run when the workflow gets published
  + **Start**: Run when n8n starts or restarts
  + **Update**: Run when the workflow gets saved while it's active

## Templates and examples[#](#templates-and-examples "Permanent link")

[Browse Activation Trigger integration templates](https://n8n.io/integrations/activation-trigger/), or [search all templates](https://n8n.io/workflows/)

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

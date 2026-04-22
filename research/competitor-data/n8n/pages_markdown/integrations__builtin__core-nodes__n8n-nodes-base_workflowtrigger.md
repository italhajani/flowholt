# Workflow Trigger node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.workflowtrigger
Lastmod: 2026-04-14
Description: Learn how to use the Workflow Trigger node in n8n. Follow technical documentation to integrate Workflow Trigger node into your workflows.
# Workflow Trigger node[#](#workflow-trigger-node "Permanent link")

The Workflow Trigger node gets triggered when a workflow is updated or activated.

Deprecated

n8n has deprecated the Workflow Trigger node and moved its functionality to the [n8n Trigger node](../n8n-nodes-base.n8ntrigger/).

Keep in mind

If you want to use the Workflow Trigger node for a workflow, add the node to the workflow. You don't have to create a separate workflow.

The Workflow Trigger node gets triggered for the workflow that it gets added to. You can use the Workflow Trigger node to trigger a workflow to notify the state of the workflow.

## Node parameters[#](#node-parameters "Permanent link")

The node includes a single parameter to identify the **Events** that should trigger it. Choose from these events:

* **Active Workflow Updated**: If you select this event, the node triggers when this workflow is updated.
* **Workflow Activated**: If you select this event, the node triggers when this workflow is activated.

You can select one or both of these events.

## Templates and examples[#](#templates-and-examples "Permanent link")

**Qualys Vulnerability Trigger Scan SubWorkflow**

by Angel Menendez

[View template details](https://n8n.io/workflows/2511-qualys-vulnerability-trigger-scan-subworkflow/)

**Pattern for Multiple Triggers Combined to Continue Workflow**

by Hubschrauber

[View template details](https://n8n.io/workflows/2857-pattern-for-multiple-triggers-combined-to-continue-workflow/)

**Unify multiple triggers into a single workflow**

by Guillaume Duvernay

[View template details](https://n8n.io/workflows/7784-unify-multiple-triggers-into-a-single-workflow/)

[Browse Workflow Trigger integration templates](https://n8n.io/integrations/workflow-trigger/), or [search all templates](https://n8n.io/workflows/)

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

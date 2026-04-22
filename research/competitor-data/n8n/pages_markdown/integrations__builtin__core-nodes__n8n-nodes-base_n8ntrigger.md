# n8n Trigger node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.n8ntrigger
Lastmod: 2026-04-14
Description: Learn how to use the n8n Trigger node in n8n. Follow technical documentation to integrate n8n Trigger node into your workflows.
# n8n Trigger node[#](#n8n-trigger-node "Permanent link")

The n8n Trigger node triggers when the workflow containing this node updates or gets published, or when the n8n instance starts or restarts. This node only responds to events in its own workflow; changes to other workflows won't trigger it.

## Node parameters[#](#node-parameters "Permanent link")

The node includes a single parameter to identify the **Events** that should trigger it. Choose from these events:

* **Published Workflow Updated**: If you select this event, the node triggers when the workflow containing this node is updated. Changes to other workflows won't trigger this node.
* **Instance started**: If you select this event, the node triggers when the n8n instance starts or restarts.
* **Workflow Published**: If you select this event, the node triggers when the workflow containing this node is published. Publishing other workflows won't trigger this node.

You can select one or more of these events.

## Templates and examples[#](#templates-and-examples "Permanent link")

**RAG Starter Template using Simple Vector Stores, Form trigger and OpenAI**

by n8n Team

[View template details](https://n8n.io/workflows/5010-rag-starter-template-using-simple-vector-stores-form-trigger-and-openai/)

**Unify multiple triggers into a single workflow**

by Guillaume Duvernay

[View template details](https://n8n.io/workflows/7784-unify-multiple-triggers-into-a-single-workflow/)

**Monitor scheduled workflow health in n8n with automatic trigger checks**

by Julian Kaiser

[View template details](https://n8n.io/workflows/13290-monitor-scheduled-workflow-health-in-n8n-with-automatic-trigger-checks/)

[Browse n8n Trigger integration templates](https://n8n.io/integrations/n8n-trigger/), or [search all templates](https://n8n.io/workflows/)

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

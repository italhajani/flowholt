# Settings | n8n Docs

Source: https://docs.n8n.io/workflows/settings
Lastmod: 2026-04-14
Description: Manage settings for an individual workflow.
# Workflow settings[#](#workflow-settings "Permanent link")

You can customize workflow behavior for individual workflows using workflow settings.

## Access workflow settings[#](#access-workflow-settings "Permanent link")

To open the settings:

1. Open your workflow.
2. Select the **three dots icon** ![three dots icon](../../_images/common-icons/three-dots-horizontal.png) in the upper-right corner.
3. Select **Settings**. n8n opens the **Workflow settings** modal.

## Available settings[#](#available-settings "Permanent link")

The following settings are available:

### Execution order[#](#execution-order "Permanent link")

Choose the execution order for multi-branch workflows:

**v1 (recommended)** executes each branch in turn, completing one branch before starting another. n8n orders the branches based on their position on the [canvas](../../glossary/#canvas-n8n), from topmost to bottommost. If two branches are at the same height, the leftmost branch executes first.

**v0 (legacy)** executes the first node of each branch, then the second node of each branch, and so on.

### Error Workflow (to notify when this one errors)[#](#error-workflow-to-notify-when-this-one-errors "Permanent link")

Select a workflow to trigger if the current workflow fails. See [error workflows](../../flow-logic/error-handling/) for more details.

### This workflow can be called by[#](#this-workflow-can-be-called-by "Permanent link")

Choose which other workflows can call this workflow.

### Timezone[#](#timezone "Permanent link")

Sets the timezone for this workflow. The timezone setting is important for the Schedule Trigger node.

You can set your n8n instance's timezone to configure the default timezone workflows use:

* [Set a n8n Cloud instance timezone](../../manage-cloud/set-cloud-timezone/)
* [Configure the timezone for self-hosted instances](../../hosting/configuration/environment-variables/timezone-localization/)

If you don't configure the workflow or instance timezone, n8n defaults to the EDT (New York) timezone.

### Save failed production executions[#](#save-failed-production-executions "Permanent link")

Whether n8n should save failed executions for active workflows.

### Save successful production executions[#](#save-successful-production-executions "Permanent link")

Whether n8n should save successful executions for active workflows.

### Save manual executions[#](#save-manual-executions "Permanent link")

Whether n8n should save executions for workflows started by the user in the editor.

### Save execution progress[#](#save-execution-progress "Permanent link")

Whether n8n should save execution data for each node.

If set to **Save**, the workflow resumes from where it stopped in case of an error. This may increase latency.

### Timeout Workflow[#](#timeout-workflow "Permanent link")

Whether n8n should cancel the current workflow execution after a certain amount of time elapses.

When enabled, the **Timeout After** option appears. Here, you can set the time (in hours, minutes, and seconds) after which the workflow should timeout. For n8n Cloud users, n8n enforces a maximum available timeout for each plan.

### Redact production execution data[#](#redact-production-execution-data "Permanent link")

Controls whether n8n redacts execution data from production (non-manually triggered) executions. When set to **Redact**, n8n hides the input and output data of each node and replaces it with a redacted indicator.

### Redact manual execution data[#](#redact-manual-execution-data "Permanent link")

Controls whether n8n redacts execution data from manually triggered executions. When set to **Redact**, n8n hides the input and output data of each node and replaces it with a redacted indicator.

Refer to [Execution data redaction](../executions/execution-data-redaction/) for details on redaction policies, revealing data, and permission requirements.

### Estimated time saved[#](#estimated-time-saved "Permanent link")

An estimate of the number of minutes each of execution of this workflow saves you.

Setting this lets n8n calculate the amount of time saved for [insights](../../insights/).

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

# Executions | n8n Docs

Source: https://docs.n8n.io/workflows/executions
Lastmod: 2026-04-14
Description: An execution is a single run of a workflow.
# Executions[#](#executions "Permanent link")

An execution is a single run of a workflow.

## Execution modes[#](#execution-modes "Permanent link")

There are two execution modes:

* Manual: run workflows manually when testing. Select **Execute Workflow** to start a manual execution. You can do manual executions of active workflows, but n8n recommends keeping your workflow set to **Inactive** while developing and testing.
* Production: a production workflow is one that runs automatically. To enable this, set the workflow to **Active**.

## How executions count towards quotas:[#](#how-executions-count-towards-quotas "Permanent link")

[Paid plans](https://n8n.io/pricing/), whether cloud or self-hosted, have an execution limit quota. Only production executions count towards this quota. These are executions started automatically by triggers, schedules, or polling. Manual executions aren't counted. This distinction applies regardless of the instance environment, such as development or production.

## Execution lists[#](#execution-lists "Permanent link")

n8n provides two execution lists:

* [Workflow-level executions](single-workflow-executions/): this execution list shows the executions for a single workflow.
* [All executions](all-executions/): this list shows all executions for all your workflows.

n8n supports [adding custom data to executions](custom-executions-data/).

## Execution data redaction[#](#execution-data-redaction "Permanent link")

You can redact execution data to protect sensitive information. Redaction hides the input and output data of workflow executions while preserving execution metadata like status, timing, and node names. Refer to [Execution data redaction](execution-data-redaction/) for details.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

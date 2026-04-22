# Workflows environment variables | n8n Docs

Source: https://docs.n8n.io/hosting/configuration/environment-variables/workflows
Lastmod: 2026-04-14
Description: Environment variables to configure workflows in n8n, including default naming, onboarding flow preferences, tag management, and caller policy settings.
environment variables

# Workflows environment variables[#](#workflows-environment-variables "Permanent link")

File-based configuration

You can add `_FILE` to individual variables to provide their configuration in a separate file. Refer to [Keeping sensitive data in separate files](../../configuration-methods/#keeping-sensitive-data-in-separate-files) for more details.

| Variable | Type | Default | Description |
| --- | --- | --- | --- |
| `N8N_ONBOARDING_FLOW_DISABLED` | Boolean | `false` | Whether to disable onboarding tips when creating a new workflow (true) or not (false). |
| `N8N_WORKFLOW_ACTIVATION_BATCH_SIZE` | Number | `1` | How many workflows to publish simultaneously during startup. |
| `N8N_WORKFLOW_CALLER_POLICY_DEFAULT_OPTION` | String | `workflowsFromSameOwner` | Which workflows can call a workflow. Options are: `any`, `none`, `workflowsFromAList`, `workflowsFromSameOwner`. This feature requires [Workflow sharing](../../../../workflows/sharing/). |
| `N8N_WORKFLOW_TAGS_DISABLED` | Boolean | `false` | Whether to disable workflow tags (true) or enable tags (false). |
| `WORKFLOWS_DEFAULT_NAME` | String | `My workflow` | The default name used for new workflows. |

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

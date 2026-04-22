# Source control and environments | n8n Docs

Source: https://docs.n8n.io/source-control-environments
Lastmod: 2026-04-14
Description: Overview of source control and environments in n8n
# Source control and environments[#](#source-control-and-environments "Permanent link")

Feature availability

* Available on Business and Enterprise plans.
* You must be an n8n instance owner or instance admin to enable and configure source control.
* Instance owners and instance admins can push changes to and pull changes from the connected repository.
* Project admins can push changes to the connected repository. They can't pull changes from the repository.

n8n uses Git-based source control to support environments. Linking your n8n instances to a Git repository lets you create multiple n8n environments, backed by Git branches.

In this section:

* [Understand](understand/):
  + [Environments in n8n](understand/environments/): The purpose of environments, and how they work in n8n.
  + [Git and n8n](understand/git/): How n8n uses Git.
  + [Branch patterns](understand/patterns/): The possible relationships between n8n instances and Git branches.
* [Set up source control for environments](setup/): How to connect your n8n instance to Git.
* [Using](using/):
  + [Push and pull](using/push-pull/): Send work to Git, and fetch work from Git to your instance.
  + [Copy work between environments](using/copy-work/): How to copy work between different n8n instances.
* [Tutorial: Create environments with source control](create-environments/): An end-to-end tutorial, setting up environments using n8n's recommended configurations.

Related sections:

* [Variables](../code/variables/): reusable values.
* [External secrets](../external-secrets/): manage [credentials](../glossary/#credential-n8n) with an external secrets vault.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

# vars | n8n Docs

Source: https://docs.n8n.io/code/cookbook/builtin/vars
Lastmod: 2026-04-14
Description: Access your environment's custom variables.
# `vars`[#](#vars "Permanent link")

Feature availability

* Available on Self-hosted Enterprise and Pro and Enterprise Cloud plans.
* You need access to the n8n instance owner account to create variables.

`vars` contains all [Variables](../../../variables/) for the active environment. It's read-only: you can access variables using `vars`, but must set them using the UI.

[JavaScript](#__tabbed_1_1)[Python](#__tabbed_1_2)

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // Access a variable $vars.<variable-name> ``` |

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` # Access a variable _vars.<variable-name> ``` |

`vars` and `env`

`vars` gives access to user-created variables. It's part of the [Environments](../../../../source-control-environments/) feature. `env` gives access to the [configuration environment variables](../../../../hosting/configuration/environment-variables/) for your n8n instance.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

# Enable modules in Code node | n8n Docs

Source: https://docs.n8n.io/hosting/configuration/configuration-examples/modules-in-code-node
Lastmod: 2026-04-14
Description: Allow the use of both built-in and external modules within the Code node.
# Enable modules in Code node[#](#enable-modules-in-code-node "Permanent link")

For security reasons, the Code node restricts importing modules. It's possible to lift that restriction for built-in and external modules by setting the following environment variables:

* `NODE_FUNCTION_ALLOW_BUILTIN`: For built-in modules
* `NODE_FUNCTION_ALLOW_EXTERNAL`: For external modules sourced from n8n/node\_modules directory. External module support is disabled when an environment variable isn't set.

|  |  |
| --- | --- |
| ```  1  2  3  4  5  6  7  8  9 10 11 ``` | ``` # Allows usage of all builtin modules export NODE_FUNCTION_ALLOW_BUILTIN=*  # Allows usage of only crypto export NODE_FUNCTION_ALLOW_BUILTIN=crypto  # Allows usage of only crypto and fs export NODE_FUNCTION_ALLOW_BUILTIN=crypto,fs  # Allow usage of external npm modules. export NODE_FUNCTION_ALLOW_EXTERNAL=moment,lodash ``` |

If using Task Runners

If n8n instance is setup with [Task Runners](../../task-runners/), add the environment variables to the Task Runners instead to the main n8n node.

Refer to [Environment variables reference](../../environment-variables/nodes/) for more information on these variables.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

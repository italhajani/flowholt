# Connect to ChatGPT - Help Center

Source: https://help.make.com/connect-to-chatgpt
Lastmod: 2026-04-08T14:40:12.600Z
Description: Help Center
Model Context Protocol

MCP toolboxes

# Connect to ChatGPT

1 min

In this guide, learn how to connect your MCP toolbox to ChatGPT.

**Prerequisites**

* ChatGPT account (paid subscription)

* ﻿[MCP toolbox URL and key](/mcp-toolboxes#create-an-mcp-toolbox)﻿

To connect your MCP toolbox to ChatGPT:

1

Open the web version of ChatGPT.

2

Click your profile name on the left sidebar.

3

Click **Settings**.

4

Go to **Apps**, then to **Advanced settings**.

5

In **Advanced settings**, enable **Developer mode**.

6

Click **Create app** at the top to open the **New App** dialog.

7

Name your MCP server.

8

Add your complete MCP toolbox URL following the structure below:

<MCP TOOLBOX URL>/t/<TOOLBOX KEY>/<TRANSPORT METHOD>

9

Replace the placeholders with your actual values:

* MCP TOOLBOX URL: The URL generated when you created the MCP toolbox.

* TOOLBOX KEY: The key generated for the MCP toolbox.

* TRANSPORT METHOD: The path of your preferred transport method. Stateless Streamable HTTP (/stateless) is recommended due to its connection reliability.

Example:https://eu2.make.com/mcp/server/•••••••••••••/t/•••••••••••••/stateless

If you experience connection issues, add /stream instead of /stateless to the end of the URL. For SSE, add /sse instead.

10

In the **Authentication** dropdown, select **No Auth**.

11

Agree to continue.

12

Click **Create**.

You have now connected your MCP toolbox to ChatGPT. Click it to view all tools available through this toolbox.

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

Connect to Claude Desktop](/connect-to-claude-desktop "Connect to Claude Desktop")[NEXT

Connect to Cursor](/connect-to-cursor "Connect to Cursor")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

# Connect to Claude Desktop - Help Center

Source: https://help.make.com/connect-to-claude-desktop
Lastmod: 2026-04-08T14:40:16.266Z
Description: Help Center
Model Context Protocol

MCP toolboxes

# Connect to Claude Desktop

1 min

In this guide, learn how to connect your MCP toolbox to Claude Desktop.

**Prerequisites**

* Claude Desktop account (Pro plan)

* ﻿[MCP toolbox URL and key](/mcp-toolboxes#create-an-mcp-toolbox)﻿

To connect your MCP toolbox to Claude Desktop:

1

Open Claude Desktop.

2

Click your profile name on the left sidebar, then **Settings**.

3

In **Settings**, go to **Connectors**.

4

Click **Add custom connector**.

5

Name your MCP toolbox, then add your complete MCP toolbox URL following the structure below:

<MCP TOOLBOX URL>/t/<TOOLBOX KEY>/<TRANSPORT METHOD>

6

Replace the placeholders with your actual values:

* MCP TOOLBOX URL: The URL generated when you created the MCP toolbox.

* TOOLBOX KEY: The key generated for the MCP toolbox.

* TRANSPORT METHOD: The path of your preferred transport method. Stateless Streamable HTTP (/stateless) is recommended due to its connection reliability.

Example: https://eu2.make.com/mcp/server/•••••••••••••/t/•••••••••••••/stateless

If you experience connection issues, add /stream instead of /stateless to the end of the URL. For SSE, add /sse instead.

7

Click **Add**.

You have now connected your MCP toolbox to Claude Desktop. In **Configure**, you can view all tools available through this toolbox.

**MCP toolbox timeout:** Your MCP toolbox scenarios must finish running within 40 seconds. If a scenario runs longer, the connection times out and no outputs are returned to the client.

﻿

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

MCP toolboxes](/mcp-toolboxes "MCP toolboxes")[NEXT

Connect to ChatGPT](/connect-to-chatgpt "Connect to ChatGPT")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

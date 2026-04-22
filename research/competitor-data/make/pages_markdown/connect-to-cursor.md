# Connect to Cursor - Help Center

Source: https://help.make.com/connect-to-cursor
Lastmod: 2026-04-08T14:40:15.492Z
Description: Help Center
Model Context Protocol

MCP toolboxes

# Connect to Cursor

2 min

In this guide, learn how to connect your MCP toolbox to Cursor.

**Prerequisites**

* Cursor account

* ﻿[MCP toolbox URL and key](/mcp-toolboxes#create-an-mcp-toolbox)﻿

To connect your MCP toolbox to Cursor:

1

Open the desktop version of Cursor.

2

On the upper right-hand side, click the settings icon to open the **Cursor Settings** dialog.

3

In the left sidebar, click **Tools & Integrations** (or **Tools**, if you're on the Free Plan).

4

Under **MCP Tools**, click **Add Custom MCP** to open the editor for the mcp.json file.

5

In the editor, add the configuration below:

JSON

1{
2 "mcpServers": {
3 "make": {
4 "url": "<MCP TOOLBOX URL>",
5 "headers": {
6 "Authorization": "Bearer <TOOLBOX\_KEY>"
7 }
8 }
9}

{
"mcpServers": {
"make": {
"url": "<MCP TOOLBOX URL>",
"headers": {
"Authorization": "Bearer <TOOLBOX\_KEY>"
}
}
}
/\*\*
\* Reset the text fill color so that placeholder is visible
\*/
.npm\_\_react-simple-code-editor\_\_textarea:empty {
-webkit-text-fill-color: inherit !important;
}
/\*\*
\* Hack to apply on some CSS on IE10 and IE11
\*/
@media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
/\*\*
\* IE doesn't support '-webkit-text-fill-color'
\* So we use 'color: transparent' to make the text transparent on IE
\* Unlike other browsers, it doesn't affect caret color in IE
\*/
.npm\_\_react-simple-code-editor\_\_textarea {
color: transparent !important;
}
.npm\_\_react-simple-code-editor\_\_textarea::selection {
background-color: #accef7 !important;
color: transparent !important;
}
}

﻿

Optionally, use an env variable when adding the toolbox key for additional security. To learn more, see [Cursor's MCP documentation](https://cursor.com/docs/context/mcp "Cursor's MCP documentation").

6

To complete the configuration, replace the placeholders with your actual values:

* MCP TOOLBOX URL: The URL generated when you created the MCP toolbox.

* TOOLBOX KEY: The key generated for the MCP toolbox.

Configuration example:

JSON

1{
2 "mcpServers": {
3 "make": {
4 "url": "https://eu2.make.com/mcp/server/•••••••••••••",
5 "headers": {
6 "Authorization": "Bearer •••••••••••••"
7 }
8 }
9}

{
"mcpServers": {
"make": {
"url": "https://eu2.make.com/mcp/server/•••••••••••••",
"headers": {
"Authorization": "Bearer •••••••••••••"
}
}
}
/\*\*
\* Reset the text fill color so that placeholder is visible
\*/
.npm\_\_react-simple-code-editor\_\_textarea:empty {
-webkit-text-fill-color: inherit !important;
}
/\*\*
\* Hack to apply on some CSS on IE10 and IE11
\*/
@media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
/\*\*
\* IE doesn't support '-webkit-text-fill-color'
\* So we use 'color: transparent' to make the text transparent on IE
\* Unlike other browsers, it doesn't affect caret color in IE
\*/
.npm\_\_react-simple-code-editor\_\_textarea {
color: transparent !important;
}
.npm\_\_react-simple-code-editor\_\_textarea::selection {
background-color: #accef7 !important;
color: transparent !important;
}
}

﻿

You've now connected your MCP toolbox to Cursor.

**Troubleshooting:** If an OAuth consent screen appears when you're trying to connect, your MCP toolbox URL or key is likely incorrect. For guidance, see [Configure your URL](/mcp-toolboxes#step-1-configure-your-url)﻿.

**MCP toolbox timeout:** Your MCP toolbox scenarios must finish running within 40 seconds. If a scenario runs longer, the connection times out and no outputs return to the client.

﻿

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

Connect to ChatGPT](/connect-to-chatgpt "Connect to ChatGPT")[NEXT

Connect to OpenAI](/connect-to-openai "Connect to OpenAI")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

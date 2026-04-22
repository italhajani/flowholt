# Connect to OpenAI API - Help Center

Source: https://help.make.com/connect-to-openai-api
Lastmod: 2026-04-08T14:40:14.095Z
Description: Help Center
Model Context Protocol

MCP toolboxes

# Connect to OpenAI API

1 min

In this guide, learn how to connect your MCP toolbox through the OpenAI API.

**Prerequisites**

* ﻿[MCP toolbox URL and key](/mcp-toolboxes#create-an-mcp-toolbox)﻿

To connect to your MCP toolbox through the OpenAI API:

1

Use the following configuration for your API call:

JSON

1curl https://api.openai.com/v1/responses \
2 -H "Content-Type: application/json" \
3 -H "Authorization: Bearer $OPENAI\_API\_KEY" \
4 -d '{
5 "model": "gpt-4.1",
6 "input": "List all available tools.",
7 "tools": [
8 {
9 "type": "mcp",
10 "server\_label": "make",
11 "server\_url": "<MCP TOOLBOX URL>/t/<TOOLBOX KEY>/<TRANSPORT METHOD>",
12 }
13 ]
14 }'

curl https://api.openai.com/v1/responses \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $OPENAI\_API\_KEY" \
-d '{
"model": "gpt-4.1",
"input": "List all available tools.",
"tools": [
{
"type": "mcp",
"server\_label": "make",
"server\_url": "<MCP TOOLBOX URL>/t/<TOOLBOX KEY>/<TRANSPORT METHOD>",
}
]
}'
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

2

In server\_url, replace the placeholders with your actual values:

* MCP TOOLBOX URL: The URL generated when you created the MCP toolbox.

* TOOLBOX KEY: The key generated when creating an MCP toolbox.

* TRANSPORT METHOD: The path of your preferred transport method. Stateless Streamable HTTP (/stateless) is recommended due to its connection reliability.

If you experience connection issues, add /stream instead of /stateless to the end of the URL. For SSE, add /sse instead.

Example configuration:

JSON

1curl https://api.openai.com/v1/responses \
2 -H "Content-Type: application/json" \
3 -H "Authorization: Bearer $OPENAI\_API\_KEY" \
4 -d '{
5 "model": "gpt-4.1",
6 "input": "List all available tools.",
7 "tools": [
8 {
9 "type": "mcp",
10 "server\_label": "make",
11 "server\_url": "https://eu2.make.com/mcp/server/•••••••••••••/t/•••••••••••••/stateless",
12 }
13 ]
14 }'

curl https://api.openai.com/v1/responses \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $OPENAI\_API\_KEY" \
-d '{
"model": "gpt-4.1",
"input": "List all available tools.",
"tools": [
{
"type": "mcp",
"server\_label": "make",
"server\_url": "https://eu2.make.com/mcp/server/•••••••••••••/t/•••••••••••••/stateless",
}
]
}'
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

You've now connected your MCP toolbox through the OpenAI API.

**MCP toolbox timeout:** Your MCP toolbox scenarios must finish running within 40 seconds. If a scenario runs longer, the connection times out and no outputs are returned to the client.

﻿

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

Connect to OpenAI](/connect-to-openai "Connect to OpenAI")[NEXT

Make Grid](/make-grid "Make Grid")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

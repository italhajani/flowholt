---
title: "Usage with Kiro | MCP Server  | Make Developer Hub"
url: https://developers.make.com/mcp-server/connect-using-oauth/usage-with-kiro
scraped_at: 2026-04-21T12:43:07.436479Z
---

1. Connect using OAuth

# Usage with Kiro

This guide outlines how to connect Make MCP server to Kiro using OAuth.

### hashtag Prerequisites

- Kiro arrow-up-right

Kiro arrow-up-right

### hashtag Connect to Kiro

To connect Make MCP server to Kiro:

1. In Kiro, click the ghost icon on the left sidebar.

In Kiro, click the ghost icon on the left sidebar.

1. Hover over the MCP servers section and click the Open MCP Config icon.
2. In the mcp.json configuration, add the following:

Hover over the MCP servers section and click the Open MCP Config icon.

In the mcp.json configuration, add the following:

```
mcp.json
```

If you experience connection issues, you can add /stateless or /stream to the end of the connection URL. For SSE, add /sse instead.

```
/stateless
```

```
/stream
```

```
/sse
```

1. Enter Ctrl + S (Windows) or Cmd + S (Mac) to save. The OAuth consent screen opens in a new browser window.
2. In the consent screen, select your organization and scopes, then click Allow .
3. Return to the MCP servers section to check whether Make MCP server connected successfully.

Enter Ctrl + S (Windows) or Cmd + S (Mac) to save. The OAuth consent screen opens in a new browser window.

```
Ctrl
```

```
S
```

```
Cmd
```

```
S
```

In the consent screen, select your organization and scopes, then click Allow .

Return to the MCP servers section to check whether Make MCP server connected successfully.

You have now connected Make MCP server to Kiro.

### hashtag Call tools on Kiro

You can call Make MCP tools in the chat:

1. To open the chat, enter Ctrl + L (Windows) or Cmd + L (Mac).
2. Enter a question related to your connected Make MCP tools.
3. When asked for permission to call a specific MCP tool, click Accept .

To open the chat, enter Ctrl + L (Windows) or Cmd + L (Mac).

```
Ctrl
```

```
L
```

```
Cmd
```

```
L
```

Enter a question related to your connected Make MCP tools.

When asked for permission to call a specific MCP tool, click Accept .

Kiro calls the relevant tool and responds to your question.

Last updated 28 days ago

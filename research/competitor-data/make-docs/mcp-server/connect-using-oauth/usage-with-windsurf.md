---
title: "Usage with Windsurf | MCP Server  | Make Developer Hub"
url: https://developers.make.com/mcp-server/connect-using-oauth/usage-with-windsurf
scraped_at: 2026-04-21T12:43:06.398822Z
---

1. Connect using OAuth

# Usage with Windsurf

This guide outlines how to connect Make MCP server to Windsurf using OAuth.

### hashtag Prerequisites

- Windsurf arrow-up-right
- Node.js arrow-up-right

Windsurf arrow-up-right

Node.js arrow-up-right

### hashtag Connect to Windsurf

To connect Make MCP server to Windsurf:

1. In Windsurf, click the Settings icon in the top-right corner, and select Windsurf Settings .
2. In Cascade, click the Open MCP Marketplace link next to MCP Servers .
3. In Installed MCPs , click the Settings icon to open the mcp.config.json configuration file.
4. Add the following configuration:

In Windsurf, click the Settings icon in the top-right corner, and select Windsurf Settings .

In Cascade, click the Open MCP Marketplace link next to MCP Servers .

In Installed MCPs , click the Settings icon to open the mcp.config.json configuration file.

```
mcp.config.json
```

Add the following configuration:

```
{"mcpServers":{"make":{"command":"npx","args":["-y","mcp-remote","https://mcp.make.com"]}}}
```

If you experience connection issues, you can add /stateless or /stream to the end of the connection URL.

```
/stateless
```

```
/stream
```

1. Enter Ctrl + S (Windows) or Cmd + S (Mac) to save. The OAuth consent screen opens in a new browser window.
2. In the consent screen, select your organization and scopes, then click Allow .
3. Return to the Installed MCPs section to check whether Make MCP server connected successfully.

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

Return to the Installed MCPs section to check whether Make MCP server connected successfully.

You have now connected Make MCP server to Windsurf.

### hashtag Call tools on Windsurf

You can call Make MCP tools in the chat:

1. Click the Toggle Cascade Side Bar icon in the top-right corner, or enter Ctrl + Alt + B (Windows) or Cmd + Option + B (Mac).
2. Enter a question related to your connected Make MCP tools.

Click the Toggle Cascade Side Bar icon in the top-right corner, or enter Ctrl + Alt + B (Windows) or Cmd + Option + B (Mac).

```
Ctrl
```

```
Alt
```

```
B
```

```
Cmd
```

```
Option
```

```
B
```

Enter a question related to your connected Make MCP tools.

Windsurf calls the relevant tool and responds to your question.

Last updated 28 days ago

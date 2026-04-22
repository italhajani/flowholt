---
title: "Usage with Claude Code | MCP Server  | Make Developer Hub"
url: https://developers.make.com/mcp-server/connect-using-oauth/usage-with-claude-code
scraped_at: 2026-04-21T12:43:05.638319Z
---

1. Connect using OAuth

# Usage with Claude Code

This guide outlines how to connect Make MCP server to Claude Code using OAuth.

### hashtag Prerequisites

- Claude Code arrow-up-right
- Node.js arrow-up-right

Claude Code arrow-up-right

Node.js arrow-up-right

### hashtag Connect to Claude Code

To connect Make MCP server to Claude Code:

1. In your terminal, open a new tab.
2. Run the following command, depending on your transport method:

In your terminal, open a new tab.

Run the following command, depending on your transport method:

Streamable HTTP

```
claude mcp add --transport http make https://mcp.make.com
```

If you experience connection issues, you can add /stateless or /stream to the end of the connection URL.

```
/stateless
```

```
/stream
```

Server-Sent Events (SSE)

```
claude mcp add --transport sse make https://mcp.make.com/sse
```

1. Run the command Claude .
2. Run /mcp to connect to available MCP servers.
3. In the OAuth consent screen in the new browser window, select your organization and scopes.
4. The response in the CLI indicates whether your Make server connected successfully.

Run the command Claude .

```
Claude
```

Run /mcp to connect to available MCP servers.

```
/mcp
```

In the OAuth consent screen in the new browser window, select your organization and scopes.

The response in the CLI indicates whether your Make server connected successfully.

You have now connected Make MCP server to Claude Code.

### hashtag Call tools on Claude Code

You can call Make MCP tools in the Claude CLI:

1. Enter a question related to your connected Make MCP tools.
2. When asked if you want to proceed, select Yes .

Enter a question related to your connected Make MCP tools.

When asked if you want to proceed, select Yes .

```
Yes
```

Claude Code calls the relevant tool and responds to your question.

Last updated 28 days ago

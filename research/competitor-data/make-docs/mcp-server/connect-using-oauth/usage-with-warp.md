---
title: "Usage with Warp | MCP Server  | Make Developer Hub"
url: https://developers.make.com/mcp-server/connect-using-oauth/usage-with-warp
scraped_at: 2026-04-21T12:43:07.525901Z
---

1. Connect using OAuth

# Usage with Warp

This guide outlines how to connect Make MCP server to Warp using OAuth.

### hashtag Prerequisites

- Warp arrow-up-right

Warp arrow-up-right

### hashtag Connect to Warp

To connect Make MCP server to Warp:

1. In Warp Drive, go to MCP Servers under Personal .
2. Click Add.
3. Enter the following configuration:

In Warp Drive, go to MCP Servers under Personal .

Click Add.

Enter the following configuration:

```
{"make":{"url":"https://mcp.make.com"}}
```

If you experience connection issues, you can add /stateless or /stream to the end of your connection URL. For SSE, add /sse instead.

```
/stateless
```

```
/stream
```

```
/sse
```

1. Click Save and wait for Make MCP server to connect.
2. In the OAuth consent screen, select your organization and scopes, then click Allow .

Click Save and wait for Make MCP server to connect.

In the OAuth consent screen, select your organization and scopes, then click Allow .

You've now connected Make MCP server to Warp.

### hashtag Call tools on Warp

To call Make MCP tools in the Warp terminal:

1. Enter a question related to your connected Make MCP tools.
2. When asked for permission to call a specific MCP tool, click Run .

Enter a question related to your connected Make MCP tools.

When asked for permission to call a specific MCP tool, click Run .

Warp calls the relevant tool and responds to your question.

Last updated 28 days ago

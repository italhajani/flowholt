---
title: "Usage with Gemini CLI | MCP Server  | Make Developer Hub"
url: https://developers.make.com/mcp-server/connect-using-oauth/usage-with-gemini-cli
scraped_at: 2026-04-21T12:43:07.319344Z
---

1. Connect using OAuth

# Usage with Gemini CLI

This guide outlines how to connect Make MCP server to Gemini CLI using OAuth.

### hashtag Prerequisites

- Gemini CLI arrow-up-right
- Node.js arrow-up-right

Gemini CLI arrow-up-right

Node.js arrow-up-right

### hashtag Connect to Gemini CLI

To connect Make MCP server to Gemini CLI:

1. In your terminal, run the following command, depending on your transport method:

In your terminal, run the following command, depending on your transport method:

Streamable HTTP

```
gemini mcp add make --scope user --transport http https://mcp.make.com
```

If you experience connection issues, you can add /stateless or /stream to the end of your connection URL.

```
/stateless
```

```
/stream
```

Server-Sent Events (SSE)

```
gemini mcp add make --scope user --transport sse https://mcp.make.com/sse
```

1. Run the Gemini command to start Gemini.
2. Run /mcp list to check if Make is among your configured MCP servers.
3. Run /mcp auth make to initiate authentication.
4. In the OAuth consent screen, select your organization and scopes, then click Allow .

Run the Gemini command to start Gemini.

```
Gemini
```

Run /mcp list to check if Make is among your configured MCP servers.

```
/mcp list
```

Run /mcp auth make to initiate authentication.

```
/mcp auth make
```

In the OAuth consent screen, select your organization and scopes, then click Allow .

You have now connected Make MCP server to Gemini CLI.

### hashtag Call tools on Gemini CLI

You can call Make MCP tools in Gemini CLI:

1. Enter a question related to your connected Make MCP tools.
2. Grant permission for the suggested tool.

Enter a question related to your connected Make MCP tools.

Grant permission for the suggested tool.

Gemini CLI calls the relevant tool and responds to your question.

Last updated 28 days ago

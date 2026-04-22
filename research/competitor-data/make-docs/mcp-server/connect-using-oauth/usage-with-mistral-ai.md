---
title: "Usage with Mistral AI | MCP Server  | Make Developer Hub"
url: https://developers.make.com/mcp-server/connect-using-oauth/usage-with-mistral-ai
scraped_at: 2026-04-21T12:43:04.205502Z
---

1. Connect using OAuth

# Usage with Mistral AI

This guide outlines how to connect Make MCP server to Mistral AI's Le Chat using OAuth.

### hashtag Prerequisites

- Mistral AI account

Mistral AI account

### hashtag Connect to Mistral AI

To connect Make MCP server to Mistral AI:

1. Open Mistral AI and go to Le Chat.
2. Click Intelligence in the left sidebar and select Connectors .
3. Click Add Connector on the right side.
4. Go to the Custom MCP Connector tab.
5. In Connector Name , name your MCP server to identify it later, for example, "Make."
6. In Connector Server , add the following URL:

Open Mistral AI and go to Le Chat.

Click Intelligence in the left sidebar and select Connectors .

Click Add Connector on the right side.

Go to the Custom MCP Connector tab.

In Connector Name , name your MCP server to identify it later, for example, "Make."

In Connector Server , add the following URL:

```
https://mcp.make.com
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

1. In Authentication Method , select OAuth2.1 from the dropdown.
2. Click Connect .
3. In the OAuth consent screen, select the organization in Organization and its granted scopes.
4. Click Allow to proceed.

In Authentication Method , select OAuth2.1 from the dropdown.

Click Connect .

In the OAuth consent screen, select the organization in Organization and its granted scopes.

Click Allow to proceed.

You've now connected Make MCP server to Mistral AI.

To use it in a chat, click your Make MCP server in the Connectors section, then click New Chat .

Last updated 28 days ago

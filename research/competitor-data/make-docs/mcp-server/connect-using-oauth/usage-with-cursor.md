---
title: "Usage with Cursor | MCP Server  | Make Developer Hub"
url: https://developers.make.com/mcp-server/connect-using-oauth/usage-with-cursor
scraped_at: 2026-04-21T12:43:04.779106Z
---

1. Connect using OAuth

# Usage with Cursor

This guide outlines how to connect Make MCP server to Cursor using OAuth.

### hashtag Prerequisites

- Cursor account (Desktop version)

Cursor account (Desktop version)

### hashtag Connect to Cursor

To connect Make MCP server to Cursor:

1. Open your Cursor account.
2. On the upper right-hand side, click the gear icon to open the Cursor Settings dialog.
3. In the left sidebar, click Tools & Integrations (or Tools , if you're on the Free Plan).
4. Under MCP Tools , click Add Custom MCP to open the editor for the mcp.json file.

Open your Cursor account.

On the upper right-hand side, click the gear icon to open the Cursor Settings dialog.

In the left sidebar, click Tools & Integrations (or Tools , if you're on the Free Plan).

Under MCP Tools , click Add Custom MCP to open the editor for the mcp.json file.

```
mcp.json
```

1. In the editor, add the configuration.

In the editor, add the configuration.

Use the following URL:

Configuration example:

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

1. In MCP Tools , you'll see Make added as an MCP tool. Click Needs login .

In MCP Tools , you'll see Make added as an MCP tool. Click Needs login .

1. In the dialog, click Open , which opens an OAuth consent screen.
2. In the Organization dropdown, select the organization that can access the server.
3. Select its granted scopes.
4. Click Allow , then Open Cursor .
5. Click Open to allow the extension to open the URI.

In the dialog, click Open , which opens an OAuth consent screen.

In the Organization dropdown, select the organization that can access the server.

Select its granted scopes.

Click Allow , then Open Cursor .

Click Open to allow the extension to open the URI.

You have now connected Make MCP server to Cursor.

Last updated 28 days ago

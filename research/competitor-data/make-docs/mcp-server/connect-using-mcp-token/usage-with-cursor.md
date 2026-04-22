---
title: "Usage with Cursor | MCP Server  | Make Developer Hub"
url: https://developers.make.com/mcp-server/connect-using-mcp-token/usage-with-cursor
scraped_at: 2026-04-21T12:43:01.525520Z
---

1. Connect using MCP token

# Usage with Cursor

This guide outlines how to connect Make MCP server to Cursor using an MCP token.

### hashtag Prerequisites

- Cursor account (Desktop version)
- MCP token

Cursor account (Desktop version)

MCP token

### hashtag Connect to Cursor

To connect Make MCP server to Cursor:

1. Open your Cursor account.
2. On the upper right-hand side, click the gear icon to open the Cursor Settings dialog.
3. In the left sidebar, click Tools & Integrations (or Tools , if you're on the Free Plan).
4. Under MCP Tools , click Add Custom MCP to open the editor for the mcp.json file.
5. In the editor, add the configuration.

Open your Cursor account.

On the upper right-hand side, click the gear icon to open the Cursor Settings dialog.

In the left sidebar, click Tools & Integrations (or Tools , if you're on the Free Plan).

Under MCP Tools , click Add Custom MCP to open the editor for the mcp.json file.

```
mcp.json
```

In the editor, add the configuration.

Use the following URL, with your zone embedded in the URL:

```
https://<MAKE_ZONE>/mcp/stateless
```

Configuration example:

```
{"mcpServers":{"make":{"url":"https://<MAKE_ZONE>/mcp/stateless","headers":{"Authorization":"Bearer ${env:MCP_TOKEN}"}}}
```

If you experience connection issues, you can add /stream instead of /stateless to the end of your connection URL. For SSE, add /sse instead.

```
/stream
```

```
/stateless
```

```
/sse
```

1. Replace <MAKE_ZONE> and <MCP_TOKEN> with your actual values.

Replace <MAKE_ZONE> and <MCP_TOKEN> with your actual values.

```
<MAKE_ZONE>
```

```
<MCP_TOKEN>
```

- MAKE_ZONE - The zone your organization is hosted in (e.g., eu2.make.com ).
- MCP_TOKEN - You can generate your MCP token in your Make profile.

MAKE_ZONE - The zone your organization is hosted in (e.g., eu2.make.com ).

```
MAKE_ZONE
```

```
eu2.make.com
```

MCP_TOKEN - You can generate your MCP token in your Make profile.

```
MCP_TOKEN
```

You've now connected Make MCP server to Cursor.

Last updated 28 days ago

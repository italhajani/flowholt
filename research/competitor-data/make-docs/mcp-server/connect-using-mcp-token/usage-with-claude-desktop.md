---
title: "Usage with Claude Desktop | MCP Server  | Make Developer Hub"
url: https://developers.make.com/mcp-server/connect-using-mcp-token/usage-with-claude-desktop
scraped_at: 2026-04-21T12:43:01.590552Z
---

1. Connect using MCP token

# Usage with Claude Desktop

This guide outlines how to connect Make MCP server to Claude Desktop using an MCP token.

### hashtag Prerequisites

- Claude Desktop account (Pro plan)
- MCP token

Claude Desktop account (Pro plan)

MCP token

### hashtag Connect to Claude Desktop

To connect Make MCP server to Claude Desktop:

1. Open your Claude Desktop account.
2. Click your profile name on the left sidebar, then Settings .
3. In Settings , navigate to Connectors .
4. Click Add custom connector , which opens a dialog.
5. In the URL field, add the following URL:

Open your Claude Desktop account.

Click your profile name on the left sidebar, then Settings .

In Settings , navigate to Connectors .

Click Add custom connector , which opens a dialog.

In the URL field, add the following URL:

```
https://<MAKE_ZONE>/mcp/u/<MCP_TOKEN>/stateless
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

1. Click Add .

Click Add .

You've now connected Make MCP server to Claude Desktop.

Last updated 28 days ago

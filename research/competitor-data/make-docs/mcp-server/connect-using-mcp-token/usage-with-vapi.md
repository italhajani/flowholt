---
title: "Usage with Vapi | MCP Server  | Make Developer Hub"
url: https://developers.make.com/mcp-server/connect-using-mcp-token/usage-with-vapi
scraped_at: 2026-04-21T12:43:03.341935Z
---

1. Connect using MCP token

# Usage with Vapi

This guide outlines how to connect Make MCP server to Vapi.

### hashtag Prerequisites

- Vapi account
- MCP token

Vapi account

MCP token

### hashtag Connect to Vapi

To connect Make MCP server to Vapi:

1. Open your Vapi account.
2. Navigate to Tools on the left sidebar.
3. Click the Create Tool button, then select MCP .
4. Configure the tool name and describe when to use the tool.
5. In Server URL , add the following URL:

Open your Vapi account.

Navigate to Tools on the left sidebar.

Click the Create Tool button, then select MCP .

Configure the tool name and describe when to use the tool.

In Server URL , add the following URL:

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

Optionally, to control which scenarios are available as tools, you can further configure the URL according to the levels outlined in scenarios as tools access control .

1. In Timeout , enter an appropriate timeout for your use case.
2. In MCP Settings , select Streamable HTTP or Server-Sent Events (SSE).
3. Click Save .

In Timeout , enter an appropriate timeout for your use case.

In MCP Settings , select Streamable HTTP or Server-Sent Events (SSE).

Click Save .

You've now connected Make MCP server to Vapi.

MCP tool calls from Vapi Assistants may exceed Make API rate limits, resulting in rate limit errors. Check your Make API rate limit, as defined in your plan, in Make API rate limits arrow-up-right .

Last updated 28 days ago

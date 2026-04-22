---
title: "Usage with OpenAI | MCP Server  | Make Developer Hub"
url: https://developers.make.com/mcp-server/connect-using-mcp-token/usage-with-openai
scraped_at: 2026-04-21T12:43:02.595168Z
---

1. Connect using MCP token

# Usage with OpenAI

This guide outlines how to connect Make MCP server to OpenAI using an MCP token.

### hashtag Prerequisites

- OpenAI Platform account
- MCP token

OpenAI Platform account

MCP token

### hashtag Connect to OpenAI

To connect Make MCP server to OpenAI:

1. In OpenAI's Playground, sign in to your OpenAI account.
2. Navigate to Prompts .
3. In Tools , click the + button.
4. Select MCP Server .
5. In the dialog, click Add new to display the form below.

In OpenAI's Playground, sign in to your OpenAI account.

Navigate to Prompts .

In Tools , click the + button.

Select MCP Server .

In the dialog, click Add new to display the form below.

1. In URL , add the following URL:

In URL , add the following URL:

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

1. Replace <MAKE_ZONE> with your actual values.

Replace <MAKE_ZONE> with your actual values.

```
<MAKE_ZONE>
```

- MAKE_ZONE - The zone your organization is hosted in (e.g., eu2.make.com ).

MAKE_ZONE - The zone your organization is hosted in (e.g., eu2.make.com ).

```
MAKE_ZONE
```

```
eu2.make.com
```

1. In Label , name your Make MCP server.
2. In Authentication , select Access token / API key .
3. Add your MCP token to the field that requires an access token.
4. Click Connect .

In Label , name your Make MCP server.

In Authentication , select Access token / API key .

Add your MCP token to the field that requires an access token.

Click Connect .

You've now connected Make MCP server to OpenAI.

Last updated 28 days ago

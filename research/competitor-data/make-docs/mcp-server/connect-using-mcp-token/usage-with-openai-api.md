---
title: "Usage with OpenAI API | MCP Server  | Make Developer Hub"
url: https://developers.make.com/mcp-server/connect-using-mcp-token/usage-with-openai-api
scraped_at: 2026-04-21T12:43:03.961130Z
---

1. Connect using MCP token

# Usage with OpenAI API

This guide outlines how to connect Make MCP server to the OpenAI API.

### hashtag Prerequisites

- MCP token

MCP token

### hashtag Connect to OpenAI API

To connect Make MCP server to the OpenAI API:

1. Configure your API call with the following:

Configure your API call with the following:

```
curlhttps://api.openai.com/v1/responses\-H"Content-Type: application/json"\-H"Authorization: Bearer$OPENAI_API_KEY"\-d'{"model": "gpt-4.1","input": "List all available tools.","tools": [{"type": "mcp","server_label": "make","server_url": "https://<MAKE_ZONE>/mcp/stateless",}]}'
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

You've now connected Make MCP server to the OpenAI API.

Last updated 28 days ago

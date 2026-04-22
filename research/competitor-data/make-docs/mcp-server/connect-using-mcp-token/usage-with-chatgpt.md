---
title: "Usage with ChatGPT | MCP Server  | Make Developer Hub"
url: https://developers.make.com/mcp-server/connect-using-mcp-token/usage-with-chatgpt
scraped_at: 2026-04-21T12:43:02.740243Z
---

1. Connect using MCP token

# Usage with ChatGPT

This guide outlines how to connect Make MCP server with ChatGPT using an MCP token.

### hashtag Prerequisites

- ChatGPT account (paid subscription)
- MCP token

ChatGPT account (paid subscription)

MCP token

### hashtag Connect to ChatGPT

To connect Make MCP server to ChatGPT:

1. Open the web version of ChatGPT.
2. Click on your profile name on the left sidebar.

Open the web version of ChatGPT.

Click on your profile name on the left sidebar.

1. Click Settings to open the settings dialog.
2. Navigate to the Connectors section, then to Advanced settings .

Click Settings to open the settings dialog.

Navigate to the Connectors section, then to Advanced settings .

1. In Advanced settings , enable Developer mode .
2. Return to Connectors , and click the Create button that is now visible in the top-right corner.
3. In the New Connector dialog, name your MCP server.
4. In the MCP Server URL field, add the following URL:

In Advanced settings , enable Developer mode .

Return to Connectors , and click the Create button that is now visible in the top-right corner.

In the New Connector dialog, name your MCP server.

In the MCP Server URL field, add the following URL:

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
- MCP_TOKEN - You can generate your MCP API token in your Make profile.

MAKE_ZONE - The zone your organization is hosted in (e.g., eu2.make.com ).

```
MAKE_ZONE
```

```
eu2.make.com
```

MCP_TOKEN - You can generate your MCP API token in your Make profile.

```
MCP_TOKEN
```

1. In the Authentication dropdown, select No authentication .
2. Select the I trust this application checkbox .
3. Click the Create button.

In the Authentication dropdown, select No authentication .

Select the I trust this application checkbox .

Click the Create button.

You have now connected Make MCP server to ChatGPT. In Connectors , you can click on it to expand its details and select which tools ChatGPT can use.

### hashtag Enable in chat

After adding Make MCP server, you can enable it in the chat:

1. Open a new chat in ChatGPT.
2. In the left-hand corner of the message bar, click the + sign to open a dropdown.
3. Click More , then Developer Mode .

Open a new chat in ChatGPT.

In the left-hand corner of the message bar, click the + sign to open a dropdown.

Click More , then Developer Mode .

1. Click Add sources .
2. Enable Make MCP server.

Click Add sources .

Enable Make MCP server.

Last updated 28 days ago

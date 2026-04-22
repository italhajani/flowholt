---
title: "Connect using MCP token | MCP Server  | Make Developer Hub"
url: https://developers.make.com/mcp-server/connect-using-mcp-token
scraped_at: 2026-04-21T12:41:08.410100Z
---

# Connect using MCP token

You can connect Make MCP server to a client using an MCP token in the connection URL. An MCP token is an API token that you create in Make for adding Make MCP server to an MCP client.

### hashtag Obtain MCP token

To obtain an MCP token:

1. In the top-right corner of your Make account, click your name.
2. Click Profile .
3. Navigate to the API access tab.
4. In Tokens , click Add token , which opens a dialog.

In the top-right corner of your Make account, click your name.

Click Profile .

Navigate to the API access tab.

In Tokens , click Add token , which opens a dialog.

1. Select your desired scopes, including the mcp:use scope if you want to make your scenarios available as tools.
2. In Label , name your API token.
3. Click Add .

Select your desired scopes, including the mcp:use scope if you want to make your scenarios available as tools.

```
mcp:use
```

In Label , name your API token.

Click Add .

You have now generated an MCP token for your MCP client. Include this token in the connection URL. To complete the connection, refer to the Usage page of your MCP client (e.g., Usage with Cursor).

An MCP token is a secret key. Treat it as sensitive information and share it only with trusted parties.

### hashtag Access control

To control which scenarios are available as tools through your MCP token, see Scenarios as tools access control .

Last updated 4 months ago

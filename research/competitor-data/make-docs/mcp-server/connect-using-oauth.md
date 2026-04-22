---
title: "Connect using OAuth | MCP Server  | Make Developer Hub"
url: https://developers.make.com/mcp-server/connect-using-oauth
scraped_at: 2026-04-21T12:41:08.862495Z
---

# Connect using OAuth

You can connect Make MCP server to MCP clients using OAuth.

OAuth is recommended due to its simple and secure setup, with a universal URL that eliminates the need to configure the URL with an MCP token.

### hashtag Connection URL

To connect Make MCP server using OAuth, use this URL for Stateless HTTP Streamable:

```
https://mcp.make.com
```

If you experience connection issues, you can add /stateless or /stream to the end of the URL. If your client only supports SSE, add /sse instead.

```
/stateless
```

```
/stream
```

```
/sse
```

### hashtag Access control

While connecting Make MCP server with an MCP client, you will select the organization and granted scopes in the OAuth consent screen. Scopes determine the tools available to the MCP client.

Consent screen example:

The Run your scenarios scope provides access to all on-demand and active scenarios within a specific organization.

```
Run your scenarios
```

For more granular control, a Teams plan arrow-up-right or higher allows you to limit scenario access to specific teams in your organization, as you can create user accounts that have access only to particular teams.

To complete the connection, refer to the Usage page of your MCP client (e.g., Usage with Cursor).

Last updated 1 month ago

---
title: "Make MCP Server | MCP Server  | Make Developer Hub"
url: https://developers.make.com/mcp-server/
scraped_at: 2026-04-21T12:40:58.854856Z
---

# message-bot Make MCP Server

Make MCP server allows AI systems, such as large language models (LLMs), to run scenarios and manage the contents of your Make account. Model Context Protocol (MCP) is a communication standard between AI and external systems. It enables safe interactions by defining endpoints and providing authentication.

Benefits

- Creates bidirectional communication between AI and Make
- Allows AI to access and manage elements of your Make account
- Turns your active and on-demand scenarios into callable tools for AI

Creates bidirectional communication between AI and Make

Allows AI to access and manage elements of your Make account

Turns your active and on-demand scenarios into callable tools for AI

### hashtag How Make MCP server works

AI systems like Claude and ChatGPT act as MCP clients of Make MCP server. The server provides them access to scenario run and management tools that enable the following actions:

- Run active and on-demand scenarios
- View and modify scenarios and their related entities (e.g., connections, webhooks, and data stores)
- View and modify teams and organizations

Run active and on-demand scenarios

View and modify scenarios and their related entities (e.g., connections, webhooks, and data stores)

View and modify teams and organizations

When you connect Make MCP server to an MCP client, your selected scopes determine the callable tools available on the server.

Scenario run ( Run your scenarios ) tools are available to all plans, and management ( View and modify ...) tools are available to paid plans.

Scenario inputs and outputs

When using scenarios as MCP tools, define scenario inputs and outputs arrow-up-right to help AI understand what data to receive and send:

- Inputs: parameters that AI fills with data when the scenario runs
- Outputs: data returned from the scenario to your AI

Inputs: parameters that AI fills with data when the scenario runs

Outputs: data returned from the scenario to your AI

Detailed scenario descriptions are strongly recommended. They help your AI understand the purpose of the scenario and improve the reliability of your prompts.

### hashtag Available transport methods

Make MCP server is a cloud-based server hosted by Make, running via Streamable HTTP and Server-Sent Events (SSE).

#### hashtag Clients with Stateless Streamable HTTP support

Stateless Streamable HTTP is Make's default transport method due to its connection reliability. It is recommended when connecting to MCP clients that support Streamable HTTP.

Use the following connection URLs, depending on your connection type:

In the above configuration, replace <MAKE_ZONE> and <MCP_TOKEN> with your actual values.

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

To control which scenarios are available as tools through your MCP token, see Scenarios as tools access control .

Optionally, you can append the following advanced query parameters to the URL for a more customized experience:

- ?maxToolNameLength=<length> - By default, generated tool names are cropped to a maximum of 56 characters to ensure compatibility with most AI systems. You can customize this behavior by specifying the maximum generated tool name length using this parameter. The allowed range is 32 to 160 characters.

?maxToolNameLength=<length> - By default, generated tool names are cropped to a maximum of 56 characters to ensure compatibility with most AI systems. You can customize this behavior by specifying the maximum generated tool name length using this parameter. The allowed range is 32 to 160 characters.

```
?maxToolNameLength=<length>
```

Authorization in headers support

If your client supports sending authorization in HTTP headers, you can use the following URL:

Specify the MCP token in the Authorization header as follows:

#### hashtag Clients with Streamable HTTP support

If your MCP client supports Streamable HTTP,  you can use /stream at the end of the connection URL specified for your chosen connection type ( OAuth or MCP token ).

```
/stream
```

#### hashtag Clients with Server-Sent Events (SSE) support

If your MCP client supports SSE, use the following connection URLs, depending on your connection type:

In the above configuration, replace <MAKE_ZONE> and <MCP_TOKEN> with your actual values.

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

To control which scenarios are available as tools through your MCP token, see Scenarios as tools access control .

Optionally, you can append the following advanced query parameters to the URL for a more customized experience:

- ?maxToolNameLength=<length> - By default, generated tool names are cropped to a maximum of 56 characters to ensure compatibility with most AI systems. You can customize this behavior by specifying the maximum generated tool name length using this parameter. The allowed range is 32 to 160 characters.

?maxToolNameLength=<length> - By default, generated tool names are cropped to a maximum of 56 characters to ensure compatibility with most AI systems. You can customize this behavior by specifying the maximum generated tool name length using this parameter. The allowed range is 32 to 160 characters.

```
?maxToolNameLength=<length>
```

Authorization in headers support

If your client supports sending authorization in HTTP headers, you can use the following URL:

Specify the MCP token in the Authorization header as follows:

#### hashtag Clients without SSE support

If your MCP client does not support SSE, use the Cloudflare mcp-remote proxy for compatibility. Refer to Cloudflare's MCP Remote Proxy Guide arrow-up-right for more details.

```
mcp-remote
```

Configuration example:

Configuration example:

### hashtag Timeouts for tool calls

Calls from MCP clients to tools on Make MCP server have timeout limits for returning output. Timeouts vary depending on the tool type called and the authorization and transport method used.

#### hashtag Scenario run tool timeout limits

- https://mcp.make.com (OAuth): 25 seconds
- https://<MAKE_ZONE>/mcp/<TRANSPORT> (MCP token): 40 seconds

https://mcp.make.com (OAuth): 25 seconds

```
https://mcp.make.com
```

https://<MAKE_ZONE>/mcp/<TRANSPORT> (MCP token): 40 seconds

```
https://<MAKE_ZONE>/mcp/<TRANSPORT>
```

Retrieve outputs after timeout

Even after a scenario run tool call times out, the called scenario continues running in Make for up to 40 minutes, and you can retrieve the output after the scenario finishes its run.

The call returns a timeout response that includes the executionId , which the MCP client can use to retrieve the output, once ready, with the corresponding tool.

```
executionId
```

Example response:

Select the scenarios:read scope to enable MCP clients to retrieve outputs after timeout once a scenario run finishes.

```
scenarios:read
```

#### hashtag Management tool timeout limits

- https://mcp.make.com (OAuth): 30 seconds
- https://<MAKE_ZONE>/mcp/<TRANSPORT> (MCP token, direct OAuth): Stateless Streamable HTTP ( /stateless ) transport: 60 seconds SSE ( /sse ) and Streamable HTTP ( /stream ) transports: 5 minutes, 20 seconds

https://mcp.make.com (OAuth): 30 seconds

```
https://mcp.make.com
```

https://<MAKE_ZONE>/mcp/<TRANSPORT> (MCP token, direct OAuth):

```
https://<MAKE_ZONE>/mcp/<TRANSPORT>
```

- Stateless Streamable HTTP ( /stateless ) transport: 60 seconds
- SSE ( /sse ) and Streamable HTTP ( /stream ) transports: 5 minutes, 20 seconds

Stateless Streamable HTTP ( /stateless ) transport: 60 seconds

```
/stateless
```

SSE ( /sse ) and Streamable HTTP ( /stream ) transports: 5 minutes, 20 seconds

```
/sse
```

```
/stream
```

Management tool calls are typically fast and rarely time out. If you still experience timeouts when using https://mcp.make.com , switch to a https://<MAKE_ZONE>/mcp/<TRANSPORT> URL for longer timeouts.

```
https://mcp.make.com
```

```
https://<MAKE_ZONE>/mcp/<TRANSPORT>
```

Last updated 3 months ago

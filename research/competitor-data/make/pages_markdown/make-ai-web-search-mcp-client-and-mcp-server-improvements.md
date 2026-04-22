# Make AI Web Search, MCP client and MCP server improvements - Help Center

Source: https://help.make.com/make-ai-web-search-mcp-client-and-mcp-server-improvements
Lastmod: 2026-01-19T11:59:04.908Z
Description: Run secure, real-time web searches directly in scenarios, for precise results. Automate tasks with AI using MCP tools; select tools and execute automatically. Make MCP server now uses Stateless Streamable HTTP for reliable connections.
Release notes

2025

# Make AI Web Search, MCP client and MCP server improvements

3 min

## New app: Make AI Web Search

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/iRjHJsjSF6I9BhtVtxd1S-20251113-094417.png "Document image")

﻿

We've released Make AI Web Search, a built-in app that lets you search and get real-time information directly in your scenarios﻿. You can run all web searches securely within Make﻿, without relying on external integrations.

Use the **Generate a response** module to run a web search based on your prompt. You can select whether you want the AI's text response to be parsed as JSON and apply location-based filters. These options give you more control over the search context and the format of the AI-generated output, making the results easier to use in the rest of your scenario﻿.

For more details and credit usage information, refer to the [Make AI Web Search documentation](https://apps.make.com/make-ai-web-search "Make AI Web Search documentation").

## MCP Client: Execute an action with AI

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/-I9C4UH4mVqNS2bdpU3tq-20251106-140225.png "Document image")

﻿

We've added **Execute an action with AI**, a new MCP Client module that uses AI to complete tasks with MCP tools. Select which tools the AI can access, describe the task, and the module automatically identifies and executes the right tool.

For more information, refer to the [MCP Client documentation](https://apps.make.com/mcp-client "MCP Client documentation").

## Stateless Streamable HTTP transport in Make MCP server

Make MCP server now uses Stateless Streamable HTTP as the default transport method for more reliable connections. Use this method when connecting to any MCP client that supports Streamable HTTP. For clients that support only SSE, continue using the SSE transport method.

To connect Make﻿ MCP server to a client, see the [Developer Hub documentation](https://developers.make.com/mcp-server/ "Developer Hub documentation").

Updated 19 Jan 2026

Did this page help you?

Yes

No

[PREVIOUS

Introducing Feature controls](/introducing-feature-controls "Introducing Feature controls")[NEXT

New Make AI Agents Reasoning feature: OpenAI reasoning model users must verify organization](/new-make-ai-agents-reasoning-feature-openai-reasoning-model-users-must-verify-organization "New Make AI Agents Reasoning feature: OpenAI reasoning model users must verify organization")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

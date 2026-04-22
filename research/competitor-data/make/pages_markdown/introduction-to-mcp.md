# Introduction to MCP - Help Center

Source: https://help.make.com/introduction-to-mcp
Lastmod: 2026-02-09T09:58:48.428Z
Description: Discover Model Context Protocol (MCP) with Make: how it works, benefits, key concepts, and MCP options.
Model Context Protocol

# Introduction to MCP

5 min

Model Context Protocol (MCP) is a protocol that helps AI and other systems communicate easily and securely. It connects AI applications, such as Claude and ChatGPT, to external systems by providing access to tools and knowledge. An MCP server is the program that provides this connection between systems.

Make provides its own MCP server that connects Make﻿ directly to AI. When connected using MCP, Make﻿ and AI build on each other's strengths: Make﻿ gives AI access to its large network of connections to third-party services and data, while AI intelligently chooses the right Make﻿ resource to use for each task.

In this guide, learn more about using MCP with Make, including key concepts, MCP options, and where to go next to get started.

## **Benefits of using MCP**

MCP offers several benefits, both in general and when used with Make through Make MCP server.

**Benefits of MCP:**

* Extend what AI can do for you and what it knows with external tools and resources

* One universal connection to any tool or data source

* Give AI real-time access to external data beyond its training data

* Allow AI to perform specific actions for you in external systems based on requests

**Benefits of Make MCP server:**

* Use one MCP server to access a wide range of tools instead of multiple servers

* Gain visibility into the tools that AI uses, with all tool runs visible in Make﻿

* Use tools that you built in Make﻿ to help AI perform specific tasks, so you control the tools used and support reliable and cost-effective AI decision-making

## Key concepts

In the context of Make﻿, MCP uses these core concepts:

* **MCP client:** AI applications and coding tools, such as ChatGPT, Claude, and Cursor, that call MCP tools using MCP.

* **MCP tools:** The tools available on an MCP server that MCP clients use to perform actions, for example, listing and adding customers in a CRM system. In Make﻿, MCP tools are active, on-demand scenarios﻿ and other elements of your Make﻿ account.

* **MCP server**: Programs that provide MCP tools, resources, and prompts to MCP clients.

* **MCP resources:** Static files, such as text, images, and video, that an MCP server shares with the MCP client to reference.

* **Make MCP server**: Make﻿ acting as a server that exposes MCP tools to MCP clients.

* **Scenario:** The automated workflow that you build in Make﻿.

* **Transport method**: The format for exchanging data between MCP servers and clients, for example, Streamable HTTP and Server-Sent-Events (SSE).

* **Connection type**: The method used to securely authenticate connections to an MCP server, for example, OAuth or API keys.

## How MCP works with Make

When you connect MCP clients like Claude to Make﻿, your scenarios﻿ and other Make﻿ resources become available as tools on an MCP server. When you send an MCP client a request, the client reviews tools, chooses the right one based on its name and description, runs it, and retrieves the outputs.

## Options for using MCP with Make

You have two ways to use MCP with Make﻿: **Make MCP server** and **MCP toolboxes**.

### Make MCP server

﻿[Make MCP server](/make-mcp-server)﻿ connects Make﻿ to MCP clients to allow clients to perform actions for you. It provides access to both **scenario run** tools and **management** tools. There is no option to limit MCP client access to a specific set of scenarios﻿ or give access to other users.

Use it when you want to:

* Run scenarios and manage your Make account from a MCP client

* Set up quickly without the need to restrict the available tools

### MCP toolboxes

﻿[MCP toolboxes](/mcp-toolboxes)﻿ are dedicated Make MCP servers that consist of a specific set of scenarios﻿ used as tools. With easy tool selection and the option to generate multiple keys, they're ideal when different clients need different sets of tools.

Use it when you want to:

* Control which tools are available to MCP clients

* Securely share different tool sets with team members and clients

To get started, refer to the documentation of the MCP feature that best suits your needs.

Updated 09 Feb 2026

Did this page help you?

Yes

No

[PREVIOUS

Model Context Protocol](/model-context-protocol "Model Context Protocol")[NEXT

Make MCP server](/make-mcp-server "Make MCP server")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

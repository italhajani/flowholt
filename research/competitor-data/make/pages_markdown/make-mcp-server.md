# Make MCP server - Help Center

Source: https://help.make.com/make-mcp-server
Lastmod: 2026-02-19T12:42:47.623Z
Description: Learn how to use Make MCP server, understand requirements, and connect to MCP clients.
Model Context Protocol

# Make MCP server

3 min

﻿Make﻿ MCP server allows MCP clients, such as Claude and ChatGPT, to access tools and resources in your Make﻿ account and perform actions for you, such as running scenarios﻿, checking data stores, or inviting members to an organization.

In this guide, learn when to use Make MCP server, its setup requirements, and how to connect to an MCP client.

For full Make﻿ MCP server technical requirements, refer to the documentation in the [Make Developer Hub](https://developers.make.com/mcp-server/ "Make Developer Hub").

## When to use Make MCP server

Use Make﻿ MCP server when:

* You want to run scenarios﻿ and manage your Make﻿ account from an MCP client

* You want minimal setup when connecting to a client

* You don't require granular control over which scenarios﻿ in your organization the MCP client uses as tools

MCP toolboxes are another way to use MCP with Make. To learn more, see [MCP toolboxes](/mcp-toolboxes)﻿.

## Permissions for MCP tools

Scopes determine the tools available to MCP clients. Make MCP server scopes include:

* **Scenario run scopes** allow clients to view and run activated scenarios﻿ with on-demand scheduling.

* **Management scopes** allow clients to view and modify the contents of your Make﻿ account, such as scenarios﻿, teams, connections, webhooks, and data stores.

The scopes available to you depend on your [plan](https://www.make.com/en/pricing "plan"): users on all plans can use **scenario run** scopes, and those on paid plans can use **management** scopes.

You select scopes when you connect to an MCP client, either in an OAuth consent screen or MCP token dialog. Only OAuth allows you to restrict access to a specific Make﻿ organization.

## Requirements for scenarios﻿ as MCP tools

You must set up the following to turn your scenarios﻿ into tools for MCP clients:

* Set your scenarios﻿ to **active** with **on-demand** scheduling.

* Select the **scenario run** scope (the Run your scenarios scope when connecting using OAuth, and the mcp:use scope when connecting using an MCP token).

* Configure [scenario inputs and outputs](/scenario-inputs-and-outputs)﻿ to define the data exchanged between Make﻿ and MCP clients.

## Connect Make MCP server to MCP clients

When you connect Make MCP server to an MCP client, you allow the client to use Make﻿ resources to respond to requests.

To connect Make﻿ MCP server to MCP clients:

1. Prepare the scenarios﻿ that you want to use as MCP tools.

2. Choose an MCP client, such as Claude and ChatGPT.

3. Choose your connection type:[**OAuth**](https://developers.make.com/mcp-server/connect-using-oauth "OAuth")or an [**MCP token**](https://developers.make.com/mcp-server/connect-using-mcp-token "MCP token").

4. Follow the steps in the client's Usage page in [OAuth](https://developers.make.com/mcp-server/connect-using-oauth "OAuth") or [MCP token](https://developers.make.com/mcp-server/connect-using-mcp-token "MCP token"). If you don't see your client, refer to its documentation for connecting to remote MCP servers.

For a guided example, see [Get started with Make MCP server](/get-started-with-make-mcp-server)﻿.

Updated 19 Feb 2026

Did this page help you?

Yes

No

[PREVIOUS

Introduction to MCP](/introduction-to-mcp "Introduction to MCP")[NEXT

Get started with Make MCP server](/get-started-with-make-mcp-server "Get started with Make MCP server")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

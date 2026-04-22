# MCP toolboxes - Help Center

Source: https://help.make.com/mcp-toolboxes
Lastmod: 2026-03-30T07:50:28.761Z
Description: Create and manage MCP toolboxes: select and configure tools, generate keys, and connect to MCP clients. 
Model Context Protocol

# MCP toolboxes

11 min

MCP toolboxes are dedicated Make﻿ MCP servers that allow MCP clients, such as Claude and ChatGPT, to access and use your scenarios﻿. They consist of a specific set of MCP tools (scenarios that you've set to active with on-demand scheduling).

In this guide, learn when to use MCP toolboxes, their key features, and how to work with them in Make﻿ and MCP clients.

﻿

## When to use MCP toolboxes

Use MCP toolboxes when:

* You want more control over the tools available to MCP clients

* You want a secure way to share MCP tools with team members and clients

Make MCP server is another way to use MCP with Make. To learn more, see [Make MCP server](/make-mcp-server)﻿.

## Key features

MCP toolboxes offer these features:

* Tool management in Make﻿ (add, configure, and delete)

* Token-based authorization using keys

* A unique URL per toolbox

* The option to create multiple keys per toolbox for sharing

* Configurable tool labels, descriptions, and types (Read only and Read & write)

## Create an MCP toolbox

To create an MCP toolbox, including its unique URL and key:

1

In Make﻿, click **MCP Toolboxes** on the left sidebar, then **Create toolbox** at the top.

2

Name your toolbox.

3

In **Tools**, select the tools you want to have in your toolbox. Only active scenarios﻿ with on-demand scheduling appear in the tool list.

4

Click **Create**.

5

In the **Create key** dialog, copy the key provided and store it in a safe place.

6

Click **Close**.

7

In **MCP Server URL**, copy the URL provided.

You've now created an MCP toolbox in Make﻿.

## Connect your MCP toolbox to an MCP client

Before connecting your MCP toolbox to an MCP client, you must:

* **Choose an MCP client**: Typical options include Claude, ChatGPT, and Cursor.

* **Check what the client supports**: In the client's MCP server documentation, check if the client supports authorization headers and the transport methods available. HTTP Streamable is the recommended method due to its connection reliability.

Next, **continue to Step 1** to configure your URL based on what the client supports.

### Step 1. Configure your URL

You must have a complete MCP server URL to connect to an MCP client.

To configure the URL:

1

Configure your URL based on the following structure, depending on whether the MCP client provides an authorization header.

**With authorization headers**

<MCP TOOLBOX URL> with the key in the authorization header:

* Header name: Authorization

* Header value: Bearer <TOOLBOX KEY>

**Without authorization headers**

<MCP TOOLBOX URL>/t/<TOOLBOX KEY>/<TRANSPORT METHOD>

2

Replace the placeholders with your actual values.

* MCP TOOLBOX URL: The URL generated when you created the MCP toolbox.

* TOOLBOX KEY: The key generated for the MCP toolbox.

* TRANSPORT METHOD: The path of your preferred transport method. Stateless Streamable HTTP (/stateless) is recommended due to its connection reliability.

**Example with authorization headers**

* URL:https://eu2.make.com/mcp/server/•••••••••••••(MCP TOOLBOX URL)

* Authorization header: ••••••••••••• (TOOLBOX KEY)

**Example without authorization headers**

* URL: https://eu2.make.com/mcp/server/•••••••••••••/t/•••••••••••••/stateless (MCP TOOLBOX URL/t/TOOLBOX KEY/TRANSPORT METHOD)

You've now configured your MCP toolbox URL. You'll add it when you're connecting to an MCP client.

### Step 2. Connect to any MCP client

To connect an MCP toolbox to an MCP client:

1

In your MCP toolbox, in **MCP Server URL**, click **Connect with...** and select an MCP client. If you don't see your preferred client, open its documentation for adding remote MCP servers.

2

In the documentation, begin following the steps for connecting to your client.

3

When asked for a URL, add the URL that you configured in Step 1. If applicable, add the key in the authorization header.

4

Finish the steps.

You've now connected your MCP toolbox to MCP client.

## Manage your MCP toolbox

Once you create an MCP toolbox, you can add or edit tools, add keys, and delete the toolbox.

### Add tools

To add tools to an existing MCP toolbox:

1

In **MCP Toolboxes**, click an existing toolbox.

2

In **Tools**, click **Add**.

3

Search or select a tool or multiple tools.

4

Click **Save**.

You've now added tools to an existing MCP toolbox.

### Configure tools

Optionally, configure your tool's name, description, and behavior:

* **Name and description:** Give your tool a custom tool name and description when its existing ones in Make﻿ may confuse an MCP client or prevent it from choosing the tool correctly. By default, the client sees existing names and descriptions, but custom ones replace them.

* **Behavior:** Select Read only and Read & write as tool annotations. In MCP clients that support them, annotations help clients understand how cautious to be with a tool, such as asking for permission before running it. By default, tools are Read & write. Mark a tool as Read only if it only reads data rather than making changes, such as adding or deleting. This option helps the client run your tools more quickly.

To configure tools:

1

In **MCP Toolboxes**, click an existing toolbox.

2

In **Tools**, click the settings icon.

3

In **Tool name**, enter a custom tool name, for example, "Watches unread emails." Alternatively, leave the field empty to use the default name.

4

In **Tool description**, enter a custom tool description, for example, "Watches inbox for unread emails with a Lead label." Alternatively, leave the field empty to use the default description.

5

In **Behavior**, select Read only or Read & write from the dropdown.

6

Click **Save**.

You can go back to configure your tools at any time.

### Add keys

Each MCP toolbox can have multiple keys to share or use across MCP clients.

To add keys to your MCP toolbox:

1

In **MCP Toolboxes**, click an existing toolbox.

2

In **Keys**, click **Add**.

3

In **Name**, name your key so you can identify it.

4

Save the key in a safe place so you can share it later.

5

Click **Close**.

You've now added a key to your toolbox. To delete a key, click the **X** symbol next to the key to delete.

### Delete an MCP toolbox

To delete an MCP toolbox:

1

In **MCP Toolboxes**, click the three-dot menu next to an existing toolbox.

2

Click **Delete**.

3

Click **Delete** to confirm.

You've now deleted an MCP toolbox.

**MCP toolbox timeout:** Your MCP toolbox scenarios must finish running within 40 seconds. If a scenario runs longer, the connection times out, and no outputs return to the client.

﻿

Updated 30 Mar 2026

Did this page help you?

Yes

No

[PREVIOUS

Get started with Make MCP server](/get-started-with-make-mcp-server "Get started with Make MCP server")[NEXT

Connect to Claude Desktop](/connect-to-claude-desktop "Connect to Claude Desktop")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

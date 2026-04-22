# Get started with Make MCP server - Help Center

Source: https://help.make.com/get-started-with-make-mcp-server
Lastmod: 2026-04-08T14:40:13.465Z
Description: Help Center
Model Context Protocol

Make MCP server

# Get started with Make MCP server

2 min

In this step-by-step guide, build a scenario﻿ as an MCP tool in Make﻿ and call it from an MCP client. By following this simple example, you'll learn how to extend AI capabilities with Make﻿ by using scenarios﻿ in AI assistants and other applications.

You'll follow these steps:

1. Build a simple scenario﻿ as an MCP tool.

2. Connect Make﻿ MCP server to an MCP client (Claude).

3. Call the scenario﻿ from the client.

## **Prerequisites**

* ﻿Make﻿ account (any plan)

* Claude account

If you want to use a different MCP client, refer to the [Developer Hub documentation](https://developers.make.com/mcp-server/connect-using-oauth "Developer Hub documentation") in the Usage page of that client for Step 2.

## Step 1. Build a scenario as an MCP tool

In this example, you'll build a scenario﻿ that searches your Gmail account for unread emails. When Claude calls it, the scenario﻿ returns the emails so Claude can read and summarize them.

You'll follow these steps to build the scenario﻿:

1. **Add a Gmail > Search emails module** to return all unread emails.

2. **Set the scenario to active and schedule it to on demand** so MCP clients can discover it.

3. **Define scenario outputs** to specify the data returned to MCP clients.

4. **Add an Array aggregator module** so the MCP client receives all returned emails.

5. **Add a Scenarios > Return outputs module** and map outputs to the defined scenario﻿ outputs.

6. **Add a scenario description** to help MCP clients decide when to call the scenario.

Once you complete these steps, your scenario﻿ is ready to be used as an MCP tool that Claude can call.

### Add a Gmail module

The **Gmail** > **Search emails** module returns all unread emails from Gmail.

To create the scenario﻿ and add the Gmail module:

1

In Make﻿, click **Create scenario** in the top-right corner.

2

On the canvas, click the giant plus and search for the **Gmail** > **Search emails** module.

3

Click **Create a connection**. In the dialog:

1. Name your Gmail connection.

2. Click **Sign in with Google** and complete the consent flow for the Gmail account that Make﻿ can access.

4

In the module settings, configure the **Gmail** > **Search emails** module:

1. In **Filter type**, select **Gmail filter** from the dropdown.

2. In **Query**, add an is:unread filter to show only unread emails.

3. In **Limit**, enter the maximum number of emails to return at once. For this example, enter 10.

4. In **Advanced settings** > **Content format**, select **Full content** from the dropdown. This email format is easy to process and includes body, subject, and other key fields.

5. Click **Save**, then **Run once**.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/G48B-9bbP-IEibAGP-Rkz-20251024-100741.png "Document image")

﻿

You've now added a Gmail module.

### Schedule and activate the scenario﻿

All scenarios﻿ used as MCP tools must be active with on-demand scheduling to be exposed to MCP clients.

To schedule and activate the scenario﻿:

1

Click the clock icon on the **Gmail** > **Search emails** module to open **Schedule settings**.

2

In the **Run scenario** field, select **On demand** from the dropdown, thenclick **Save.**

3

Click **Activate scenario**.

You've now scheduled and activated the scenario﻿.

### Define scenario﻿ outputs

In MCP tools, scenario﻿ outputs define the data that scenarios return to MCP clients.

To define the scenario﻿ outputs:

1

Click the **Scenario inputs and outputs** icon on the scenario﻿ toolbar.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/GrViSrvuYw1wQZXRV7lwd-20251106-102254.png "Document image")

﻿

2

In **Scenario outputs**, configure your output item, **email\_data**, which returns the message data of all unread emails to the MCP client:

* **Name**: email\_data

* **Description**: All of an email's message data

* **Type**: Dynamic collection

* **Required**: Yes

While your scenario﻿ output is **email\_data** here, output items can include any scenario﻿ data—such as the email sender or body, in this case.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/zmiKj5Ron8wXnivUfmcOl-20251105-161450.png "Document image")

﻿

3

Click **Save**.

You've now defined scenario﻿ outputs.

### Add an Array aggregator

As the **Gmail** > **Search emails** module returns unread emails as individual [bundles](/operations#what-are-bundles)﻿, the **Array aggregator** module is needed to accumulate all emails into one bundle. This action enables Make﻿ to return all emails, not only the first, to the MCP client.

To add an Array aggregator:

1

Add the **Array aggregator** module to the **Gmail** > **Search emails** module.

2

In the module settings, in **Aggregated fields**, select these fields to aggregate:

* **Date**

* **Subject**

* **From (email)**

* **Snippet**

3

Click **Save**.

You've now added an Array aggregator.

### Add a Return output module

To return the defined scenario﻿ outputs to the MCP client, the scenario﻿ must end with a **Scenarios** > **Return output** module.

To add this module:

1

Add the **Scenarios** > **Return output** module to the **Array aggregator** module.

2

In **email\_data**, map the Array aggregator [bundle], shown below. This bundle contains the aggregated email message data of all unread emails.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/8OoK8spTOkpTzTQdBer6Z-20251106-101754.png "Document image")

﻿

3

Click **Save**.

4

Click **Save** on the toolbar.

You've now added a **Scenarios** > **Return output** module.

### Describe the scenario﻿

The scenario﻿ description helps MCP clients and other AI systems to understand when to use the scenario﻿.

To describe the scenario﻿:

1

Next to the scenario﻿ name, click the arrow icon, then click **Save changes**.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/ka3SQ1VrKvw2Oe7eTFbKO-20251024-114150.png "Document image")

﻿

2

In the top-right corner, click **Options** and select **Edit description**.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/MklLxvsbWJtOY3jibKcMK-20251024-114455.png "Document image")

﻿

3

In **Description**, briefly describe the purpose of this scenario.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/05TtZCmlofoQorkqEUPJx-20251024-115256.png "Document image")

﻿

4

Click **Save**.

Once you've described your scenario﻿, it's ready to use as an MCP tool for an MCP client. Next, connect Make﻿ to your client, Claude.

## Step 2. Connect Make MCP server to Claude

Connect Make﻿ MCP server to an MCP client, Claude, to allow the client to call your scenario﻿.

To connect:

1

Open Claude and click your profile name on the left sidebar.

2

Select **Settings**.

3

Go to **Connectors**.

4

Click **Browse connectors**.

5

Search for Make and click the plus sign.

6

In the OAuth consent screen, select a Make﻿ organization and its granted scopes.

1. In **Organization**, select the organization that contains the MCP tool that you built earlier.

2. Select your scopes:

* If you're on a **Free plan**: Select **Run your scenarios** only.

* If you're on a **Paid plan**: You can also select management scopes such as **View and modify your scenarios** and **View and modify your teams and organizations**.

You [determine the MCP tools available](https://help.make.com/make-mcp-server#QCFKp "determine the MCP tools available") through your scopes:

* The scenario runscope (**Run your scenarios**) allows clients to view and run active scenarios﻿ with on-demand scheduling.

* Management scopes (**View and modify your scenarios** and **View and modify your teams and organizations**) allow clients to view and modify the contents of your Make﻿ account.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/5HHOggrCERdBHYbTTZT4Q-20251103-103109.png "Document image")

﻿

7

Click **Allow**.

8

In **Connectors**, notice that Make﻿ is now connected.

9

Optionally, click **Configure** to define tool-based permissions.

You've now connected Make MCP server to Claude.

## Step 3. Call your MCP tool from Claude

To call your scenario﻿ from the chat in Claude:

1

In Claude, select **New chat** in the left sidebar.

2

Ask Claude a question that your MCP tool can help answer. For example, "What are my unread emails today?"

3

When Claude requests permission to use your MCP tool, click **Allow once** or **Always allow**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/CHPpGAP_ft0s9EnTjEqOX-20251103-133011.png?format=webp "Document image")

﻿

4

After you grant permission, Claude calls the MCP tool and returns the scenario﻿ outputs defined earlier **(email\_data)**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/g8Na7Wdxxq8yZeQmSbWNt-20251103-133507.png?format=webp "Document image")

﻿

You've now called your tool from Claude.

Now that you've built an MCP tool in Make﻿ and connected Make﻿ to an MCP client, you can explore [additional connection methods](https://developers.make.com/mcp-server/ "additional connection methods") and build more complex scenarios.

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

Make MCP server](/make-mcp-server "Make MCP server")[NEXT

MCP toolboxes](/mcp-toolboxes "MCP toolboxes")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

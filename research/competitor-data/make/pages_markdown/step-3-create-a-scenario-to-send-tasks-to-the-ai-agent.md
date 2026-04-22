# Step 3. Create a scenario to send tasks to the AI agent - Help Center

Source: https://help.make.com/step-3-create-a-scenario-to-send-tasks-to-the-ai-agent
Lastmod: 2026-03-06T10:21:13.944Z
Description: Help Center
Make AI Agents

AI agent use case

# Step 3. Create a scenario to send tasks to the AI agent

1 min

This page reflects a **previous version of Make AI Agents**. For the latest information, see [Make AI Agents (New)](/make-ai-agents-new)﻿.

In this final step, we create the scenario﻿ to communicate with our agent. We will equip the agent with scenarios﻿ as tools to perform the agent's tasks: list our shop inventory and order more items. We will use Slack to send tasks to our agent.

1

Click the **Create a new scenario** button in your organization dashboard or in the list of scenarios﻿.

2

Add the **Slack** > **Watch new events** module to the scenario﻿.

3

Set up the module:

1. In the **Webhook** field, select a Slack event webhook or click **Add** to create a new one.

2. In the **Event type** drop-down, select **New channel message**.

3. In the **Connection** field, select your Slack connection.

4. In the **Channel** field, select a channel you can use for testing the AI agent.

5. Set the scenario﻿ scheduling to **Immediately when data arrives**.

6. Click **Save** to confirm the module settings.

4

Click the module placeholder to add a new module to your scenario﻿. Search "AI agent" to get the **Make AI Agents >** **Run an agent** module and add it to your scenario﻿.

5

In the **Agent** field, select the agent you created in the [previous section](/ai-agent-use-case#QKAMW)﻿.

6

In **T****ools**, click **Add tool**.

7

Add the scenarios﻿ to the AI agent's tools:

1. Click the empty drop-down under **Select scenario**. The list of scenarios﻿ in your team rolls down. Select the "List shop inventory" scenario﻿ we created in the [previous section](/ai-agent-use-case#gnt62)﻿.

Use the search row at the top of the selection list to find the scenario﻿. Note the scenario﻿ description that appears under the name of the scenario﻿ and the name of the scenario﻿ folder.

![Document image](https://images.archbee.com/xSpGhDIsAwW5-e9QQh6Dl-yIAFalqsBkb4W4pj6TQRM-20250306-125757.png?format=webp "Document image")

﻿

1. Click **OK** to confirm the selection.

2. Add the "Create buy stock order" scenario﻿ created in the [previous section](/ai-agent-use-case#jJur0)﻿ in the same way.

3. Click **Save**.

8

Finish setting up the **Run an agent** module:

1. In the **Thread ID** field, map a unique identifier to keep the same thread for all communication with the agent. This optimizes the context sent to the agent with each module run and allows the agent to keep the history of previous conversations.

2. In the **Message 1** field, map the Text from the **Watch new events** module.

3. Click **Save** to confirm changes.

9

Add the **Ignore** error handler to the **Run an agent** module. Sometimes, the agent can take time to respond.

If the response time gets longer than 180 seconds, the module outputs the ModuleTimeoutError and Make﻿ stops the scenario﻿.

There are more sophisticated options to prevent the ModuleTimeoutError, but they are not part of this use case. If you want to learn more, check the module settings reference.

10

Add the **Slack** > **Create a message** module after the **Run an agent** module.

11

Set up the module:

1. In the **Connection** field, select your connection.

2. In the **Enter a channel ID or name** and **Channel type** fields, select values relevant for the channel where you want to send agent's replies and pick the channel in the next field.

3. In the **Text** field, map the response from the AI agent.

4. Click **Save** to confirm changes.

12

Update the name of your scenario﻿.

13

Save the scenario﻿.

You should now test your agent. Send a message to the channel that is watched by the **Watch new events** module that contains the intent for the agent to either send the inventory information or order new stock. For example, request the agent to list the current shop inventory.

Check the channel where is the **Create a message** module sending agent's replies. You should see a reply from the agent listing the same data as we defined in the data store when we were setting up the scenarios﻿ available to the agent.

Updated 06 Mar 2026

Did this page help you?

Yes

No

[PREVIOUS

Step 2. Create the AI agent's tools](/step-2-create-the-ai-agents-tools "Step 2. Create the AI agent's tools")[NEXT

Model Context Protocol](/model-context-protocol "Model Context Protocol")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

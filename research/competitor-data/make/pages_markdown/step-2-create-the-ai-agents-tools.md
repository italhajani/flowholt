# Step 2. Create the AI agent's tools - Help Center

Source: https://help.make.com/step-2-create-the-ai-agents-tools
Lastmod: 2026-03-06T10:21:00.537Z
Description: Help Center
Make AI Agents

AI agent use case

# Step 2. Create the AI agent's tools

3 min

This page reflects a **previous version of Make AI Agents**. For the latest information, see [Make AI Agents (New)](/make-ai-agents-new)﻿.

AI agents in Make﻿ need tools to do their job – these tools are modules, scenarios﻿ and MCP tools. Agents use information provided by you to reason about how and when to use these tools.

To inform the AI agent's context, Make﻿ sends the following information to the AI service provider:

* System prompt

* The name and description of each tool

* The name and description of [inputs or outputs](dI1PkXe4s6-sTrIU9SpVv)﻿ of the scenario used as a tool

In addition to providing context, all scenarios﻿ used as tools for AI agents must be [active](/active-and-inactive-scenarios)﻿ and either scheduled **on demand** or triggered by a **Custom webhook.**

In the next sections, we will create a tool for our agent to list our shop inventory and another to order more stock if we're low.

The aim of the following sections is to showcase the AI agent's reasoning. The example scenarios﻿ provided have been simplified to streamline their setup.

## Tool 1: Scenario to list shop inventory

We will provide our agent with a scenario﻿ to list our shop inventory. Since we want to send data from the scenario﻿ to the agent, we have to use [scenario outputs](/use-scenario-outputs)﻿ and the **Scenarios** > **Return output** module.

To create the scenario﻿:

1

Click the **Create a new scenario** button in your organization dashboard or in the list of scenarios﻿.

2

If you don't have testing data ready, set up your shop data:

1. Add the **Data store** > **Search record** module to your scenario﻿.

2. In the **Data store** field, select **Add** to create a new data store.

3. In the **Data store name** field, fill in the name for your inventory data storage.

4. In the **Data structure** box, click **Add** to define a structure for your data store.

5. ﻿

![Document image](https://images.archbee.com/xSpGhDIsAwW5-e9QQh6Dl-yrYWfvGplur7yV8QMrCf5-20250306-124119.png?format=webp "Document image")

﻿

6. Click **Save** to confirm the data structure and **Save** to create the data store.

7. Go to the list of data store and open the new data store.

8. Click the **Add** button to add data to your data store:

![Document image](https://images.archbee.com/xSpGhDIsAwW5-e9QQh6Dl-jYhXubr3GNnzWEwydwQlV-20250306-124235.png?format=webp "Document image")

﻿

3

Update the name of the scenario﻿. The AI agent uses the scenario﻿ name to decide if it should run the scenario﻿. Fill in: "List shop inventory".

4

Add the **Tools** > **Text aggregator** module

1. In the **Source module** field, keep the data store module.

2. Enable the **dvanced settings** toggle at the bottom of the module settings.

3. In the **Row separator** field, select **New row**.

4. In the **Text** field, map the name and quantity fields from your data store:

![Document image](https://images.archbee.com/xSpGhDIsAwW5-e9QQh6Dl-qbtuXUlKbpPTXePRhrNxY-20250306-124859.png?format=webp "Document image")

﻿

5

Add the **Scenarios** > **Return output** module.

1. Click **Add scenario outputs** to set scenario﻿ outputs for the return data module.

2. In the **Scenario outputs** tab, define the scenario﻿ output structure and fill in the description of each item in the output:

3. ﻿

![Document image](https://images.archbee.com/xSpGhDIsAwW5-e9QQh6Dl-p0fksUq3OBAV4GBehELHO-20250306-125058.png?format=webp "Document image")

﻿

4. In the module settings, map the text variable to the inventory field.

5. Confirm module settings with **Save**.

6

Set scenario﻿ scheduling:

1. Set the scenario﻿ scheduling to **On demand**. The agent will run the scenario﻿ for you when needed.

2. Confirm the scenario﻿ scheduling with **Save**.

3. Activate the scenario﻿.

4. Save your scenario﻿.

7

Add scenario﻿ description for the agent:

1. Go to the scenario﻿ **Diagram** tab.

2. Click **Options** > **Edit description**.

3. Add description to the scenario﻿. The AI agent uses the scenario﻿ name and description to decide if it should run the scenario. Fill in: "Lists the shop inventory."

4. Click **Save**.

You have created the scenario﻿ for your agent to list the shop inventory. We will make the scenario﻿ available to your agent in the following sections.

## Tool 2: Scenario to order more stock

We will provide the agent with another tool: a scenario﻿ to order more items for our shop inventory. The scenario﻿ will receive order information from the agent with scenario﻿ inputs.

For our testing purposes, the scenario﻿ will just send messages to a selected chat.

To create the scenario﻿:

1

Click the **Create a new scenario** button in your organization dashboard or in the list of scenarios﻿.

2

In **Scenario inputs and outputs** in the **Scenario inputs** tab, set the scenario﻿ inputs structure and description:

![Document image](https://images.archbee.com/xSpGhDIsAwW5-e9QQh6Dl-iWEgWRv8Pjq8m5iwOw98R-20250306-125358.png?format=webp "Document image")

﻿

![Document image](https://images.archbee.com/xSpGhDIsAwW5-e9QQh6Dl-gmIThHam9Eb9Z1h_dSozh-20250306-125409.png?format=webp "Document image")

﻿

3

Add the **Slack** > **Create a message** module.

4

Set up the **Create a message** module:

1. In the **Connection** selection box, select your connection. If you don't have a connection, click the **Add** button to create it.

2. Select the channel where you want to receive the messages about new orders created by the agent.

3. In the module settings, use the scenario input in the **Text** field. For example:

![Document image](https://images.archbee.com/xSpGhDIsAwW5-e9QQh6Dl-OX4qt7qt3EnhZu944vDUZ-20250306-125502.png?format=webp "Document image")

﻿

5

Update the name of the scenario﻿. The AI agent uses the scenario﻿ name to decide if it should run the scenario﻿. Fill in: "Create buy stock order."

6

Set scenario﻿ scheduling:

1. Set the scenario﻿ scheduling to **On demand**. The agent will run the scenario﻿ for you when needed.

2. Confirm the scenario﻿ scheduling with **Save**.

3. Activate the scenario﻿.

4. Save your scenario﻿.

7

Add scenario﻿ description for the agent:

1. Go to the scenario﻿ **Diagram** tab.

2. Click **Options** > **Edit description**.

3. Add description to the scenario﻿. The AI agent uses the scenario﻿ name and description to decide if it should run the scenario﻿. Fill in: "Creates orders to refill the shop inventory."

4. Click **Save**.

You have created the scenario﻿ for your agent to create orders to refill the shop inventory. We will make the scenario﻿ available to your agent in following sections.

Updated 06 Mar 2026

Did this page help you?

Yes

No

[PREVIOUS

Step 1. Set up the AI agent](/step-1-set-up-the-ai-agent "Step 1. Set up the AI agent")[NEXT

Step 3. Create a scenario to send tasks to the AI agent](/step-3-create-a-scenario-to-send-tasks-to-the-ai-agent "Step 3. Create a scenario to send tasks to the AI agent")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

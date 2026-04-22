# Slack-triggered AI agent - Help Center

Source: https://help.make.com/slack-triggered-ai-agent
Lastmod: 2026-03-19T18:36:17.302Z
Description: Help Center
Make AI Agents (New)

Create AI agents for different...

# Slack-triggered AI agent

5 min

This Slack-triggered AI agent scenario﻿ watches a Slack channel for new user messages and the agent replies to them.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/w5yKFjwyX19MROib_wM2X-20260210-182310.png?format=webp "Document image")

﻿

## Prerequisites

* A **Slack account** with a **private channel** for interacting with the agent

While a private channel is more convenient for testing, you can use either a private or public channel.

## Step 1. Add a Watch New Events module

The **Slack** > **Watch New Events** module watches your Slack channel for new messages, so the agent receives them when they arrive.

To add a **Watch New Events** module:

1

In the Scenario﻿ Builder, click the giant plus.

2

In the app search, search for and click **Slack**.

3

Click **Watch New Events**.

4

In **Webhook name**, name your webhook to identify it later.

5

In **Event type**, select the following from the dropdown:

* **New private channel message** (for a private channel)

* **New channel message** (for a public channel)

6

In **Connection**, click **Add** to create a new Slack connection or select an existing one from the dropdown.

7

In **Channel**, select the channel that you set up earlier.

8

Click **Save**.

9

Test the **Slack** > **Watch New Events** module:

1. Click **Run once** on the Scenario﻿ toolbar.

2. In Slack, send a message in your channel.

3. In the Scenario﻿ Builder, click the output bubble next to the module to view the data items in an output bundle. For example, the Text value is the user message.

If you've sent a message to your Slack channel, but the module hasn't received data yet:

* Wait a few minutes. Slack webhooks sometimes delay in detecting messages.

* Stop the scenario﻿ run and click the down arrow next to **Run once** to run the scenario﻿ using data from a previous run.

You've now added the **Slack** > **Watch New Events** module to your scenario﻿.

## Step 2. Add a Send a Message module

Now that you've added a module that sends new Slack messages to your agent, add a **Slack** > **Send a Message** module to allow the agent to reply to them.

To add a **Slack** > **Send a Message** module:

1

In the Scenario﻿ Builder, click the plus icon next to the **Slack** > **Watch New Events** module.

2

In the app search, click **Slack**.

3

Search for and click **Send a Message**.

4

In **Connection**, select your Slack connection.

5

In **Channel ID or name**, click the field and map the Channel value from the **Slack** > **Watch New Events** module.

6

In **Text**, configure the reply:

1. Click the field and map the Text value from the **Slack** > **Watch New Events** module.

2. Before the Text value, enter custom text, such as "Agent:", to specify that the reply is from an agent. Without this text, the agent won't distinguish user and agent messages, causing it to reply to itself in an infinite loop. Later, you'll filter messages with the "Agent:" text, so the agent only processes user messages.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/CTYI_q-OcIz4EKGurxqr--20260210-095628.png?format=webp "Document image")

﻿

Optionally, to distinguish between agents and users most clearly, [create a Slack app](https://apps.make.com/slack#obtain-your-client-credentials-in-slack "create a Slack app ") and create a Bot connection. This way requires a more complex setup.

7

Toggle **Advanced settings**.

8

In **Thread message ID (time stamp)**, enter a function for Slack timestamps:

1. Click the field, and search for and click the Ifempty function.

2. In the function, before the semicolon, map the Thread Timestamp value from the **Slack** > **Watch New Events** module.

3. After the semicolon, map the Timestamp value from the **Slack** > **Watch New Events** module.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/EOwSQAgZi9oLg0BPHPotj-20260210-090622.png?format=webp "Document image")

﻿

You use a function here so that the agent replies in the Slack thread after receiving the first message. The function covers two types of Slack timestamps:

* Timestamp: The identifier of the first message of the Slack thread.

* Thread timestamp: The identifier of the Slack thread once the thread has a reply (unavailable for the first message).

9

Click **Save**.

10

Click **Save** on the Scenario﻿ toolbar.

11

Right-click the route between the modules and select **Set up a filter**.

12

Set up a filter that allows only user messages to pass through, so the agent doesn't reply to itself in an infinite loop:

1. In **Label**, name your label "Only user messages."

2. In **Condition**, map the Text value from the **Slack** > **Watch New Events** module, select **Text operators: Does not contain**, and enter "Agent:":

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/89IkB9lZEcQAsjE0fGxYE-20260210-102023.png?format=webp "Document image")

﻿

3. Click **Save**.

13

Test the **Slack** > **Send a Message** module:

1. Click **Run once** on the Scenario﻿ toolbar.

2. In Slack, send a message in your channel.

3. Check if you see a reply in the same thread beginning with "Agent:" in the same thread. This means the module works.

14

Toggle **Immediately as data arrives** on the Scenario﻿ toolbar to activate the scenario﻿, so that the scenario﻿ automatically receives new messages from Slack.

15

Click **Save**.

16

Click **Save** on the Scenario﻿ toolbar.

You've now added your Slack modules to your scenario﻿ .

## Step 3. Add a Run an agent module

To finish your scenario﻿, add the **Make AI Agents (New)** > **Run an agent** module.

To add the **Run an agent** module:

1

Right-click the route between the Slack modules and select **Add a module**.

2

In the app search, search for and click **Make AI Agents (New)**.

3

Select the **Run an agent** module.

4

In the module settings, in **Connection**, select an existing AI provider connection from the dropdown or click **Add** to create a new one.

If you don't want to set up an account with an AI provider, select **Make's AI Provider**.

5

In **Model**, select a small model. Smaller models react quickly to new data, which is ideal for this chat-based AI agent.

6

In **Instructions**, describe who the agent is and what it does. For example, "You are a helpful agent. Answer with a warm and friendly tone."

For now, the sample instructions provided are sufficient. Later, you can tailor them to the agent's workflow.

7

In **Input**, map the Text value from the **Slack** > **Watch New Events** module. This action gives the agent access to incoming Slack messages.

8

In **Conversation** ID, enter the same function that you added to the **Thread message ID (time stamp)** field in the **Add a Send a Message module** step.

This action allows the agent to remember previous exchanges with a user, and provide contextual responses when the user asks follow-up questions in the same thread.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/_d-0AO1dqb0aFSzt6vM_4-20260210-125123.png?format=webp "Document image")

﻿

9

Click **Save**.

10

Click the **Slack** > **Send a Message** module.

11

In **Text**, keep the custom "Agent:" text and replace the Text value with the Response value from the **Run an agent** module. This action allows the agent to reply with its own response.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/90tEWaFa9O-Q78tDUwNpI-20260210-125502.png?format=webp "Document image")

﻿

12

Click **Save**.

13

Click **Save** on the Scenario﻿ toolbar.

14

Send a message to your channel in Slack to check if the agent works.

You've now built a Slack-triggered AI agent scenario﻿.

Updated 19 Mar 2026

Did this page help you?

Yes

No

[PREVIOUS

Create AI agents for different triggers](/create-ai-agents-for-different-triggers "Create AI agents for different triggers")[NEXT

Telegram-triggered AI agent](/telegram-triggered-ai-agent "Telegram-triggered AI agent")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

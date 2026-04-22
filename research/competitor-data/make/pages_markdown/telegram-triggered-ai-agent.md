# Telegram-triggered AI agent - Help Center

Source: https://help.make.com/telegram-triggered-ai-agent
Lastmod: 2026-03-19T18:36:37.803Z
Description: Help Center
Make AI Agents (New)

Create AI agents for different...

# Telegram-triggered AI agent

6 min

This Telegram-triggered AI agent scenario﻿ watches a Telegram Bot chat for new user messages and the agent replies to them.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/EHt1g0fJWO56cYUshKubF-20260211-154654.png?format=webp "Document image")

﻿

## Prerequisites

* A Telegram account

* A [Telegram bot](https://core.telegram.org/bots/tutorial "Telegram bot")﻿

* Your token (you'll use this when creating a webhook in Make﻿)

## Step 1. Add a Watch Updates module

The **Telegram Bot** > **Watch Updates** module watches for new messages from your bot channel in Telegram.

To add the **Telegram Bot** > **Watch Updates** module:

1

In the Scenario﻿ Builder, click the giant plus.

2

In the app search, search for and click **Telegram Bot**.

3

Click the **Watch Updates** module.

4

In **Webhook name**, name your webhook to identify it later.

5

In **Connection**, click **Add** to create a new Telegram Bot connection:

1. In **Connection name**, name your connection to identify it later.

2. In **Token**, paste the token you received when you created the Telegram bot.

3. Click **Save**.

6

Click **Save**.

7

Click **Save** on the Scenario﻿ toolbar.

You've now added the **Telegram Bot** > **Watch Updates** module to your scenario﻿.

## Step 2. Add a route to reply to /start or non-text messages

When you start a conversation with a Telegram Bot, the bot sends a /start message to your scenario﻿. As /start isn't a unique user message, you don't want it to trigger your agent.

Additionally, this example Slack scenario﻿ only accepts text, excluding non-text media, such as images, videos, or audio files.

Add a route that sends a welcome message in response to /start, or requests text-only messages in response to non-text messages.

To add a route:

1

Click the plus icon next to the **Telegram Bot** > **Watch Updates** module.

2

In the app search, search for and click **Flow control**.

3

Click **Router**.

4

Click the 1st route.

5

In **Label**, enter Welcome response.

6

In **Condition**, configure the fields based on the following:

* Map the Message: Text value from the **Telegram Bot** > **Watch Updates** module.

* Text operators: Equal to

* /start

Make sure you've selected Message:Text here, rather than a similar value, such asEdited Channel Post: Text.

7

Click **Add OR rule** to add a second condition for non-text messages:

* Map the Message: Text value from the **Telegram Bot** > **Watch Updates** module.

* Basic operators: Does not exist

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/4QMBOvbfNFOoV2ZuAhpJe-20260211-161404.png?format=webp "Document image")

﻿

8

Click **Save**.

9

Click **Save** on the Scenario﻿ toolbar.

10

Click the giant plus next to the 1st route.

11

In the app search, search for and click **Telegram Bot**.

12

Click the **Send a Text message or a Reply** module.

13

In **Connection**, select the same Telegram Bot connection that you used earlier.

14

In **Chat ID**, map the Message: Chat: ID value from the **Telegram Bot** > **Watch Updates** module.

15

In **Text**, enter the following function, so when the message is /start, the agent replies "Welcome!", and when it's anything else, the agent replies that it only accepts text.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/2zJoKco7KQJ97O3znSEXf-20260211-155138.png?format=webp "Document image")

﻿

16

Click **Save**.

17

Click **Save** on the Scenario﻿ toolbar.

18

Test the module:

1. Click **Run once** on the Scenario﻿ toolbar.

2. In your Telegram Bot chat, click **Start**. This triggers the correct message as a reply.

You've now added a route that replies to /start or non-text messages.

## Step 3. Add a route to reply to user messages

To add a route to reply to all other user messages:

1

Click the 2nd route.

2

In **Label**, enter "All other user messages."

3

Select **Yes** to **Set the route as a fallback**.

4

Click **Save**.

5

Right-click the **Telegram** > **Send a Message or a Reply** module and select **Clone**.

6

Move the cloned module down until it links to the empty giant plus, then unclick.

7

Right-click the empty giant plus and select **Delete** module.

8

In the cloned module, in **Text**, delete the function. Enter "Hello" and map the Message: Text value from the **Telegram Bot** > **Watch Updates** module.

9

Click **Save**.

10

Click **Save** on the Scenario﻿ toolbar.

11

Toggle **Immediately as data arrives** on the Scenario﻿ toolbar to activate the scenario﻿.

12

To test the scenario﻿, go back to your Telegram Bot chat and send a message to receive an agent reply.

You've now added a route to reply to user messages.

## Step 4. Add a Run an agent module

To add the **Run an agent** module to the user message route:

1

Right-click the 2nd route and select **Add a module**.

2

In the app search, search for and click **Make AI Agents (New)**.

3

Click the **Run an agent** module.

4

In **Connection**, select an existing AI provider connection from the dropdown or click Add to create a new one.

5

In **Model**, select a small model. Smaller models react quickly to new data, which is ideal for this chat-based AI agent.

6

In **Instructions**, describe who the agent is and what it does. For now, enter "You are a friendly agent."

7

In **Input**, map the Message: Text value from the **Telegram Bot** > **Watch Updates** module.

8

In **Conversation ID**, map the Message: Chat: ID value from the **Telegram Bot** > **Watch Updates** module.

In Telegram, each user has their own Message: Chat: ID. The agent uses it to remember the conversation history with the user and answer any follow-up questions.

As users chat more with your Telegram-triggered agent, storing all past messages can get expensive. To reduce tokens, you can set this field to start fresh conversations periodically (like using a timestamp), so the agent remembers less.

You've now added the **Make AI Agents (New)** > **Run an agent** module to the scenario﻿.

## Step 5. Add the agent response

To finish this scenario﻿, map the agent response in the **Telegram Bot** > **Send a Text Message or a Reply** module to allow the agent to reply to the user message.

To add the agent response:

1

In the **Telegram Bot** > **Send a Text message or a Reply** module on the 2nd route, in **Text**, delete the existing text and map the response value from the **Make AI Agents (New)** > **Run an agent** module.

2

Click **Save**.

3

Click **Save** on the Scenario﻿ toolbar.

You've now created a Telegram-triggered AI agent scenario﻿.

Updated 19 Mar 2026

Did this page help you?

Yes

No

[PREVIOUS

Slack-triggered AI agent](/slack-triggered-ai-agent "Slack-triggered AI agent")[NEXT

Email-triggered AI agent](/email-triggered-ai-agent "Email-triggered AI agent")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

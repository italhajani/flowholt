# Form-triggered AI agent - Help Center

Source: https://help.make.com/form-triggered-ai-agent
Lastmod: 2026-03-19T18:42:21.053Z
Description: Help Center
Make AI Agents (New)

Create AI agents for different...

# Form-triggered AI agent

4 min

This form-triggered AI agent scenario﻿ watches new form responses, and the agent replies to form questions in an email.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/g8S4Zd9q8QIsVqPXrg8Aq-20260210-181942.png?format=webp "Document image")

﻿

## Prerequisites

* A Gmail account

* A Tally account

* A Tally form configured with the following fields:

* Your first name

* Your last name

* Your email

* Your question

* A test form submission with your personal email address

While this example uses Tally, you can use any forms service.

## Step 1. Add a Watch New Responses module

The **Tally** > **Watch New Responses** module is a [webhook](https://help.make.com/webhooks "webhook ") that watches all new form responses.

To add the **Watch New Responses** module:

1

In the Scenario﻿ Builder, click the giant plus.

2

In the app search, search for and click **Tally**.

3

Click the **Watch New Responses** module.

4

Click **Create a webhook**:

1. In **Webhook name**, name your webhook to identify it later.

2. In **Connection**, select an existing Tally connection. Alternatively, click **Add** to create a new one and select **OAuth**.

3. In **Form ID**, select the form that you created earlier.

4. Click **Save**.

5

Click **Save**.

6

Click **Save** on the Scenario﻿ toolbar.

7

Test the module:

1. Click **Run once** on the Scenario﻿ toolbar.

2. Click the output bubble to view your responses from the test form you submitted earlier.

You've now added a **Tally** > **Watch New Responses** module to your scenario﻿.

## Step 2. Add a Run an agent (New) module

To add the **Make AI Agents (New)**> **Run an agent (New)** module:

1

Click the plus icon next to the **Tally** > **Watch New Responses** module.

2

In the app search, search for and click **Make AI Agents (New)**.

3

Click the **Run an agent (New)** module.

4

In **Connection**, select an existing AI provider connection from the dropdown or click **Add** to add a new one.

If you don't want to set up an account with an AI provider, select **Make's AI Provider**.

5

In **Model**, select a model from your chosen AI provider.

6

In **Instructions**, describe who your agent is and what it does. You can copy-paste the below:

You are a friendly agent who answers general questions. Always use HTML for your answers.

You request HTML here so that the agent provides its answers in an email in a structured format.

7

In **Input**, map the Fields by ID: Your question value from the **Tally** > **Watch New Responses** module, so the agent receives the question from the Tally form.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/3WNKT2YXwfE9umZAjHfQH-20260210-172355.png?format=webp "Document image")

﻿

8

Click **Save**.

9

Click **Save** on the Scenario﻿ toolbar.

You've now added the **Make AI Agents (New)** > **Run an agent (New)** module to your scenario﻿.

## Step 3. Add a Send an email module

With the **Gmail** > **Send an email** module, the agent answers the form question directly to the user's email address.

To add a **Send an email** module:

1

Click the plus icon next to the **Run an agent (New)** module.

2

In the app search, search for and click **Gmail**.

3

Click the **Send an email** module.

4

In **Connection**, select an existing Gmail connection from the dropdown or click **Add** to create a new one.

5

In **To**, click **Add recipient**.

6

In **Recipient email address 1**, map the Fields by ID: Your email value from the **Tally** > **Watch New Responses** module, so the agent replies to the email address specified in the Tally form.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/a-LPEaFyTd9hLRpcUgjND-20260210-175703.png?format=webp "Document image")

﻿

7

In **Subject**, specify the subject of the agent's email reply, for example, "Thanks for your question!"

8

In **Body type,** select **Raw HTML** from the dropdown.

9

In **Content**, map the Response value from the **Run an agent (New)** module.

10

Click **Save**.

11

Click **Save** on the Scenario﻿ toolbar.

12

Test the scenario﻿:

1. Click the down arrow next to **Run once** on the Scenario﻿ toolbar.

2. In **Scenario run**, select the previous scenario run to use its trigger data as test data.

3. Click **Run once**.

4. Check your email to see if the agent replied to your question.

You've now created a form-triggered AI agent scenario﻿.

Updated 19 Mar 2026

Did this page help you?

Yes

No

[PREVIOUS

Email-triggered AI agent](/email-triggered-ai-agent "Email-triggered AI agent")[NEXT

Webhook-triggered AI agent](/webhook-triggered-ai-agent "Webhook-triggered AI agent")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

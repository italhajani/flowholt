# Email-triggered AI agent - Help Center

Source: https://help.make.com/email-triggered-ai-agent
Lastmod: 2026-03-19T18:37:17.913Z
Description: Help Center
Make AI Agents (New)

Create AI agents for different...

# Email-triggered AI agent

4 min

This email-triggered AI agent scenario﻿ watches new emails in your Gmail account, and the agent replies to them. The watched emails are ones you've sent to yourself with a specific subject. Later, you can tailor the watch criteria to your needs.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/FGLbPKlmw_dt8tZ1mOCM2-20260210-182131.png?format=webp "Document image")

﻿

## Prerequisites

* A Gmail account

* A test email, with any text and subject, sent to your personal email

## Step 1. Add Watch emails module

The **Gmail** > **Watch emails** module watches your Gmail account for new emails.

To add a **Watch emails** module:

1

In the Scenario﻿ Builder, click the giant plus.

2

In the app search, search for and click **Gmail**.

3

Select the **Watch emails** module.

4

In **Connection**, select an existing Gmail connection from the dropdown or click **Add** to add a new one.

5

Optionally, in **Label**, you can filter the emails by label.

6

Toggle **Advanced settings**.

7

In **Sender email address**, enter your personal email address so that the module only watches emails from that address.

8

Optionally, in **Subject**, add the specific subject to watch for.

9

Click **Save**.

10

In the dialog that prompts you to choose where to start processing data, click the link.

11

In the **Choose where to start** dialog, select **Choose manually** and select the first option (the email you sent yourself earlier).

12

Click **Save** on the Scenario﻿ toolbar.

13

Click **Run once** on the Scenario﻿ toolbar to retrieve your test email and have data to map in other modules.

14

Click the output bubble to view the output items that you can share with the agent. For example, the Full text body value is the content of the email.

You've now added the **Gmail** > **Watch email** module to the scenario﻿.

## Step 2. Add the Run an agent module

To add the **Make AI Agents (New)** > **Run an agent** module:

1

Click the plus icon next to the **Gmail** > **Watch emails** module.

2

In the app search, search for and click **Make AI Agents (New)**.

3

Click the **Run an agent** module.

4

In **Connection**, select an existing AI provider connection from the dropdown or click **Add** to add a new one.

If you don't want to set up an account with an AI provider, select **Make's AI Provider**.

5

In **Model**, select a model from your chosen AI provider.

6

In **Instructions**, describe who the agent is and what it does. You can copy-paste the below:

You are a customer service agent that answers questions from customers. Read the content of the email and answer in HTML format. Directly reply to the email. Don't provide any email signature.

7

In **Input**, map the Full text body value from the **Gmail** > **Watch emails** module so that the agent accesses the email content.
Later, you can add other values that the agent needs, such as Date and From (name).

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/TiLmU65ovPDxSQ0dNuRxc-20260210-153413.png?format=webp "Document image")

﻿

8

In **Conversation ID**, map the Thread ID value from the **Gmail** > **Watch emails** module. This action retrieves the email history so the agent remembers previous emails in case the user replies.

9

Click **Save**.

10

Click **Save** on the Scenario﻿ toolbar.

You've now added the **Make AI Agents (New)** > **Run an agent** module to your scenario﻿.

## Step 3. Add a Reply to an email module

Add a **Gmail** > **Reply to an email** module so the agent replies to incoming emails.

To add a **Reply to an email** module:

1

Click the plus icon next to the **Make AI Agents (New)** > **Run an agent** module.

2

In the app search, click **Gmail**.

3

Click the **Reply to an email** module.

4

In **Connection**, select your existing Gmail connection.

5

In **Thread ID**, map the Thread ID value from the **Gmail** > **Watch emails** module. This action allows the agent to reply directly to the initial user email.

6

In **Body contents**, click **Add body content**.

7

In **Text**, map the Response value from the **Run an agent** module, so the agent sends its response as the email reply.

8

Click **Save**.

9

Click **Save** on the Scenario﻿ toolbar.

10

Test your scenario﻿:

1. Click the down arrow next to **Run once** on the Scenario﻿ toolbar.

2. In **Scenario run**, select the previous scenario run to use its trigger data as test data.

3. Click **Run once**.

4. Check your inbox for a reply from the agent.

You've now created an email-triggered AI agent scenario﻿.

Updated 19 Mar 2026

Did this page help you?

Yes

No

[PREVIOUS

Telegram-triggered AI agent](/telegram-triggered-ai-agent "Telegram-triggered AI agent")[NEXT

Form-triggered AI agent](/form-triggered-ai-agent "Form-triggered AI agent")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

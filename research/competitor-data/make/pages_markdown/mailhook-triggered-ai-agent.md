# Mailhook-triggered AI agent - Help Center

Source: https://help.make.com/mailhook-triggered-ai-agent
Lastmod: 2026-03-19T18:51:24.545Z
Description: Help Center
Make AI Agents (New)

Create AI agents for different...

# Mailhook-triggered AI agent

10 min

This mailhook-triggered AI agent scenario watches for new emails, and the agent replies to them. Mailhooks (email webhooks) immediately trigger scenarios﻿ in response to new emails, rather than [on a schedule](/email-triggered-ai-agent)﻿.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/8VVEpm5qENjHeeq2h41uW-20260310-105015.png?format=webp "Document image")

﻿

## Prerequisites

* Two email accounts, such as a business email address and a personal email address

**This example uses Gmail.** If you have a different email provider, see its documentation for equivalent settings in the relevant steps.

## Step 1. Add a Custom mailhook module

The **Webhooks** > **Custom mailhook** module generates an email address (mailhook) that your email provider forwards new emails to, triggering the scenario﻿.

To add a **Custom mailhook** module:

1

In the Scenario﻿ Builder, in the top-left corner, name your scenario﻿ and click **Save**.

2

Click the giant plus.

3

In the app search, search for and click **Webhooks**.

4

Select the **Custom mailhook** module.

5

In the module settings, in **Mailhook**, click **Add**.

6

In **Webhook name**, name the mailhook. For example, use the scenario﻿ name.

7

Click **Save**. You'll now see the generated mailhook to use in later steps.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/_8Wzdo8HuFT2alJxIZ-mV-20260310-151201.png?format=webp "Document image")

﻿

8

Copy the address to your clipboard and click **Save**. You'll later update your email settings to forward emails to it.

9

Click **Save** in the Scenario﻿ toolbar.

You've now added a **Webhooks** > **Custom mailhook** module.

## Step 2. Add your mailhook as a forwarding email

In the email account where new emails trigger the scenario﻿, add the mailhook as a forwarding address so your email provider sends new emails to it.

To add the mailhook as a forwarding address:

1

Open your Gmail account.

2

Click the **Settings** icon in the top-right menu, and click **See all settings**.

3

Go to the **Forwarding and POP/IMAP** tab.

4

Click **Add a forwarding address**.

5

Paste the mailhook that you copied earlier.

6

Agree to proceed in all remaining steps.

You've now added the mailhook as a forwarding address in Gmail.

## Step 3. Create an email filter

To send only specific incoming emails to the mailhook, rather than all emails, create a filter in Gmail.

To create an email filter:

1

In **Settings** in your Gmail account, go to the **Filters and Blocked Addresses** tab.

2

Click **Create a new filter**.

3

In **From**, enter the email address associated with the email account that you're in now.

You use your own email address so you can send yourself an email and reply to it. Your email reply passes an important header into Make﻿ called references that you must map later in the scenario﻿.

4

Click **Create filter**.

5

Select **Forward it to:** and select the mailhook that you added in the previous step.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/vi30Xf7yw6_bx_nXKy5BV-20260311-150732.png?format=webp "Document image")

﻿

6

Click **Create filter**.

You've now created an email filter, so only specific emails go to the mailhook.

## Step 4. Send a test email to the Custom mailhook module

To test that your **Custom mailhook** module receives forwarded emails from Gmail:

1

In the Scenario﻿ Builder, click **Run once** on the Scenario﻿ toolbar.

2

In Gmail, send yourself an email.

3

Once the mailhook receives the email, you can click the output bubble of the **Custom mailhook** module to view the email properties, such as headers.

You've now sent a test email to yourself. Next, reply to it.

## Step 5. Reply to the test email

Reply to the first test email to pass headers that are only available in email replies —in-reply-to and references—into the scenario﻿ for mapping. You'll need these values for replying to emails.

To reply to the test email:

1

Click **Run once** on the Scenario﻿ toolbar.

2

Go to your Gmail account.

3

Reply to the email that you sent yourself.

4

Once the mailhook receives the email, click the output bubble to expand Headers and view the values you'll use in later steps:

* message-ID: The unique ID of an email

* in-reply-to: The message ID of the email being replied to

* references: A list of message IDs in a single thread of emails, with the first ID being the initial email

The **Webhooks** > **Custom mailhook** is complete now that it has reply email output data.

## Step 6. Add a Run an agent module

To add the **Make AI Agents (New)** > **Run an agent** module:

1

Click the plus icon next to the **Webhooks** > **Custom mailhook** module.

2

In the app search, search and click **Make AI Agents (New)**.

3

Click the **Run an agent** module.

4

In **Connection**, select an existing AI provider connection from the dropdown or click **Add** to add a new one.

If you don't want to create an account with an AI provider, select **Make's AI Provider**.

5

In **Model**, select a model from your chosen AI provider.

6

In **Instructions**, describe who the agent is and what it does. Alternatively, copy-paste the following: You are a helpful agent who replies to emails.

7

In **Input**, tell the agent to read the email content and answer in HTML. You can copy-paste the following:

Read the content of this email </content> Text </content>, and answer in HTML format. Directly reply to the email. Don't add any internal instructions or provide an email signature.

While optional, XML tags (</content>) clearly separate data (Text) from the rest of the instructions.

8

Replace Text with the Text value from the **Webhooks** > **Custom mailhook** module.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/LqdAYMZaecRD0SbybR8XS-20260312-124822.png?format=webp "Document image")

﻿

9

In **Conversation ID**, enter the following function: ifempty( first( split( Headers: references; space ) ) ; Headers: message-id)

This function uses the first message ID listed in the reference header, and if empty, uses the message ID. The split(splits the reference array into individual values and the first( uses the first value.

10

Replace the text in the function (Headers: reference and Headers: message-id) with the corresponding values from the **Webhooks** > **Custom mailhook** module.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/7EdO6nIaT2bTJgWMtlnA2-20260312-132350.png?format=webp "Document image")

﻿

11

Click **Save** in the Scenario﻿ toolbar.

You've now added a **Run an agent (New)** module.

## Step 7. Add a Send an email module

The **Gmail** > **Send an email** module replies to emails with agent-generated answers from the **Make AI Agents (New)** > **Run an agent** module.

To add a **Send an email** module:

1

Click the plus icon next to the **Make AI Agents (New)** > **Run an agent** module.

2

In the app search, search for **Gmail** and click **Send an email**.

3

In the module settings, in **Connection**, select the Gmail connection that you used to create the mailhook.

4

In **To**, map the Sender: Email address value from the **Webhooks** > **Custom mailhook** module.

5

In **Subject**, map the Subject value from the **Webhooks** > **Custom mailhook** module.

6

In **Body type**, select Raw HTML because you requested HTML in the agent instructions.

7

In **Content**, map the Responsevalue from the **Make AI Agents (New)** > **Run an agent** module.

8

Toggle **Advanced settings**.

9

In **Additional email headers**, add these email headers:

* **Email header 1**:

* In **Key**, enter in-reply-to.

* In **Value**, map the Headers: message-id value from the **Webhooks** > **Custom mailhook** module.

* **Email header 2**:

* In **Key**, enter references.

* In **Value**, map the Headers: references and Headers: message-id values from the **Webhooks** > **Custom mailhook** module.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/dS3uBwLPQ-aP1j1m_oVYQ-20260312-154447.png?format=webp "Document image")

﻿

10

Click **Save**.

11

Click **Save** on the Scenario﻿ toolbar.

Your email webhook-triggered AI agent scenario﻿ is now ready to test again.

## Step 8. Update the email filter and test it

Based on your current email settings, Gmail forwards emails from yourself—including agent replies to them—to the mailhook.

To prevent an infinite loop, where each agent reply triggers the scenario﻿, add a different email address to your email filter, such as your personal email address, and test it from that account.

To update the email filter and test it:

1

In Gmail, click the **Settings** icon, and click **See all settings**.

2

Click **Filters and Blocked Addresses**.

3

Find your existing email filter and click **edit**.

4

In **From**, add a different email address.

5

Click **Continue**, then click **Update filter**.

6

In the email account associated with the new address, send an email to the original email address.

7

In the Scenario﻿ Builder, click **Run once** on the Scenario﻿ toolbar to test if agent replies work.

8

Return to the account associated with the new email address. You now have an email thread with the initial email (**1**) and the agent reply (**2**).

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/ylyWdD7SlpHm8HeC0VD9w-20260313-094129.png?format=webp "Document image")

﻿

You've now created a mailhook-triggered AI agent scenario﻿, where your target email account forwards emails to a mailhook, and the agent immediately replies to them.

Next, you can tailor the email filter with additional specifics, depending on your use case.

Updated 19 Mar 2026

Did this page help you?

Yes

No

[PREVIOUS

Webhook-triggered AI agent](/webhook-triggered-ai-agent "Webhook-triggered AI agent")[NEXT

Knowledge](/knowledge "Knowledge")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

# Webhook-triggered AI agent - Help Center

Source: https://help.make.com/webhook-triggered-ai-agent
Lastmod: 2026-03-19T18:46:56.773Z
Description: Help Center
Make AI Agents (New)

Create AI agents for different...

# Webhook-triggered AI agent

5 min

This webhook-triggered AI agent scenario﻿ watches for new data sent to a [webhook](/webhooks)﻿ and the agent sends a reply back to the webhook. It is ideal for sending data from third-party services to Make﻿.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/lB6H9tA6bjxzEdxVaqLPF-20260211-121001.png?format=webp "Document image")

﻿

## Prerequisites

* A [**Postman account**](https://www.postman.com/ "Postman account") ﻿

## Step 1. Add a Custom webhook

The **Webhooks** > **Custom webhook** module allows the agent to automatically receive new data from any third-party service.

To add the **Custom Webhook** module:

1

In the Scenario﻿ Builder, click the giant plus.

2

In the app search, search for and click **Webhooks**.

3

Click the **Custom webhook** module.

4

In **Webhook**, click **Add** to create a new one.

5

In the **Create a webhook** dialog, in **Webhook name**, name your webhook to identify it later.

6

Optionally, in **API keys**, create an API key that consists of characters of your choice for additional security.

7

Copy the webhook URL to your clipboard.

You've now added a **Webhooks** > **Custom webhook** module to your scenario﻿.

## Step 2. Test the webhook in Postman

To check that your webhook works, send a sample request to it from Postman. This action mimics a real request from a third-party service.

To send the request in Postman:

1

Paste your webhook URL and select **POST**.

2

In **Body**, add the following configuration:

JSON

1{
2 "request" : "test",
3 "conversationID" : "333333"
4}

{
"request" : "test",
"conversationID" : "333333"
}
/\*\*
\* Reset the text fill color so that placeholder is visible
\*/
.npm\_\_react-simple-code-editor\_\_textarea:empty {
-webkit-text-fill-color: inherit !important;
}
/\*\*
\* Hack to apply on some CSS on IE10 and IE11
\*/
@media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
/\*\*
\* IE doesn't support '-webkit-text-fill-color'
\* So we use 'color: transparent' to make the text transparent on IE
\* Unlike other browsers, it doesn't affect caret color in IE
\*/
.npm\_\_react-simple-code-editor\_\_textarea {
color: transparent !important;
}
.npm\_\_react-simple-code-editor\_\_textarea::selection {
background-color: #accef7 !important;
color: transparent !important;
}
}

﻿

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/R-3wljXY1ArUN3d2JfQNZ-20260211-100643.png?format=webp "Document image")

﻿

3

In **Authorization**, if you have an API key:

1. In **Key**, enter x-make-apikey.

2. In **Value**, enter your APi key.

4

Click **Send** to send the request to the webhook.

5

Go back to your webhook scenario﻿ to check if you have a **Successfully determined** status below the webhook URL. This means that the webhook works.

6

Click **Save**.

You've now tested your webhook URL in Postman.

## Step 3. Add a Run an agent module

To add a **Make AI Agents (New)** > **Run an agent** module:

1

In the Scenario﻿ Builder, click the plus icon next to the **Webhooks** > **Custom webhook** module.

2

In the app search, search for and click **Make AI Agents (New)**.

3

Click the **Run an agent** module.

4

In **Connection**, select an existing AI provider connection or click **Add** to create a new one.

If you don't want to set up an account with an AI provider, select **Make's AI Provider**.

5

In **Model**, select a model from your chosen AI provider.

6

In **Instructions**, describe who the agent is and what it does. For example, "You are a helpful agent who answers questions."

7

In **Input**, map the request value from the **Webhooks** > **Custom webhook** module.

8

In **Conversation ID**, map the conversationID value from the **Webhooks** > **Custom webhook** module.

The agent uses this ID to remember previous exchanges in the conversation, allowing it to provide contextual responses when the user asks follow-up questions. The agent treats each new value as a new conversation.

In Postman, you set a random Conversation ID value.

9

Click **Save**.

10

Click **Save** on the Scenario﻿ toolbar.

You've now added a **Make AI Agents (New)** > **Run an agent** module to your scenario.

## Step 4. Add a Webhook response module

The **Webhooks** > **Webhook response** module allows the agent to reply to the webhook request.

To add the **Webhooks** > **Webhook response** module:

1

In the Scenario﻿ Builder, click the plus icon next to the **Make AI Agents (New)** > **Run an agent** module.

2

In the app search, click **Webhooks**.

3

Click **Webhook** response.

4

In **Body**, enter a simple JSON response:

JSON

1{
2"response": "<Response>"
3}

{
"response": "<Response>"
}
/\*\*
\* Reset the text fill color so that placeholder is visible
\*/
.npm\_\_react-simple-code-editor\_\_textarea:empty {
-webkit-text-fill-color: inherit !important;
}
/\*\*
\* Hack to apply on some CSS on IE10 and IE11
\*/
@media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
/\*\*
\* IE doesn't support '-webkit-text-fill-color'
\* So we use 'color: transparent' to make the text transparent on IE
\* Unlike other browsers, it doesn't affect caret color in IE
\*/
.npm\_\_react-simple-code-editor\_\_textarea {
color: transparent !important;
}
.npm\_\_react-simple-code-editor\_\_textarea::selection {
background-color: #accef7 !important;
color: transparent !important;
}
}

﻿

5

To replace the <Response> placeholder, map the Response value from the **Make AI Agents (New)** > **Run an agent** module.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/1yAqhtukacNRS-9VOpZyB-20260211-105140.png?format=webp "Document image")

﻿

6

Toggle **Advanced settings**.

7

In **Custom headers**, click **Add item** to define the type of data returned:

1. In **Key**, enter content-type.

2. In **Value**, enter application/json.

8

Click **Save**.

9

Click **Save** on the Scenario﻿ toolbar.

10

Toggle **Immediately as data arrives** to activate the scenario﻿, so it's ready to receive incoming data as soon as it comes.

11

Click **Save**.

You've now built a webhook-triggered scenario﻿, so any third-party service can send data to the webhook and pass it into the agent.

Updated 19 Mar 2026

Did this page help you?

Yes

No

[PREVIOUS

Form-triggered AI agent](/form-triggered-ai-agent "Form-triggered AI agent")[NEXT

Mailhook-triggered AI agent](/mailhook-triggered-ai-agent "Mailhook-triggered AI agent")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

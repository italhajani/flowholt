# Webhooks - Help Center

Source: https://help.make.com/webhooks
Lastmod: 2026-04-08T14:40:12.863Z
Description: Create webhooks to trigger scenarios instantly and manage their data processing and queues
Key concepts

Apps & modules

# Webhooks

14 min

Webhooks allow you to send data to Make﻿ over HTTPS. Webhooks create a URL that you can call from an external app or service, or from another Make﻿ scenario﻿. Use webhooks to trigger the execution of scenarios﻿.

Webhooks usually act as instant triggers. Contrary to scheduled triggers, which periodically ask a given service for new data to be processed, webhooks execute the scenario﻿ immediately after the webhook URL receives a request.

﻿Make﻿ supports the following types of webhooks:

* App-specific webhooks listen for data coming out of a specific app, also called instant triggers.

* Custom webhooks allow you to create a URL to which you can send any data.

## Creating app-specific webhooks

Many apps provide webhooks to execute scenarios﻿ whenever a certain change occurs in the app. These are called **instant triggers**. Instant triggers are marked with the label **INSTANT** in the list of an app's modules:

![Document image](https://images.archbee.com/PL8X94efBsjvhfQV3wyyj-sMjOTx6FEUYqBbk_DoqQR-20250715-110630.png?format=webp "Document image")

﻿

If an app does not provide webhooks, you can use **polling triggers** to periodically poll the service for new data.

## Creating custom webhooks

To create a custom webhook, you must use Make's Webhooks app. You can find information regarding how to set up the Custom webhooks module in the [Webhooks](https://apps.make.com/gateway)﻿ app documentation.

## Scheduling webhooks processing

By default, when Make﻿ receives data on a webhook, your scenario﻿ executes immediately. If you don't want to run your scenario﻿ immediately after a webhook receives data, you can schedule your scenario﻿ to process all webhook requests periodically.

1

Edit the scenario﻿ which is triggered by your webhook.

2

Edit the scenario﻿ schedule settings or edit the schedule settings of the webhook module.

3

Set up your desired schedule.

When a scheduled webhook receives data, Make﻿ stores the data in the webhook's queue. The whole queue is then processed every time your schedule criteria are met.

## How Make﻿ processes webhooks

When a webhook receives a request, the system stores the request in the webhook's queue. Each webhook has its own queue. Go to the **Webhooks** section in the left menu to view all webhooks and their queues.

### Parallel vs. sequential processing

If you are using instant webhooks, Make﻿ starts processing each request immediately as the request is received. By default, scenarios﻿ **with instant webhooks are processed in parallel**. Even if a previous scenario﻿ execution is still being processed, Make﻿ does not wait for its processing to complete.

You can inspect all running executions in the scenario﻿ detail. Click an item in the list of running executions to view the graphical representation of that particular execution. The execution that is currently displayed is marked with an eye icon.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/nf8Uv0eH5CSZ07_H5zF2_-20251001-141448.png?format=webp "Document image")

﻿

**To turn off parallel processing**, open the settings of your scenario﻿ and select **Sequential processing**. With sequential processing enabled, Make﻿ waits until the previous execution is complete before starting the next one. Also, use sequential processing when you need to process your webhook requests in the order that they came in.

### Processing scheduled webhooks

If you are using scheduled webhooks, requests accumulate in the queue until the schedule criteria are met. When schedule criteria are met, Make﻿ processes the queued requests based on the *Maximum number of results* that you set for the webhook.

For example, if your scenario is scheduled to run every hour and your *Maximum number of results* is set to the default value of 2, Make﻿ processes two items from the queue every hour. If your webhook queue is filling up with requests, increase the *Maximum number of results* or adjust the schedule to execute the scenario more often.

**Instant trigger** modules have the *Maximum number of cycles* parameter instead of the *Maximum number of results*.

Set the *Maximum number of cycles* in the **instant trigger** modules to get the same data processing behavior as is with webhooks and the *Maximum number of results* parameter.

### Webhook response module

The Webhook response module is typically used to send a response back to the service that triggered the webhook, confirming receipt or providing additional information. **Without** this module in your scenario﻿, the default responses are:

| ﻿ | **HTTP status code** | **Body** |
| --- | --- | --- |
| Webhook accepted in the queue | 200 | Accepted |
| Webhook queue full | 400 | Queue is full |
| Rate limit check failed | 429 | Too many requests |

Learn more about setting up a rate limit [here](https://help.make.com/schedule-a-scenario#lcstO "here").

You can further customize this response with the [Webhook response module](https://apps.make.com/gateway#VI6Pr "Webhook response module").

If you place the Webhook response module in the middle of a scenario﻿ and an error occurs in a subsequent module, the scenario﻿ will not be deactivated. This can result in increased consumption of credits as you will not receive notification of the error.

If you place the Webhook response module last, you will be notified if any error occurs at any point in the scenario﻿.

### Webhook queue details

When data arrives to a webhook and the call is not processed instantly, Make﻿ stores it in the webhook processing queue.

The limit for the number of webhook queue items depends on your usage allowance, which is a part of your subscription. For every 10,000 credits licensed per month, you can have up to 667 items in each webhook's queue. The maximum number is 10,000 items in the webhook's queue.

When the webhook queue is full, Make﻿ rejects all incoming webhook data which is over the limit.

Incoming webhook data is always stored in the queue regardless of the data is confidential option settings. As soon as the data is processed in a scenario﻿, it is permanently deleted.

### View webhook queue

To view the content of the queue, follow the steps below.

1

In the left sidebar, click **Webhooks.**

On smaller screens or at higher zoom levels, click the **three** **dots** and select **Webhooks**.

2

Select the webhook for which you want to view the queue.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/nl1ogrzVG0KjC3lIxZP7L-20251001-123214.png?format=webp "Document image")

﻿

3

You will see the details of that specific webhook:

* Webhook status

* Status of your scenario﻿

* ﻿Scenario﻿ ID and scenario﻿ URL

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/LRyoYv_AJcE5J4hfH-qex-20251001-124447.png?format=webp "Document image")

﻿

Some apps also include a Webhook URL and webhook UDID (unique webhook identifier).

4

To see the webhook's queue, switch to the **Queue** tab.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/avW3lTwIqhRDBd4JEGFeL-20251001-125218.png?format=webp "Document image")

﻿

5

Click **Detail** next to the webhook you want to inspect.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/gt_VUnTr7z7aWAmgVzi-b-20251001-125253.png?format=webp "Document image")

﻿

You will see the parsed items.

### Expiration of inactive webhooks

﻿Make﻿ automatically deactivates webhooks that are not connected to any scenario﻿ for more than 5 days (120 hours). The hook return 410 Gone status code.

![Document image](https://images.archbee.com/4CkrlJIBl1di_p1x71ery-tReEgTE6hsNRs41aFjkiz-20250210-160531.png?format=webp "Document image")

﻿

### Delete webhook item from a queue

To delete a webhook item from a queue:

1

Go to **Webhooks** in the left sidebar.

2

Select the webhook to view its queue.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/nl1ogrzVG0KjC3lIxZP7L-20251001-123214.png?format=webp "Document image")

﻿

3

Switch to the **Queue** tab.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/avW3lTwIqhRDBd4JEGFeL-20251001-125218.png?format=webp "Document image")

﻿

4

Tick the boxes on the left of the entries you want to delete, and click **Delete** **selected**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/8FjbKwT2_KjPMjNFcnk6d-20251001-130747.png?format=webp "Document image")

﻿

To delete all, tick the first box on the left and then **Delete all**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/gPCCP6YaOfFEOFJMgupnv-20251001-130407.png?format=webp "Document image")

﻿

Click **Delete** to confirm.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/pZWvfODlE090Ff56OuYFo-20251001-130615.png "Document image")

﻿

You have deleted the incoming webhook item(s) from the queue.

### Webhook logs

﻿Make﻿ stores webhook logs for 3 days. For the organizations on the Enterprise plan, Make﻿ keeps the webhook logs for 30 days. Make﻿ deletes logs older than other retention limit.

To view webhook logs, follow the steps below.

1

In the left sidebar, click **Webhooks.**

On smaller screens or at higher zoom levels, click the **three** **dots** and select **Webhooks**.

2

Select the webhook for which you want to view the logs.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/nl1ogrzVG0KjC3lIxZP7L-20251001-123214.png?format=webp "Document image")

﻿

3

Switch to the **Logs** tab.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/8iPtia0Lh-OIpt1-FSOaW-20251001-131240.png?format=webp "Document image")

﻿

You can see:

* The status of the webhook call (success, warning, error, or all)

To filter the webhook logs by status, click the filter icon.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/rTDEtCrnRBKR9f0wW85xG-20251001-131727.png "Document image")

﻿

* Date and time of the incoming webhook

To sort the webhook log by date and time, click the arrow icon. To filter the webhook logs by date of creation, click the filter icon on the right and enter a date.

![Document image](https://app.archbee.com/api/optimize/PL8X94efBsjvhfQV3wyyj-uplmAax3Mh9WpoKvH3bGT-20250716-082942.png "Document image")

﻿

* Webhook execution log size

4

To see the details of the specific webhook log, click **Detail**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/eN1jQvzeL-EomI6AFmn-N-20251001-132147.png?format=webp "Document image")

﻿

You will see:

* Webhook request (timestamp, URL, method, headers, query, body)

* Webhook response (status, headers, body)

* Parsed items

* Parsed items combine the query parameters and body of the webhook request in one bundle.

## Updating webhook settings

You can update a webhook's settings when you use the Custom Webhooks module only. To learn more, see the [Webhooks](https://apps.make.com/gateway#edit-custom-webhook-settings)﻿ app documentation.

## Error Handling

When there is an error in your scenario﻿ with a webhook, the scenario﻿:

* stops immediately - when the scenario is set to run *Immediately*.

* stops after 3 unsuccessful attempts (3 errors) - when the scenario is set to run as **scheduled**.

## Webhook rate limit

﻿Make﻿ can process up to 300 incoming webhook requests per 10 second interval.

If you send more, the system returns an error with status code 429.

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

Update legacy modules with new modules](/update-legacy-modules-with-new-modules "Update legacy modules with new modules")[NEXT

Select the first bundle to process](/select-the-first-bundle-to-process "Select the first bundle to process")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

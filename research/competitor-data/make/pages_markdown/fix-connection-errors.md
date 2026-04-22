# Fix connection errors - Help Center

Source: https://help.make.com/fix-connection-errors
Lastmod: 2026-02-10T07:31:33.230Z
Description: Understand what causes connection errors and how to manage them with error handlers
Error handling

How to handle errors

# Fix connection errors

3 min

App modules output the ConnectionError when the app is unavailable. For example, the app might be offline for maintenance.

﻿Make﻿ uses the [HTTP 503 and 504 status codes](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes "HTTP 503 and 504 status codes") to identify the ConnectionError.

﻿Make﻿ follows the standard error codes and their definitions. Note that it is possible that the third party may not fully comply with the standard.

When a module in your scenario﻿ outputs the ConnectionError, you should check the status page of the module app. Chances are that the status page will have the URL https://status.domain, for example [https://status.make.com](https://status.make.com "https://status.make.com").

When Make﻿ recognizes the module output as the [ConnectionError](n4w0YAeoP7a-A4VfW-EBp#0sYf1)﻿ and you don't use any error handling, Make﻿ acts depending on the following attributes:

* ﻿scenario﻿ scheduling

* enabling of the incomplete executions

| ﻿ | Incomplete executions disabled | Incomplete executions enabled |
| --- | --- | --- |
| Scheduled scenario﻿ | ﻿Make﻿ pauses the scheduling of the scenario for 20 minutes.  ﻿Make﻿ doesn't rerun the scenario. | ﻿Make﻿ pauses the scheduling of the scenario for 20 minutes.  ﻿Make﻿ retries the incomplete execution with the incomplete execution [backoff](/exponential-backoff)﻿. |
| Instant scenario﻿ | ﻿Make﻿ reruns the incomplete execution with the scenario﻿ [backoff](/exponential-backoff)﻿. | ﻿Make﻿ retries the incomplete execution with the incomplete execution [backoff](/exponential-backoff)﻿. |

## How to handle the ConnectionError

To handle the ConnectionError, you can use the [strategies for handling the RateLimitError](/fix-rate-limit-errors#)﻿. The most efficient strategy is to use the [Break error handler](/break-error-handler#)﻿ to rerun the scenario﻿ after a delay:

1

If your scenario﻿ triggers with an [instant trigger](PDoPIBceCKCboMPpKplmY#gfYHC)﻿ (for example, a custom webhook module), consider enabling sequential processing in scenario settings. With sequential processing, the trigger module processes incoming data one by one in the order they arrive.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/szxk7pC0B-0-SAbMj_Nsr_uuid-fc7e3caf-3e31-697f-ec74-64e9056122bf.png?format=webp "Document image")

﻿

Otherwise, skip this step.

If a scenario﻿ has incomplete executions and sequential processing enabled, Make﻿ pauses the scenario﻿ until the incomplete executions are processed to keep the order of incoming data.

2

Add the **Break** error handler to the module that is causing the errors.

Consider setting the delay and the number of attempts according to the importance and the schedule of your scenario﻿.

For example, if the app has occasional downtime for maintenance for a few hours with no availability, it might be best to set a lower number of attempts with longer time periods between them.

On the other hand, if the app is occasionally unavailable because it's overloaded, and the scenario﻿ is important for you, it might be best to use a short time period (a few minutes) with a higher number of attempts.

3

Enable incomplete executions in the scenario﻿ settings. Make﻿ will save bundles that caused the error.

For example, if you would use the **Webhook** trigger to ask questions to **ChatGPT**, but the **ChatGPT** app is sometimes overloaded with requests and sending back errors, your Make and Make settings with error handling could look like this:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/knZ45PKnPwPT5mEYOYbRk_uuid-00ea2d20-42c0-038a-d330-a7a44c61907b.png?format=webp "Document image")

﻿

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/szxk7pC0B-0-SAbMj_Nsr_uuid-fc7e3caf-3e31-697f-ec74-64e9056122bf.png?format=webp "Document image")

﻿

﻿

Whenever the **Create a completion** module outputs the ConnectionError because the OpenAI servers are overloaded or unavailable, Make﻿ creates an incomplete execution with the **Create a completion** module.

After the delay set in the **Break** error handler, Make﻿ reruns the **Create a completion** module. If the rerun succeeds, Make﻿ will continue scheduling new scenario﻿ runs.

If the rerun fails, Make﻿ reruns the module again after the delay, up to the number of attempts set in the **Break** error handler settings.

Updated 10 Feb 2026

Did this page help you?

Yes

No

[PREVIOUS

Fix rate limit errors](/fix-rate-limit-errors "Fix rate limit errors")[NEXT

Fix missing data errors](/fix-missing-data-errors "Fix missing data errors")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

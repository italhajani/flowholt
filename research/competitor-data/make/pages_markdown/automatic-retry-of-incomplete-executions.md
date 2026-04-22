# Automatic retry of incomplete executions - Help Center

Source: https://help.make.com/automatic-retry-of-incomplete-executions
Lastmod: 2026-04-08T14:40:12.116Z
Description: Help Center
Explore more

...

Incomplete executions

# Automatic retry of incomplete executions

3 min

﻿Make﻿ checks the origin of every incomplete execution when it's created. Make﻿ automatically retries incomplete executions that have been created because of:

* RateLimitError

* ConnectionError

* ModuleTimeoutError

and incomplete executions that were created with the [Break error handler](/break-error-handler)﻿ with the automatic run completion enabled.

﻿Make﻿ takes the following steps when Make﻿ retries incomplete executions:

1. ﻿Make﻿ schedules the incomplete execution retries.

2. ﻿Make﻿ retries the incomplete execution.

3. Based on the incomplete execution retry result Make﻿ schedules another attempt or marks the incomplete execution resolved.

## Automatic retry scheduling

﻿Make﻿ schedules automatic retries with the [incomplete executions backoff](/exponential-backoff)﻿ schedule. The backoff schedule prevents the situation when you would get the same error multiple times in a row.

For example, when you get the ConnectionError because the app is unavailable, it might take some time until it's back. Make﻿ spaces out the retry attempts to get a successful retry even at a later time after the original error.

| **Error type** | **Retry schedule** |
| --- | --- |
| * RateLimitError  * ConnectionError  * ModuleTimeoutError | 1. 1 minute (1 minute after the original scenario﻿ run).  2. 10 minutes (11 minutes after the original scenario﻿ run).  3. 10 minutes (21 minutes after the original scenario﻿ run).  4. 30 minutes (51 minutes after the original scenario﻿ run).  5. 30 minutes (1 hour 21 minutes after the original scenario﻿ run).  6. 30 minutes (1 hour 51 minutes after the original scenario﻿ run).  7. 3 hours (4 hours 51 minutes after the original scenario﻿ run).  8. 3 hours (7 hours 51 minutes after the original scenario﻿ run). |
| Error handled by the **Break** error handler | If you enable automatic scenario﻿ run completion in the error handler settings. The default is:  * maximum number of retry attempts: 3  * retry delay: 15 minutes  You can customize the defaults in the error handler settings. |

Other [error types](n4w0YAeoP7a-A4VfW-EBp)﻿ usually require changes in the incomplete execution and [manual resolving](/manage-incomplete-executions#resolve-an-incomplete-execution)﻿. Make﻿ doesn't retry these error types automatically by default.

## Automatic retry processing

After Make﻿ schedules the retries, Make﻿ runs the scenario﻿ again, starting with the module that caused the error.

For each scenario﻿, there is a limit of 3 incomplete execution retries running in parallel. If there are more incomplete executions scheduled from the same scenario﻿, Make﻿ retries them in batches of 3 after the previous batch finishes.

In addition, the retry doesn't start when the original scenario﻿ is running already.

The 3 parallel retries limit applies to retries from the same scenario﻿. When Make﻿ retries incomplete executions from multiple scenarios﻿, then each of them has their own limit.

This limitation is to prevent your scenarios﻿ from getting follow-up rate limit errors if you are retrying a lot of incomplete executions at the same time.

**For example:**

You have a scenario﻿ that runs for 10 minutes every hour. There was a disruption of a third party service for 5 hours.

* The scenario﻿ now has 5 incomplete executions scheduled for automatic retry.

* ﻿Make﻿ first waits until the original scenario﻿ finishes if it's running already. This takes 10 minutes if the scenario﻿ started just now.

* After the scenario﻿ finishes, Make﻿ retries the first 3 incomplete executions. This takes an additional 10 minutes (20 in total).

* ﻿Make﻿ retries the remaining 2 incomplete executions after the previous batch finishes. This takes another 10 minutes (30 in total).

* After another 30 minutes (1 hour in total), Make﻿ starts the scenario﻿ again according to the scenario﻿ schedule.

## Automatic retry result

If a retry attempt succeeds, Make﻿ marks the incomplete execution as **Resolved** and stops retrying.

If all of the retry attempts fail, Make﻿ marks the incomplete execution as **Unresolved**. You can then retry the incomplete execution when the app that caused the error is available again or you can resolve the incomplete execution manually.

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

Incomplete executions](/incomplete-executions "Incomplete executions")[NEXT

Manage incomplete executions](/manage-incomplete-executions "Manage incomplete executions")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

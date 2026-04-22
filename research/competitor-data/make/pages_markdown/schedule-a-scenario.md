# Schedule a scenario - Help Center

Source: https://help.make.com/schedule-a-scenario
Lastmod: 2026-01-15T15:04:53.496Z
Description: Schedule your Make scenarios and set rate limits to control exactly when and how often they run
Key concepts

Scenarios & connections

# Schedule a scenario

5 min

Make allows you to define when and how often an [active](/active-and-inactive-scenarios#)﻿ scenario﻿ executes.

1. Go to the Scenario Builder.

2. Click "Every 15 minutes" in the Scenario Builder toolbar.

3. The **Schedule setting panel** appears. Use this panel to customize your scenario﻿ schedule.

## Schedule setting panel

The schedule setting panel lets you adjust the running schedule of the scenario﻿. By default, a scenario﻿ runs every 15 minutes, but within this panel, you can customize the run schedule and the interval.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/XYxUrx718klfibTyLfrA3-20251124-111825.png "Document image")

﻿

### Run a scenario﻿

You can select the following schedule options:

* Immediately

* At regular intervals

* Once

* Every day

* Days of the week

* Days of the month

* Specified dates

* On demand

When choosing any of these options, you may have to further define how often you want the run to occur. For example, if you select the **At regular intervals** option you must define the time interval (in minutes) between two consecutive scenario﻿ runs.

The minimum length of the interval depends on your [plan](https://www.make.com/en/pricing "plan").

The **Immediately** option is available only for some triggers. For more information on triggers, please see the [types of modules](PDoPIBceCKCboMPpKplmY#)﻿ help guide.

You can always see how much time is left until the next scenario execution on the organization dashboard.

![Document image](https://images.archbee.com/PL8X94efBsjvhfQV3wyyj-kKSho7rG_I0OVVBM5cD-b-20250715-102621.png?format=webp "Document image")

﻿

### On demand scheduling

With the On demand scheduling option, your scenario﻿ is waiting to be triggered by an API call or the Run once button. The scenario﻿ does not have any schedule and it does not run unless you start it manually.

### Start and end date

To define the time range in which an activated scenario﻿ runs, check the **Show advanced settings** box and fill in the **Start** and **End** date.

## Set up scenario rate limit

If your scenario has an instant trigger that's triggered frequently within a short amount of time (tens of runs per minute) and connects to services like Slack or Shopify, it may exceed those services' rate limits. When this happens, the scenario will return an error for sending too many requests in a short time.

To avoid this, you can configure the **Maximum runs to start per minute** in the scenario's scheduling options.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/LnzwwE0EaaKH5-UARapTb-20251124-111910.png "Document image")

﻿

For example, if you set the maximum to 30 runs per minute, and that limit is reached, Make will keep subsequent requests in the queue and process them gradually as the configured limit allows it.

If your scenario has the **webhook response** module in it and exceeds the rate limit, the caller of the webhook will receive an **HTTP 429 Too many requests** error. This means the caller should wait and retry the request later.

﻿

Updated 15 Jan 2026

Did this page help you?

Yes

No

[PREVIOUS

Connect an application](/connect-an-application "Connect an application")[NEXT

Clone a scenario](/clone-a-scenario "Clone a scenario")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

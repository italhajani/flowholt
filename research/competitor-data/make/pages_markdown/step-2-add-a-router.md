# Step 2. Add a router - Help Center

Source: https://help.make.com/step-2-add-a-router
Lastmod: 2025-11-03T20:24:43.389Z
Description: Help Center
Get started

Expand your scenario

# Step 2. Add a router

2 min

A router allows you to split your scenario flow into multiple routes. Think of it like a fork in the road where your data can follow different paths based on your scenario requirements. This lets you process the same information in different ways - for example, sending all prospect notifications to Slack while only sending specific ones to mobile devices.

To add a router to your scenario:

1

In the left sidebar, click **Scenarios** and select the **New prospect notification** scenario you built in the [Create your first scenario](/create-your-first-scenario)﻿ section.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/FY1GbwQNxVjJ10OQiWrTm-20250930-115357.png?format=webp "Document image")

﻿

2

Right-click between the Google Sheets and Slack modules and select **Add a router**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/juGQN-gImC6XpO8YqyPi--20251103-202148.png?format=webp "Document image")

﻿

A router module will appear between the modules.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/6urYSAA2evnwYSCfuMmSS-20251103-202350.png?format=webp "Document image")

﻿

Alternatively, you can add a router the same way you add any other module:

* Click **+ Add another module** on the right side of your module, search for "Router" in the search field, and select **Router** from the results.

While the right-click option is recommended when you need to place a router between two existing modules, this alternative method adds the router at the end of your scenario. This is useful when building a scenario from scratch, but requires additional reconfiguration when working with existing modules.

3

Next, hover over the router and click the **+** icon that appears. This creates a second route that branches from the router.

![Document image](https://archbee-image-uploads.s3.amazonaws.com/oAyFj2GHlBeBVWF5OAir2/Q9Wb8dj152H-LDeQUlels-20251103-202436.gif "Document image")

﻿

Your scenario now has two routes: the original route to Slack, where all prospects are sent, and a new route that you'll set up in the next step to send only US-based prospects to the mobile app.

**Understanding routers**

A router is a Make tool that allows you to branch or split your scenario flow into multiple routes:

* Each route after a router can process data differently

* You can add conditions to each route using filters (which we'll cover in [Step 4. Add a filter](y6-o4tUEw1QSHnmW5XXC2)﻿)

* You can direct specific data to different destinations based on your requirements

* Routers don't consume credits, making them efficient for complex workflows

﻿

Updated 04 Nov 2025

Did this page help you?

Yes

No

[PREVIOUS

Step 1. Get your app ready](/step-1-get-your-app-ready "Step 1. Get your app ready")[NEXT

Step 3. Set up another module](/step-3-set-up-another-module "Step 3. Set up another module")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

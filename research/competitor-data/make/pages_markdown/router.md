# Router - Help Center

Source: https://help.make.com/router
Lastmod: 2026-01-15T17:27:53.467Z
Description: Branch a scenario into multiple routes to process data differently based on specific conditions
Key concepts

Tools

# Router

8 min

A router allows you to branch the scenario﻿ flow into several chains of modules. Each route processes the data differently according to the condition you set. Filters help you to determine conditions via different operators such as less than, greater than, and so on.

Order routes in the sequence you want and set up a fallback route that will process data that doesn't fit other routes.

See our scenario﻿ template for the [Controlled distribution of data flow](https://www.make.com/en/templates/2952-controlled-distribution-of-data-flow "Controlled distribution of data flow").

## Adding a router to a scenario﻿

You can add a router in two different ways:

* Connect a router to a module:

1

Click **Add another module**.

![Document image](https://images.archbee.com/4CkrlJIBl1di_p1x71ery-7A9Xm0SEYKNR5hyiYiNtj-20250214-104816.png?format=webp "Document image")

﻿

2

In the search box, type **Flow controls** and click it.

![Document image](https://images.archbee.com/4CkrlJIBl1di_p1x71ery-u0Ejrv2fkBo4bRM2LrUiS-20250214-104853.png?format=webp "Document image")

﻿

3

Select **Router**.

* Insert a router between two modules:

1

Right-click the bridge between two modules, and select **Add a router**.

![Document image](https://images.archbee.com/4CkrlJIBl1di_p1x71ery-AFT6IYmtIq9Qk8Hh71cyt-20250214-105016.png?format=webp "Document image")

﻿

## Order routes

You can set the order of routes in which Make﻿ processes them in the scenario﻿.

This example shows the router that determines which hint to send you on Slack according to tomorrow's weather.

1

Click the router that contains the routes you want to order.

2

Right-click and select **Order routes**. A window appears.

![Document image](https://images.archbee.com/4CkrlJIBl1di_p1x71ery-7NMjzMmIo7MABvZ3xT1oD-20250214-104142.png?format=webp "Document image")

﻿

3

Click arrows and move routes according to your needs.

4

*Optional*. Select **Auto-align arranges with set order** to visually arrange modules on the scenario﻿ canvas according to the set order.

5

Click **Apply**.

Routes are processed sequentially, not in parallel. Make﻿ won't process the second route unless it finishes processing the first one.

## The fallback route

A fallback route processes data that doesn't fit the condition of all other routes. You can mark a route as a fallback if you want it to be executed last.

You can set up a filter for a fallback route same as for other routes.

To set up a fallback route, follow the steps:

1

Click the route you want to mark as a fallback. A filter window appears.

![Document image](https://images.archbee.com/4CkrlJIBl1di_p1x71ery-SWpPW5k0ghLuACwq_5Mki-20250214-104238.png?format=webp "Document image")

﻿

2

Select **Yes**.

3

Click **Save**.

You can recognize the fallback route by the special arrow icon on the router module:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/bKOATYxUqQHyoHAhGGKn7_uuid-036cc5df-914c-058d-d73f-7e0774a9e6c1.png?format=webp "Document image")

﻿

## Select a whole branch

You can manage all modules in the branch at once.

Click the route menu, then click **Select whole branch**. It selects all the following modules.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/IrpZRCGHih_oujYeT9637_uuid-e3def79c-e047-8485-8c6e-d563eb9323a2.png?format=webp "Document image")

﻿

You can copy or delete all selected modules at once.

**Example of a router with a fallback route**

You need to receive a message on Slack depending on tomorrow's weather:

* if the weather is hot, the message is wear shorts.

* if the weather is cold, the message is wear a jacket.

* if the weather is neither hot nor cold, the message is better stay at home.

The scenario looks like that:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/chJne3fCQxUYdpDVbPlVV_uuid-1159cae7-cd6f-80a5-2280-f28de8aa5927.png?format=webp "Document image")

﻿

The scenario flow is:

1

The Weather module gets data about tomorrow's weather.

2

Data goes to the router that processes routes in the determined order:

![Document image](https://images.archbee.com/4CkrlJIBl1di_p1x71ery-BQG-iuSswyxPS-O03UXy_-20250214-103759.png?format=webp "Document image")

﻿

a. The **Hot weather** route sends the message to Slack, if data fits the filter condition:

![Document image](https://images.archbee.com/4CkrlJIBl1di_p1x71ery-pqtiJwBALe7xyVNGecyFL-20250214-103850.png?format=webp "Document image")

﻿

b. The **Cold weather** route sends the message to Slack, if data fits the filter condition:

![Document image](https://images.archbee.com/4CkrlJIBl1di_p1x71ery-1C8OePr9a8L6pnpZSb4Fm-20250214-103925.png?format=webp "Document image")

﻿

c. The **Fallback** route sends the message to Slack, if data doesn't fit previous routes.

![Document image](https://images.archbee.com/4CkrlJIBl1di_p1x71ery-w0NqmS-n5v_864VysGVU8-20250214-103953.png?format=webp "Document image")

﻿

﻿

Updated 15 Jan 2026

Did this page help you?

Yes

No

[PREVIOUS

Iterator](/iterator "Iterator")[NEXT

Resources](/resources "Resources")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

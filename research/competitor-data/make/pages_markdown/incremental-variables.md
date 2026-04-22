# Incremental variables - Help Center

Source: https://help.make.com/incremental-variables
Lastmod: 2026-03-18T13:18:31.032Z
Description: Help Center
Explore more

...

Variables

# Incremental variables

2 min

Incremental variables are variables that can be used when you want to keep track of a value when a scenario﻿ or a route in a scenario﻿ runs.

## Use incremental variables when you need:

* Counters that increment with each scenario﻿ run

* Values that can either reset after each run or persist indefinitely

The incremental variable returns a value of 1 after the first run. The subsequent value is based on your choice for the value to never reset, reset after one cycle, or reset after one scenario﻿ run.

You can add an incremental variable to your scenario﻿ by clicking on to the **Tools** icon and selecting the **Increment function** module.

![Increment function](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-XsCQyMlfXCyTYY1LwdVTg-20250529-084116.png?format=webp "Increment function")

﻿

## Example: Rotating the assignment of tasks to users in a group

Imagine that you receive a form submission requesting the completion of a task. In the following scenario﻿, an incremental variable is set to count each time a request is submitted and send the task by email to different people, alternating the assignment of the task.

To alternate the tasks, we are using the mod function to filter the assignments between two people.

The mod function returns the remainder after dividing one number by another.

For example, 12 mod 2 = 0, because there is no remainder after dividing 12 by 2.

13 mod 2 = 1, because after dividing 13 by 2, there is a remainder of 1.

In this scenario﻿, the incremental variable value is divided by 2 using the mod function, and the tasks are routed to different people based on the remainder being even (0) or odd (1).

![Incremental variables](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-yBtHgNuMdMoYWoOtZV5tk-20250613-092333.png?format=webp "Incremental variables")

﻿

1

Add a **Tool > Increment function** module and configure the value to never reset.

![Increment function](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/C2MkrykLq6eO8kjT8AdK6_uuid-805d861a-325c-2420-1bf6-3582ec935f56.png?format=webp "Increment function")

﻿

2

Add a router. You will see two default routes added.

3

Click the wrench icon for the first route and set the filter:

**Label**: Odd

**Condition**: Map the incremental variable and use the mod math function and add the number 2

Change the **Equal to** operator from the default **Text operator** to the **Numeric operator** and type 1 in the comparison field.

![filter odd](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-nfjgUnE27ONDApVF8HPO9-20250613-092458.png?format=webp "filter odd")

﻿

4

Click the wrench icon for the second route and set the filter:

**Label:** Even

**Condition:** Map the incremental variable and use the mod math function and add the number 2.

Change the **Equal to** operator from the default **Text operator** to the **Numeric** operator and type 0 in the comparison field.

![even filter](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-26Rt5zyvVcRbZbQE1NE2s-20250613-092546.png?format=webp "even filter")

﻿

5

Complete your scenario﻿ by adding an Email module to the end of each route, notifying the recipient of their assignment.

As information comes in, the task assignment alternates between the two recipients.

﻿

Updated 18 Mar 2026

Did this page help you?

Yes

No

[PREVIOUS

Custom variables](/custom-variables "Custom variables")[NEXT

Incomplete executions](/incomplete-executions "Incomplete executions")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

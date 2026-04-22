# Variables - Help Center

Source: https://help.make.com/variables
Lastmod: 2026-04-08T14:40:13.782Z
Description: Understand types of variables and how to set them to store and reuse data in scenarios
Explore more

Scenarios

# Variables

5 min

Variables are containers for storing data. You can think of a variable as a “box” for data, with a uniquely-named sticker on it.

Imagine you are moving to a new home and you need to pack up all the things in your house. You might want a box for clothes, one for books, and one for the dishes. When you pack the boxes, it's helpful to add a label to each box. That way, you know what is inside.

Variables store data as boxes store items.

However, unlike a box, you can store only one thing in a variable. Variables have a fixed name and a value that can change. You can reference the name in your scenario﻿. The name is then replaced by the current value of your variable when the scenario﻿executes.

When using Make﻿, you might need to save certain pieces of information and assign a label to the information so that you can retrieve it later. A username, the day of the week, or available inventory left in your e-shop - these are just some examples of data that can be stored in variables as reusable elements that can be mapped to any module in the module's input fields.

# Types of variables

﻿Make﻿ offers four types of variables:

﻿[System variables](/system-variables)﻿

Provided by Make﻿*.* You can’t modify or delete system variables. They can be used in modules with input fields, filters within the scenario﻿ editor, and in templates.

﻿[Scenario variables](/scenario-variables)﻿

Created within a scenario﻿ for use in scenario﻿ executions. You can use the [Set variable](/util#set-variable)﻿ and [Set multiple variables](/util#set-multiple-variables)﻿ tools to define these variables.

﻿[Custom variables](/custom-variables)﻿﻿

Similar to scenario variables, but created at the Organization or Team level and can be accessed and modified within a scenario﻿ execution. Only available with Pro, Teams, and Enterprise [pricing plans](https://www.make.com/en/pricing "pricing plans").

﻿[Incremental variables](/incremental-variables)﻿﻿

Created for each scenario﻿. You can increment them any time in a scenario﻿ execution. The value of the incremental variable can be kept within multiple scenario﻿ executions.

# Variable use cases

Consider the following examples to determine the best variable to use in your scenario﻿.

### Get Make﻿ information

Use:

* System variable

A system variable is available in all scenarios﻿, created by Make﻿, and never deleted.

### Share a value between multiple scenarios﻿

**Use:**

* Custom variable

Organization-level custom variables are visible for all scenarios in the organization. Team-level custom variables are only visible inscenarios﻿ built within that team. They can be created, modified, or deleted by the admin of the organization or team. Custom variables can also be modified within a scenario﻿, by using the Make﻿ API or the **Update a Custom Variable** module

### Store a counter that can be shared between multiple scenario﻿ runs

**Use:**

* Custom variable

* Incremental variable

An incremental variable is only available in the current scenario﻿. Incremental variables are created by Make﻿ and are incremented using the **Tool>Increment Function** module. The value resets for each scenario﻿ execution, or never resets, based on the parameters chosen in the **Tool>Increment Function** module.

### Set a variable and retrieve its value in the same scenario﻿ run

**Use:**

* Custom variable, with restrictions

* Incremental variable, with restrictions

* Scenario variable

﻿Scenario﻿ variables only exist in the current scenario﻿. They can't be deleted, but they no longer exist when the scenario﻿ stops running.

**Restrictions:**

* While you can set the value of a custom variable in a scenario﻿, the other modules will still use its previous value. The new value of a custom variable is retrieved only when the scenario﻿ starts again.

* The increment is only a counter; you can't store any complex data.

### Set a variable and retrieve its value in other scenarios﻿

**Use:**

* Custom variable, with restrictions

**Restriction:**

* The value of the variable is retrieved only when the scenario﻿ starts its execution. If a Team or Organization variable is modified while a scenario﻿ is running, the current run will use the previous value of this variable. The new value of a custom variable is retrieved only when the scenario﻿ starts again.

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

Custom scenario properties](/custom-scenario-properties "Custom scenario properties")[NEXT

System variables](/system-variables "System variables")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

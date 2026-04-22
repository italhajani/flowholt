# Filtering - Help Center

Source: https://help.make.com/filtering
Lastmod: 2026-01-15T17:26:30.217Z
Description: Manage data flow between modules with filters and operators, and copy them
Key concepts

Data & mapping

# Filtering

4 min

In some scenarios﻿, you may need to only work with bundles that fit specific criteria. Filters will help you to select those bundles.

You can add a filter between two modules and check whether bundles received from the preceding modules fulfill specific filter conditions or not. If yes, the bundles will be passed on to the next module in the scenario﻿. If not, their processing will be terminated.

For example, if you want to create a scenario﻿ with the [Facebook](https://apps.make.com/facebook#)﻿ trigger *Watch posts* and you want to work only with posts containing a specific word or posts written by a specific author, a filter would make sure you receive only these posts and nothing else.

## Adding a filter

To add a filter between two modules, click on the connecting line between them.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/vfcJ7M8gpBi-dE4rqZWQs_uuid-1c880eae-ed8e-cb8c-b69a-33b4996368f8.png?format=webp "Document image")

﻿

This brings up a panel where you can enter the name for the filter that is to be created and define one or more filter conditions.

![screen-shot-2021-12-10-at-16_16_11.png](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/TbSIURX6BoQ0WpVdiMM9K_uuid-3d5735ef-a72c-04e2-86fc-50e9b0529622.png?format=webp "screen-shot-2021-12-10-at-16_16_11.png")

﻿

For each condition, you can enter one or two operands and an operator that will determine the relation between them. In the operand field, you can enter values in the same way as you would [map](/mapping#)﻿ them.

In the example above, you can see how to connect the [Gmail](v6l8KMmwflB2wxhoi3TRp#)﻿ trigger *Watch emails* and the [Google Drive](https://apps.make.com/google-drive#)﻿ action *Upload a file*. The filter automatically applies the condition to incoming bundles from the first module and only bundles containing attachments are allowed to pass on to the next module.

## Operators

For each condition, you can use one of several different operators.

### Basic operators

* **Exists** - checks whether a specific bundle item is filled in. Using this operator, you can create a filter that permits, for example, only Facebook posts that contain a photo to go through to the next module in a scenario﻿.

* **Not exists** - the opposite of *exists*. It permits only those bundles where a specific item is not filled in.

### Other operators

There are a number of other operators you can use: text comparison operators, numerical operators, time and date operators, and operators for working with [arrays](/array-functions#)﻿.

## Copying a filter

Copying filters is currently not natively supported by the [Scenario editor](7euvHnup3GLX7SO-Jdcng#)﻿, though if you use the Google Chrome web browser, the following workaround can be employed:

1

Install [Make DevTool](/make-devtool)﻿ Chrome extension.

2

In Make﻿, open your scenario﻿.

3

In Chrome, open the **Developer tools**. You can do so either by choosing the **Developer tools** command from the the Chrome main menu or just press Ctrl+Shift+I or F12:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/5P34QWcnnARKeSEitdHww-20260115-132649.png?format=webp "Document image")

﻿

4

In the **Developer tools**, click on the Make﻿ tab.

5

Click on the **Tools** icon in the left side bar.

6

.Click on the **Copy filter** tool and configure it in the right side panel.

7

Set the **Source Module** field - the module that's right after the filter you wish to copy.

8

Set the **Target Module** field - the module before which you wish to copy the filter.

9

Click on the **Run** button.

﻿

Updated 15 Jan 2026

Did this page help you?

Yes

No

[PREVIOUS

Mapping](/mapping "Mapping")[NEXT

Mapping arrays](/mapping-arrays "Mapping arrays")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

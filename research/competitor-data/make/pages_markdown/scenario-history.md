# Scenario history - Help Center

Source: https://help.make.com/scenario-history
Lastmod: 2026-04-08T14:40:13.076Z
Description: Monitor execution history and user changes, and export logs for debugging and analysis
Key concepts

Scenarios & connections

# Scenario history

8 min

TheScenario﻿history contains information about scenario﻿ runs and user changes to the scenario﻿. To find it, click a scenario﻿ in the scenario﻿ list, then switch to the **History**tab.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/qTIxoW3wa7Di5P-ELdYHZ-20251010-150015.png?format=webp "Document image")

﻿

## ﻿Scenario﻿ run and change log entries

In the Scenario﻿ history, scenario﻿ run entries include the following information:

* Run date and time

* ﻿[Run name](https://apps.make.com/scenario-service#customize-run-name "Run name")﻿

* Trigger or activity type

* Status (Success, Warning, Error)

* Run duration

* ﻿[Operations](/operations)﻿ completed

* ﻿[Credits](/credits)﻿ consumed

* Size of transferred data

* Source run

* ﻿[Scenario run replay](/scenario-run-replay)﻿﻿

* ﻿[Details](mPZad5K3W2s-ekmRsKdTI#xD-E1)﻿﻿

Change log entries record the following user actions:

* ﻿Scenario﻿ scheduling changes

* ﻿Scenario﻿ edits

* ﻿Scenario﻿ activation

The number of days your scenario﻿ run history entries are stored depends on your pricing plan. For details, see Make's [pricing page](https://www.make.com/en/pricing "pricing page").

## ﻿Scenario﻿ history details

You can view full information about a specific scenario﻿ run, including the bundles processed, in the **Details** of the **History** tab. This allows you to inspect module outputs and logs and understand how a scenario behaved – for example, if a module returned an unexpected value.

To view scenario run details:

1

Find the scenario run entry in the **History** tab.

2

Click **Details** on the right-hand side of the entry.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/BqDowlWKLNs3qkVpO_VXY-20260312-164321.png?format=webp "Document image")

﻿

In **Details**, you can:

1. Check the output bundles of a specific module from that scenario run.

2. See general information about the scenario run.

3. Switch between a simple log and an advanced log.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/YsunIPGQORwoIjm5NAg16-20260312-163804.png?format=webp "Document image")

﻿

## Filter Scenario﻿ history

To customize the columns you want to see in your Scenario﻿ history:

1

Click the filter icon on the right-hand side of the Scenario﻿ history.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/BG0KZ7WYBpbhdwKceR-TJ-20260313-090837.png?format=webp "Document image")

﻿

2

In the dropdown, unselect the columns you want to hide.

The **History** tab now displays only the selected columns.

To hide change log entries or [check runs](/types-of-modules#polling-triggers)﻿:

1

Click the three dots in the upper-right corner of the **History** tab.

2

Enable or disable **Hide check runs** and/or **Hide** **change log**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/casIokyUBmk0zqYsCJ6Cv-20260313-091347.png?format=webp "Document image")

﻿

If you disable the check runs, the scenario history won't display scheduled scenario﻿ runs that check for new data, but don't return anything. If you disable the change log, the scenario history won't display any changes made in the scenario (e.g., edits, activation).

## Export Scenario﻿ history

You can export your scenario﻿ history as a CSV file for a deeper analysis. To do that:

1

Click the three dots in the upper-right corner of the **History** tab.

2

Select **Export to CSV** from the dropdown menu.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/sDbvyjFjFEGE7m8bFcfyS-20260313-092156.png?format=webp "Document image")

﻿

The CSV file downloads to your device. It will include key scenario execution details like execution status, timestamp, author, operations count, execution duration, and the link to examine the execution.

## Full-text execution log search

Available on **Pro** and higher plans. If you upgrade from lower tiers, Fulltext search will only display executions that were run after the upgrade.

Instead of going through the details of each scenario run entry one by one, you can use the **Fulltext search** to quickly find a specific entry. This feature lets you search for any term appearing in module outputs within the scenario execution history.

**Example**: Suppose you ran a scenario that receives new registrations to the **Jotform > Watch for Submissions** module and adds registered participants to your database. If the scenario run was successful but a participant wasn't added, you can search for the participant’s name using the Fulltext search. This may help you quickly identify the issue and troubleshoot effectively.

To look for an entry in the **Fulltext search:**

1

In the **History** tab, click **Fulltext search.**

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/BqtgtvOF2UsQPRGcsDk38-20260313-102055.png?format=webp "Document image")

﻿

2

In the search box, enter the word or term you want to find.

3

Click the relevant search result.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/ZxrNLGDiVaTSZqqgNCO1w-20260313-102254.png?format=webp "Document image")

﻿

You’ll be redirected to the execution log containing the module and the bundle that includes your search term. From there, you can inspect the details.

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

Scenario execution flow](/scenario-execution-flow "Scenario execution flow")[NEXT

Scenario blueprints](/blueprints "Scenario blueprints")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

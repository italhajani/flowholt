# Tutorial: How to replace a dependency - Help Center

Source: https://help.make.com/tutorial-how-to-replace-a-dependency
Lastmod: 2026-01-15T12:51:08.282Z
Description: Use Make Grid to analyze dependencies, visualize workflows, and effectively plan and manage migrations of your data sources
Make Grid

# Tutorial: How to replace a dependency

4 min

### Objective

The objective of this tutorial is to help you use Make﻿ Grid to visually analyze scenario﻿ dependencies and plan updates. In this tutorial, you will use Make﻿ Grid to plan to migrate away from an existing Google Sheets spreadsheet and use another data element, for example, an Airtable base. With the help of Make﻿ Grid, you can plan changes effectively and ensure a smooth, error-free transition without disrupting existing workflows.

### Requirements

Before using Make﻿ Grid, ensure that you have an existing scenario﻿ with dependencies.

### Step 1: Open your scenario

1

Log in to Make﻿.com.

2

In the left sidebar, navigate to **Scenarios**.

3

From **All scenarios**, click the scenario﻿ that you want to update.

In this example, you plan to replace the Google Sheets spreadsheet with an Airtable base.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/QOLLp4kY1R5VlPorNSnP8-20251119-081235.png?format=webp "Document image")

﻿

### Step 2: Open Make Grid to analyze the scenario and its dependencies

1

In the scenario﻿ diagram, click the **Grid** button.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/ANdVjgvEtGdfeUs-L_SQM-20251119-081412.png?format=webp "Document image")

﻿

2

Once Make﻿ Grid opens, you can view the scenario﻿ and its dependencies.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/4aLT3oxtV4volJoNOY-Wh-20251119-081853.png?format=webp "Document image")

﻿

3

In the right side panel, you can view the details of the scenario﻿.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/709KfUvYxmhwrjJSrU4xa-20251119-082117.png?format=webp "Document image")

﻿

4

Click on a specific dependency you want to make changes to, such as the Google Sheets spreadsheet in this example. Make﻿ Grid highlights the scenario﻿ dependencies.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/swx_hsV-01UpZTS5RVRTW-20251119-083040.png?format=webp "Document image")

﻿

5

Click **Links** to view the scenarios﻿ that depend on the selected dependency. In this example, you can view which scenarios﻿ read or write to the Google Sheets spreadsheet.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/2Qlua8MQR5_soqqarngh5-20251119-083322.png?format=webp "Document image")

﻿

6

Click **Attributes** to view where specific attributes of the selected dependency are used. In example, you can view which Google Sheets columns are referenced in which scenarios﻿.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/eMfdHkOMHuFIYkEqweLsU-20251119-083802.png?format=webp "Document image")

﻿

7

Click **Raw Data** to see the JSON data for the dependency, which is useful for advanced debugging and understanding the data structure.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/gLJ5npv9zgl-bYPq0H-Cv-20251201-141246.png?format=webp "Document image")

﻿

﻿Make﻿ Grid offers a comprehensive visual representation of how a dependency is interconnected within a scenario﻿ and with other scenarios﻿. This holistic overview allows you to trace data flows, understand dependencies, and plan changes effectively, minimizing the risk of breaking existing logic or workflow.

### Step 3: Plan the replacement

1

Identify the new replacement, an Airtable - Upsert a Record module, for example.

2

Before making any changes, use the information from the **Attributes** and **Links** view to create a clear plan to map the old data attributes to the new dependency. This ensures data integrity.

3

Add the new Airtable base to your scenario﻿.

4

Reconfigure existing dependencies to read and write to the new replacement.

By thoroughly analyzing your scenario﻿ and workflow with Make﻿ Grid, you should be able to complete the transition smoothly.

Updated 15 Jan 2026

Did this page help you?

Yes

No

[PREVIOUS

How to use Make Grid](/how-to-use-make-grid "How to use Make Grid")[NEXT

Best practices to use Make Grid](/best-practices-to-use-make-grid "Best practices to use Make Grid")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

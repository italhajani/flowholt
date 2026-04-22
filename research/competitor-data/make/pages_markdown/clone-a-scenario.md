# Clone a scenario - Help Center

Source: https://help.make.com/clone-a-scenario
Lastmod: 2026-03-06T15:43:45.249Z
Description: Clone scenarios across your organization to scale your workflows and save hours of manual setup
Key concepts

Scenarios & connections

# Clone a scenario

4 min

In Make, you can clone scenarios within the same organization, either within your team or to a different team. This saves you time as you don't need to rebuild the scenario and reconfigure each module manually.

Cloning allows you to:

* Copy a scenario **within the same team** with all the module settings and connections. You will only need to set up the webhooks if there are any.

* Copy a scenario **to another team** within the same organization with all the module settings. You will only need to set up the required connections for the target team and the webhooks, if there are any.

Cloning is the fastest way to duplicate a scenario within your organization compared to [blueprints](https://help.make.com/blueprints "blueprints"), [templates](https://help.make.com/scenario-templates "templates"), or [sharing through a link](https://help.make.com/scenario-sharing "sharing through a link").

## Clone scenario

To clone a scenario:

1

In the left sidebar, click **Scenarios**.

2

Click the **three** **dots** **>** **Clone** next to the required scenario.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/jRCotYvqP9ohLJzHhy1PH-20251125-084514.png?format=webp "Document image")

﻿

Alternatively, click the required scenario. In the upper-right corner of the scenariodiagram, click **Options > Clone.**

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/SV2W-oE1_i006rVbJzQyc-20251125-084530.png?format=webp "Document image")

﻿

You will see a window to configure the cloned scenario.

### Clone scenario within your team

When cloning a scenario within your team, configure it as follows:

1

In the **Name of new scenario** field, change the scenario name if needed.

2

In the **Target** **team** field, keep your current team that is selected by default.

3

In **Webhooks** (if your scenario includes webhooks), select an existing webhook or create a new one that will replace the original.

4

In the **Keep the states of any new modules the same as those being duplicated** field, choose whether polling triggers in the cloned scenario should keep their state.

* If you select **Yes**,the trigger will continue from the last processed item in the original scenario.

* If you select **No**,the scenario will start from the initial position, as defined in the module settings.

**Example**: You have a scenario with the **Google Sheets > Watch New Rows** module set to return one output per execution cycle. You ran the original scenario twice and now want to clone it.

* If you select **Yes**, the cloned scenario will start from row 3.

* If you select **No**, the cloned scenario will start from row 1.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/GR4ToZd3HVWbNmSHAOGZo-20260213-125240.png?format=webp "Document image")

﻿

5

Click **Save**.

After saving the cloning configurations, you will be redirected to the cloned scenario diagram. Click **Edit** in the upper-right corner, or anywhere in the canvas, make any necessary adjustments, activate the scenario, if needed, and save your changes.

### Clone scenario to another team

To clone a scenario to another team, configure the cloned scenario as follows:

1

In the **Name of new scenario** field, change the scenario name if needed.

2

In the **Target** **team** field, choose the team to clone the scenario to.

3

In **Connections**, for each module included in the cloned scenario, select the connections from the target team or create new ones.

Make sure to adjust and review the module settings after selecting a different connection.

**Example**: You're cloning a scenario that includes the **Google Sheets > Watch New Rows** module and select a connection from the target team. The module settings will be prefilled with data from the original scenario. However, the new connection may not have access to certain elements, e.g., the selected spreadsheet. If you run the scenario without adjusting the module settings, it will return an error.

4

In **Webhooks** (if your scenario includes webhooks), create a webhook that will replace the original one.

5

In the **Keep the states of any new modules the same as those being duplicated** field, select whether polling triggers in the cloned scenario should keep their state.

* If you select **Yes**,the trigger will continue from the last processed item in the original scenario.

* If you select **No**,the scenario will start from the initial position, as defined in the module settings.

This option applies only if you use the same connection in both the original and cloned scenarios.

If you select a different connection, the cloned scenario will start from the initial position regardless of the option selected.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/uxOKP06clvDOfkfZae4kv-20260213-142140.png?format=webp "Document image")

﻿

6

Click **Save**.

After saving the cloning configurations, the cloned scenario will appear in the **Scenarios** list of the selected target team.

You will be redirected to the cloned scenario diagram. Click **Edit** in the upper-right corner, or anywhere in the canvas, make any necessary adjustments, activate the scenario, if needed, and save your changes.

Updated 06 Mar 2026

Did this page help you?

Yes

No

[PREVIOUS

Schedule a scenario](/schedule-a-scenario "Schedule a scenario")[NEXT

Active and inactive scenarios](/active-and-inactive-scenarios "Active and inactive scenarios")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

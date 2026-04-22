# If-else and Merge - Help Center

Source: https://help.make.com/if-else-and-merge
Lastmod: 2026-04-08T14:40:12.658Z
Description: Discover the new If-else and Merge feature, designed for efficient, logical routing in workflows.
Explore more

Tools

# If-else and Merge

9 min

If-else and Merge is a new feature currently in Open Beta. Share [your feedback](https://f.make.com/if-else-merge "your feedback") to help us improve.

Use the If-else module with the Merge module when you need to split your scenario﻿ into conditional paths, follow only one path based on your logic, and then reconnect the flow into a single route.

This differs from a [Router](/router)﻿ that runs all routes and can't be reconnected.

## If-else module

The If-else module splits your scenario﻿ into conditional routes. Only the first condition that evaluates as true runs. If no conditions are true, the Else route runs.

Structure your conditions from most specific to least specific to ensure that the correct route runs. You can add any number of conditions.

The If-else module requires one conditional route and one else route. These routes can't be unlinked from the If-else module and the last module can't be deleted.

After setting up your routes, you can keep them separate or use a Merge module to bring them back together and continue the flow.

To add an If-else module to your scenario, see [Add an If-else module](/if-else-and-merge#add-an-if-else-module)﻿.

While an If-else module and a [Router](/router)﻿ can both split a scenario﻿ into different paths with conditions, the scenario﻿ run process differs.

| **If-else module** | **Router** |
| --- | --- |
| Splits the scenario﻿ into multiple routes with conditions | Splits the scenario﻿ into multiple routes with conditions |
| Runs the first condition that passes as true | Runs all conditions in the set order |
| Routes can be merged back together with a Merge module | Routes can't be merged back together |

The If-else module uses operations but does not consume any credits.

## Merge module

The Merge module reconnects the conditional routes created by an If-else module into a single flow. It passes data from the active route to any subsequent modules in your scenario﻿.

The Merge module only works with an If-else module. You can't add it to a scenario without first setting up an If-else flow.

To add a Merge module to your scenario, see [Add a Merge module](/if-else-and-merge#add-a-merge-module)﻿.

The Merge module uses operations but does not consume any credits.

## Add an If-else module

The If-else module splits the scenario﻿ flow into multiple routes with conditions.

To add an If-else module:

1

In your scenario﻿, click the plus to add another module.

2

Search for the **Flow Control > If-else** module.

![If-else module: Splits the scenario flow into multiple routes with conditions, then lets you merge them back together.](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/57lsRGrunx-7NMybOIHgq-20260224-120214.png?format=webp "If-else module: Splits the scenario flow into multiple routes with conditions, then lets you merge them back together.")

﻿

The Merge module is not available to add to your scenario﻿ until after an If-else flow has been set up.

3

After adding the If-else module, you will see a default setting of two paths, one condition route and an else route.

Set the condition:

* **Label:** Name the condition.

* **Condition:** Enter or map the values for the condition. Add additional rules as needed.

![Set up condition](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/gdKO1SHGqXyQkAiaJbVCD-20260224-121846.png?format=webp "Set up condition")

﻿

4

Click **Save** to save this condition.

5

To add another condition route, hover over the If-else module until you see the white + symbol and click.

![Add another condition.](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/3wdLNQ4KVTmtEUJU1PAkj-20260224-124203.png?format=webp "Add another condition.")

﻿

Another condition route is added every time you click.

6

Set the values for each condition and click **Save**.

7

Optional: Click the Else filter and enter a Label.

![Label the Else route.](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/zJW12PUXi04OT16vWe9VO-20260224-124753.png?format=webp "Label the Else route.")

﻿

8

Click **Save**.

After you've set all of the conditions, continue to add modules to your scenario﻿ as needed to complete each route.

You can keep each route separate or add a merge module to bring the routes together and continue the flow.

**Restrictions to the If-else flow**

You can't add a Router module or another If-else module into the flow after an If-else module.

![The Router and If-else modules are not available for use between an If-else and Merge flow.](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/TCuZjU6AsbWxHdW5m8q5s-20260302-113131.png?format=webp "The Router and If-else modules are not available for use between an If-else and Merge flow.")

﻿

## Add a Merge module

The Merge module merges the If-else routes together and continues the flow with data in a single route.

The Merge module can only be used after an If-else module.

To add a Merge module:

1

At the end of any route, click the plus to add another module.

2

Search for the **Flow Control > Merge** module.

![Merge module: Merges if-else routes together and continues the flow with data from a single route.](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/CnJ3MD0JFClwpLYetLhFa-20260224-130912.png?format=webp "Merge module: Merges if-else routes together and continues the flow with data from a single route.")

﻿

3

Click and hold the Merge module icon to drag and connect it to all routes in the If-else flow.

![Join the merge module to all routes.](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/vGif-L-vG3-IxHFGQA2XQ-20260224-131744.png?format=webp "Join the merge module to all routes.")

﻿

You can also merge the routes by clicking the plus sign at the end of any route and selecting **Merge routes**.

![Merge routes](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/8_WG4Osc53EVJ1eymbapj-20260309-131645.png?format=webp "Merge routes")

﻿

4

Enter or map the following values for your Merge module output:

* **Output name**

* **If 1st condition is true > Output value**

* **Else > Output value**

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/TCBkMYpgbYLju0C5RWWr1-20260305-120329.png?format=webp "Document image")

﻿

Add additional if-else outputs, if necessary.

5

Click **Save**.

The Merge module is connected to the If-else flow and the scenario﻿ flow can continue after the merge.

If a condition route does not include a module and you connect the route to the Merge module, Make﻿ displays a Do Nothing module. While this route does not include any modules, data passes through.

![If you do not select a module for one of the routes after If-else and then connect it to the Merge, the module name becomes Do Nothing.](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/T8zHWQqfiSK99Ooq5jyOO-20260302-114245.png?format=webp "If you do not select a module for one of the routes after If-else and then connect it to the Merge, the module name becomes Do Nothing.")

﻿

To replace the Do Nothing module with a different module, click the Do Nothing module and search for your required app.

![Search for an app to replace the Do Nothing module.](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/f2T0rFOKFDKlRkBw_PSDx-20260302-130938.png?format=webp "Search for an app to replace the Do Nothing module.")

﻿

## Delete modules from the If-else and Merge flow

To delete an If-else module, right-click and select **Delete**.

This removes the module and all its conditions. This action can't be undone.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/UR4jGLavQbVmKJMgBL9L9-20260302-141335.png?format=webp "Document image")

﻿

Any remaining modules after the deleted If-else module will show an error until you reconnect them to the scenario﻿ flow.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/dF0KsPPqFT4ZVBRzsXdPn-20260302-141627.png?format=webp "Document image")

﻿

If you delete modules before the Merge module, the Merge module will show an error. Connect at least one module before configuring its outputs.

![Merge module without connection error](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/NPhm08tPl6__S5uZ-g8hX-20260302-141900.png?format=webp "Merge module without connection error")

﻿

## Tutorial: Expense report approval system

In this tutorial, you'll build a scenario﻿ that automatically sorts expense report submissions into two paths: immediate approval for low-value expenses, and a Slack notification for expenses that need manual review. All submissions are logged in Google Sheets with their approval status.

You will need:

* A Tally form to submit expense information. Your form should include the following fields: first name, last name, date of expense, description of expense, and amount.

* A Slack account, to receive notifications of expenses that need additional review for approval.

* A Google Sheet file with the following column titles: First Name, Last Name, Date of Expense, Description of Expense, Amount, and Approval.

![Expense report approval system scenario](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/Il2qYx3SP8AIptDuo6pMD-20260305-093214.png?format=webp "Expense report approval system scenario")

﻿

To build the scenario﻿:

**Step 1: Connect to Tally**

1

Click the giant plus and add a **Tally > Watch New Responses** module.

2

Click **Create a webhook**. Enter a webhook name and connect to your Tally account.

3

In the **Form ID**  field, select the expense report form you created in Tally.

4

Click **Save** to save the webhook, then **Save** again to save the module settings.

Your scenario﻿ is now connected to Tally and triggers when a new form is submitted.

**Step 2: Set the If route conditions and configure the flow**

1

Add an **If-else** module and set the first condition, an expense report value that is above the automatic approval limit. In this example, expenses of $100 or more are above the limit.

* **Label:** Above limit

* **Condition:** Map the Tally field for the amount of the expense and set the condition to great than 100.

![First condition - expense amount above the limit](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/QDuyd04ZguNrIYshp0pca-20260305-100303.png?format=webp "First condition - expense amount above the limit")

﻿

2

Click **Save**.

3

In this first condition route, add a **Slack > Send a Message** module.

4

Create a connection to your Slack account and select the ID of the person to receive the messages. Your configuration may differ, depending on your Slack setup.

5

In the **Text** field, enter the message to send regarding the expense report. You can map data from the Tally form in the message. In this example, the first and last name of the person who submitted the expense report is included.

![Configure the Slack module to send a message](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/621c9cbJsf85qPfgA2jgd-20260305-101332.png?format=webp "Configure the Slack module to send a message")

﻿

6

Click **Save**.

The If condition route identifies expense report submissions that are $100 or more and sends a Slack message notifying the recipient.

![Slack message example](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/J_iOCescOxrEfbVGSwRPl-20260305-111545.png?format=webp "Slack message example")

﻿

**Step 3: Configure the Else route flow**

1

Click the Else route condition and in the **Label** field enter a name. Click **Save**.

![Set the Else route Label name](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/FlpYg3ZnK_7u3sgPaTKSR-20260305-100828.png?format=webp "Set the Else route Label name")

﻿

2

Add a **Tools > Set variable** module.

* **Variable name**: Enter a name for the variable to indicate the status of the approval.

* **Variable value**: Enter a value for the variable, to show that the expense report is already approved in this route.

![Set a variable to indicate that the expense report is approved.](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/_cUfZvQmeswaVe0J-f3qc-20260305-102844.png?format=webp "Set a variable to indicate that the expense report is approved.")

﻿

3

Click **Save**.

The Else route is configured to identify expense reports that are under the $100 limit and mark them as approved.

**Step 4: Merge the conditions and continue the flow**

1

After either of the routes, add a **Flow Control > Merge** module.

2

Click and hold the Merge module icon to drag and connect it to all routes in the If-else flow.

3

Click the Merge module and enter or map the following values for your merge output:

* **Output name:** Approval (to match the field in the Google Sheets file)

* **If 1st condition is true > Output value:** Review required

* **Else > Output value:** Map the value of the variable set in the Else route, status

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/ckiyiqOgDRhhInq4QkGw0-20260305-104219.png?format=webp "Document image")

﻿

4

Click **Save**.

5

Add a **Google Sheets > Add a row** module. Create your connection to your Google account and select the Google Sheets file you created.

Your values will vary based on where you saved your file, your file name, and the sheet name within the file.

![Google Sheets > Add a row module configuration](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/mqnak1qhplHYrCOJIUo0f-20260305-104800.png?format=webp "Google Sheets > Add a row module configuration")

﻿

6

For each Google Sheets column, map the Tally form data and the Merge module output:

* **First Name:** First name

* **Last Name:** Last name

* **Date of Expense:** Date of expense

* **Description of Expense:** Description

* **Amount:** Amount submitted (in dollars)

* **Approval:** Approval

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/V9KOvv-tbCCZYxu0YriPB-20260305-105150.png?format=webp "Document image")

﻿

7

Click **Save**.

Click **Save** and save your scenario﻿.

When ready, [schedule your scenario](/schedule-a-scenario)﻿ to run. Since your scenario﻿ starts with a webhook module, the default setting is to run immediately when data arrives.

![Schedule the scenario to run](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/dmS5tfvnPYuEBaS51uSgW-20260305-110343.png?format=webp "Schedule the scenario to run")

﻿

When an expense report is submitted, the information is saved in the Google Sheets file and marked with the correct approval value.

![Google Sheets submissions](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/igy7YCI3Miqcfh-mNMbyK-20260305-110500.png?format=webp "Google Sheets submissions")

﻿

﻿

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

Tools](/xcvW-tools "Tools")[NEXT

Flow control](/flow-control "Flow control")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

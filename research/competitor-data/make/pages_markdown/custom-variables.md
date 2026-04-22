# Custom variables - Help Center

Source: https://help.make.com/custom-variables
Lastmod: 2026-03-18T13:18:09.323Z
Description: Help Center
Explore more

...

Variables

# Custom variables

6 min

﻿

Custom variables are similar to [scenario variables](/scenario-variables)﻿, but they are defined at the organization or team level.

## Use custom variables when you need:

* Data shared across multiple scenarios﻿

* Settings that control how scenarios﻿ behave (for example, TestMode = true/false)

* Values that persist between scenario﻿ runs

* Team or organization-wide configuration values

Custom variables are available only on Pro, Teams, and Enterprise pricing plans. See [Make pricing](https://www.make.com/en/pricing "Make pricing") for more information.

﻿

For each variable, you need to identify the:

* **Name** (permanent variable name)

* **Data type** (text, number, Boolean, or date)

* **Value** (the actual value of the variable)

Here are some situations for which you might use custom variables:

* Keep track of a value between multiple scenario﻿ executions

* Share a value between different scenarios﻿

* Set a global variable that various scenarios﻿ leverage. For example TestMode = true/false so the scenario﻿ routes differently according to the value.

* Change the behavior of a scenario﻿ without modifying the scenario﻿ blueprint. For example, myLimit=20 set as a custom variable in the Limit field of a module.

Variables are not meant to store secrets. Don’t use them for anything sensitive!

Variable values are not encrypted as they are stored in plain text. Don’t use variables to store passwords or any other sensitive data. Be aware that other team members and organization admins can access all custom variables.

## Create a custom variable

You can create custom variables at the organization level and at the team level.

1

Decide if you want to create an organization variable or a team variable.

* For organization variables, go to the organization dashboard and click **Org Variables > Add organization variable**.

* For team variables, go to the team dashboard and click **Team Variables > Add team variable**.

2

Fill in the following information:

| **Field** | **Description** |
| --- | --- |
| **Name** | * This field is mandatory and you cannot change it after you save it.  * The name is the identifier of the variable.  * The name must contain only letters, digits, or the symbols $ and \_.  * The name cannot start with a digit.  * The name must contain a maximum of 128 characters. |
| **Data type** | Choose the variable data type from the dropdown menu  * Number  * Text  * Boolean  * Date |
| **Value** | * Enter the value for your variable.  * You can use letters, digits, spaces, and special characters.  * Value cannot be empty. |

3

Click **Save** to save your custom variable.

Your new variable will appear in the list of variables. Click the scenarios﻿ icon to see a list of scenarios﻿ using the custom variable.

![Usage of a custom variable in a scenario](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/XFzTBc-zqZfSAgR6OdyqW-20260316-113448.png?format=webp "Usage of a custom variable in a scenario")

﻿

To preview the variable value, hover over the individual value field.

![Preview variable value](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/sSplZad7fcVAGvcJwJlGt_uuid-be2168f3-43b9-8e67-f571-98acc55cb92d.png?format=webp "Preview variable value")

﻿

## Edit a custom variable

If your other team members or organization admins use the same variable in their scenarios﻿, the changes will affect them too.

1

Go to the variable you want to edit.

* For organization variables, go to the organization dashboard and click **Variables**.

* For team variables, go to the team dashboard and click **Variables**.

![Organization variables](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/Sw7hlnJFiOAmA_SNthxsF_uuid-9aa620f5-93e1-2e75-f40f-d40d8d3f367c.png?format=webp "Organization variables")

﻿

2

In the list of your custom variables, find the one you want to edit and click **Edit** next to it.

![Edit a custom variable](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/_LxOWDd6e0-n0leVNvRZF_uuid-649fa07f-5cc6-a3ca-2965-1a037be80585.png?format=webp "Edit a custom variable")

﻿

3

Edit the variable as needed. You can edit the variable data type and value. You can't edit the name.

4

Click **Save** to save your changes.

Your changes are saved and your updated variable will appear on the list of variables. Hover over the individual value field to preview the variable value.

The changes automatically update in the scenarios﻿ that already use the variable.

The value of a custom variable can be changed within a scenario﻿as well. The value changes only **after** the scenario﻿ finishes running. The new value is available for the next run of the scenario﻿ for everyone in the organization or team.

## Delete a custom variable

Deleting a variable that you already use in one or more scenarios﻿ can affect other users who use the same variable in their scenarios﻿. After you delete a variable, the variable becomes inactive in all scenarios﻿ where it is used and it stops returning expected values.

1

Decide if you want to delete an organization variable or a team variable.

* For organization variables, go to the organization dashboard and click **Variables**.

* For team variables, go to the team dashboard and click **Variables**.

![Organization variables](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/Sw7hlnJFiOAmA_SNthxsF_uuid-9aa620f5-93e1-2e75-f40f-d40d8d3f367c.png?format=webp "Organization variables")

﻿

2

In the list of your custom variables find the one you want to delete and click **Delete** next to it.

![Delete a custom variable](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/a9rv3DYO_7AZZ9KyBcQf2_uuid-937365c7-46ad-aaa5-a44d-bf6e8f36eb13.png?format=webp "Delete a custom variable")

Delete\_a\_custom\_variable\_.png

﻿

3

Click **OK** to confirm that you want to delete the variable.

If the custom variable you are deleting is already used, you will see a pop-up that lists all scenarios that will be impacted. If you still want to delete it, click **OK**.

The variable is deleted and disappears from your list of custom variables.

## Check custom variable history

You can see who changed the custom variable, when, and what the changes are.

1

Go to the custom variable whose history you want to check.

* For organization variables, go to the organization dashboard and click **Variables**.

* For team variables, go to the team dashboard and click **Variables**.

2

Click the dropdown menu next to **Edit**. Select **Show history**.

![Variable history](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/QqjNTbNk_9BJuuBmhxDwy_uuid-3a08debe-c15d-3c76-aace-5baa64271b62.png?format=webp "Variable history")

﻿

A new window opens where you can see the variable history. The last change appears on the top.

## User permissions for custom variables

**Organization variables**

| ﻿ | **Owner** | **Admin** | **Member** | **Accountant** | **App Developer** |
| --- | --- | --- | --- | --- | --- |
| **Can access organization variables** | X | X | X | ﻿ | X |
| **Can edit organization variables** | X | X | ﻿ | ﻿ | ﻿ |
| **Can add organization variables** | X | X | ﻿ | ﻿ | ﻿ |
| **Can delete organization variables** | X | X | ﻿ | ﻿ | ﻿ |

**Team variables**

| ﻿ | **Team Admin** | **Team Member** | **Team Monitoring** | **Team Operator** | **Team Restricted Member** |
| --- | --- | --- | --- | --- | --- |
| **Can access team variables** | X | X | ﻿ | X | X |
| **Can add team variables** | X | X | ﻿ | ﻿ | X |
| **Can edit team variables** | X | X | ﻿ | ﻿ | X |
| **Can delete team variables** | X | X | ﻿ | ﻿ | X |

## Example: Use a custom variable to control a scenario﻿﻿

You can use a custom variable at the organization or team level to easily switch the value and control how a scenario﻿works. Here, a custom variable called debugMode is boolean, and if the value is true an email will be sent to a team member. If you change the value to false at the team level, the scenario will end after adding a row to the Google Sheets document.

![Custom variable scenario example](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-0RMLHlJimsf2Wky8UYh1r-20250617-084713.png?format=webp "Custom variable scenario example")

﻿

1

Decide if you want to create an organization variable or a team variable.

* For organization variables, go to the organization dashboard and click **Variables > Add organization variable**.

* For team variables, go to the team dashboard and click **Variables > Add team variable**.

In this example, we are using a team variable.

2

Enter your variable **Name**, **Data type**, and **Value**.

**Name:** debugMode

**Data type:** boolean

**Value:** Yes

Click **Save** to save your custom variable.

![custom variable](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-HazvNPMejaof-Z8-BnLJw-20250617-084350.png?format=webp "custom variable")

﻿

3

In your scenario﻿, add a **Tools > Set variable** module.

Set the **Variable name** to city and the **Variable value** to Madrid.

Click **Save**.

![Set city variable](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-DqxgjWG2V5IGQMKHJiVET-20250617-085014.png?format=webp "Set city variable")

﻿

4

Add a **Weather > Get current weather** module.

In the **I want to enter a location by** field, select cities.
In the **City** field, map the value to the city variable that you set in step 3.

Click **Save**.

![Weather, set location](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-IX7qNS0yDENePw7GKuSCS-20250617-085651.png?format=webp "Weather, set location")

﻿

5

Add a **Google Sheets > Add a row** module and create a connection.

In this example, we have a Google Sheets document called **Weather report** saved in **My Drive**. This file has headers for the **date**, **city**, **average temp**, **status**, and **description**.

Connect to this file and map values as shown:

| **Field** | **Mapped value** |
| --- | --- |
| date | formatDate(now; "DD-MM-YYYY") |
| city | ﻿Scenario﻿ variable city |
| average temp | Weather app value Temperature |
| status | Weather app value Status |
| description | Weather app value Description |

Click **Save**.

![Map values to the Google Sheet document](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-VoQ6hXm33LbPO9xO0-njy-20250617-085949.png?format=webp "Map values to the Google Sheet document")

﻿

6

Add an **Email > Send an Email to a Team Member** module and create a connection.

In the **To** field, select the member of your team you want to send the email to.
In the **Subject** field, enter a relevant subject.
In the **Content** field, enter the text of your email, mapping the information you want to share with your team member. You can use HTML tags.
Click **Save**.

![Send email if filter is true](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-kl0TKIbuE8qBAC6U93HFV-20250617-090231.png?format=webp "Send email if filter is true")

﻿

7

In your scenario﻿, between the **Google Sheets** and **Email** modules, click the **wrench icon** to set up a filter.

**Label:** Debug mode?

**Condition:** Map the condition to the debugMode custom variable.

Change the operator to **Boolean operators: Equal to** and enter true in the field.

Click **Save**.

![Debug filter](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-1vdyNQYWQEYxTHdO1uqtt-20250617-090525.png?format=webp "Debug filter")

﻿

8

Click the save icon to save your scenario﻿ and click **Run once** to test.

If your custom variable value is yes, an email is sent to your team member.

![Custom variable email example](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-j_yvnMTfJp1abCZoZs2_u-20250617-094226.png?format=webp "Custom variable email example")

﻿

If the custom variable value is no, the email is not sent after the weather information is stored in the Google Sheets document.

﻿

Updated 18 Mar 2026

Did this page help you?

Yes

No

[PREVIOUS

Scenario variables](/scenario-variables "Scenario variables")[NEXT

Incremental variables](/incremental-variables "Incremental variables")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

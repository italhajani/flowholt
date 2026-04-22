# Scenario variables - Help Center

Source: https://help.make.com/scenario-variables
Lastmod: 2026-03-18T13:17:31.695Z
Description: Help Center
Explore more

...

Variables

# Scenario variables

2 min

*﻿*Scenario﻿ variables are useful when you need to reuse the same information multiple times. They make scenarios﻿ easier to manage and maintain.

## Use scenario﻿ variables when you need:

* Temporary data that only exists during one scenario﻿ run

* To pass information between modules in the same scenario﻿

* Data that doesn't need to persist after the scenario﻿ completes

* Simple counters or flags within a single scenario﻿ run

To use scenario﻿ variables, use the **Set variable** or **Set multiple variable** tools in your scenario﻿.

If you need to access the defined variable(s) in a different route than where they were set, use the **Get Variable** or **Get Multiple Variable** tools.

## Create a scenario﻿ variable

You can create scenario﻿ variables in your scenario﻿.

1

Click the **Tool** icon on the Scenario Builder toolbar to select the **Set variable** tool.

![Set variable](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-rkQcxfJghBuZXk7lIFP9n-20250610-113901.png?format=webp "Set variable")

﻿

You can also click the giant plus in your canvas to select **Tools < Set variable**.

![Set variable](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-WmPOOrQlVP_n4Dp8QFjjf-20250610-114136.png?format=webp "Set variable")

﻿

To set multiple variables at once, select the **Set multiple variables** tool.

2

Fill in the following information:

| **Field** | **Description** |
| --- | --- |
| **Variable name** | * This field is mandatory.  * The name is the identifier of the variable. |
| **Variable value** | * Enter the value for your variable.  * You can use letters, digits, spaces, and special characters. |
| **Variable lifetime** | Select the lifetime of your variable:  * One cycle  * One execution |

If you are using the **Set multiple variables** tool, repeat this for each variable.

3

Click **Save** to save your variable.

## Example: Send an email with weather conditions for a selected city

In this example, we use the **Set variable** module to select a city, retrieve weather information for the city, and use the **Set multiple variables** and **Get multiple variables** modules to send the information in an email to a team member.

![Scenario variables example](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-LAN_DOvHPVRRkaOmnzyyq-20250613-100249.png?format=webp "Scenario variables example")

﻿

1

In your scenario﻿, click the **Tool** icon on the Scenario Builder toolbar to select the **Set variable** tool.

You can also click the giant plus in your canvas to select **Tools < Set variable**.

2

In the **Variable name** field, enter City.

For this example, we have set the **Variable value** to Paris.

Click **Save**.

![Set variable - City](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-xwltSHLrnuTKh1mSWO0cH-20250613-122950.png?format=webp "Set variable - City")

﻿

3

Add a **Router**.

4

In the first route at the top, add a **Weather** module.

In the **I want to enter a location by** field, select cities.

In the **City** field, map the value to the City variable that you set in step 1.

Click **Save**.

![Weather module](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-rLGQ50RzDZKUs_R_HHdeg-20250613-123355.png?format=webp "Weather module")

﻿

5

After the **Weather** module in the first route, add a **Set multiple variables** module.

Add two variables:

* status - mapped to the Status value from the Weather module.

* description - mapped ot the Description value from the Weather module.

Click **Save.**

![Set multiple variables](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-fZOk8tNxXpXhE5WjqBWeK-20250613-123755.png?format=webp "Set multiple variables")

﻿

6

In the second route at the bottom, add a **Get multiple variables** module to retrieve the information from the previously set variables.

For **Variable name 1**, enter status.

For **Variable name 2**, enter description.

Click **Save**.

![Get multiple variables](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-6zwZDS5jq-PFKEaqeNi3P-20250613-124104.png?format=webp "Get multiple variables")

﻿

Note that this step is not necessary if you are not using a router.

In this example, we've chosen to split the scenario into two routes to demonstrate both the **Set mutliple variables** and **Get multiple variables** modules.

7

After the **Get multiple variables** module in the second route, add an **Email > Send an Email to a Team Member** module and **Create a connection**.

In the **To** field, select the member of your team you want to send the email to.

In the **Subject** field, enter a relevant subject.

In the **Content** field, enter the text of your email, mapping the City, status, and description variables. You can use HTML tags.

Click **Save**.

![Send email](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-zLjNKS7k8U5HrNLV-5d8K-20250613-124852.png?format=webp "Send email")

﻿

8

Click **Run once** to test your scenario.

The person you selected in the Email module receives an email like this:

![Weather scenario email](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-8mnNqCgk2VyW-DiQiQThV-20250613-125224.png?format=webp "Weather scenario email")

﻿

﻿

Updated 18 Mar 2026

Did this page help you?

Yes

No

[PREVIOUS

System variables](/system-variables "System variables")[NEXT

Custom variables](/custom-variables "Custom variables")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

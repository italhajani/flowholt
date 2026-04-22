# System variables - Help Center

Source: https://help.make.com/system-variables
Lastmod: 2026-03-18T13:17:03.876Z
Description: Help Center
Explore more

...

Variables

# System variables

3 min

﻿

System variables are provided by Make﻿*.* You can’t modify or delete system variables. They can be used in modules with input fields, filters within the scenario﻿ editor, and in templates.

## Use system variables when you need:﻿

* Information about the current scenario﻿ execution (ID, start time, operations consumed)

* Organization/team details (name, operations left, data left)

* Error handling and debugging information

* Automated notifications based on usage limits

You can access the scenario variables under the **Custom and system variables** tab when mapping a value in a module.

![System variables](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-cC5E65SBo3mGjQImD-kv0-20250528-084908.png?format=webp "System variables")

﻿

System variables include information about:

* the scenario﻿ itself (Scenario ID, Scenario name, Scenario URL)

* the specific scenario﻿ execution (Execution ID, Operations consumed, Data consumed, Execution start date/time)

* the team the scenario﻿ is in (Team ID, Team name)

* the organization the scenario﻿ is in (Organization ID, Organization name, Operations left, Data left, Zone domain)

System variables are useful for error handling and scenario﻿ activity tracking.

For example, if there is an error in your scenario﻿, you can use the scenario﻿ ID or organization name variables to pinpoint the exact scenario﻿ execution and organization in which the error occurred.

Here are some other situations for which you might use system variables:

* Create a slack message, email, or support ticket that contains a link to the scenario﻿ execution that created the message.

* Set email notifications to notify you once the operations left value reaches a certain number.

You can also reuse system variables and map them to any module in the module's input fields.

## Example: Get notified before you reach your operations limit

In this example, we imagine that at some point in your scenario﻿ you want to notify a team member of the number of operations left in your organization. We use a router to send an email when there are 1000-5000 operations left and when there are under 1000 operations left.

![Notify a team member based on the number of operations left](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-NKjDNe8Ghi1uZTF7Db_2j-20250616-111825.png?format=webp "Notify a team member based on the number of operations left")

﻿

1

In your scenario﻿, add a router.

2

In the first route, click the wrench icon to set up a filter.

**Label**: 1000-5000 operations left

**Condition**: Map the condition to the Operations left system variable.

Change the operator to **Numeric operators: Greater than** and enter 1000 in the field.

Click **Add AND rule**.

**Condition**: Map the second condition to the **Operations left** system variable.

Change the operator to **Numeric operators: Less than or equal to** and enter 5000 in the field.

Click **Save**.

![System variable first filter](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-Ggk7IETdsl3dhuMow3dAD-20250616-105935.png?format=webp "System variable first filter")

﻿

3

After this filter in the first route, add an **Email > Send an Email to a Team Member** module and **Create a connection**.

In the **To** field, select the member of your team you want to send an email to.

In the **Subject** field, enter a relevant subject.

In the **Content** field, enter the text of your email, mapping the Operations left variable. You can use HTML tags.

Click **Save**.

![Email 1000 - 5000 operations left](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-3Qhn8vbDa1hNpVedStu2O-20250616-110710.png?format=webp "Email 1000 - 5000 operations left")

﻿

4

In the second route, click the wrench icon to set up a filter.

**Label**: 1000 or fewer operations left

**Condition**: map the condition to the Operations left system variable.

Change the operator to **Numeric operators: Less than or equal to** and enter 1000 in the field.

Click **Save**.

![System variable first filter](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-x5LF_WEiV_O66uy0gLwfa-20250616-111232.png?format=webp "System variable first filter")

﻿

5

After this filter in the second route, add an **Email > Send an Email to a Team Member** module.
In the **To** field, select the member of your team you want to send an email to.
In the **Subject** field, enter a relevant subject.
In the **Content** field, enter the text of your email, mapping the Operations left variable. You can use HTML tags.
Click **Save**.

![Email 1000 - 5000 operations left](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-g1RtEzPo-LVdNCF91iAgO-20250616-111530.png?format=webp "Email 1000 - 5000 operations left")

﻿

As the number of operations left drops to the filtered amounts, your team member receives email notifications.

﻿

Updated 18 Mar 2026

Did this page help you?

Yes

No

[PREVIOUS

Variables](/variables "Variables")[NEXT

Scenario variables](/scenario-variables "Scenario variables")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

# Manage time zones - Help Center

Source: https://help.make.com/manage-time-zones
Lastmod: 2026-04-08T14:40:13.410Z
Description: Learn the difference between organization and user time zones and how to customize your settings for scenario scheduling.
Your profile

Profile settings

# Manage time zones

4 min

In Make﻿, every [organization](/organizations)﻿ and every user has a definable time zone parameter. However, Make﻿ uses organization time zones and user time zones differently:

* The **organization time zone** defines the time used when executing scenarios﻿ and modules. For example, a scenario﻿ schedule of "4:00 pm every day" means 4:00 pm in the organization's time zone.

* The **user time zone** is similar to [locale](https://en.wikipedia.org/wiki/Locale_(computer_software) "locale") and defines how Make﻿ displays time, for example, in the [scenario execution history](/scenario-history)﻿.

As a result, organization members in a time zone different from the organization's time zone may see different times displayed. See the [example](/manage-time-zones#example)﻿ below for more details.

Your profile page lets you view and edit time zone settings from the **Time Zone Options** tab.

## Manage your organization time zone

﻿Make﻿ uses an organization's time zone to define when a scheduled scenario﻿ executes. The organization time zone defines scenario﻿ execution and functions such as formatDate and parseDate. Unless otherwise specified, Make﻿ uses the organization time zone as the default time for time and date-related functions and scenario﻿ execution. You can view and edit your organization time zones on the **Time Zone Options** tab of the profile page. afsa

Only organization owners and admins can edit the organization's time zone.

1

Click your profile icon in the upper-right corner and select **Profile**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/GIXmJffuSW63v_pNG0-oM-20251002-085259.png?format=webp "Document image")

﻿

2

Click the **Time zone options** tab.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/8WT0eRoAJeHdQ3VUy1c6i-20251002-090340.png "Document image")

﻿

3

﻿Make﻿ lists your organizations under **Scenarios** and displays the current time zone setting.

4

Click the edit icon to edit an organization's settings.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/1_g0x13MWgzQMkqANsb_f-20251002-090606.png "Document image")

﻿

5

In the dialog box, use the menu to search for and select a new time zone.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/y2YfRShOHpZycr-HWz8lS-20251002-090746.png "Document image")

﻿

6

Click **Save**.

The selected time zone now appears on the **Time zone options** page.

Any scheduled scenarios﻿ execute at the scheduled time in the time zone you assigned in step 4.

## **Manage your user time zone**

﻿Make﻿ uses your user time zone to display time and date information. For example, execution logs display the time in your user time zone. The user time zone only impacts how Make displays information, such as the date and time displayed in module output, bundles, or a log. Changing the user time zone does not impact scenario﻿ execution. You can view and edit your user time zone anytime on the **Time Zone Options** tab of the profile page.

1

Click your profile icon in the upper-right corner and select **Profile**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/GIXmJffuSW63v_pNG0-oM-20251002-085259.png?format=webp "Document image")

﻿

2

Click the **Time zone options** tab.

3

Find your name in the **Web** section. Make﻿ displays the current time zone setting.

4

Click the edit icon to edit your settings.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/NV-JT8CmkAWq3aUYwLtBQ-20251002-091440.png "Document image")

﻿

5

In the dialog box, use the menu to search for and select a new time zone.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/dMf7VKryTQ1dGFhhzTmJu-20251002-091546.png "Document image")

﻿

6

Click **Save**.

You can also manage your user time zone from your Profile page:

1

Click your profile icon in the upper-right corner and select **Profile**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/GIXmJffuSW63v_pNG0-oM-20251002-085259.png?format=webp "Document image")

﻿

2

Click **Profile settings**.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/mGAqcIipZIWjiCWsos3_w-20251002-092210.png "Document image")

﻿

3

In the dialog box, use the menu to search for and select a new time zone.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/dMf7VKryTQ1dGFhhzTmJu-20251002-091546.png "Document image")

﻿

The selected time zone will appear on the **Time zone options** page.

## Example

A Make﻿ organization based in New York City has members in New York City, Los Angeles, and London. When members view scenario﻿ execution histories, they see that information relative to their local time zone.

Members in London see the time scenarios﻿ executed in London time, Los Angeles members see those execution times in LA time, and so on. However, when they schedule scenarios﻿, Make﻿ uses New York City time regardless of the user's location.

| **User city and time zone** | **Organization time zone** | **Time zone that the user sees in the** scenario﻿ **editor and logs** | **Time zone used for** scenario﻿ **execution** |
| --- | --- | --- | --- |
| New York (GMT-05:00) America/New\_York | (GMT-05:00) America/New\_York | (GMT-05:00) America/New\_York | (GMT-05:00) America/New\_York |
| Los Angeles (GMT-08:00) America/Los\_Angeles | (GMT-05:00) America/New\_York | (GMT-08:00) America/Los\_Angeles | (GMT-05:00) America/New\_York |
| London (GMT+0:00) Europe/London | (GMT-05:00) America/New\_York | (GMT+0:00) Europe/London | (GMT-05:00) America/New\_York |

﻿

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

Delete your profile](/delete-your-profile "Delete your profile")[NEXT

API key](/api-key "API key")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

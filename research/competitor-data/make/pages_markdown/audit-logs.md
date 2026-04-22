# Audit logs - Help Center

Source: https://help.make.com/audit-logs
Lastmod: 2026-03-04T11:14:42.642Z
Description: Monitor user activity across your organization or team.
Your organization

Administration

# Audit logs

6 min

This feature is available to Enterprise customers.

Audit logs allow you to monitor user activity within your organization or team. This information is particularly useful for resolving issues and troubleshooting incidents. For example, if a crucial scenario﻿ transferring data between systems unexpectedly fails, audit logs can help you identify who updated the scenario﻿ and when it happened.

Audit logs are available on the Enterprise plan only. Organization owners and admins as well as team admins can access audit logs.

Audit logs are stored for 12 months.

## Organization audit logs

Audit logs are available at both the organization and team levels. Organization audit logs give you visibility into everything that is happening in your organization, including such events as creating or updating the organization variable.

Organization Audit logs are visible only to organization owners and admins.

To open Audit logs from the Organization dashboard:

1

Click **Org** in the left sidebar.

2

Click the **Org** **Audit Logs** tab.

Once you open the tab, you will see the audit logs for the organization you’re in. You can filter what you see to show only specific events, specific time periods, or users by setting up filters on the filter panel.

Additionally, you can select to see only events from specific teams in the audit logs.

3

Click the **All filters** button.

4

Select the teams for which you want to see the logs in the **Team** dropdown.

5

Click **Apply**.

## Team Audit logs

Team audit logs are available to team admins. Organization owners and admins can see team audit logs through the audit logs in the Organization dashboard or by opening the audit logs for a specific team from the Team dashboard.

To view audit logs from the Team dashboard:

1

Click **Team** in the left sidebar.

2

Click the **Team** **Audit Logs** tab.

You will see the audit logs for your team. You can filter the logs to display specific events or time periods.

## Available events

The audit logs allow you to see what was changed, who made the change, when it was made, and for which scenario﻿.

Some of the events are not visible in the team audit logs. For example, you won’t see events about organization variables, but you will see events connected to this specific team (team member added, removed, etc.).

| Event category | Available events | Available for Organization | Available for Team |
| --- | --- | --- | --- |
| ﻿Scenarios﻿ | * ﻿Scenario﻿ created  * ﻿Scenario﻿ updated  * ﻿Scenario﻿ deleted  * ﻿Scenario﻿ activated  * ﻿Scenario﻿ deactivated | Yes | Yes |
| Connections | * Connection created  * Connection deleted  * Connection updated  * Connection authorized/reauthorized | Yes | Yes |
| Webhooks | * Webhook created  * Webhook deleted  * Webhook updated  * Webhook enabled  * Webhook disabled | Yes | Yes |
| Keys | * Key created  * Key updated  * Key deleted | Yes | Yes |
| Team | * Team created  * Team updated  * Team deleted  * Team role updated  * Team member removed | Yes | Yes |
| Team Variables | * Team variable created  * Team variable updated  * Team variable deleted | Yes | Yes |
| Organization Variables | * Organization variable created  * Organization variable updated  * Organization variable deleted | Yes | No |
| Data Store | * Data store created  * Data store updated  * Data store deleted  * Data store record created  * Data store record updated  * Data store record deleted | Yes | Yes |
| Data Store Records | * Data store record created  * Data store record updated  * Data store record deleted | Yes | Yes |
| Data Structure | * Data structure created  * Data structure updated  * Data structure deleted | Yes | Yes |
| Functions | * Function updated  * Function created  * Function deleted | Yes | Yes |
| Organization | * Organization created  ﻿ | Yes | No |
| Two-factor authentication enforcement | * Organization 2FA enforcement enabled  * Organization 2FA enforcement disabled | Yes | No |
| Credential requests | * Credential request created  * Credential request authorized  * Credential request deleted | Yes | Yes |

Events related to Data Store Records (like Data Store Record Updated) only apply to actions done within the Make﻿ interface or API. They don't apply to actions done through the datastore modules.

## Event details

The audit log main page provides a summary of who performed specific actions and when they occurred. For more detailed information about an event, click the **Details** button next to the entry. A pop-up window will appear, displaying additional data about the event. To copy any information, click the **Copy** button within the pop-up.

Updated 04 Mar 2026

Did this page help you?

Yes

No

[PREVIOUS

Set the length of your session timeout](/set-the-length-of-your-session-timeout "Set the length of your session timeout")[NEXT

Feature controls](/feature-controls "Feature controls")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

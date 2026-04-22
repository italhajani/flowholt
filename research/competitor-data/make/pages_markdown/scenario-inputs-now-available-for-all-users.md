# Scenario inputs now available for all users - Help Center

Source: https://help.make.com/scenario-inputs-now-available-for-all-users
Lastmod: 2026-01-19T09:23:14.792Z
Description: Check Make's newest updates: scenario inputs now for all users, connection updates, new TikTok Audiences, Lusha, and xAI apps, plus enhanced custom app capabilities and API improvements
Release notes

2024

# Scenario inputs now available for all users

4 min

## Improvements and changes

* Users can now update their existing connections when their credentials change, instead of creating and reconfiguring new connections.

* Note: This feature is being enabled in stages. Some apps may not yet support connection updates.

![Document image](https://images.archbee.com/4CkrlJIBl1di_p1x71ery-kSO3qf_yfwtwB_ez0PIO3-20250218-145854.png?format=webp "Document image")

﻿

* The [scenario inputs](https://www.make.com/en/help/scenarios/scenario-inputs "scenario inputs") are now available to all Make﻿ users. Previously, scenario﻿ inputs were available only to users in organizations with the **Pro** plan or higher.

* The scenario﻿ entity in the Make﻿ API now has the isActive parameter. This parameter shows whether a scenario﻿ [is active](https://www.make.com/en/help/scenarios/active-and-inactive-scenarios "is active"). The islinked parameter is now Make API still returns the islinked parameter for backward compatibility.

* Custom app developers now have the ability to utilize data structures directly within custom apps. Users can create a data structure and integrate it into their app, similar to how data structures function in data stores.

* Previously, when a Team Admin only had an organization member role, they were unable to add new users to the team. Now, a Team Admin with a member role can see all the organization users and add users to the team.

* Custom app developers can now add a banner to the module settings. You can use banners in module settings to highlight new features or announce changes.

## Fixed issues

* When parsing a date with the parseDate function in the timestamp format in milliseconds, users had to convert the timestamp to a number first. This is no longer required. The parseDate function converts timestamps in seconds or in milliseconds directly.

* Previously, attempting to add a custom property would result in an error stating that the property data already exists if there was an empty value for that property. Now, the function recognizes an empty object as a condition and allows the user to add the new property without receiving an error.

## Apps updates

### New apps

* ﻿[TikTok Audiences](https://www.make.com/en/help/apps/marketing/tiktok-audiences "TikTok Audiences") - A new app that enables you to manage custom audiences, customer audience contacts, customer file audiences, and saved audiences directly from your TikTok Business account.

* ﻿[Lusha](https://www.make.com/en/help/apps/crm-and-sales-tools/lusha "Lusha") - This new app helps businesses find accurate and verified contact and company information for easy prospecting and research.

* ﻿[xAI](https://www.make.com/en/help/apps/ai/xai "xAI") - An app enabling users to create text completions from prompts or chats, supporting streamlined automation and enhanced workflows.

### Updated apps

* ﻿[LinkedIn Conversions API](https://www.make.com/en/help/app/linkedin-conversions-api#linkedin-conversions-api "LinkedIn Conversions API") - The documentation has been updated with additional details, including Salesforce configuration guidance, required LinkedIn account permissions, and steps for setting up conversion events.

* ﻿[Snack Prompt](https://www.make.com/en/help/app/snack-prompt "Snack Prompt") - We've updated the documentation to include more detailed information about the modules in the app.

Updated 19 Jan 2026

Did this page help you?

Yes

No

[PREVIOUS

New Snapchat integration](/new-snapchat-integration "New Snapchat integration")[NEXT

Editor revamp and subscenarios launch](/editor-revamp-and-subscenarios-launch "Editor revamp and subscenarios launch")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

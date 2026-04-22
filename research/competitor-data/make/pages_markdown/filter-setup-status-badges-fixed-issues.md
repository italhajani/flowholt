# Filter setup status badges, fixed issues - Help Center

Source: https://help.make.com/filter-setup-status-badges-fixed-issues
Lastmod: 2026-01-19T17:32:26.155Z
Description: Explore filter setup improvements, Leonardo.AI image generation, Google Vertex AI Gemini, TickTick productivity app, and NetSuite and Workday updates
Release notes

2024

# Filter setup status badges, fixed issues

3 min

## Improvements and changes

* During guided template setup, filters now have setup status badges:

* Your filter has unsaved changes:

![Document image](https://images.archbee.com/4CkrlJIBl1di_p1x71ery-uRkpg562BDXChBG3sAFZj-20250228-115752.png?format=webp "Document image")

﻿

* Your filter is set up and ready:

![Document image](https://images.archbee.com/4CkrlJIBl1di_p1x71ery-CpESc9zj-JYv8vTVYi-SB-20250228-121756.png?format=webp "Document image")

﻿

## Fixed issues

* Custom functions sometimes took too long to finish, which caused an error and disabled your scenario﻿. We reviewed the timeout settings on custom functions. Before using custom functions, check the [limits](/custom-functions#)﻿.

* Webhooks migrated from the Integromat platform sometimes returned a ConnectionError. We fixed the issue so your legacy webhooks remain stable.

* In some cases, domain verification did not work for SSO domain claim. Verification now works as expected.

* Sharable links to templates went to the organization dashboard. These links now go directly to the specific template.

* Switching from one team to another sometimes resulted in an error message. Navigating to a different team now works just fine.

## Apps updates

### New and updated apps:

* ﻿[Leonardo.AI](KBDC_RF68_B7Eafr7mGWd#) ﻿- This new app helps you generate images using the latest AI art generator, Leonardo AI, a popular alternative to Midjourney.

* ﻿[TickTick](https://apps.make.com/ticktick#)﻿ - Manage your to-do lists and tasks with this helpful productivity app.

* ﻿[Google Vertex AI (Gemini)](XyVb7j789YKY3Ymlt9_oX#)﻿ - A powerful new app that can answer anything with the **Create a Completion** module using the gemini-pro model, as well as analyze image and video files with the gemini-pro-vision model. This app is a replacement for the recently deprecated Google Cloud Vision app.

* ﻿[NetSuite](https://apps.make.com/netsuite#)﻿ - It is now possible to trigger a scenario﻿ when a custom date field is updated. Use the **Watch Records** module for this purpose. Also, we added new hints in the **Create or Update a Record** module.

* ﻿[Workday Financial Management](https://www.make.com/en/help/apps/business-operations-and-erps/workday-financial-management "Workday Financial Management") and [Workday Human Capital Management](https://www.make.com/en/help/apps/hr-management/workday-human-capital-management "Workday Human Capital Management") - You can select the format in which to get a RaaS report with the help of the **Get RaaS Report** module. Also, we added helping hints to let users know where to get credentials to create an OAuth2 connection.

Updated 19 Jan 2026

Did this page help you?

Yes

No

[PREVIOUS

Table view improvements](/table-view-improvements "Table view improvements")[NEXT

Module setup badges, community apps](/module-setup-badges-community-apps "Module setup badges, community apps")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

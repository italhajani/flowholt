# Scenario rate limits for instant triggers - Help Center

Source: https://help.make.com/scenario-rate-limits-for-instant-triggers
Lastmod: 2026-01-19T14:48:54.008Z
Description: Learn how to set execution limits on instant scenarios to prevent overloads, manage high-volume tasks, and enhance workflow reliability with our new features.
Release notes

2025

# Scenario rate limits for instant triggers

3 min

Available for all users on all plans.

Previously, instant scenarios﻿ used to run at full speed, often overwhelming third-party services and triggering "Too Many Requests" errors that could halt your automations. Now you can set execution limits to control the pace, ensuring reliable workflows and smoother interactions with third-party applications.

### **What's new?**

* You can set how many instant scenarios can start per minute.

* It prevents APIs from rejecting requests due to excessive calls.

* System handles timing automatically—no sleep modules needed.

* Sudden spikes get distributed evenly instead of overwhelming services.

* It prevents high-volume scenarios from blocking other automations.

* Missed executions get reprocessed automatically.

### Where to find it?

In the Scenario﻿ Builder, the **Schedule setting** now includes a "[Maximum runs per minute](https://help.make.com/schedule-a-scenario#lcstO "Maximum runs per minute")" option to configure your rate limits. When a scenario﻿ reaches its configured scenario﻿ run limit, it queues and processes requests gradually as the limit allows.

![Document image](https://images.archbee.com/4CkrlJIBl1di_p1x71ery-RjVvWHA9qXu4KSSViRnUC-20250728-145641.png?format=webp "Document image")

﻿

Available for scenarios with instant triggers.

### Learn more

* ﻿[Technical documentation: Set up scenario rate limits](https://help.make.com/schedule-a-scenario#lcstO "Technical documentation: Set up scenario rate limits")﻿

* ﻿[Community announcement: Rate limit your scenarios](https://community.make.com/t/feature-spotlight-scenario-rate-limits/88197 "Community announcement: Rate limit your scenarios")﻿

Updated 19 Jan 2026

Did this page help you?

Yes

No

[PREVIOUS

Google Sheets add-on, new OpenAI module](/google-sheets-add-on-new-openai-module "Google Sheets add-on, new OpenAI module")[NEXT

Make AI Content Extractor, new Shopify version, app updates](/make-ai-content-extractor-new-shopify-version-app-updates "Make AI Content Extractor, new Shopify version, app updates")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

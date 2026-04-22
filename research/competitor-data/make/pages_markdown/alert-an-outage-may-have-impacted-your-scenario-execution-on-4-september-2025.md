# [RESOLVED] Alert: An outage may have impacted your scenario execution on 4 September, 2025 - Help Center

Source: https://help.make.com/alert-an-outage-may-have-impacted-your-scenario-execution-on-4-september-2025
Lastmod: 2026-01-19T13:49:20.402Z
Description: On September 4, 2025, Make experienced a brief outage; learn how to check for missed events, resubmit data, and the steps taken to enhance system security.
Release notes

2025

# [RESOLVED] Alert: An outage may have impacted your scenario execution on 4 September, 2025

3 min

### **10 September, 2025**

This incident has been fully resolved. All Make services are operating normally.

**What we did to recover:** Thanks to our extensive monitoring and incident response procedures, our engineering team responded within minutes to mitigate the impact and restore service. We conducted a thorough investigation, reconstructed the complete chain of events, and implemented proactive measures to defend against similar disruptions.

**Prevention measures:** We've implemented additional hardening steps and have more planned for the near future to prevent similar incidents from occurring.

**Delayed webhook deliveries:** You may have received delayed webhook calls as third-party systems automatically retried their requests during the outage. This is normal behavior and indicates that Make's webhook queuing mechanisms worked as designed.

**Need help?** If you continue to experience any issues, please [contact our Customer Care team](https://www.make.com/en/ticket "contact our Customer Care team").

﻿

### **4 September, 2025**

We experienced an outage today (4 September 2025) between 14:37 CEST and 16:35 CEST that affected the execution of all scenarios. While our systems are now running as normal, scenarios that should have been triggered during the outage may not have been executed.

**How your scenarios may have been impacted**

* **Scenarios that rely on data or triggers being sent to Make** (instant triggers, and scheduled scenarios that receive data from other sources such as webhooks) did not run during the outage. If data was sent to Make at that time, it was not received, and scenarios were not executed.

* **Scenarios that fetch data from other sources** (scheduled triggers) did not run during the outage. Most of these have already been run with a delay. If not, they will run shortly.

* **In a small number of cases, scenarios that were running when the outage began** may not have been fully executed. If this is the case, you will see an error in your execution history.

**What you need to do now**

If data was sent to Make during the outage, it was not received, and scenarios were not executed. We therefore recommend you:

* Check other systems for any events that should have triggered a scenario during the outage window.

* Review your execution history to see if any data was not received.

* If any was missed, re-send it to trigger the scenario again.

Please note that many apps or services retry sending data several times. In some cases, you may therefore find that data that should have been sent to Make during the outage will follow later.

Finally, you may have received email notifications that your scenarios were stopped or deactivated. We have automatically reactivated any scenarios that were deactivated as a result of this outage, but you may wish to check all your scenarios to be sure.We know that Make is important to your business and rest assured that we are here to support you. We regret disruptions in any form and we will work hard to avoid similar situations in the future.

We will continue sharing updates on the Make [status page](https://status.make.com/ "status page").

Updated 19 Jan 2026

Did this page help you?

Yes

No

[PREVIOUS

Make AI Toolkit, simplified MCP token creation, apps updates](/make-ai-toolkit-simplified-mcp-token-creation-apps-updates "Make AI Toolkit, simplified MCP token creation, apps updates")[NEXT

Credit dashboard display fix](/credit-dashboard-display-fix "Credit dashboard display fix")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

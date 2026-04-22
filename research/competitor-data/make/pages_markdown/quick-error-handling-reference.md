# Quick error handling reference - Help Center

Source: https://help.make.com/quick-error-handling-reference
Lastmod: 2026-04-08T14:40:15.052Z
Description: Compare all error handlers at a glance and understand what each one does when an error occurs
Error handling

Error handlers

# Quick error handling reference

1 min

The following table provides a quick reference to working with error handlers in Make﻿.

If you want to learn more about individual error handlers, check the dedicated articles in this section of the Help Center. If you want to learn more about error handling, you can start with the [introduction](/introduction-to-errors-and-warnings#)﻿.

| **Break** | ﻿  Document image  ﻿ | ﻿Make﻿ stores the subsequent modules as an [incomplete execution](/incomplete-executions#)﻿. Set the automatic completion to **Yes** to get similar functionality as a **Retry**. Otherwise, you have to resolve incomplete executions manually.  ﻿Make﻿ processes the rest of the bundles in the scenario﻿ flow normally.  **The scenario ends with the "warning" status.**  Check the [Break error handler](/break-error-handler#)﻿ for further information. |
| --- | --- | --- |
| **Commit** | ﻿  Document image  ﻿ | ﻿Make﻿ stops the scenario﻿ run and commits all changes.  ﻿Make﻿ doesn't process the rest of the modules in the scenario﻿ flow.  **The scenario ends with the "success" status.**  Check the [Commit error handler](/commit-error-handler#)﻿ for further information. |
| **Ignore** | ﻿  Document image  ﻿ | ﻿Make﻿ ignores the error. The bundle doesn't continue in the scenario﻿ flow.  ﻿Make﻿ processes the rest of the bundles in the scenario﻿ flow normally.  **The scenario ends with the "success" status.**  Check the [Ignore error handler](/ignore-error-handler#)﻿ for further information. |
| **Resume** | ﻿  Document image  ﻿ | Specify a substitute mapping for when the module outputs an error. The substitute data continue through the rest of the scenario﻿.  ﻿Make﻿ processes the rest of the bundles in the scenario﻿ flow normally.  **The scenario ends with the "success" status.**  Check the [Resume error handler](/resume-error-handler#)﻿ for further information. |
| **Rollback** | Document image  ﻿ | ﻿Make﻿ stops the scenario﻿ run and reverts changes in all modules that support transactions.  ﻿Make﻿ doesn't process the rest of the modules in the scenario﻿ flow.  ﻿Make﻿ stops scheduling the scenario﻿ after the **Rollback** activates for the [number of consecutive errors](/overview-of-error-handling#number-of-consecutive-errors)﻿ in a row.  **The scenario ends with the "error" status.** |

**Rollback** is the default error handling if you don't set any error handling and when you keep [incomplete executions](/incomplete-executions)﻿ disabled.

﻿

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

Error handlers](/error-handlers "Error handlers")[NEXT

Break error handler](/break-error-handler "Break error handler")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

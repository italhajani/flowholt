# Scenario settings - Help Center

Source: https://help.make.com/scenario-settings
Lastmod: 2026-02-04T14:47:36.961Z
Description: Define how your scenario executes and behaves if an error occurs
Explore more

Scenarios

# Scenario settings

8 min

To access **Scenario settings**, click the gear icon in the Scenario﻿ Builder. Here you can set various advanced settings.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/Zusz0Qbp3EP67xJ3qK7cl-20251003-145143.png "Document image")

﻿

## Sequential processing

You can allow Make﻿ to store information about incomplete Make﻿ executions.

The sequential processing setting determines how Make﻿ processes recurring incomplete executions. The [incomplete executions](/incomplete-executions)﻿ folder must contain Make﻿ data.

* If enabled, Make﻿ stops executing the scenario﻿ until you resolve all incomplete executions. This option guarantees that Make﻿ will always solve incomplete executions in sequential order.

* If disabled, the scenario﻿ continues to run according to its [schedule](SCPFttWgFaPf077uJO1jh)﻿, regardless of errors.

Sequential processing also applies to [webhooks](1yhUnJ8jvZyxiP9Cf3Ps1)﻿. By default, Make﻿ processes webhooks in parallel. When you enable sequential processing, Make﻿ waits until the previous execution is complete before starting the next one.

## Data is confidential

After a scenario﻿ executes, you can [display information](/scenario-execution-flow)﻿ about data processed by the modules. This happens by default.

If you do not want to store this information, enable this setting.

If enabled, there are very limited options to solve errors that occur in a scenario﻿ execution.

## Store incomplete executions

This setting determines what happens if a scenario﻿ run encounters an [error](/incomplete-executions#OrXDX)﻿. You can choose how Make﻿ will process the data.

* If enabled, the scenario﻿ is paused and moved to the [incomplete executions](/incomplete-executions)﻿ folder. This gives you the possibility to fix the issue and continue from where the scenario﻿ stopped.

* If disabled, the scenario﻿ run stops and starts a [rollback phase](https://help.make.com/scenario-execution-cycles-and-phases#F-KOC "rollback phase").

You can resolve each incomplete execution either manually or automatically.

The data in this folder counts towards the storage limits of your [subscription plan](https://www.make.com/en/pricing "subscription plan").

## Enable data loss

﻿Make﻿ may fail to save a data bundle to the queue of [incomplete executions](/incomplete-executions)﻿ (e.g. due to a lack of free space). With this setting enabled, Make﻿ does not save the lost data. This is to prevent interruptions in the Make execution.

This option is well-suited for scenarios﻿ where continuous execution is the highest priority. The incoming data is less important.

Modules can encounter files larger than the [maximum allowed size](OAUIOo6OUjV0FYGlzMRte)﻿. In this case, Make﻿ proceeds according to the enable data loss setting and displays a warning message.

The maximum file size depends on your [subscription plan](https://www.make.com/en/pricing "subscription plan").

## Auto commit

This setting applies to transactions and defines the way to process a scenario﻿. This setting is enabled by default.

* If enabled, the [commit phase](https://help.make.com/scenario-execution-cycles-and-phases#F-KOC "commit phase") on each module starts immediately after the operation phase. Data is committed right away and cannot be restored in the case of an error.

* If disabled, no commit occurs until operations are executed for all modules.

Not every module supports transactionality. Only modules marked with the tag 'ACID' support transactions.

## Commit trigger last

This setting defines the module commit order after a successful scenario﻿ operation phase. This setting is enabled by default.

* If enabled, the commit phase skips the trigger and processes that module last.

* If disabled, the commit phase occurs in the default order.

## Max number of cycles

This setting defines the maximum number of cycles allowed during a scenario﻿ execution.

Setting more [cycles](https://help.make.com/scenario-execution-cycles-and-phases#75-3E "cycles") can be useful when you want to prevent connection interruption to third-party services. This can also ensure all records are processed within the scenario﻿ run.

If you execute the scenario﻿ manually by clicking the **Run once** button, the setting is ignored and **only one cycle** will be performed.

## Number of consecutive errors

This setting defines the maximum number of consecutive execution attempts before the scenario﻿ deactivates (though there are exceptions listed in the [error handling overview](/overview-of-error-handling)﻿.

If a scenario﻿ starts with an instant trigger, the setting is ignored and the scenario﻿ is deactivated immediately once the first error has occurred.

﻿

Updated 04 Feb 2026

Did this page help you?

Yes

No

[PREVIOUS

Scenarios](/scenarios "Scenarios")[NEXT

Scenario notes](/scenario-notes "Scenario notes")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

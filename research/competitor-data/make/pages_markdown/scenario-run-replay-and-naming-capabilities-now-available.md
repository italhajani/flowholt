# Scenario run replay and naming capabilities now available - Help Center

Source: https://help.make.com/scenario-run-replay-and-naming-capabilities-now-available
Lastmod: 2026-01-19T13:14:37.349Z
Description: Scenario run replay and custom run names are now available on all plans, letting you replay runs to test or backfill data and label executions for easier tracking in scenario history.
Release notes

2025

# Scenario run replay and naming capabilities now available

4 min

Both scenario run replay and customize run name are available on all plans.

You can now **replay scenario runs** to easily test scenarios and backfill data, and **customize scenario run names** to distinguish between runs in the scenario history.

## Scenario run replay

Scenario run replay uses trigger data from a previous run in a current version of the scenario. This allows you to test scenarios, resolve errors, and backfill data without obtaining new trigger data.

You can use scenario run replay in two locations in Make, depending on your use case:

* **Scenario Builder**: Use **Run with existing data** (in the **Run once** dropdown) for easy testing and debugging as you build scenarios. This capability replays a previous run's trigger data on the current version of the scenario you're working on, even if unsaved.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/z59Y43NmVyGdBSI2vdQjN-20251010-130318.png "Document image")

﻿

* **Scenario history**: Use **Replay scenario run** (next to the **Details** button) to backfill data or replay errored runs after resolving errors. This capability replays a previous run's trigger data on the last-saved version of your scenario.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/gVfSqIH5pH1u9VGVuZQlq-20251010-133826.png "Document image")

﻿

﻿

Replayed runs appear in your scenario history and [consume credits](So6VnaYMUsFuaNYZOLVxq)﻿ like standard runs.

## Customize run name

You can now define custom names for scenario runs using the **Scenarios** > **Customize run name** module. This helps you identify and search for specific runs in your [scenario history](/scenario-history)﻿.

Add this module anywhere in your scenario route to name runs conditionally based on data mapped from a preceding module. Custom run names appear in the **Run name** column of the scenario history.

To find **Customize run name**, create a new scenario, or click on a scenario in your scenarios list. In the Scenario Builder, add the **Scenarios** > **Customize run name** module to a scenario.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/NJe-1erP3uYhvoX4cauH--20251023-114803.png "Document image")

﻿

﻿

As the **Customize run name** module does not use any credits, you can add clarity to your scenario runs for free.

## Learn more

To find out more about scenario run replay and naming in Make, head to our Help Center:

* ﻿[Scenario run replay](/scenario-run-replay)﻿

* ﻿[Customize run name](https://apps.make.com/scenario-service#LCslc)﻿

﻿

﻿

﻿

Updated 19 Jan 2026

Did this page help you?

Yes

No

[PREVIOUS

New navigation now live for all users](/new-navigation-now-live-for-all-users "New navigation now live for all users")[NEXT

Upcoming adjustments to plans and pricing](/upcoming-adjustments-to-plans-and-pricing "Upcoming adjustments to plans and pricing")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

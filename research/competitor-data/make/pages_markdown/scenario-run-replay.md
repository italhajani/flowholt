# Scenario run replay - Help Center

Source: https://help.make.com/scenario-run-replay
Lastmod: 2026-04-08T14:40:13.212Z
Description: Use trigger data from a previous run to execute a current version of a scenario for testing and debugging
Explore more

Scenarios

# Scenario run replay

11 min

Scenario﻿ run replay is available on all plans.

﻿Scenario﻿ run replay is a capability that runs a current version of a scenario using trigger data from a previous scenario﻿ run. This means you can test scenarios, resolve errors, and retroactively send data to third-party systems without needing to obtain new data.

You can replay scenario﻿ runs in multiple places in Make﻿, depending on your goals:

* ﻿[Scenario Builder](/scenario-run-replay#builder)﻿: Test and debug new and existing scenarios﻿

* ﻿[Scenario history](/scenario-run-replay#history)﻿ and [Run details](/scenario-run-replay#run-details)﻿: Backfill data and recover from errors in existing scenarios﻿

## Why replay scenario﻿ runs

Many data events, such as payments, CRM deals, or e-commerce orders, are difficult to trigger on demand. Using trigger data from replayed scenario﻿ runs instead enables efficiency in each of the following use cases.

### Test and debug

As you progressively build and test scenarios, the same data is processed multiple times. Instead of obtaining new data at each step, you can use trigger data from previous runs to ensure that new modules, routes, or fields are successful.

﻿[Run with existing data](/scenario-run-replay#builder)﻿ in the Scenario﻿ Builder is ideal for testing, as it enables you to replay runs while building.

### Recover from errors

You can replay scenario﻿ runs to resolve logical errors, such as faulty filters, incorrect data mapping, or missing modules.

For example, if you have 100 errored runs due to a logical mistake, you can use [Run with existing data](/scenario-run-replay#builder)﻿ to fix the error in the Scenario﻿ Builder, then[Replay run](/scenario-run-replay#history)﻿ to replay the 99 errored runs from the Scenario﻿ history or Run details.

### Backfill data

You can use replay to retroactively populate data in databases and third-party systems when errors in scenarios﻿ result in corrupt or incomplete data, or when you forget to add data to a system after building a scenario﻿.

﻿[Replay run](/scenario-run-replay#history)﻿ from the Scenario﻿ history or Run details is ideal for backfilling data, as this action doesn't require you to be in the Scenario﻿ Builder.

## How it works

When you replay a scenario﻿ run, a current version of a scenario﻿ runs using the trigger data of a previous run. That data passes through all modules, even those that ran successfully.

The following data is stored for scenario﻿ run replays:

* Trigger output data

* ﻿[Scenario inputs](/scenario-inputs-and-outputs)﻿﻿

* The most up-to-date [variable](/variables)﻿ value (values from previous runs are not preserved if updated during or since these runs)

Like standard scenario﻿ runs, replayed runs appear in the Scenario﻿ history and consume credits.

If you see the note **Run cannot be replayed**, this is likely because the following run types aren't stored:

* **Check run**: A run scheduled by a [polling trigger](/types-of-modules#polling-triggers)﻿ that did not return new data.

* **Single module run**: A run of a single non-[trigger](/types-of-modules#triggers)﻿ module.

## Where to find it

You can replay scenario﻿ runs from the Scenario﻿ Builder, Scenario﻿ history, and Run details.

### ﻿Scenario﻿ Builder

To find **Run with existing data**:

1

In the left sidebar, click **Scenarios**.

2

Select a scenario﻿ from your scenarios﻿ list.

3

On the toolbar, click the down arrow next to the **Run once** button.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/E_5T95KsL1DhRC8IVy9xQ-20251010-125928.png "Document image")

﻿

4

Select the scenario﻿ run to replay from the dropdown menu.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/z59Y43NmVyGdBSI2vdQjN-20251010-130318.png "Document image")

﻿

5

Click the **Run once** button.

### ﻿Scenario﻿ history

To find **Replay run** in the Scenario﻿ history:

1

On the left sidebar, click **Scenarios**.

2

Select a scenario﻿ from the list.

3

In the scenario﻿ diagram, click **History**.

4

To replay a scenario﻿ run, click the replay icon next to the **Details** button.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/gVfSqIH5pH1u9VGVuZQlq-20251010-133826.png?format=webp "Document image")

﻿

5

Optionally, click **View run** to view the replayed run in more detail in a new tab.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/vVx8XWjE8LvwG6Cqawllm-20251212-125407.png?format=webp "Document image")

﻿

### Run details

To find **Replay run** in Run details:

1

On the left sidebar, click **Scenarios**.

2

Select a scenario﻿ from the list.

3

In the scenario﻿ diagram, click a run in **History**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/ZSFALikEhBkWSc2eI0SIf-20251210-162300.png?format=webp "Document image")

﻿

4

Click the **Replay run** button to replay the run.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/n1LNYypK_ziNxx2phOklT-20251210-162555.png?format=webp "Document image")

﻿

5

Alternatively, click **History**, then the date or the  **Details** button.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/Yp2YykreHAiW9Nz_9XhMi-20251212-114011.png?format=webp "Document image")

﻿

6

Click the **Replay run** button to replay the run.

## Examples

In this example, you have a scenario﻿ that sends Tally responses to a Slack channel. The example is for illustrative purposes only, and does not require you to build a scenario.

![Document image](https://images.archbee.com/Q31995ot4OZzZRNwsMBrJ-2C4fxt-4oWwcqXDP5oqyu-20250818-155556.png?format=webp "Document image")

﻿

### Run with existing data

Your scenario﻿ watches responses in a Tally form and sends them to a private Slack channel. As you build, you update the Slack channel configured in the **Slack** > **Create a Message** module:

1

In the Scenario﻿ Builder, you open the **Slack** > **Create a Message** module settings, add the new Slack channel, and save.

2

To test this change, you click the downward arrow next to the **Run once** button on the toolbar.

3

In **Scenario run**, you select a previous run to use for trigger data.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/INSM2MODfoeaXMVsRpk2g-20251010-134421.png "Document image")

﻿

4

You click the **Run once** button.

5

The change does not return errors, so you save the scenario for future use.

### Replay run

After a week of running your Tally form scenario﻿, you realize you should have also sent the responses to Airtable. You decide to replay the past week's run to backfill its data in Airtable:

1

You update the scenario with an Airtable module and click **Save**.

Alternatively, you can temporarily disable the route to Slack to avoid sending the same responses again.

![Document image](https://images.archbee.com/Q31995ot4OZzZRNwsMBrJ-n2DfC5lHVbEBL_HqSA8AZ-20250818-160209.png?format=webp "Document image")

﻿

2

To backfill the past week's data into Airtable, you replay last week's scenario﻿ run in **History**.

Alternatively, replay it from the Run details after clicking the date or **Details**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/RaUMmu3iwCXhP-QuAtHrz-20251010-134914.png?format=webp "Document image")

﻿

3

This action injects the previous run's trigger data into the trigger module of the updated scenario﻿.

4

The replayed run appears at the top of your scenario﻿ history. The run resulted in 1 extra credit due to the added Airtable module, totalling 3 credits.

5

Your Airtable database now includes data from the past week.

﻿Scenario﻿ run replay includes the following constraints:

* Bulk replay is currently not possible.

* A scenario﻿ run is replayable as long as it's available in the scenario﻿ history, which varies by plan. See [log storage](https://www.make.com/en/pricing " log storage") for details.

﻿

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

Restore and recover scenario](/restore-and-recover-scenario "Restore and recover scenario")[NEXT

Connections](/connections "Connections")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

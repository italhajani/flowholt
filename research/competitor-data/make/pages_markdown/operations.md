# Operations - Help Center

Source: https://help.make.com/operations
Lastmod: 2026-04-08T14:40:16.968Z
Description: Learn what operations are, how modules process data through bundles, and how to view them for debugging and optimization
Key concepts

Credits & operations

# Operations

9 min

Operations recently changed as a term and concept. This article reflects the new definition of operations.

When you use features in Make, you'll notice that your activities result in operations. A good understanding of operations is key to a broader view of how Make works: how data flows through scenarios and is processed. In this guide to operations in Make, you'll learn what operations are, how they work, and where to check them for debugging or credit usage tracking purposes.

## **What are operations?**

An operation is a single module run to process data or check for new data. When you run a scenario, each of its modules runs one or more times, resulting in 1 or more operations.

A module's number of operations depends on the number of bundles it processes. For now, think of a bundle as a unit of data, like an email, contact, or file.

**Examples**

* The **Gmail > Send an Email** module sends 5 emails = 5 operations (one per email)

* The **Google Drive > Upload File** module uploads 3 files = 3 operations (one per file)

The exception to this rule is [trigger modules](/types-of-modules#triggers)﻿, which only run once to check for or retrieve data, regardless of the number of bundles returned:

* The **Google Sheet > Watch New Rows** module checks for new rows in a Google spreadsheet = 1 operation (one per check)

When you run a scenario, the checkmark icon (the first number) in the white bubbles above modules shows each module's operation count. The coin icon (the second number) shows the number of [credits](/credits)﻿ consumed by those operations.

![Document image](https://images.archbee.com/Q31995ot4OZzZRNwsMBrJ-gFkNJUCJ7vyF-7v4dxHQV-20250724-113006.png?format=webp "Document image")

﻿

By default, the white bubble only shows operations. You can toggle on credits next to the scenario name.

## **What are bundles?**

Bundles are containers that hold related data items, and data items are individual pieces of data. When you click a white bubble above a module and expand an operation, you can see the bundles that the module processed.

For example, when a module runs to add new contacts to a table, each contact is a bundle. A bundle can include several data items, parameters such as name, last name, and email.

![Document image](https://images.archbee.com/Q31995ot4OZzZRNwsMBrJ-eEgAfsQC3w9e3ruh_vaJM-20250724-130544.png?format=webp "Document image")

﻿

### Input and output bundles

An operation contains two types of bundles: input bundles and output bundles. An input bundle is the data a module receives, and an output bundle is the module's response data.

In a scenario, the trigger module first retrieves bundles from an external source. The next module receives these bundles as input bundles. This module processes these bundles according to its function in the scenario, resulting in output bundles. This process repeats throughout the scenario.

### How bundles relate to operations

While an operation is a module run to process or check data, a bundle is the processed data. Modules process each bundle separately, meaning each bundle triggers its own module run. For example, adding 5 contacts to a sheet requires 5 runs, resulting in 5 operations.

Since each bundle requires a module run, bundles in earlier modules have a multiplying effect on the operations in the rest of the scenario:

1. A trigger module runs once to check for new data -> 1 operation

2. If the trigger module returns multiple bundles, the next modules run once for each bundle -> That many operations

**Example**

A scenario watches for responses to a Google Form, creates a document for each response, downloads it, and emails the document to each respondent. In the last scenario run, the trigger module, **Google Forms > Watch Responses**, returned 10 new bundles (responses):

![Document image](https://images.archbee.com/Q31995ot4OZzZRNwsMBrJ-kUOlraDfaxnJtbDnQDW08-20250812-140619.png?format=webp "Document image")

﻿

Here's a breakdown of the total operations in this run:

* Trigger: 1 operation

* Other modules: 10 operations each (10 bundles per run)

Total: 31 operations (1+30) for each scenario run

If you press the **Stop** button while a scenario is running, the currently running module will finish processing all of the bundles and then the scenario will stop. It is not possible to stop the module before it processes all of the bundles.
Example:
Your scenario has five modules. During the processing of the third module, you click the **Stop** button. The third module will finish processing all the bundles then the scenario will stop. The fourth and fifth modules will not run.

## **Viewing operations**

Looking at your operations in detail is useful for debugging, understanding your credit usage, and monitoring your activities in Make.

To view operations in a scenario:

* Click the white bubble above any module after running a scenario.

* Expand individual operations to see their bundles processed.

* Expand bundles to see their data items.

Next, you'll walk through an example of how to view your operations and optimize them for the future.

**Example**

Your scenario starts with a **Google Sheets > Watch New Rows** module that watches a spreadsheet for new contacts. After running the module, the white bubble shows 1 operation, but when you expand it, you see 10 bundles—one for each contact returned.

After expanding a bundle, you can see a contact's first and last name, email, city, and other details.

![Document image](https://images.archbee.com/Q31995ot4OZzZRNwsMBrJ-o9HAPOL6FAxd2Td9jdsj0-20250721-122143.png?format=webp "Document image")

﻿

The next module, **Gmail > Send an Email**, sends 1 email to your company's sales manager for each new contact, including contact details. The module's white bubble shows 10 operations—one for each email sent.

![Document image](https://images.archbee.com/Q31995ot4OZzZRNwsMBrJ-roA7dxdjtTz-DVz-3__xR-20250721-125941.png?format=webp "Document image")

﻿

You return to this scenario run to look at its operations in detail. After finding and clicking the scenario in your scenario list, you navigate to its **History** tab. You locate the scenario run with 11 operations and click **Details**.

![Document image](https://images.archbee.com/Q31995ot4OZzZRNwsMBrJ-aixyWzn-kYU-SFufKFLY--20250725-111932.png?format=webp "Document image")

﻿

In **Details**, you can view a simple and advanced history log of the scenario run. You click on the **Gmail > Send an email** module's white bubble to learn more about its 10 operations. You can see that each operation is an email for a contact.

![Document image](https://images.archbee.com/Q31995ot4OZzZRNwsMBrJ-5CW8MytVvyH0LH0qtWPii-20250725-112837.png?format=webp "Document image")

﻿

After reviewing this scenario, you decide to optimize it so that it sends a single email with all new contacts in the body, instead of sending 10 separate emails (one for each new contact). To do this, you add a **Text aggregator** to combine all new contacts. This adjustment reduces total operations for this run from 11 to 3.

![Document image](https://images.archbee.com/Q31995ot4OZzZRNwsMBrJ-iiNUkK1fJSBkGKKiBCe_Q-20250825-093838.png?format=webp "Document image")

﻿

﻿

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

How to track credits](/how-to-track-credits "How to track credits")[NEXT

Scenarios & connections](/scenarios-and-connections "Scenarios & connections")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

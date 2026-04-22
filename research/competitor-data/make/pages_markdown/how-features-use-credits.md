# How features use credits - Help Center

Source: https://help.make.com/how-features-use-credits
Lastmod: 2026-04-08T14:40:14.851Z
Description: Understand the credit cost of different Make features and modules based on their type and function
Key concepts

...

Credits

# How features use credits

4 min

Understand the credit cost of your activities in Make with an overview of how different features in Make, including apps, modules, and in-app features, consume credits. The next sections explain credit usage by features and operations in modules.

## Credits by **feature**

In Make, a feature's credit usage logic depends on the use of [Make's AI Provider](/credits#PGtNM)﻿, a custom AI provider connection, such as via an API key, or an automatic AI provider connection.

**Make's AI Provider** is available on **all plans**, and **custom AI provider connections** are available on **paid plans**.

| **Feature** | **Make's AI Provider**  **(all plans)** | **Custom AI provider connection**  **(paid plans)** | **Automatic AI provider connection**  **(all plans)** |
| --- | --- | --- | --- |
| ﻿[Make AI Toolkit](https://apps.make.com/ai-tools "Make AI Toolkit ") ﻿ | Dynamic: 1 credit per operation + credits based on token usage | Fixed: 1 credit per operation | ﻿ |
| ﻿[Make AI Agents](https://help.make.com/make-ai-agents-app "Make AI Agents") | Dynamic: 1 credit per operation/chat + credits based on token usage, including:  * AI tokens (**Run an agent** and **Create Agent Context** modules)  * Embedding tokens (**Create Agent Context** modules) | Fixed: 1 credit per operation (+ embedding tokens when using **Create Agent Context** modules) | ﻿ |
| ﻿[Make AI Content Extractor](https://apps.make.com/make-ai-extractors "Make AI Content Extractor") | ﻿ | ﻿ | Fixed (1 credit per operation) or dynamic (credits based on token, file, or page-based usage), [depending on the module](https://apps.make.com/make-ai-extractors#J7fs5 "depending on the module"). |
| ﻿[Make AI Web Search](https://apps.make.com/make-ai-web-search "Make AI Web Search ") ﻿ | ﻿ | ﻿ | Dynamic: 1 credit per operation + credits based on token usage |

The [Make Code](https://apps.make.com/code#credit-usage)﻿ app uses 2 credits per second of execution time.

**All other features consume credits based on a fixed rate of 1 credit per operation.** The next section details the relationship between credits and operations for each module type.

## Credits by module type

Most non-AI apps at Make consume credits on a [fixed](/credits#fixed-credit-usage)﻿ basis based on operations in modules. There are several [module types](/types-of-modules)﻿ at Make, each using credits differently based on their place in the scenario and how they process data:

* **Trigger** modules use 1 credit per run, regardless of whether they return data. Even when a trigger finds no new data, it still uses 1 credit for checking. For example, in the **Google Sheets > Watch New Rows** module below, the scenario run retrieved no new data, but used 1 credit for the operation.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/SfGq7S3kWBUDt8ggstSYo_image.png?format=webp "Document image")

﻿

* **Search** modules use 1 credit per run, even when they return multiple bundles. For example, the **Google Sheets > Search Row** module below runs once to search rows according to the specified criteria. It only uses 1 credit for this operation despite returning 10 rows, or bundles.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/Rl7pihMKyYWyfPu0YbUe__image.png?format=webp "Document image")

﻿

* **Action** modules (those with "Add," "Update," "Delete," etc) use as many credits as runs needed to process all bundles. It uses 1 credit per input bundle processed. For example, the **Google Sheets > Search Row** module below returned 10 rows and used 1 credit. The following **Delete Rows** module must run 10 times to delete each of the 10 rows, using 10 credits. The scenario uses 11 credits total.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/ehLsxpLfejWYU3fMgGVXX_image.png?format=webp "Document image")

﻿

* **Aggregator** modules combine multiple bundles into a single bundle, called an array. Aggregators use 1 credit for each aggregation. For example, the array aggregator below combined 10 contacts, or bundles, from the **Google Sheets > Watch New Rows** module into an array. This aggregation used 1 credit.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/J1V5CrjGrOOYLkN-KjetY_image.png?format=webp "Document image")

﻿

* **Iterator**modules split an array into multiple bundles. Iterators use 1 credit to split an array into bundles, and the next modules use 1 credit for each iterated bundle. For example, the **Iterator** below received an email with an array of 5 attachments and split the array into 5 separate attachments. It used 1 credit to split the attachment array, and the **Google Drive > Upload a File** module used 5 credits to upload each attachment.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/MVatuTWrkTTf8_hYSAXP0_image.png?format=webp "Document image")

﻿

These module types do not use credits:

* ﻿[Error handler](/error-handlers)﻿ modules: **Rollback**, **Break**, **Resume**, **Commit**, **Ignore**

* ﻿[Router](/router)﻿ modules and [filters](/filtering)﻿

* ﻿[Scenarios](https://apps.make.com/scenario-service)﻿ modules: **Call a subscenario**, **Start a scenario**, **Return output**, and **Customize run name**

You can learn more about bundles and their relationship to operations in [Operations](/operations)﻿.

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

Credits](/credits "Credits")[NEXT

How to track credits](/how-to-track-credits "How to track credits")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

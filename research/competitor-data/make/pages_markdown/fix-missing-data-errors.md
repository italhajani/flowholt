# Fix missing data errors - Help Center

Source: https://help.make.com/fix-missing-data-errors
Lastmod: 2026-02-10T07:31:40.706Z
Description: Understand what causes missing data errors and how to handle them
Error handling

How to handle errors

# Fix missing data errors

4 min

App modules output the BundleValidationError when the input bundle is missing the required data. For example, if you map data from a search module that didn't return any results.

When a module in your scenario﻿ outputs the BundleValidationError, you should check the reason for the error. You should consider redesigning your scenario﻿ if you can avoid the error to make your automation more robust. You can use the [if](/general-functions#)﻿ or [ifempty](/general-functions#)﻿ functions or use [Filtering](/filtering#)﻿.

Otherwise, you will have to handle the error to keep your scenario﻿ active.

In the following examples, we will consider two situations:

1. Ignore the missing data or use a placeholder.

2. The missing data are not a problem. You just want to keep your scenario﻿ enabled.

3. Get notified about errors and store the scenario﻿ run.

4. The missing data are not acceptable. If you get the BundleValidationError, you want to check what happened in detail.

To learn more about how to approach error handling in Make﻿ you can check the [error handling overview](/overview-of-error-handling#)﻿.

## Ignore the missing data or use a placeholder

You might work with data that sometimes contains missing values. You don't need to fix them or investigate why they are missing. Your main goal is to avoid disabling your scenario﻿.

We will use the following scenario﻿ for testing:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/wX4WSbHjXr2iItcN9-mIO_uuid-b8cc239f-82b1-d822-29c3-d6023d500362.png?format=webp "Document image")

﻿

The scenario﻿ reads data, modifies it, and uses it for a search in the data store. One piece of data is empty, which causes the BundleValidationError in the search module.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/AopklPJxy4sSAt6veYlSu_uuid-1a7a1e56-3c3e-874c-2387-23e4e8e93af6.png?format=webp "Document image")

﻿

To keep your scenario﻿ running even when the error happens, you can use the [Ignore](/ignore-error-handler#)﻿ or [Resume](/resume-error-handler#)﻿ error handlers.

1. Right-click the module that is causing the error.

2. Select **Add an error handler**.

3. A pop-up appears. From the list of error handlers, select the **Ignore** error handler.

The final scenario﻿ should look like this:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/uXRce8A7eFoMNB7ykv5fn_uuid-50c22ca4-d87e-a9f2-0c0c-f2370c71a587.png?format=webp "Document image")

﻿

## Get notified about errors and store the Make run

There might be scenarios﻿ you want to check closely when an error happens. You can do that with a custom error handling setup. If an error occurs in your scenario﻿, you get an email with the error description and a link to the scenario﻿. In addition, you store the error bundle as incomplete execution to resolve it manually.

We will use the following scenario﻿ for testing:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/wX4WSbHjXr2iItcN9-mIO_uuid-b8cc239f-82b1-d822-29c3-d6023d500362.png?format=webp "Document image")

﻿

The scenario﻿ reads data, modifies them and uses them for search in the data store. One piece of data is empty, which causes the BundleValidationError in the search module.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/AopklPJxy4sSAt6veYlSu_uuid-1a7a1e56-3c3e-874c-2387-23e4e8e93af6.png?format=webp "Document image")

﻿

To store unfinished scenario﻿ runs and get a custom email notification when an error occurs, follow these steps:

1. Right-click the module that is causing the error.

2. Select **Add an error handler**.

3. A pop-up appears. From the list of error handlers, select the **Break** error handler.

4. A pop-up appears with the **Break** error handler settings. Set automatic completion to **No** to always resolve the error manually. Confirm the settings with the **OK** button. To learn more about the **Break** error handler settings, check the [dedicated article](/break-error-handler#)﻿.

5. Click the scenario﻿ settings icon and enable storing of incomplete executions.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/JITv5bFhH08k053Dq2pdC-20260204-150539.png?format=webp "Document image")

﻿

6. Right-click the connection between the erroring module and the **Break** error handler. Choose **Add a module**. Make inserts a gray module placeholder between the erroring module and the **Break** error handler.

7. Click the gray module placeholder and search for the **Gmail** app. Insert the **Send an email** module into the module placeholder.

8. Set up the **Send an email** module. In the **Content** field, add the notification message you want to receive when an error happens. Use the Make﻿ [system variables](5UJ3-0KGuD4jwffMxAm-9#)﻿ to get the metadata. For example:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/czenG-shi1mvFkpbrgkDO_uuid-3a13b84f-81a1-07ce-c61c-d8b30baec274.png?format=webp "Document image")

﻿

You set up error handling in your scenario﻿ to create an incomplete execution and notify you with an email when an error happens.

The example scenario﻿ with error handling looks like this:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/Tr6S71di4lCLllhUshdt6_uuid-3616c054-88b2-38b5-a085-37448ce75729.png?format=webp "Document image")

﻿

﻿

Updated 10 Feb 2026

Did this page help you?

Yes

No

[PREVIOUS

Fix connection errors](/fix-connection-errors "Fix connection errors")[NEXT

Fix general errors](/fix-general-errors "Fix general errors")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

# Break error handler - Help Center

Source: https://help.make.com/break-error-handler
Lastmod: 2026-02-26T17:27:49.167Z
Description: Use Break error handler to store incomplete executions and enable automatic or manual retries
Error handling

Error handlers

# Break error handler

4 min

The **Break** error handler removes the erroring bundle from the scenario﻿ flow. Make﻿ stores the error message, mappings and the remaining scenario﻿ flow as an [incomplete execution](/incomplete-executions)﻿. Depending on the **Break** error handler settings, Make﻿ retries the incomplete scenario﻿ runs automatically or stores them until you resolve them yourself.

Automatic retry is most effective for temporary errors or errors where another attempt might be successful.

﻿Make﻿ automatically retries the most frequent temporary errors, the ConnectionError and RateLimitError, by default already. You don't need the **Break** error handler to automatically retry these types of errors.

To automatically retry the ConnectionError and RateLimitError, you only need to enable incomplete executions in scenario settings.

You can read more about automatic retry in the article about [incomplete executions](/incomplete-executions)﻿.

﻿Make﻿ processes the rest of the bundles in the scenario﻿ flow.

To use the **Break** error handler in your scenario﻿, you have to enable incomplete executions in scenario﻿ settings.

For example: This demo scenario﻿ contains five modules. The scenario﻿ is useful for tests and showing the effect of an error handler:

1. **JSON** - **Parse JSON** provides test data in the form of an array of three record IDs.

2. **Iterator** splits the array into individual bundles.

3. **Data store** - **Update a record**: Updates the data in the data store.

4. **Data store** - **Update a record**: This module updates the data again. This time the module works differently. In the module mapping, there is a mapping that intentionally creates an error:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/IGuzVI2USP_2J2uaI6DiO_uuid-38a27efa-f066-3ba0-d77f-c1fac59dbb6a.png?format=webp "Document image")

﻿

5. The mapping inserts a null value into the required **Key** field, which always creates the BundleValidationError.

6. **Slack** - **Send a message**: Sends a message to a private testing channel.

This is how the example scenario﻿ looks:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/hAt8L-RCHcqlRX1Zv9ITu_uuid-a20c3804-3600-efbd-3e63-6ee8604bee5a.png?format=webp "Document image")

﻿

When we run the example scenario﻿, we would get the BundleValidationError:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/CNPg8JnCTdNcxaACINlIU_uuid-5e505ecc-ffa2-af6c-9a23-e625392bf169.png?format=webp "Document image")

﻿

If we added the **Break** error handler to the **Update a record** module, the **Break** error handler would remove the bundle from the scenario﻿ flow. The bundle that caused the error doesn't continue through the rest of the scenario﻿. Instead, Make﻿ creates an incomplete execution to store the error type, mappings, and the remaining scenario﻿ flow.

﻿Make﻿ would then process the remaining bundles in the scenario﻿ flow.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/-1qoR3x7k1QReheL899wF_uuid-89d26bf8-c2b9-d64b-47b5-30315c386979.png?format=webp "Document image")

﻿

For more information about error handling strategies check the [overview of error handling](/overview-of-error-handling#)﻿.

## Store the scenario﻿ when an error happens

With the **Break** error handler, you can store the remaining scenario﻿ flow in the scenario﻿ incomplete executions when an error happens. Make﻿ also stores the error message, scenario﻿ mappings, and data.

You can finish the scenario﻿ run in the incomplete executions tab manually or Make﻿ can finish the run automatically.

For example, the following scenario﻿ outputs an error in the **Data Store** app module:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/5XcqxaH60UEFdzAFXFjSw_uuid-a901367d-9ebd-d869-b841-0778ef13d599.png?format=webp "Document image")

﻿

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/5baGy6bZHQ6leP08QGmF3_uuid-d129246f-c7e4-31d0-c665-e4090e96a099.png?format=webp "Document image")

﻿

﻿

To store the scenario﻿ as an incomplete execution, follow the steps:

1. Right-click the module that is causing the error. In the menu, select **Add error handler**.

2. Select the **Break** error handler.

3. Optional: In the error handler settings, select if you want to automatically finish the incomplete executions. For automatic completions, you can set the number of attempts and the time delay between them.

4. Confirm the **Break** handler settings with the **OK** button.

5. Enable storing of incomplete executions in scenario﻿ settings.

6. Save your scenario﻿.

You added the **Break** error handler to your scenario﻿. When an error occurs in the **Data store** module, Make﻿ creates an incomplete execution. The scenario﻿ incomplete execution contains the error message, scenario﻿ mappings and data.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/-1qoR3x7k1QReheL899wF_uuid-89d26bf8-c2b9-d64b-47b5-30315c386979.png?format=webp "Document image")

﻿

If you use the automatic scenario﻿ completion, Make﻿ attempts to finish the scenario﻿ automatically.

Updated 26 Feb 2026

Did this page help you?

Yes

No

[PREVIOUS

Quick error handling reference](/quick-error-handling-reference "Quick error handling reference")[NEXT

Commit error handler](/commit-error-handler "Commit error handler")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

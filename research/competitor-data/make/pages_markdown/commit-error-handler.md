# Commit error handler - Help Center

Source: https://help.make.com/commit-error-handler
Lastmod: 2026-04-08T14:40:12.338Z
Description: Add Commit error handler to stop scenario execution when an error occurs and save the processed changes
Error handling

Error handlers

# Commit error handler

6 min

The **Commit** error handler stops the scenario﻿ run and commits changes in your database apps. If your scenario﻿ is not using apps that support transactions, like **MySQL** or **Data store**, the **Commit** error handler just stops the scenario﻿.

Modules that support transactions are labeled with the "ACID" label.

Before you use the **Rollback** or **Commit** error handlers, take a look at the [auto commit scenario setting](/scenario-settings#auto-commit)﻿ first.

The bundle that caused the error doesn't go through the rest of the scenario﻿ flow. Make﻿ doesn't process the rest of the bundles.

For example: This demo scenario﻿ contains five modules. The scenario﻿ is useful for tests and showing the effect of an error handler:

1. **JSON** - **Parse JSON** provides test data in the form of an array of three record IDs.

2. **Iterator** splits the array into individual bundles.

3. **Data store** - **Update a record**: Updates the data in the data store.

4. **Data store** - **Update a record**: This module updates the data again. This time the module works differently. In the module mapping, there is a mapping that intentionally creates an error:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/IGuzVI2USP_2J2uaI6DiO_uuid-38a27efa-f066-3ba0-d77f-c1fac59dbb6a.png?format=webp "Document image")

﻿

5. The mapping inserts a null value into the required **Key** field, which always creates the BundleValidationError.

6. Having two data store modules doing the same thing, but one of them failing, will make a good example for the **Commit** and **Rollback** error handlers.

7. **Slack** - **Send a message**: Sends a message to a private testing channel.

This is how the example scenario﻿ looks:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/hAt8L-RCHcqlRX1Zv9ITu_uuid-a20c3804-3600-efbd-3e63-6ee8604bee5a.png?format=webp "Document image")

﻿

When we would run the example scenario﻿, we would get the BundleValidationError:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/eV9s60is4o30uYvPGyHHU_uuid-d0cd6900-234c-21a1-c35c-e5ee696e538c.png?format=webp "Document image")

﻿

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/eV9s60is4o30uYvPGyHHU_uuid-d0cd6900-234c-21a1-c35c-e5ee696e538c.png?format=webp "Document image")

﻿

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/CNPg8JnCTdNcxaACINlIU_uuid-5e505ecc-ffa2-af6c-9a23-e625392bf169.png?format=webp "Document image")

﻿

﻿

If we added the **Commit** error handler to the **Update a record** module, the **Commit** error handler would stop processing the bundle in the scenario﻿ and save changes to your data in database apps. Make﻿ wouldn't process the remaining bundles.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/mNQWejvkDQgp6I0tGStjl_uuid-c5f5a530-6064-5b5f-6173-43065e78feff.png?format=webp "Document image")

﻿

Let's check the data in the data store as well.

Before running the scenario﻿, the data store contained the following data:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/oRZrCTIj9zuzZsnPsPb73_uuid-5d1bac2c-e430-eeb5-bc8b-220215ade799.png?format=webp "Document image")

﻿

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/hfIMYjRdotNKBy-0o3Ev8_uuid-41ecf051-2dae-90c9-bfdd-288c3f64d0c0.png?format=webp "Document image")

﻿

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/nwkQQ7SQTHK8_9R5xT9D-_uuid-c10413d2-2a9d-4d96-fe28-e86daff85b73.png?format=webp "Document image")

﻿

The mappings for the **Update a record** modules. The first module updates the ID column to the number 4 and the Name column to the text Test 4.

The second module updates the ID column to the number 5 and the Name column to the text Test 5.

After running the scenario﻿, Make﻿ would update the data in the data store:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/wZicTI1EIcTtXTIDeHgq3_uuid-0f0aedfd-c5cc-0a42-48e8-e78595379bf3.png?format=webp "Document image")

﻿

1. The first bundle of data gets through the scenario﻿ flow successfully and updates the first row of data in the data store both times. The first row contains the update from the second **Update a record** module: ID = 5, Name = Test 5.

2. The second bundle gets to the first **Update a record** module successfully, but causes an error in the second module.

3. The **Commit** error handler saves the update in the first module, but prevents the update in the second module and stops the scenario﻿. The second row contains the update from the first module only: ID = 4, Name = Test 4.

4. ﻿Make﻿ doesn't update the third row because the **Commit** error handler stopped the scenario﻿ run already. The data in the third row remain the same: ID = 3, Name = Test 3.

For more information about error handling strategies check the [overview of error handling](/overview-of-error-handling#)﻿.

## Stop the scenario﻿ when an error happens

With the **Commit** error handler, you can stop the scenario﻿ when an error happens. Make﻿ saves changes in the database apps in your scenario﻿ and doesn't process the rest of the bundles in the scenario﻿ flow.

Modules that support transactions are labeled with the "ACID" label.

Before you use the **Rollback** or **Commit** error handlers, take a look at the [auto commit scenario setting](/scenario-settings#auto-commit)﻿ first.

For example, the following scenario﻿ outputs an error in the **Data Store** app module:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/QRutfLx3O8T0C6c8tMjkr_uuid-fa7509b2-3845-6e23-3dcd-501d7aae3c28.png?format=webp "Document image")

﻿

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/BNvKAxXCftLdipluUABzo_uuid-ef360c16-0bfc-9f15-d79a-c2e4ff48b73e.png?format=webp "Document image")

﻿

To stop the scenario﻿ and save changes, follow the steps:

1. Right-click the module that is causing the error. In the menu, select **Add error handler**.

2. Select the **Commit** error handler.

3. Save your Make.

You added the **Commit** error handler to your scenario﻿. When an error occurs in the **Data store** module, the scenario﻿ stops and Make﻿ saves changes in modules that support transactions.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/ST26JkOm3ZhIZryPgtG0c_uuid-c5223517-4573-5f3e-8bcd-67cd68ca8bb0.png?format=webp "Document image")

﻿

﻿

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

Break error handler](/break-error-handler "Break error handler")[NEXT

Ignore error handler](/ignore-error-handler "Ignore error handler")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

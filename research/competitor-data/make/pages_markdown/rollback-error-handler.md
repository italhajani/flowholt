# Rollback error handler - Help Center

Source: https://help.make.com/rollback-error-handler
Lastmod: 2026-04-08T14:40:12.799Z
Description: Apply Rollback error handler to stop scenario execution when an error occurs and revert changes
Error handling

Error handlers

# Rollback error handler

6 min

The **Rollback** error handler stops the scenario﻿ run and reverts changes made by modules that support transactions. They always use a database app, like **MySQL** or **Data store**. Make﻿ cannot undo actions made by modules that don't support transactions, like **Gmail > Send an email** or **Dropbox > Delete a file**.

The bundle that caused the error doesn't continue in the scenario﻿ flow. In addition, Make﻿ doesn't process any remaining bundles.

﻿Make﻿ marks the scenario﻿ run as an error in the scenario﻿ history. Make﻿ won't disable the scenario﻿ because of consecutive errors.

Modules that support transactions are labeled with the "ACID" label.

Before you use the **Rollback** or **Commit** error handlers, take a look at the [auto commit scenario setting](/scenario-settings#auto-commit)﻿ first.

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

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/CNPg8JnCTdNcxaACINlIU_uuid-5e505ecc-ffa2-af6c-9a23-e625392bf169.png?format=webp "Document image")

﻿

If we added the **Rollback** error handler to the **Update a record** module, the **Rollback** error handler would stop processing the bundle in the scenario﻿. Make﻿ wouldn't process the remaining bundles.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/hFW_Qzof1gOSgooi8bFke_uuid-1efea139-a1c9-35b8-bc89-f89428a18bd5.png?format=webp "Document image")

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

If you disable the **Auto-commit** option in the scenario﻿ settings, Make﻿ reverts the changes that happened when Make﻿ was processing the bundle in modules that support transactions.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/m_T7FG48xXzUiNpMD615w_uuid-9e689f33-25d5-47ac-7f0d-a0e7ff42cf8b.png?format=webp "Document image")

﻿

1. The first bundle of data gets through the scenario﻿ flow successfully and updates the first row of data in the data store both times. The first row contains the update from the second **Update a record** module: ID = 5, Name = Test 5.

2. The second bundle gets to the first **Update a record** module successfully, but causes an error in the second module. The **Rollback** error handler reverts the update from the second bundle and stops the scenario﻿.

3. ﻿Make﻿ doesn't update the third row because the **Rollback** error handler stopped the scenario﻿ run already. The data in the third row remain the same: ID = 3, Name = Test 3.

If you keep the **Auto-commit** option enabled, Make﻿ reverts the changes made by the module that output the error if the module supports transactions.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/VnE9UupIhuh__HkPObLdL_uuid-3ce21539-b9cc-0fbf-da10-2459ce8e2bf2.png?format=webp "Document image")

﻿

1. The first bundle of data gets through the scenario﻿ flow successfully and updates the first row of data in the data store both times. Make﻿ commits all changes and they cannot be rolled back later.

2. The first row contains the update from the second **Update a record** module: ID = 5, Name = Test 5.

3. The second bundle gets to the first **Update a record** module successfully. Make﻿ commits all changes and they cannot be rolled back later. The second bundle causes an error in the second module.

4. The **Rollback** error handler prevents the update in the second module and stops the scenario﻿. The second row contains the update from the first module only: ID = 4, Name = Test 4.

5. Make doesn't update the third row because the **Rollback** error handler stopped the scenario﻿ run already. The data in the third row remain the same: ID = 3, Name = Test 3.

You can use the **Rollback** error handler to stop the scenario﻿ run and undo changes when the module outputs an error.

For more information about error handling strategies check the [overview of error handling](/overview-of-error-handling#)﻿.

## Undo changes to your data when an error happens

With the **Rollback** error handler, you can stop the scenario﻿ and undo changes when the module outputs an error. You can only undo changes in modules that support transactions.

Modules that support transactions are labeled with the "ACID" label.

Before you use the **Rollback** or **Commit** error handlers, take a look at the [auto commit scenario setting](/scenario-settings#auto-commit)﻿ first.

For example, the following scenario﻿ outputs an error in the **Data Store** app module:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/EGfaqKnCDq5hQ8-WkABEl_uuid-3bdc786e-427a-b07b-36ed-b091281174b2.png?format=webp "Document image")

﻿

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/spIQgqWBtPCVbufIvTwTw_uuid-f8ed6745-4a90-4dad-ad35-8995b0539c18.png?format=webp "Document image")

﻿

To stop the scenario﻿ and undo changes where possible when an error happens, follow the steps:

1. Right-click the module that is causing the error. In the menu, select **Add error handler**.

2. Select the **Rollback** error handler.

3. Optional: Go to scenario﻿ settings and disable the **Auto-commit** option.

4. When an error happens, the module that outputs the error reverts changes if the module supports transactions. If you disable the **Auto-commit** option, all modules in the scenario﻿ that support transactions undo changes.

5. Save your scenario﻿.

You added the **Rollback** error handler to your scenario﻿. When an error occurs in the **Data store** module, the scenario﻿ stops and Make﻿ reverts changes made by the erroring bundle in modules that support transactions.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/hFW_Qzof1gOSgooi8bFke_uuid-1efea139-a1c9-35b8-bc89-f89428a18bd5.png?format=webp "Document image")

﻿

﻿

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

Resume error handler](/resume-error-handler "Resume error handler")[NEXT

Types of errors](/types-of-errors "Types of errors")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

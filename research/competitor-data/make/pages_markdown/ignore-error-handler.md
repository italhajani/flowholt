# Ignore error handler - Help Center

Source: https://help.make.com/ignore-error-handler
Lastmod: 2026-01-16T11:32:52.164Z
Description: Use the Ignore error handler to disregard errors and allow the scenario to process subsequent bundles
Error handling

Error handlers

# Ignore error handler

3 min

The **Ignore** error handler ignores the error and removes the bundle from the scenario﻿ flow. The scenario﻿ run continues with the next bundle.

You can use the **Ignore** error handler when you know that there can be incorrect data in your scenario﻿ and they don't have an impact on your processes. The **Ignore** error handler prevents turning off the scenario﻿ when there's an error and marks the scenario﻿ run as a success even in case of errors.

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

When we would run the example scenario﻿, we would get the BundleValidationError:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/eV9s60is4o30uYvPGyHHU_uuid-d0cd6900-234c-21a1-c35c-e5ee696e538c.png?format=webp "Document image")

﻿

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/CNPg8JnCTdNcxaACINlIU_uuid-5e505ecc-ffa2-af6c-9a23-e625392bf169.png?format=webp "Document image")

﻿

If we added the **Ignore** error handler to the **Update a record** module, the **Ignore** error handler would remove the bundle from the scenario﻿ flow. The bundle doesn't enter the fifth (**Send a message**) module. The third bundle runs through the scenario﻿:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/cJlX7_Xflye7KUVxd6NEv_uuid-4b29c9a9-fcec-d564-94a4-67bc9b32010c.png?format=webp "Document image")

﻿

For more information about error handling strategies check the [overview of error handling](/overview-of-error-handling#)﻿.

## Keep your scenario﻿ running regardless of errors

With the **Ignore** error handler, you can remove the bundle that causes an error from the scenario﻿ flow and process the rest of the bundles in the scenario﻿. In addition, Make﻿ will keep running your scenario﻿ on schedule instead of disabling scheduling because of an error.

For example, the following scenario﻿ outputs an error in the **Update a record** module:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/eV9s60is4o30uYvPGyHHU_uuid-d0cd6900-234c-21a1-c35c-e5ee696e538c.png?format=webp "Document image")

﻿

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/RckXeXKUloJouSs4qGk6T_uuid-eddb2fe3-1de0-4c74-8ddc-56552cb48d48.png?format=webp "Document image")

﻿

﻿

To ignore the error and keep your scenario﻿ running regardless of errors, follow the steps:

1. Right-click the module that is causing the error. In the menu, select **Add error handler**.

2. Select the **Ignore** error handler.

3. Save your scenario﻿.

Your scenario﻿ keeps running regardless of errors. When an error occurs in the **Data store** module, the **Ignore** error handler removes the bundle from the scenario﻿ flow.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/17iUmy5T-DY7-j4SYFb7U_uuid-0e7ee896-d929-6290-26e6-cc41f706c57c.png?format=webp "Document image")

﻿

﻿

Updated 16 Jan 2026

Did this page help you?

Yes

No

[PREVIOUS

Commit error handler](/commit-error-handler "Commit error handler")[NEXT

Resume error handler](/resume-error-handler "Resume error handler")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

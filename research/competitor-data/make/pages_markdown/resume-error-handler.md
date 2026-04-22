# Resume error handler - Help Center

Source: https://help.make.com/resume-error-handler
Lastmod: 2026-01-16T11:55:55.938Z
Description: Add Resume error handler to set a substitute value for a failed module and continue scenario processing
Error handling

Error handlers

# Resume error handler

3 min

The **Resume** error handler replaces the module output with a substitute output when an error happens. You define the substitute output in the **Resume** error handler settings. The rest of the scenario﻿ uses the substitute output. Make﻿ processes the rest of the bundles in the scenario﻿ flow normally.

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

﻿

If we added the **Resume** error handler to the **Update a record** module, the **Resume** error handler would replace the bundle with the substitute mapping. When the module outputs an error, Make﻿ would use the substitute bundle instead. The third bundle runs through the scenario﻿:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/Yz73p1jVq4BK8dC5T7VZn_uuid-1a455b15-b789-055f-bf34-2144fcf94370.png?format=webp "Document image")

﻿

You can use the **Resume** error handler when you have a substitute mapping that fixes the bundle and allows the data bundle to continue in the scenario﻿ flow. You can also use the **Resume** error handler to add a placeholder that marks the data bundle to check later.

For more information about error handling strategies check the [overview of error handling](/overview-of-error-handling#)﻿.

## Change the bundle when it causes an error

With the **Resume** error handler, you can substitute the bundle that causes an error with your custom data. The custom data continue the rest of the scenario﻿ flow instead of the erroring bundle.

In the **Resume** error handler settings, you get the same fields as in the handled module settings. In the error handler fields, you can provide custom data that Make﻿ uses instead of the bundle that caused the error.

For example, the following scenario﻿ outputs an error in the **Update a record** module:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/eV9s60is4o30uYvPGyHHU_uuid-d0cd6900-234c-21a1-c35c-e5ee696e538c.png?format=webp "Document image")

﻿

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/RckXeXKUloJouSs4qGk6T_uuid-eddb2fe3-1de0-4c74-8ddc-56552cb48d48.png?format=webp "Document image")

﻿

To change the erroring bundle for custom data and use them in the rest of the scenario﻿, follow the steps:

1. Right-click the module that is causing the error. In the menu, select **Add error handler**.

2. Select the **Resume** error handler.

3. Fill in the **Resume** handler settings with your custom mapping.

4. Save your scenario﻿.

You added the **Resume** error handler to your scenario﻿. When an error occurs in the **Data store** module, the **Resume** error handler replaces the bundle with your custom mapping.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/Yz73p1jVq4BK8dC5T7VZn_uuid-1a455b15-b789-055f-bf34-2144fcf94370.png?format=webp "Document image")

﻿

﻿

Updated 16 Jan 2026

Did this page help you?

Yes

No

[PREVIOUS

Ignore error handler](/ignore-error-handler "Ignore error handler")[NEXT

Rollback error handler](/rollback-error-handler "Rollback error handler")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

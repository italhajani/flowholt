# Iterator - Help Center

Source: https://help.make.com/iterator
Lastmod: 2026-01-15T17:27:36.997Z
Description: Split arrays into individual bundles using iterators to process each item separately
Key concepts

Tools

# Iterator

7 min

Iterator is a special type of module that converts an array into a series of bundles. Each array item will output as a separate bundle.

## Setting up an iterator

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/Z5TzLrnePyBiz8uz4CGc8_uuid-76ebf1a2-e19f-d998-5faa-366411cbe503.png?format=webp "Document image")

﻿

Setting up an iterator is done in the same way as [setting any other module](/module-settings#)﻿. The Array field contains the array to be converted/split into separate bundles.

### Examples:

### Save email attachments to Google Drive

The scenario﻿ below shows how to retrieve emails with attachments and save the attachments as single files in a selected [Google Drive](https://apps.make.com/google-drive#)﻿ folder.

Emails can contain an array of attachments. The **Iterator** module inserted after the first module enables you to handle each attachment separately. The **Iterator** splits the array of attachments into single bundles, each bundle with one attachment will then save one at a time in a selected Google Drive folder. The **Iterator** module set up is shown above - the Array field should contain the Attachments[] array.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/6me7VXLBgnu4YVJzrjewX_uuid-afd56dcf-8ee1-119f-c8cf-9d1b8b93778a.png?format=webp "Document image")

﻿

### Specialized iterators

For your convenience, many Make﻿ apps offer specialized iterator modules with a simplified setup. For example, the [Email](MInmGWOE1-I9v0yVMHkZm#)﻿ app contains the special iterator **Email > Iterate attachments** that will produce the same results as the general **Iterator** without having to specify the array, just the source module.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/QhBwYdJiHid8iJz0thwvN_uuid-bd6d2f54-cd86-0526-3eaf-a1ff554dba42.png?format=webp "Document image")

﻿

## Learn when to use an Iterator in your scenarios﻿﻿

The video below is module 1 of the 3 part lesson titled **Iterator and Array Aggregator**. It explains the purpose of the Iterator and the Array Aggregator and with the help of a sample scenario﻿, explains when to use an Iterator and what to do with the output.

﻿

### Troubleshooting: Mapping panel does not display mappable items under the Iterator module

When an **Iterator** does not have information about the structure of the array's items, the mapping panel in the modules following the **Iterator** will display only two items under the **Iterator**: Total number of bundles and Bundle order position:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/_4I0SIQ4StH8PY7oH4FzL_uuid-9e8ce4d7-8de0-9a44-0f40-379c04149499.png?format=webp "Document image")

﻿

The reason for this is that in Make﻿ each module is responsible for providing information about items it outputs so these items can be properly displayed in the mapping panel in the following modules. However, there are several modules that might be unable to provide this information in some cases, e.g. [JSON](https://apps.make.com/json#)﻿ **> Parse JSON** or [Webhooks](1yhUnJ8jvZyxiP9Cf3Ps1#)﻿ **> Custom Webhook** modules with missing [data structure](/data-structures#)﻿.

The solution is to manually execute the scenario﻿ to make the module learn about the items it outputs so it can provide the information to the following modules.

For example, if you have a **JSON > Parse JSON** module without a data structure as below:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/GBSv9I7uVXF8bQP5TMfxl_uuid-aebaafc2-8fef-c8f5-9c40-c7d125978bd1.png?format=webp "Document image")

﻿

And then if you connect an **Iterator** module to it, you will not be able to map the output of the module to the *Array* field in the setup panel of the **Iterator**:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/lDcwWarEB3Bv0vz0TByn2_uuid-cdb106ba-05ba-4b5a-e0a2-b4999f852db6.png?format=webp "Document image")

﻿

To resolve this, just manually start the scenario﻿ in the Scenario﻿ editor. You can un-link the modules after the **JSON > Parse JSON** module to prevent the flow from proceeding further or right-click the **JSON > Parse JSON** module and choose "Run this module only" from the context menu to execute only the **JSON > Parse JSON** module.

Once the **JSON > Parse JSON** has been executed, it learns about the items it outputs and provides this information to all the following modules including the **Iterator**. The mapping panel in the **Iterator's** setup will then display the items:

![Flow_Control_10.png](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/aDAcDFWeOwq8EBbtvosuL_uuid-52e88ac1-3593-608c-57f3-f93b0a792a7a.png?format=webp "Flow_Control_10.png")

﻿

Moreover, the mapping panel in the modules connected after the **Iterator** will display the items contained in the array's items:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/L7AD8qbPhPEC30mVyiMdV_uuid-39c30df4-4f5e-1bff-6c6c-f1449fc1a7da.png?format=webp "Document image")

﻿

**In summary:** if you cannot see some items in a module's mapping panel, simply run the scenario﻿ once so all the modules can learn about the items they output and provide this information to the following modules.

Updated 15 Jan 2026

Did this page help you?

Yes

No

[PREVIOUS

Aggregator](/aggregator "Aggregator")[NEXT

Router](/router "Router")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

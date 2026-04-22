# Update legacy modules with new modules - Help Center

Source: https://help.make.com/update-legacy-modules-with-new-modules
Lastmod: 2026-01-26T10:09:03.552Z
Description: Update legacy modules to the latest versions to ensure compatibility and access new features
Key concepts

Apps & modules

# Update legacy modules with new modules

1 min

Most Make﻿ apps rely on external services, particularly their APIs (Application Programming Interfaces). As services evolve, so do their APIs. When services release a new API version, their Make﻿ app eventually becomes deprecated and shuts down. The result is a legacy (outdated) module in Make﻿.

﻿Make﻿ regularly implements new app versions that align with services' latest APIs. To keep your scenarios﻿ running, make sure to update legacy modules to the latest versions.

Here's a step-by-step guide to updating legacy modules in Make﻿, using Google Drive as an example.

1

### Step 1. Identify the legacy scenario﻿

A green double arrow icon (below) indicates a legacy module:

![Document image](https://images.archbee.com/Q31995ot4OZzZRNwsMBrJ-0gh1P6xxDoRMomFye7ut1-20250416-090127.jpg?format=webp "Document image")

﻿

2

### Step 2. Clone the legacy scenario﻿

Clone the scenario﻿ to make a copy. You will use this scenario from now on.

1. In the scenario﻿ diagram, open the **Options** drop-down menu in the top-right corner.

2. Select **Clone**.

3. In **Name of new scenario**, name the copied scenario﻿.

4. To enable the scenario﻿ to pick up where its old version left off, select **Yes** in **Keep the states of any modules the same as those being duplicated**.

5. Click **Save**.

![Document image](https://archbee-image-uploads.s3.amazonaws.com/Q31995ot4OZzZRNwsMBrJ-GMCHjY6DhjEo2Te1tSHfx-20250416-122940.gif "Document image")

﻿

We recommend opening the legacy scenario﻿ in a new tab to easily compare its configuration settings with those of the new scenario﻿.

3

### Step 3. Access and select new modules

1. In your new (copied) scenario﻿, choose the legacy module you need to upgrade and click on its green double arrow icon.

2. Click **Show me new modules** and select the corresponding module. The new module will appear in the scenario builder, but remains unconnected.

In the new modules list, some modules may no longer be available. In this case, choose the next-best fit.

4

### Step 4. Update the trigger module

1. Move the clock icon from the legacy module to the new module.

2. Unlink the legacy module and subsequent module, and link the new module with the desired module.

3. Set the values of the new module. Keep in mind that some fields may be different.

![Document image](https://archbee-image-uploads.s3.amazonaws.com/Q31995ot4OZzZRNwsMBrJ-VSuLDfoXvWIfT94xMOVaV-20250416-122354.gif "Document image")

﻿

5

### Step 5. Update other modules

1. Update the next legacy module, following the same process outlined in Step 3 (Access and Select New Modules).

2. Connect the new module to (after) its legacy module.

3. Set the values of the new module. If any items are missing in the mapping panel, see our [Mapping](/mapping)﻿ documentation.

4. Repeat this process for any remaining legacy modules.

![Document image](https://archbee-image-uploads.s3.amazonaws.com/Q31995ot4OZzZRNwsMBrJ-YAob4OygEiJCLGbjVim7z-20250416-115639.gif "Document image")

﻿

6

### Step 6. Clean up and finalize

1. Remove all legacy modules from your new scenario﻿ with right-click and **Delete module**.

2. Click **Save** to save your scenario﻿.

![Document image](https://archbee-image-uploads.s3.amazonaws.com/Q31995ot4OZzZRNwsMBrJ-3GBsh4kJcJ07oUk9lu-ZG-20250416-121538.gif "Document image")

﻿

You have now updated your legacy modules to their newest versions. This process ensures your scenarios﻿ continue to run properly as external services evolve their APIs.

Updated 26 Jan 2026

Did this page help you?

Yes

No

[PREVIOUS

Module settings](/module-settings "Module settings")[NEXT

Webhooks](/webhooks "Webhooks")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

# Scenario execution flow - Help Center

Source: https://help.make.com/scenario-execution-flow
Lastmod: 2026-02-02T15:25:58.075Z
Description: Learn how scenarios execute, how data flows through modules, and how to interpret processed bundles
Key concepts

Scenarios & connections

# Scenario execution flow

4 min

In this section, you will learn how a scenario﻿ runs and how data flows through a scenario﻿. It will also show you where you can find information about your processed data and how to read it.

Once a scenario﻿ is [set-up](4InplgaXo0COpID3pX2YS#)﻿ correctly and [activated](/active-and-inactive-scenarios#)﻿, it will run according to its defined [schedule](SCPFttWgFaPf077uJO1jh#)﻿.

The scenario﻿ begins with the first [module](PDoPIBceCKCboMPpKplmY#)﻿ responding to an event it has been set to watch for. If it returns any bundles (data), the bundles are then passed on to the next module and the scenario﻿ continues. If it does not return any bundles, the scenario does not continue and ends after the first module. In the case where there are returned bundles after the first module, the bundles will then go through each proceeding module one-by-one. If the bundles are processed correctly throughout all of the modules, the scenario﻿ is then marked as **Successful**.

## Example: Connect Facebook to Dropbox

The example below shows how Make connects three modules in a scenario﻿. It explains how Make downloads photos from [Facebook](https://apps.make.com/facebook#)﻿, converts them to another format, and sends them to a selected [Dropbox](https://apps.make.com/dropbox)﻿ folder.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/J1Dss_nkutuGRkBR3esBk_uuid-5b218535-8781-6514-efab-1e6566734d2e.png?format=webp "Document image")

﻿

When the scenario﻿ begins, the first step is to watch for bundles. In this case, it is to watch for photos on Facebook. If it does not return a bundle (a photo), the processing of the scenario﻿ does not continue and ends after the first module.

If a bundle is returned, the bundle then passes through the rest of the scenario﻿. The bundle is first received through the **Watch photos** module, then it goes through the **Convert a format** module for the Image app, and then goes through the **Upload a file** module for Dropbox to reach its final destination, the Dropbox folder.

It is also important to note that if Facebook returns multiple bundles, for example two bundles, the processing of the latter bundle will not start until the first bundle is converted and uploaded to Dropbox.

## Information about processed bundles

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/X_XinyWduU4uiywMJsXmj_uuid-e45f0900-2bca-1dec-f513-85e2c0f187a0.png?format=webp "Document image")

﻿

For each module, the bundle goes through a 4 step process before going on to the next module or reaching its final destination. The 4 step process is **Initalization, Operation, Commit/Rollback, and Finalization**. This is called transaction processing and it helps to explain how data was processed in a module.

Once a scenario﻿ run is complete, each module displays an icon showing the number of operations performed. Clicking this icon will display the detailed information about the processed bundles, in the format described above. You can see which [modules settings](/module-settings#)﻿ were used and which bundles were returned by which module.

The picture above illustrates the processing of the last module used in the scenario﻿ above, the Dropbox module, **Upload a file**.

The module received the following input information:

1. Converted image

2. Selected folder where the image shall be uploaded to

3. Original name of the Facebook image

After processing, the module returned this output information:

* Image ID assigned by Dropbox

* Full path where in Dropbox Make uploaded the file

The above information is captured for each bundle separately, as marked by the drop down boxes Operation 1 and Operation 2 in the image.

## Stop a scenario﻿ run

You can stop a scenario run by clicking the **Stop** button.

The **Stop** button replaces the **Run once** button at the bottom of the Scenario Builder while the scenario is running.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/VJzsnUOiqFFk0g5EhgpFe-20260202-152128.png?format=webp "Document image")

﻿

When you press the **Stop** button, the currently running module will finish processing all of the bundles and then the scenario will stop. It is not possible to stop the module before it processes all of the bundles.

Your scenario has five modules. During the processing of the third module, you click the **Stop**  button. The third module will finish processing all the bundles then the scenario will stop. The fourth and fifth modules will not run.

## Errors while executing a scenario﻿

An error may occur during the scenario﻿ run. For example, if you delete the Dropbox folder that you have set as the target folder in the module setting, the scenario﻿ will terminate with an error message. For more information on this and to learn how to handle errors, please see the [error handling](/error-handling)﻿ help guide.

Updated 02 Feb 2026

Did this page help you?

Yes

No

[PREVIOUS

Active and inactive scenarios](/active-and-inactive-scenarios "Active and inactive scenarios")[NEXT

Scenario history](/scenario-history "Scenario history")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

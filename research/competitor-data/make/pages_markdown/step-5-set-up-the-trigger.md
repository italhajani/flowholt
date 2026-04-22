# Step 5. Set up the trigger - Help Center

Source: https://help.make.com/step-5-set-up-the-trigger
Lastmod: 2025-11-03T19:51:10.394Z
Description: Help Center
Get started

Create your first scenario

# Step 5. Set up the trigger

2 min

At this step, you'll set up your Google Sheets trigger to watch for new rows in your spreadsheet. You'll specify which spreadsheet to monitor and how many rows to process at once.

To set up your Google Sheets trigger:

1

Select your **Drive** from the dropdown menu. You can leave the **Search Method** field at its default setting **Search by path**.

2

In the **Spreadsheet ID** field, use the **Click here to choose file** button to select the **Prospects** spreadsheet you created in Step 2.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/uHhr_9q7z-DNKHl_gcxDu-20251103-194843.png?format=webp "Document image")

﻿

3

Select **Sheet1** in the **Sheet Name** field. This specifies which sheet contains the rows you want to monitor.

4

For **Table contains headers**, select **Yes**. This tells Make that the first row contains column names, which you'll use for mapping data later.

5

For **Row with headers**, leave the default **A1:Z1** value. This indicates where your column headers are located.

6

Set the **Limit** to 20. This tells the module to process up to 20 new rows in a single run. You can adjust this based on your needs.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/i3Li8FwszXi25LmRFWpOm-20251103-194932.png?format=webp "Document image")

﻿

7

Click **Save**. This saves your module settings, but not the entire scenario.

Remember to click the **Save** icon in the Scenario Builder toolbar to save your entire scenario. It's good practice to save your scenario regularly as you build it.

8

In the **Choose where to start** window that appears, select **All.**

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/imj7PeynpiEGhqCmGE0x7-20251103-195007.png?format=webp "Document image")

﻿

If you accidentally close that window, right-click the Google Sheets module and select **Choose where to start** from the menu.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/bgRy7Hv1nFIRdljbZVyry-20250929-152659.png "Document image")

﻿

The **Choose where to start** option determines which rows the module will process. By selecting **All**, the module will first process the existing rows in the sheet, and then any new rows added afterwards. Also, the module will track which rows it has already processed and only fetch the ones it hasn't processed yet.

Your Google Sheets trigger is now configured to detect new rows in your **Prospects** spreadsheet. Next, you'll test the module to ensure it works properly.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/fEtmteIiifjw9IJ0fI3nK-20251103-195055.png?format=webp "Document image")

﻿

**Understanding trigger modules**

Trigger modules like the one you've just configured can only be used at the beginning of scenarios. They process data when specific events occur in connected applications. There are two main types:

* **Instant triggers** start your scenario immediately when an event occurs in the connected application (marked with an "instant" tag in Make). These are ideal when you need real-time responses.

* **Polling triggers** (like your Google Sheets module) check for new data at regular intervals when your scenario runs. The module remembers what it has already processed and only retrieves new items each time.

The **Google Sheets > Watch New Rows** module you're using is a polling trigger, which will check for new rows each time your scenario runs.

﻿

Updated 04 Nov 2025

Did this page help you?

Yes

No

[PREVIOUS

Step 4. Create a connection](/step-4-create-a-connection "Step 4. Create a connection")[NEXT

Step 6. Test the module](/step-6-test-the-module "Step 6. Test the module")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

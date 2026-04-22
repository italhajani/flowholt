# Step 8. Map data - Help Center

Source: https://help.make.com/step-8-map-data
Lastmod: 2025-11-03T19:58:54.282Z
Description: Help Center
Get started

Create your first scenario

# Step 8. Map data

1 min

Mapping is how you send data between modules. It means taking information (output) from one module and telling Make how you want to use it in the next module (input).

In this scenario, you're taking prospect information from Google Sheets (output) and using it in specific spots in your Slack message (input).

To configure your Slack message with data from Google Sheets:

1

In the **Enter a channel ID or name** field, choose **Select from the list**.

2

In the **Channel type** field, select **Public** **channel**.

3

In the **Public channel** field, select **sales-team**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/0_Ll9onFOPJI-iDRVL6Vp-20251103-195616.png?format=webp "Document image")

﻿

4

Click the **Text** field. A mapping panel will appear showing data from your **Google Sheets > Watch New Rows** module.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/s2hJ3qaBLroe7SpA_uB0A-20251103-195650.png?format=webp "Document image")

﻿

5

Create your notification message. You can copy and paste the following template into the **Text** field or create your own message.

New prospect added!
Name:
Email:
Country:
Phone:
Details:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/HBQgIXM4_oM5I2pMtp3zj-20251103-195725.png?format=webp "Document image")

﻿

6

Drag and drop the values from the Google Sheets module to the **Text** field, or simply click on the values to place them into your message.

If you map several values into the same field (like First Name and Last Name in this example), separate them with spaces to get two distinct values in the output.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/llZsG95dbkpJ9cJGqb8lY-20251103-195754.png?format=webp "Document image")

﻿

This is mapping data: taking prospect information from Google Sheets and placing it into specific spots in your Slack message.

7

Click **Save** to save your module settings.

8

Click the **Save** icon on the Scenario Builder toolbar to save your entire scenario.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/MZWOFxuGxYAlKsYEcHtGM-20251103-195829.png?format=webp "Document image")

﻿

Your scenario now has two connected modules:

* **Google Sheets > Watch New Rows** to detect new prospects

* **Slack > Send a Message** to send notifications to your team

In the next step, you'll test your scenario to make sure both modules work together properly.

Updated 04 Nov 2025

Did this page help you?

Yes

No

[PREVIOUS

Step 7. Add another module](/P7l2-step-7-add-another-app "Step 7. Add another module")[NEXT

Step 9. Test your scenario](/step-9-test-your-scenario "Step 9. Test your scenario")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

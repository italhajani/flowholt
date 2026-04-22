# Step 9. Test your scenario - Help Center

Source: https://help.make.com/step-9-test-your-scenario
Lastmod: 2025-11-03T20:01:46.514Z
Description: Help Center
Get started

Create your first scenario

# Step 9. Test your scenario

1 min

To make sure that both modules work together, you need to test your scenario.

1

Right-click the Google Sheets module and select **Choose where to start**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/kPA5Dko4fA2aTJ5JcSnSg-20251103-195921.png?format=webp "Document image")

﻿

2

Select **All** and click **Save.**

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/8AfzmHUJiJE7joH5PiB7J-20251103-195945.png?format=webp "Document image")

﻿

3

In the Scenario Builder toolbar, click the **Run once** button.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/oE82Ng76I6MKDb__bY09Q-20251103-200006.png?format=webp "Document image")

﻿

4

Check the output bubbles above each module to see the results. The numbers shown in the bubbles indicate how many operations were processed/credits used.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/YAmMhOt61fj9MiYZUzvso-20251103-200037.png?format=webp "Document image")

﻿

5

Click the output bubble above the Google Sheets module to see all rows processed in the Output section. Since we selected **All** in step 2, it processed all rows in your Google sheet (up to the limit of 20 you set earlier).

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/aj0c3lyR4aqzl9wDZe-Nw-20251103-200056.png?format=webp "Document image")

﻿

Click the output bubble above the Slack module to see:

* The **Input** information it received from Google Sheets.

* The **Output** information about the Slack message it sent.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/RO1xaCsIDJLUEWOHuEjei-20251103-200132.png?format=webp "Document image")

﻿

6

Go to your Slack channel and check if the notification appeared correctly.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/sJV9yXJhAvx0rKDOghr61-20250930-143946.png?format=webp "Document image")

﻿

7

Compare the data in your Slack message with your **Prospects** spreadsheet to ensure all information was transferred correctly.

![Document image](https://images.archbee.com/yjwhINLS3fc-NXg38fV_d-7a0wwkNHMvLJabbox7xyr-20250323-160801.png?format=webp "Document image")

﻿

**Understanding bundles**

A bundle is a collection of data delivered together. It can contain a single piece of information (like an email address) or multiple pieces of data (like spreadsheet rows). When you click on the output bubbles, you'll see the bundles that were processed:

* **Input bundle**: Contains the information you entered into the module and data you mapped from previous modules.

* **Output bundle**: Contains the results of the actions taken in the application and any data generated that can be mapped to the next module.

* **Action** modules (like your Slack module in this example) use as many credits as runs needed to process all bundles. If it processes 1 input bundle, it consumes 1 credit.

* **Trigger** modules (like your Google Sheets module) only use 1 credit, even if they output multiple bundles.

For example, if your Google Sheets document has 3 rows and you selected **All**, the Google Sheets module will generate 3 output bundles but only use 1 credit because it's a trigger module. These become input bundles for the Slack module, which processes them and sends 3 messages. The Slack module will use 3 credits because it processes 3 input bundles.

﻿

Updated 04 Nov 2025

Did this page help you?

Yes

No

[PREVIOUS

Step 8. Map data](/step-8-map-data "Step 8. Map data")[NEXT

Step 10. Schedule your scenario](/step-10-schedule-your-scenario "Step 10. Schedule your scenario")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

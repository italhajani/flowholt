# Step 5. Test your scenario - Help Center

Source: https://help.make.com/step-5-test-your-scenario
Lastmod: 2025-11-04T09:12:29.770Z
Description: Help Center
Get started

Expand your scenario

# Step 5. Test your scenario

1 min

Now that you've set up the filter, it's time to test your scenario with different types of prospects.

To test your scenario:

1

Go to your **Prospects** spreadsheet and add two new rows:

* One with country = USA

* Another one with a different country

![Document image](https://images.archbee.com/yjwhINLS3fc-NXg38fV_d-aI9qEPUSP0iZhNLnvSgJA-20250331-154009.png?format=webp "Document image")

﻿

2

In the Scenario Builder toolbar, click the **Run once** button.

By default, the **Google Sheets > Watch New Rows** module will only find the new rows added since you last ran your scenario.

If you want to process all rows again for testing, you can reset it: right-click the Google Sheets module and select **Choose where to start**. Select **All** and click **Save**. The next time you run the scenario, it will include all the rows again.

3

Check the operation bubbles above each module to see the results. The numbers shown in the bubbles indicate how many operations were used.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/WQRGPoI1NVIaxaYDx74LB-20251104-090259.png?format=webp "Document image")

﻿

4

Click on the output bubbles to view the details.

The **Google Sheets > Watch New Rows** module should show both prospects:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/omLAlzi9FJp2LKDGpN0MA-20251104-090323.png?format=webp "Document image")

﻿

The **Slack > Send a Message** module should receive and process both prospects:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/UTbik44FO9_ci3AtiwlX5-20251104-090344.png?format=webp "Document image")

﻿

The **filter** should only let the USA prospect through:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/YRueP7YZkP1-wjO3-WfeO-20251104-090406.png?format=webp "Document image")

﻿

The **Apple iOS > Send a push notification** module should only process the USA prospect:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/-DeMlqGdwOSO4lttdYxif-20251104-090437.png?format=webp "Document image")

﻿

5

Check your Slack channel to confirm both notifications arrived.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/nBY4aXMCQWuOccfZvfe-H-20250930-142441.png?format=webp "Document image")

﻿

6

Check your mobile device to confirm you only received a notification for the USA prospect.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/qQ0ojBT8OzpXLGy9jvi8h-20251104-091158.png "Document image")

﻿

This test shows that the scenario works properly:

* All prospects are sent as Slack notifications

* Only US prospects trigger mobile notifications

This targeted approach ensures the Sales Manager gets alerts only for US market prospects, while the Slack channel receives updates about all prospects.

However, if many US prospects are added at once, the Sales Manager would receive multiple separate notifications. In the next step, you'll add an aggregator to combine multiple US prospects into a single notification.

Updated 04 Nov 2025

Did this page help you?

Yes

No

[PREVIOUS

Step 4. Add a filter](/step-4-add-a-filter "Step 4. Add a filter")[NEXT

Step 6. Add an aggregator](/step-6-add-an-aggregator "Step 6. Add an aggregator")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

# Step 6. Add an aggregator - Help Center

Source: https://help.make.com/step-6-add-an-aggregator
Lastmod: 2025-11-04T09:48:32.906Z
Description: Help Center
Get started

Expand your scenario

# Step 6. Add an aggregator

2 min

Imagine your marketing team adds multiple US prospects in a single day, your Sales Manager could quickly become overwhelmed with a flood of individual mobile notifications. By adding an aggregator to your scenario, you can combine all those prospects into a single notification - making the information more manageable while still ensuring timely alerts.

To add an aggregator:

1

Right-click the dots between the filter and the **Apple iOS** module and select **Add a module**. This will open a window with the list of apps and modules that you can add to your scenario.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/p8x13aN6r-ktd6I2WtuxS-20251104-093929.png?format=webp "Document image")

﻿

2

Search for **Tools** in the search bar and then choose **Text** **Aggregator** from the available modules.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/gftNCjUWIGWPbE1SrvNj1-20251104-093952.png?format=webp "Document image")

﻿

Alternatively, you can enter "Text aggregator" in the search bar to find it faster.

3

In the **Tools** settings, select **Google Sheets - Watch New Rows (1)** from the dropdown list under the **Source Module** field.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/L5D7m4yS9sAJ8VOhESGnQ-20251104-094032.png?format=webp "Document image")

﻿

4

Switch on the **Advanced settings** toggle at the bottom of the window to open additional options.

5

In the **Row separator** field, select **New row** from the dropdown.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/GoRRaM61Ra8yc1v5lb-gf-20251104-094053.png?format=webp "Document image")

﻿

6

In the **Text** field, drag and drop or click First Name and Last Name values from the Google Sheets module. Separate the values with a space to get two distinct values in the output.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/vpKxsd2XvagI0BFiRhcSW-20251104-094114.png?format=webp "Document image")

﻿

7

Click **Save** to save the aggregator settings.

8

Next, you need to update the **Apple iOS > Send a push notification** module to use the aggregated text. Click the Apple iOS module to open its settings.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/g0VIRk7JMl7zcdbnXfHri-20251104-094250.png?format=webp "Document image")

﻿

9

In the **Body** field, remove any existing mapped values, then drag and drop or click the text value from the **Text** **aggregator** module.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/hABsbv6ualJ_U2Ivouln0-20251104-094319.png?format=webp "Document image")

﻿

10

Click **Save** to apply the changes and make sure to save your entire scenario by clicking the **Save** icon in the Scenario Builder toolbar.

Your scenario now has an aggregator that combines new US prospects that arrive into a single notification. In the next step, you'll test this entire scenario.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/z-ZsDTvDjEcAcSkQBc3J2-20251104-094825.png?format=webp "Document image")

﻿

**Understanding aggregators**

Aggregators combine multiple bundles of data into a single bundle. Without an aggregator, each prospect would trigger a separate notification. With an aggregator:

* Multiple prospects are combined into one notification

* The Sales Manager receives one comprehensive alert instead of many

* The scenario consumes fewer credits

Make offers different types of aggregators:

* **Text aggregator**: Combines text with separators (the one we used in this scenario)

* **Numeric aggregator**: Performs calculations (sum, average, count)

* **Array aggregator**: Groups data into structured arrays

In our scenario, the text aggregator helps prevent notification overload by sending one organized list of all US prospects.

﻿

Updated 04 Nov 2025

Did this page help you?

Yes

No

[PREVIOUS

Step 5. Test your scenario](/step-5-test-your-scenario "Step 5. Test your scenario")[NEXT

Step 7. Test the final scenario](/step-7-test-the-final-scenario "Step 7. Test the final scenario")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

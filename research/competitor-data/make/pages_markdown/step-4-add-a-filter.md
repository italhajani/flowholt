# Step 4. Add a filter - Help Center

Source: https://help.make.com/step-4-add-a-filter
Lastmod: 2025-11-04T08:29:53.108Z
Description: Help Center
Get started

Expand your scenario

# Step 4. Add a filter

2 min

Filters allow you to control when a module runs, or what data is passed to a module based on specific conditions. In this case, you want to send mobile notifications only for prospects from the USA.

To add a filter:

1

Click on the wrench icon on the dots between the router and the Apple iOS module, and select **Set up a filter**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/ig412Y_djavMelliawKvV-20251104-082720.png?format=webp "Document image")

﻿

Alternatively, you can right-click on the dots between modules and select **Set up a filter** or left-click directly on the dots between modules, which will open the **Set up a filter** window.

2

In the **Label** field, enter "US prospects only" as a label for the filter.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/7mechOXLn4oBGmY01oi4D-20251104-082752.png?format=webp "Document image")

﻿

The label of the filter is important because it appears in the Scenario Builder, making it easier to understand the flow of data through your scenario.

3

In the **Condition** field, drag and drop or click on the value Country from Google Sheets.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/rbbsCYxtGeniL7mD3bRXE-20251104-082814.png?format=webp "Document image")

﻿

4

Keep the **Text Operators** dropdown as **Equal to** and enter "USA" in the field below.

5

Click **Save.**

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/qsSD9Uhznu5D60M_qnIaj-20251104-082922.png?format=webp "Document image")

﻿

Remember to click the **Save** icon in the Scenario Builder toolbar to save your entire scenario.

Now mobile notifications will only be sent when a prospect's country is "USA". The sales team will still receive all Slack notifications through the other route.

**Understanding filters**

Filters are tools that allow specific data to be passed or restricted within the flow of your scenario. Think of them as gatekeepers that only let through data that meets your criteria.

Filters are useful to:

* Send data down specific paths only when it meets your conditions.

* Check if data matches specific criteria (equals, contains, greater than, etc.).

* Build complex rules by combining multiple filters.

* Save operations because they stop the flow when your conditions aren't met.

Your scenario is now set up to send targeted notifications.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/_4K8SMmx-uyU289cG3wfR-20251104-082943.png?format=webp "Document image")

﻿

Next, you'll test it to make sure it works as expected with different types of prospects.

Updated 04 Nov 2025

Did this page help you?

Yes

No

[PREVIOUS

Step 3. Set up another module](/step-3-set-up-another-module "Step 3. Set up another module")[NEXT

Step 5. Test your scenario](/step-5-test-your-scenario "Step 5. Test your scenario")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

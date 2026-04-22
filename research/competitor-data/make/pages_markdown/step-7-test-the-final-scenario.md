# Step 7. Test the final scenario - Help Center

Source: https://help.make.com/step-7-test-the-final-scenario
Lastmod: 2025-11-04T10:23:30.602Z
Description: Help Center
Get started

Expand your scenario

# Step 7. Test the final scenario

1 min

Now that you've added an aggregator to your scenario﻿, it's time to test the complete scenario﻿ to make sure everything works as expected.

1

Go to your **Prospects** spreadsheet and add three or more new rows where:

* At least two prospects have the **USA** in the **Country** column

* One prospect has a different country in the **Country** column

![Document image](https://images.archbee.com/yjwhINLS3fc-NXg38fV_d-IPHTPMYELf3GB2h2cfNCM-20250401-120300.png?format=webp "Document image")

﻿

2

In the Scenario﻿ Builder toolbar, click the **Run once** button.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/At9VWVQhYuZRNhysX6UzL-20251104-094927.png?format=webp "Document image")

﻿

By default, the **Google Sheets > Watch New Rows** module will only find the new rows added since you last ran your scenario. To process all rows again:

* Right-click the Google Sheets module

* Select **Choose where to start**

* Choose **All** and click **Save**

3

Check the output bubbles above each module to see the results. The numbers shown in the bubbles indicate how many operations were completed.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/rGVeDmKiHLZXUWD98mH7D-20251104-101730.png?format=webp "Document image")

﻿

4

Click on the bubbles to view the details.

The **Google Sheets > Watch New Rows** module should show all new prospects you added, depending on the limit you set:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/q1EUZn_ydpEsY_-qdeE2P-20251104-101751.png?format=webp "Document image")

﻿

The **Slack > Send a Message** module should receive and process all prospects:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/yzIX6TeOM883JyIsqOlsL-20251104-101811.png?format=webp "Document image")

﻿

The **filter** should only let the USA prospects through:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/BonXqN3PZUO3Ei0EINlPS-20251104-101832.png?format=webp "Document image")

﻿

The **Text aggregator** should combine the USA prospects into a single bundle:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/lvheJzGsse7YY2r990nKs-20251104-101853.png?format=webp "Document image")

﻿

The **Apple iOS > Send a push notification** module should only process this single aggregated bundle:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/TvW5k9DY5zGBxNuMcqEUk-20251104-102205.png?format=webp "Document image")

﻿

5

Check your Slack channel to confirm all notifications arrived.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/8lTWsr8k7Bk2tPC6lmCaC-20251001-081818.png?format=webp "Document image")

﻿

6

Check your mobile device to confirm you received only one notification that contains all the US prospects.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/QuQhsOJ9BtshSqvnoEYgD-20251104-102234.png "Document image")

﻿

You've now created a scenario﻿ that:

* Monitors your Google Sheets document for new prospects

* Sends all prospects to a Slack channel

* Sends only US-based prospects to the Sales Manager's mobile device

* Combines multiple US prospects into a single mobile notification

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/qoGQ1wQbrDkSCdGaas85k-20251104-102322.png?format=webp "Document image")

﻿

**What's next?**

Now that you've learned how to use routers to create multiple paths, filters to process data conditionally, and aggregators to combine related information, you can continue expanding your scenario by:

* Adding more filters for other countries or criteria

* Integrating additional apps like email or CRM systems

* Exploring other aggregator types for different data formats

* Learning about error handlers to make your scenarios more robust

To advance your Make knowledge, explore our free online courses at [Make Academy](https://academy.make.com/ "Make Academy").

﻿

Updated 04 Nov 2025

Did this page help you?

Yes

No

[PREVIOUS

Step 6. Add an aggregator](/step-6-add-an-aggregator "Step 6. Add an aggregator")[NEXT

Key concepts](/key-concepts "Key concepts")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

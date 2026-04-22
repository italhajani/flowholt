# Replace connections across multiple modules - Help Center

Source: https://help.make.com/replace-connections-across-multiple-modules
Lastmod: 2026-04-08T14:40:15.546Z
Description: Replace connections in multiple modules of the same app across one or many scenarios
Explore more

Connections

# Replace connections across multiple modules

9 min

In Make﻿, you may occasionally need to replace a connection that's used in multiple modules of the same app across one or many scenarios. This might be necessary when:

* You've switched accounts.

* The authentication method has been changed.

* You need to replace the connection instead of [editing the credentials for an existing one](https://help.make.com/connect-an-application#tN2pJ "editing the credentials for an existing one").

Instead of replacing each connection manually, you can choose one of the two methods, depending on where the connection is used:

* ﻿[Replace connections within one scenario](/replace-connections-across-multiple-modules#replace-the-connection-within-one-scenario)﻿

* ﻿[Replace connections within multiple scenarios](/replace-connections-across-multiple-modules#replace-connections-within-multiple-scenarios)﻿﻿

## Replace the connection within one scenario

Use this method when multiple modules in the same scenario use the connection you want to replace.

You'll need the **Make DevTool** installed. See the installation instructions [here](https://help.make.com/make-devtool#_pJCx "here").

1

Open the scenario in Make﻿ where you want to change the connection.

2

Click any module that will use the new connection, then click **Add** next to the **Connection** field.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/voWL0wH_SMMoMK2gVsp-j-20251009-143708.png "Document image")

﻿

3

Complete the required steps to create and save your new connection.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/lK99aHBo0sO-UHu3nY7Mj-20251009-143737.png "Document image")

﻿

4

Open **Chrome Developer Tools**:

* **Windows**: **Control+Shift+I** or **F12**

* **Mac**: **Fn+F12**

Use a horizontal dock for better visibility. Click the three dots in the toolbar's right corner to configure this.

5

Switch to the **Make** tab in the Developer Tools.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/0Y_9hRD5YYolR76YcksLl-20251009-143806.png?format=webp "Document image")

﻿

6

In the left sidebar, click **Tools**, then select **Swap Connection**.

![Document image](https://images.archbee.com/PL8X94efBsjvhfQV3wyyj-guplp8zJYXUvpq09uctui-20250801-073631.png?format=webp "Document image")

﻿

7

In the **Source** **Module** field, select the module where you’ve created the new connection. The number in brackets helps you locate it in the Scenario Builder.

In the **Target Module** field, add the modules where you want to change the connection. Leave it empty to update all the modules of the same app in the scenario.

![Document image](https://app.archbee.com/api/optimize/PL8X94efBsjvhfQV3wyyj-h8rrhQZAB12p_E15b4XUN-20250723-125031.png "Document image")

﻿

8

Click **Run**.

9

Wait for the “Run completed” message, and click **Done**.

![Document image](https://app.archbee.com/api/optimize/PL8X94efBsjvhfQV3wyyj-r4N8kyePCquqBYG8Vgn5o-20250723-125129.png "Document image")

﻿

All modules from the app in this scenario now use the new connection.

## Replace connections within multiple scenarios

If you need to update the connection used in multiple scenarios, using Make﻿ DevTool may be time-consuming. Instead, you can use [Make app](https://apps.make.com/make "Make app") modules to replace connections across multiple scenarios. For that, you need to:

* ﻿[Obtain the IDs of the old connection to be replaced and the new one](/replace-connections-across-multiple-modules#obtain-the-ids-of-the-old-and-new-connections)﻿.

* ﻿[Create a scenario to change the connections](/replace-connections-across-multiple-modules#create-a-scenario-to-replace-connections)﻿.

The Make﻿ app is only available on [paid plans](https://www.make.com/en/pricing "paid plans").

### Obtain the IDs of the old and new connections

To change the connection across multiple scenarios, you'll first need to obtain the IDs of both the old and new connections.

Before you begin, make sure you’ve already created the new connection in at least one scenario. If not, follow [these steps](https://help.make.com/connect-an-application#QzWef "these steps") to create a new connection, then return here to continue.

1

Log in to your Make﻿ account and click **+ Create new scenario.**

2

Add the **Make app** and select the **List connections in a team** module.

3

Configure the module settings:

* In the **Connection** field, choose your Make﻿ connection. If you use an API connection, make sure your API key has the **organizations:read** and **connections:read** scopes.

* In the **Team ID** field, click **Search** **teams**, and select the required team.

* Optional: In the **Type** field, you can enter the app name, if you know the exact one:

* The app name is typically the name of the service (e.g., shopify, notion, facebook).

* If the app offers more than one connection type, the name may have a number appended (e.g., slack2, airtable3).

* For apps with compound names, dashes are used (e.g., google-forms, google-sheets).

* You can also check the exact app name using the Make DevTool's **Highlight App** feature. See the instructions [here](https://help.make.com/make-devtool#Ua4B9 "here").

* Optional: In the **Limit** field, you can specify how many connections you want to get in the output.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/IdqApK1DB8L00Y0YehtgB-20251009-150840.png "Document image")

﻿

4

Click **Save**.

5

Click the **Run once** button in the Scenario﻿ Builder toolbar.

6

Click the operation bubble above the module.

7

In the **Output**, expand **Body** > **Connections**.

In the output, you will see:

* Your new and old connections' respective **IDs**.

* Your new and old connections' **names**. To identify the old and new connection names, compare the **Name** in the output with the name used when creating the connection.

* Under **Account name**, the type of connection you searched for.

8

Copy the IDs for the next steps.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/hFXdZTdRRtOUlbDd-lCNh-20251009-150904.png "Document image")

﻿

### Create a scenario to replace connections

You can use our [template](https://www.make.com/en/hq/template/16232-migration-of-connection-in-scenarios "template") with a pre-set scenario to replace the connection, or create a scenario yourself.

In the latter case, you'll need to complete the steps described below to find the relevant scenarios, get their blueprints, and update them using the Make app.

1

In your Make﻿ account, click **+ Create new scenario.**

2

Add the **Tools > Set multiple variables** module, and set two variables obtained from the previous step:

* Item 1: old\_connection\_id (Variable name) and its ID (Variable value)

* Item 2: new\_connection\_id (Variable name) and its ID (Variable value)

Click **Save**.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/83uv365BKqg_OrQlC5xuj-20251009-150932.png "Document image")

﻿

3

To find all the scenarios that use the old connection you want to replace, add the **Make** > **Search scenarios** module.

4

Configure the module settings:

* In the **Connection** field, choose your Make﻿ connection.

* Select your **Organization** and **Team**.

* Select the **Folder** if the required scenarios are stored in a particular folder.

* Use **Filters** to refine the search by default and/or custom properties. For example, if you need to search for scenarios created by you.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/dVFNG4JF-zvb5JAmxKtlr-20251009-151003.png "Document image")

﻿

* Choose which scenarios to include in the search: active, inactive, or all.

* In the **Limit** field, specify how many scenarios to return in the output.

Click **Save**.

5

Optional: Add a filter after this module to further narrow down the scenarios that need to be edited. This may be relevant if the **Search** **scenarios** module doesn’t allow filtering by the parameters you need.

6

To retrieve the scenario blueprint you'll work with, add the **Make** **>** **Get a scenario blueprint** module.

7

Configure the module settings:

* In the **Connection** field, choose your Make connection.

* In the **Scenario ID** field, map the Scenario ID from the **Search scenarios** module.

* Click **Advanced settings**,andselect **JSON string** in the **Return a blueprint** field.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/9QzKgmduomkA0ev8WdU5Z-20251009-151029.png "Document image")

﻿

Click **Save**.

8

Optional: Add a filter for the connection ID to ensure that only scenarios containing the old connection are updated.

* Enter toString(map Blueprint from the **Get a scenario blueprint** module) to the **Condition** field.

* Choose **Text operator: Contains**.

* Enter ("\_\_IMTCONN\_\_": map the old connection variable from the **Set a variable** module)

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/neH-L6O-qPrLkMdsGZMBO-20251009-151052.png "Document image")

﻿

9

Optional: You can temporarily add a **Tools > Text aggregator** module after the **Make >** **Get a scenario blueprint** module. This will list all scenarios that are about to be updated, helping you confirm that the connections will be replaced in the correct scenarios. Once you've verified that, you can either disconnect or delete the **Text aggregator** module.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/dFjoeDBfahER_68BlW2VN-20251009-151526.png?format=webp "Document image")

﻿

10

To update the scenarios that use the old connection with a new connection, add the **Make** > **Update a scenario** module.

11

Configure the module settings:

* In the **Connection** field, choose your Make﻿ connection.

* In the **Scenario ID** field, map the **Scenario ID** from the **Search scenarios** module.

* In the **Blueprint** field, add a **replace** function, map the **Blueprint**, and add the old and new connection IDs in the following formats: "\_\_IMTCONN\_\_": connection ID.

* Leave the **Scenario name** and **Folder ID** fields blank.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/h2u30zTfE56iyt5UQ1RJL-20251009-151339.png "Document image")

﻿

Click **Save**.

12

Click the **Run once** button in the Scenario Builder toolbar.

All the old connections in the scenarios you selected will be updated to new ones.

## How to confirm the connections are replaced correctly

To verify that the right connections have been replaced in your scenarios, follow these steps.

1

After running the full scenario, add a **Tools > Text aggregator** module after the **Make > Update a scenario** module. Select **Make > Update a scenario** as a source module, and map Name and Scenario ID from that module.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/bMjMaQH4A1wQiNhq-rQjd-20251009-151719.png "Document image")

﻿

Run the scenario again. If the connection was successfully replaced, this second run should return 0 results (i.e., there’s nothing to replace).

2

After running the full scenario, you can also set a filter to find scenarios that use the new connection.

* Enter toString(map Blueprint from the **Get a scenario blueprint** module) to the **Condition** field.

* Choose **Text operator: Contains**.

* Enter ("\_\_IMTCONN\_\_": map the new connection variable from the **Set a variable** module)

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/yHJHD4bvI-XA8yOT4qihr-20251009-151803.png "Document image")

﻿

If you run the scenario again, it should return all scenarios that have the replaced connection.

## Troubleshooting

Here you can find solutions for the most common issues when replacing the connection across multiple modules in Make﻿.

### Don’t see any or certain scenarios from the **Search scenario** module

* Make sure you’ve selected the correct **Organization**, **Team,** and **Folder** (if applicable).

* Check whether the **filters** you’ve set match the properties of the scenarios you’re looking for.

* Review the **Limit** field to ensure you’re not cutting off results.

* Ensure you are filtering the correct **Connection ID**.

### The Update a scenario module fails or doesn’t update anything

* Confirm that the **Blueprint** field is filled in correctly, including the proper replace () syntax.

* Double-check that the blueprint actually contains the old connection ID you’re trying to replace.

* Verify that you are editing the correct app connection.

### What happens if you update scenarios incorrectly

An incorrect update can break the connections in your scenarios. It’s best to test your setup on one or two scenarios first before applying changes in bulk.

Additionally, you can use the **Tools > Text aggregator** module after the **Make > Get a scenario blueprint** module, as explained above. This will display a list of all scenarios that are about to be updated, helping you confirm that the connections will be replaced in the correct scenarios.

You can also [restore a previous scenario version](https://help.make.com/restore-a-previous-scenario-version "restore a previous scenario version") if something goes wrong.

﻿

﻿

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

Connect to Google services using a custom OAuth client](/connect-to-google-services-using-a-custom-oauth-client "Connect to Google services using a custom OAuth client")[NEXT

Credential requests](/credential-requests "Credential requests")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

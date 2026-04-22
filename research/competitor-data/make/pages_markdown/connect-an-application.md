# Connect an application - Help Center

Source: https://help.make.com/connect-an-application
Lastmod: 2026-03-25T09:43:41.689Z
Description: Learn how to connect third-party services to Make to securely access and control data in your scenarios
Key concepts

Scenarios & connections

# Connect an application

16 min

To allow your scenario﻿ to get and receive data from third-party services, you need to create a connection between Make and those services.

Connections allow your scenarios to perform actions like updating records in Airtable, sending emails in Gmail, adding rows in Google Sheets, and many more, from directly within your automated workflow in Make.

Since third-party services use different technologies and authentication methods, the steps to create a connection in Make can vary.

For some apps, you will only need to log in to the third-party service and grant Make permission to access your profile and data. Other apps may require you to enter specific credentials such as username and password, API Key, Client ID, and Client secret, or other values.

To prevent connection errors, always review the app's required connection details in our [Apps Documentation](https://apps.make.com/ "Apps Documentation").

Make offers two types of connections:

1. **Standard** **connections** - the most common type of connection, covered in detail in this article.

2. **Dynamic** **connections** - a variable that contains multiple connections you can choose from while executing the scenario. Learn more about this Enterprise-level feature [here](https://help.make.com/dynamic-connections "here").

If Make doesn't offer an integration for the service you need, you can connect to it using the [HTTP app](https://apps.make.com/http "HTTP app").

## Create a connection

You create connections in the Scenario Builder when adding a module. All users in your team in Make can use and manage any connections you create in that team. Use your personal third-party account and credentials carefully, especially when your team has otherusers.

If you're on the **Teams** plan or higher, you may consider creating a separate team in which you are the only member to connect to Make using your personal accounts and details.

To see how to connect a specific app, refer to the app's page in the [Apps Documentation](https://apps.make.com/ "Apps Documentation").

These are the general steps to create a connection:

1

Create a new scenario or open the existing one.

2

Click the giant plus and search for the app and module you need. In this example, we will choose **Dropbox** >**Create a Folder**.

3

Click **Create a connection**.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/gDwX09TAF35Y_GJP8-fiZ-20251021-121934.png "Document image")

﻿

4

Steps 4 and 5 can vary. For Dropbox, you will only see the **Connection** **name** field within the standard settings. However, for other apps, you may see additional optional and(or) mandatory fields related to authentication or module's requirements.

In the **Connection name** field, you can name your connection. For example, if you have two different Dropbox accounts, you might name one "Dropbox-Company" and the second "Dropbox-Personal".

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/JWPPJqXNROeC4wKViT-pA-20251021-122607.png "Document image")

﻿

5

Click **Save**. A new window prompts you to grant Make access to your data.

6

Follow the on-screen instructions to grant Make access to your Dropbox account and data.

You have now created a connection between your Dropbox account and Make and can continue setting up the module. You can reuse this connection in any other Dropbox module across scenarios.

Within your team, there can be multiple connections for the same app. If a connection already exists, follow these steps to create another one:

* Click **Add** in the **Connection** field ofthe required app's module.

* Repeat the connection creation steps described above.

You can now select the required connection from the drop-down menu in the **Connection** field.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/-eGljsZ3v0z12EcAm4m4F-20251022-163046.png "Document image")

﻿

## Manage connections

To view and manage connections, click **Credentials** in the left sidebar, switch to **Connections,** and locate the required app. From there, you can:

* Edit the connection

* Verify the connection

* Reauthorize the connection

* Delete the connection

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/RX2oIUX3MErTExS6I9wHf-20260325-092634.png?format=webp "Document image")

﻿

There, you can also see the scenarios where this connection is used, permissions granted and use filter to see your connections.

### See the scenarios where this connection is used

* Click the scenarios icon to see which scenarios are using the connection, and click the expand icon to open the scenario in a new tab.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/7ureYQvsmzttgOmu40F2q-20260325-092715.png?format=webp "Document image")

﻿

### See the permissions granted with this connection

* Click the permissions icon to view the permissions granted for that connection.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/6wijhDIAssxe_7DPronqL-20260325-092901.png?format=webp "Document image")

﻿

### Filter connections

* Click the filter icon next to the search box:

* Select **All connections** to see all the connections created within your team

* Select **My connections** to only see connections created by you

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/0ZkvAorvFP0zUUntce-Th-20260325-093348.png?format=webp "Document image")

﻿

* You can also see an icon next to the connection created by you:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/5CDNmiK9NrFOiE653doai-20260325-093612.png?format=webp "Document image")

﻿

## Edit connections

You can update the credentials and other details of a connection after you created it. For example, if you need to change the API key, Client ID, Client Secret, required scopes, etc. Different apps will have different connection editing forms depending on the credentials or details they require and allow to edit.

Editing a connection replaces the original data with the new data. You have to provide all the credentials required to create the connection again, as Make doesn't keep the original connection data.

To edit a connection:

1

In the left sidebar, click **Credentials**, switch to **Connections**, and locate the required connection.﻿

2

Click the **three dots** **>** **Edit** for the required connection.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/2sKhzoHS5VPZlT00CYsmD-20260325-093633.png?format=webp "Document image")

﻿

3

Inthe pop-up window, enter the new details.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/SxrasLYDIRy9U5oOCGe5t-20251216-150824.png?format=webp "Document image")

﻿

4

Click **Save.**

After you edit a connection, it will be automatically updated in all the modules that use it. By editing a connection, you update some of its details, but don't create a new one.

If you've switched accounts used in a connection, or the authentication method has been changed, you will need to create a new connection. Once you create it, follow the steps described [here](https://help.make.com/replace-connections-across-multiple-modules "here") to replace the old connection with a new one across multiple modules.

### Edit connections with API keys, OAuth credentials, and scopes

When updating credentials, especially for API key and OAuth connections, make sure the new credentials include all necessary scopes to allow Make modules to perform actions on your behalf. This is particularly important if your scenario uses the **Make an API call** module of the app.

Make cannot ensure that the edited connection has the scopes required for all modules that use the connection.

If a module uses a connection with insufficient scopes, the scenario﻿ will end with an error.

To edit a connection with an API key:

1

Click the **three dots** > **Edit** for the required connection.

2

In the pop-up window, fill in the new data in the form.

Connection editing forms may vary depending on the app and on the type of credentials you can edit. This is an example for the [OpenAI (ChatGPT, Sora, DALL-E, Whisper)](https://apps.make.com/openai-gpt-3 "OpenAI (ChatGPT, Sora, DALL-E, Whisper)") connection:

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/sBr-RTgpu2aFtDqeJdp0h-20251021-161622.png "Document image")

﻿

3

Click the **Save** button to confirm changes. If you click the **Close** button, Make closes the form and keeps your original connection.

Make applies the saved changes immediately. After confirming, Make will update the connection details in all the modules where it's used.

To edit a connection with OAuth credentials:

1

Click the **three dots** > **Edit** for the required connection.

2

In the pop-up window, fill in the new data in the form.

Connection editing forms may vary depending on the app and on the type of credentials you can edit. This is an example of the [Airtable connection](https://apps.make.com/airtable "Airtable "):

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/KObKylF1hc4ErfG2tOmXr-20251022-074609.png "Document image")

﻿

3

Click the **Save** button to confirm changes. If you click the **Close** button, Make closes the form and keeps your original connection.

4

Follow the steps to confirm that Make can access your account. Check the required fields to create the connection and review the connection scopes. If everything is correct, confirm the connection update with the **Accept** button.

Make applies the saved changes immediately. After confirming, Make will update the connection details in all the modules where it's used.

## Verify connections

To check whether your connection works properly, you can verify it.

To do that:

1

In the left sidebar, click **Credentials**, switch to **Connections**, and locate the required connection.﻿

2

Click **Verify**. The button briefly changes to **Verifying ...** as Make checks.

Once the verification is completed, a green check mark appears.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/qnWy3nHXUwJCOJzCqNJ4v-20251022-110350.png?format=webp "Document image")

﻿

If the verification fails, you'll see an exclamation mark. This means that something is wrong with the connection. To fix that, click **Reauthorize** to update access to a third-party service. If it doesn't help, create a new connection.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/4rnw573jKjxEN7WhAnTKa-20251022-110312.png?format=webp "Document image")

﻿

## Reauthorize connections

Apps that use the OAuth 2.0 protocol only grant access for a limited time. In this case, you may need to reauthorize your connection periodically.

To reauthorize the OAuth 2.0 connection:

1

In the left sidebar, click **Credentials**, switch to **Connections**, and locate the required connection.﻿

2

Click **Reauthorize** and follow any on-screen prompts that appear.

Once the reauthorization is completed, a green check mark appears.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/8DlrYVQM1y-wti0f4Zevy-20251022-112716.png?format=webp "Document image")

﻿

If the reauthorization fails, you'll see an exclamation mark. This can happen when your browser blocks the reauthorization pop-up, tokens have expired or been revoked, permissions changed, or there was a temporary outage. Try reauthorizing again. If it doesn't help, delete the old connection and create a new one.

## Delete connections

To delete a connection:

1

In the left sidebar, click **Credentials**, switch to **Connections**, and locate the required connection.﻿

2

Click the **three dots** > **Delete** for the connection you want to delete.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/k-nKMhS7zR_8kqL4mOvx1-20260325-093715.png?format=webp "Document image")

﻿

3

In a pop-up window, click **Delete** to confirm.

4

If the connection is used in any scenario, you'll see a corresponding warning and a list of scenarios where it's used. Click **OK** to confirm the deletion.

* Deleting a connection may cause your scenarios﻿ to stop working. Be sure that the connection is not used in any scheduled or active scenarios﻿.

* If there's a [webhook](https://help.make.com/webhooks "webhook") using the connection, you must first delete the webhook before you can delete the connection.

## See also

This article covers the basics. To learn about advanced connection concepts and configurations, see the [**Connections**](https://help.make.com/connections "Connections") section in **Explore** **more**.

Updated 25 Mar 2026

Did this page help you?

Yes

No

[PREVIOUS

Scenarios & connections](/scenarios-and-connections "Scenarios & connections")[NEXT

Schedule a scenario](/schedule-a-scenario "Schedule a scenario")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

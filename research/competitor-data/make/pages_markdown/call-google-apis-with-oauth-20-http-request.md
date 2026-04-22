# Call Google APIs with OAuth 2.0 HTTP request - Help Center

Source: https://help.make.com/call-google-apis-with-oauth-20-http-request
Lastmod: 2026-04-08T14:40:12.393Z
Description: Call Google APIs using HTTP requests with OAuth 2.0 authentication
Explore more

Connections

# Call Google APIs with OAuth 2.0 HTTP request

11 min

In Make, you can call Google APIs with the [**HTTP > Make a request**](https://apps.make.com/http#pKx7q "https://apps.make.com/http#pKx7q") module. Since Google APIs use the OAuth 2.0 protocol for authentication and authorization, you will need to select the OAuth 2.0 authentication type when configuring your connection.

For details on required APIs, scopes, and connection settings, refer to the API documentation of the specific Google service you are using. You can find it in the [Google APIs Explorer](https://developers.google.com/apis-explorer/ "Google APIs Explorer").

To call Google APIs with the **HTTP > Make a request** module, you need to:

1. ﻿[Create and configure a Google Cloud Platform project](/call-google-apis-with-oauth-20-http-request#create-and-configure-a-google-cloud-platform-proje)﻿﻿

2. ﻿[Establish the OAuth connection in Make](/call-google-apis-with-oauth-20-http-request#establish-the-oauth-connection-in-make)﻿﻿

3. ﻿[Configure the HTTP module to send the request](/call-google-apis-with-oauth-20-http-request#configure-the-http-module-to-send-the-request)﻿﻿

## Create and configure a Google Cloud Platform project

To connect Make﻿ to Google services using your custom client credentials, you need to create and configure a project in the Google Cloud Platform.

### Create a Google Cloud Platform project

1

Log in to the [Google Cloud Platform](https://console.cloud.google.com/ "Google Cloud Platform") using your Google credentials.

2

On the welcome page, click **Create or select a project****.**

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/iUUfJBhljqxbp2J37P6Zh-20250912-100329.png?format=webp "Document image")

﻿

3

In the next window, click **New project** in the upper-right corner.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/TwqnY3iDQMsafLpxzv4JU-20250912-100529.png?format=webp "Document image")

﻿

4

Change the default **Project name** and **Project ID**, if needed. Select the **Location** for your project, and click **Create**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/HoHbDak4T8cEzz5BVWV---20250912-102510.png?format=webp "Document image")

﻿

5

On the top panel, next to the Google Cloud logo, click **Select a project**.

6

In the next window, click the project you just created.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/jIdNcvAxzEUP22emCBrlp-20250912-103458.png?format=webp "Document image")

﻿

You'll now see the **Google Cloud Platform project** you've created on the top panel, next to the Google Cloud logo.

To create a new project or work in the existing one, you need to have the serviceusage.services.enable permission. If you don’t have this permission, ask the Google Cloud Platform Project Owner or Project IAM Admin to grant it to you.

### Enable APIs

1

In the left sidebar of the Google Cloud Platform, click **APIs & Services** > **Library**.

2

Search for the API you need for your project (e.g., Google Drive, Google Sheets, etc.).

3

Click the relevant API. For example, Google Sheets API:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/FqyFIK1N28aaFciCB7nHq-20251119-105908.png?format=webp "Document image")

﻿

4

Click **Enable**.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/-RVq7HyCeesc1C1t0hKRm-20251119-110119.png "Document image")

﻿

Your API is now enabled.

### Configure your OAuth consent screen

1

In the left sidebar of the Google Cloud Platform, click **APIs & Services** > **OAuth consent screen**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/szrwOEJWw7Ei-b7MSgGJt-20250912-111324.png?format=webp "Document image")

﻿

2

Click **Get Started**.

3

In the **Overview** section:

* Under **App information**, enter *Make* as the app name, enter your Gmail address, and click **Next**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/iFvukbKbVakiQPqmsvre8-20250912-112021.png?format=webp "Document image")

﻿

* Under **Audience**, select **External**,andclick **Next**. For more information regarding user types, refer to [Google's Exceptions to verification requirements documentation](https://support.google.com/cloud/answer/9110914#exceptions-ver-reqts "Google's Exceptions to verification requirements documentation").

* Under **Contact Information**, enter your Gmail address, and click **Next**.

* Under **Finish**, agree to the [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy?authuser=1 "Google API Services User Data Policy"), and click **Continue**, then **Create**.

* In the next window, click **Create OAuth Client**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/gWhkTq2f_h5To-n_byZ7b-20250912-114156.png?format=webp "Document image")

﻿

* You'll be redirected to the **Clients** tab. You can skip it for now or refer to the [Create your client credentials](/connect-to-google-services-using-a-custom-oauth-client#create-your-client-credentials)﻿ section to configure it.

4

In the **Branding** section:

* Under **Authorized domains,** click **+Add domain.**

* Add make.com and integromat.com.

* Click **Save**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/qyTTXd-f6d-L3Qpue7jgY-20250912-115053.png?format=webp "Document image")

﻿

5

In the **Audience** section:

* Click **Publish app** to update the project status to **In production.**

* If you want the project to remain in the **Testing** publishing status, click **+Add users** and enter your Gmail address under **Test users.**

﻿

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/eMmPIQOVjUMtu2KFMZISU-20250912-115725.png?format=webp "Document image")

﻿

**Publishing Status**

**Testing:** If you keep your project in the **Testing** status, you will be required to reauthorize your connection in Make every week. To avoid weekly reauthorization, update the project status to **In production**.

**In production:** If you update your project to the **In production** status, you will not be required to reauthorize the connection weekly. To do that, go to the **Google Auth Platform**, the **Audience** section, and click **Publish app**. If you see the notice **Needs verification**, you can choose whether to go through the [Google verification process](https://support.google.com/cloud/answer/13463073?authuser=1&visit_id=638718595933013017-1855034908&rd=1 "Google verification process") for the app or to connect to your unverified app. Currently, connecting to unverified apps works in Make, but we cannot guarantee that Google will allow connections to unverified apps for an indefinite period.

For more information regarding the publishing status, refer to the Publishing status section of [Google's Setting up your OAuth consent screen help](https://support.google.com/cloud/answer/10311615#zippy= "Google's Setting up your OAuth consent screen help").

Your OAuth consent is now configured.

### Create your client credentials

1

In the left sidebar of the Google Cloud Platform, click **APIs & Services** > **OAuth consent screen**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/szrwOEJWw7Ei-b7MSgGJt-20250912-111324.png?format=webp "Document image")

﻿

2

Go to the **Clients** section, and click **+Create client**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/-1bUMR6Uj2xMDxANLbnHN-20250912-123323.png?format=webp "Document image")

﻿

3

Under**Create OAuth client ID**:

* In the **Application type** dropdown, select **Web application**.

* In the **Name** field, update the name of your OAuth client. This will help you identify it in the console afterward.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/mBdU3rr_GENJMNAXSL3gP-20250912-124942.png?format=webp "Document image")

﻿

4

Under the **Authorized redirect URIs,** click **+ Add URI.** Enter: https://www.integromat.com/oauth/cb/oauth2 and click **Save**.

This redirect URI is required to use the **HTTP > Make a request** module in Make.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/29XiATeiOAJ-yODCpBWCy-20251119-111753.png "Document image")

﻿

5

Click **Create**.

6

You'll see a message that the OAuth client has been created. Copy your **Client ID** and **Client secret** values, and store them in a safe place.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/9K5uTh_cRFMTGrzqa_i5i-20251119-112349.png "Document image")

﻿

You will use these values in the **Client ID** and **Client Secret** fields in Make.

## Establish the OAuth connection in Make

To establish the connection in Make:

1

Log in to your Make﻿ account .

2

Create a new scenario or open an existing one and add an **HTTP > Make a request** module to your scenario﻿.

3

In the **Authentication type** field, select  **OAuth 2.0**.

4

In the **Credentials** field, click **Create a connection** (or **Add** next to **Create a connection**) to create your OAuth 2.0 connection:

* In the **Connection n****ame** field, enter a name to distinguish your connection.

* In the Flow type field, select Authorization Code as you'll need to enter further both an **Authorize URI** and **Token URI**.

* In the **Authorize URI** field, enter the **Authorize URI** as it's defined in the Google API documentation: https://accounts.google.com/o/oauth2/v2/auth

* In the **Token URI** field, enter the **Token** **URI** as it's defined in the Google API documentation: https://oauth2.googleapis.com/token

* In the **Scope** field, click **+Add item** to add the scopes required for your HTTP request.

You can check the scopes in the Google service's API documentation. For the [Google Sheets API scopes](https://developers.google.com/workspace/sheets/api/scopes "Google Sheets API scopes"), for example, you can use:

* https://www.googleapis.com/auth/drive

* https://www.googleapis.com/auth/spreadsheets

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/LgGbum5HIC9oBaWVT2ghx-20251119-115613.png?format=webp "Document image")

﻿

* In the **Client** **ID** field, add the **Client ID** you obtained from your Google Cloud Platform project app.

* In the **Client Secret** field, add the **Client** **Secret** you obtained from your Google Cloud Platform project app.

* Enable the **Advanced settings** toggle, and select **SPACE** in the **Scope** **separator** field.

Choosing the right scope separator is important, as the wrong one can prevent you from establishing the connection.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/tS6YaAjg5f0hAjvqtPzD7-20251119-121730.png "Document image")

﻿

* To avoid having to constantly refresh the connection, in the **Authorize** **parameters**, click **+Add item** and add:

* **Key**: access\_type **Value**: offline

* **Key**: prompt **Value**: consent

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/xlUIxU_PaWAsVfJNbhKOz-20251212-122702.png?format=webp "Document image")

﻿

* Click **Save**.

5

Complete the required steps to sign in to Google. If you see a message that Google hasn't verified your app, you'll need to confirm that you trust the developer:

* Click **Advanced**.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/MKB2Ge-KPFYTX9SfT9n9X-20251119-130723.png "Document image")

﻿

* Click **Go to integromat.com (unsafe)**.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/H3KsXukfc2n3qtaay2R8U-20251119-130805.png "Document image")

﻿

6

Then, if prompted, authenticate your account, grant all requested permissions, and confirm access.

You've successfully created the OAuth 2.0 connection and can now make the HTTP request to a Google app.

You can [edit the connection](https://help.make.com/connect-an-application#tN2pJ "edit the connection ") at any time. To do that:

* Open **Connections** from the left sidebar.

* Find the required connection, click the three dots next to its name, and click **Edit**.

You will be able to add or remove scopes and edit some other connection parameters.

## Configure the HTTP module to send the request

To make an HTTP POST request to the Google Sheets API to create a spreadsheet:

1

In the **URL** field, enter the URL according to the desired output. To create a spreadsheet, for example, you would use: https://sheets.googleapis.com/v4/spreadsheets

2

Select the **POST** method required for this API call.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/aBvLw76eidYVonN-vBBFT-20251119-133534.png "Document image")

﻿

3

Leave the **Headers** and **Query** sections empty.

4

For the **Body** section:

* In the **Body content type** field, select **application/json**.

* In the **Body input method** field, select **Data structure**.

* In the **Body** **structure** field, click **Add** to create a new data structure.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/pJ13hn4DlhkjowqatUx5D-20251119-133636.png "Document image")

﻿

* Enter a name for your data structure to distinguish it afterward. Click **+Add item** to set up the parameters as 'key-value' pairs.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/qeGUIK1DTXSu9C_IXOTok-20251119-133956.png "Document image")

﻿

* Alternatively, click **Generate** to enter a JSON text that will be converted into 'key-value' pairs. For example:

{
"properties": {
"title": "New Spreadsheet Created by Make"
},
"sheets": [
{
"properties": {
"title": "Initial Data"
}
}
]
}

* Click **Generate**.

* This way, you'll add a title field to add the name of the spreadsheet you create, and a title field for the sheet created in that spreadsheet. Click **Save**.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/FNGYXmhwQfhQYN7g7VkyN-20251119-134338.png "Document image")

﻿

* In the **Body content** field, you can now enter the names of the spreadsheet and sheet that you'll create.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/BGohQIUWyKbYVFiL7Yrp5-20251119-134818.png "Document image")

﻿

5

Click **Save** and run the module.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/a3rbIYSUnUKMe6WaRCtrf-20251119-134935.png "Document image")

﻿

You can now check your Google Sheets. A new spreadsheet called **New spreadsheet Make** with a **New sheet** will be created. You can also see it in the output:

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/8A-XW2bwdkf2DUGCpWrz_-20251119-135342.png "Document image")

﻿

## Troubleshooting

If you get an error while establishing the OAuth 2.0 connection to any Google service in the **HTTP > Make a request** module, ensure that you've completed all the steps described above. Below is the summary of the key items you need to verify.

### Check your Google Cloud Platform project

1

**Required API is enabled:** Ensure you've enabled the required Google API, as explained [here](/call-google-apis-with-oauth-20-http-request#enable-apis)﻿.

2

**Authorized domains are added:** Add integromat.com and make.com as authorized domains in the **Branding** section, as explained in step 4 [here](/call-google-apis-with-oauth-20-http-request#configure-your-oauth-consent-screen)﻿.

3

**Test user is added, or the app is published**: Add your Gmail account as a test user or publish the app, as explained in step 5 [here](/call-google-apis-with-oauth-20-http-request#configure-your-oauth-consent-screen)﻿.

4

**Authorized Redirect URI is added:** Add the correct https://www.integromat.com/oauth/cb/oauth2 in the **Clients** section, as explained in step 4 [here](/call-google-apis-with-oauth-20-http-request#create-your-client-credentials)﻿.

### Check the connection settings of the HTTP > Make a request module in Make

1

**Authorize URI and Token URI are correct:** Use https://accounts.google.com/o/oauth2/v2/auth as **Authorize URI** and https://oauth2.googleapis.com/token as **Token URI,** as explained in step 4 [here](/call-google-apis-with-oauth-20-http-request#establish-the-oauth-connection-in-make)﻿.

2

**Required scopes are added**: Add all the scopes needed for your HTTP request, as explained in step 4 [here](/call-google-apis-with-oauth-20-http-request#establish-the-oauth-connection-in-make)﻿.

3

**Correct Client ID and Client Secret are used:** Enter the credentials youobtained from your Google Cloud Platform project, and ensure they match.

4

**Scope separator is set to SPACE**: Set the **Scope separator** to **SPACE** if you're adding more than one scope, as explained in step 4 [here](/call-google-apis-with-oauth-20-http-request#establish-the-oauth-connection-in-make)﻿.

﻿

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

Connections](/connections "Connections")[NEXT

Connect to any web service using OAuth 2.0](/connect-to-any-web-service-using-oauth-20 "Connect to any web service using OAuth 2.0")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

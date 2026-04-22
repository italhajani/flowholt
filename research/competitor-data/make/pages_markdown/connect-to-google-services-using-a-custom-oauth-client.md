# Connect to Google services using a custom OAuth client - Help Center

Source: https://help.make.com/connect-to-google-services-using-a-custom-oauth-client
Lastmod: 2026-04-08T14:40:16.629Z
Description: Create a custom OAuth client in Google Cloud Platform to connect Google services to Make
Explore more

Connections

# Connect to Google services using a custom OAuth client

11 min

To connect some restricted Google services, like Google Drive or Google Sheets*,* to Make, you need to create your own project in Google Cloud Platform and a custom OAuth client.

The following procedure is intended for:

* **Personal use** (*@gmail* and *@googlemail.com* users)

* **Internal use** (Google Workspace users who prefer to use a custom OAuth client)

To connect, you must have a [Google account](https://accounts.google.com/signin "Google account").

## Configure a Google Cloud Platform project

To configure a Google Cloud Platform project, follow these five steps:

1. ﻿[Create a Google Cloud Platform project](/connect-to-google-services-using-a-custom-oauth-client#create-a-google-cloud-platform-project)﻿﻿

2. ﻿[Enable APIs](/connect-to-google-services-using-a-custom-oauth-client#enable-apis)﻿﻿

3. ﻿[Configure your OAuth consent screen](/connect-to-google-services-using-a-custom-oauth-client#configure-your-oauth-consent-screen)﻿﻿

4. ﻿[Create your client credentials](/connect-to-google-services-using-a-custom-oauth-client#create-your-client-credentials)﻿﻿

5. ﻿[Connect to Google services using a custom OAuth client](/connect-to-google-services-using-a-custom-oauth-client#establish-the-connection-in-make)﻿﻿

### Create a Google Cloud Platform project

To create a project in your Google Cloud console:

1

Log in to the [Google Cloud Platform](https://console.cloud.google.com/ "Google Cloud Platform") using your Google credentials.

2

On the welcome page, click **Create or select a project****.**

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/iUUfJBhljqxbp2J37P6Zh-20250912-100329.png?format=webp "Document image")

﻿

If you've already created projects in your Google Cloud Platform, you will be redirected to the latest project upon login. To create a new one, click the project name in the upper-left corner.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/9FvGpwwR3OpuC6WPd3lR9-20260312-142428.png?format=webp "Document image")

﻿

3

In the next window, click **New project** in the upper-right corner.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/TwqnY3iDQMsafLpxzv4JU-20250912-100529.png "Document image")

﻿

4

Change the default **Project name** and **Project ID**, if needed. Select the **Location** for your project, and click **Create**.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/HoHbDak4T8cEzz5BVWV---20250912-102510.png "Document image")

﻿

5

On the top panel, next to the Google Cloud logo, click **Select a project**.

6

In the next window, click the project you just created.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/jIdNcvAxzEUP22emCBrlp-20250912-103458.png "Document image")

﻿

You'll now see the **Google Cloud Platform project** you've created on the top panel, next to the Google Cloud logo.

To create a new project or work in the existing one, you need to have the serviceusage.services.enable permission. If you don’t have this permission, ask the Google Cloud Platform Project Owner or Project IAM Admin to grant it to you.

### Enable APIs

To turn on the APIs your Google application needs:

1

In the left sidebar of the Google Cloud Platform, click **APIs & Services** > **Library**.

2

Search for the API you need for your project (e.g., Google Sheets, Google Drive, etc.). For the information on APIs for particular apps, look for the required app in the [Apps Documentation](https://apps.make.com/ "Apps Documentation").

3

Click the relevant API (e.g., Google Sheets API):

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/TRPadVqOMtq32fSCK5Hd3-20251119-161147.png "Document image")

﻿

4

Click **Enable**.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/-RVq7HyCeesc1C1t0hKRm-20251119-110119.png "Document image")

﻿

Your API is now enabled.

### Configure your OAuth consent screen

To set up the OAuth consent screen:

1

In the left sidebar of the Google Cloud Platform, click **APIs & Services** > **OAuth consent screen**.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/szrwOEJWw7Ei-b7MSgGJt-20250912-111324.png "Document image")

﻿

2

Click **Get Started**.

3

In the **Overview** section:

* Under **App information**, enter *Make* as the app name, enter your Gmail address, and click **Next**.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/iFvukbKbVakiQPqmsvre8-20250912-112021.png "Document image")

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

6

In the **Data Access** section:

1. Under **Data Access**, click **Add or remove scopes.**

2. Under **Update selected scopes**, search for and select the required scopes from the list.

3. Alternatively, enter the required scopes one by one and click **Add to table** under **Manually add scopes.**

4. Click **Update**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/TY0oxLY3FCNZB-khPTzbU-20251119-160545.png?format=webp "Document image")

﻿

For the Google Sheets app, for example, you'd need to add the following scopes:

* https://www.googleapis.com/auth/spreadsheets

* https://www.googleapis.com/auth/drive

Each app, however, requires its own set of scopes. To find the correct scopes, go to the app's page in the [Apps Documentation](https://apps.make.com/ "Apps Documentation") and refer to the **Configure your OAuth consent screen** section.

7

Click **Save**.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/dtTyqztOypQIdp-_az0iP-20251119-160907.png "Document image")

﻿

Your OAuth consent is now configured.

### Create your client credentials

To generate the Client ID and Client secret needed for authentication:

1

In the left sidebar of the Google Cloud Platform, click **APIs & Services** > **OAuth consent screen**.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/szrwOEJWw7Ei-b7MSgGJt-20250912-111324.png "Document image")

﻿

2

Go to the **Clients** section, and click **+Create client**.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/-1bUMR6Uj2xMDxANLbnHN-20250912-123323.png "Document image")

﻿

3

Under**Create OAuth client ID**:

* In the **Application type** dropdown, select **Web application**.

* In the **Name** field, update the name of your OAuth client. This will help you identify it in the console afterward.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/mBdU3rr_GENJMNAXSL3gP-20250912-124942.png "Document image")

﻿

4

Under the **Authorized redirect URIs,** click **+ Add URI** and enter the required redirect URI.

For the Google Sheets app, for example, you would need https://www.integromat.com/oauth/cb/google/.

Each app, however, requires different Redirect URIs. To find the correct one, go to the app's page in the [Apps Documentation](https://apps.make.com/ "Apps Documentation") and refer to the **Create your client credentials** section.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/roYo5qq3R0lqf3rv8c3MR-20251119-155905.png "Document image")

﻿

5

Click **Create**.

6

You'll see a message that the OAuth client has been created. Copy your **Client ID** and **Client secret** values, and store them in a safe place.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/Hw708snAzmYP3oS2oEzFl-20251121-090200.png "Document image")

﻿

You will use these values in the **Client ID** and **Client Secret** fields in Make.

### Establish the connection in Make

To establish the connection in Make:

1

Log in to your Make﻿ account, add a Google app module to your scenario﻿, and click **Create a connection**.

2

Optional: In the **Connection name** field, enter a name for the connection.

3

Switch on the **Advanced settings** toggle and enter your Google Cloud Platform project client credentials.

4

Click **Sign in with Google**.

5

If prompted, authenticate your account, grant all requested permissions, and confirm access.

You've successfully created the connection and can now use the Google app modules in your scenarios﻿. If you want to make changes to your connection in the future, follow the steps [here](https://help.make.com/connect-an-application#tN2pJ "here").

## Common problems

### Failed to verify connection 'My Google Restricted connection'. Status Code Error: 400

This error message may appear if your connection has expired and is no longer valid. You need to reauthorize the connection.

This error affects **non**-Google Workspace accounts. For more details, please refer to the [Google OAuth documentation](https://developers.google.com/identity/protocols/oauth2#expiration "Google OAuth documentation").

Due to Google's updated security policy, unpublished apps can only have a 7-day authorization period. After the OAuth security token expires, the connection is no longer authorized, and any module relying on it will fail.

**Solution 1**

To avoid weekly reauthorization, you can update the publishing status of your project.

If you update your project to the **In production** status, you will not be required to reauthorize the connection weekly.

**To c****hange the status of your project to** **In production**, follow the step 5 explained [here](/connect-to-google-services-using-a-custom-oauth-client#configure-your-oauth-consent-screen)﻿. Here's a summary:

1

In the left sidebar of the Google Cloud Platform, click **APIs & Services** > **OAuth consent screen**.

2

Switch to the **Audience** section, and click **Publish app** to update the project status to **In production.**

3

If you see the notice **Needs verification**, you can choose whether to go through the [Google verification process](https://support.google.com/cloud/answer/13463073?visit_id=638357423877979226-2405331664&rd=1#exceptions-ver-reqts "Google verification process") for the app or to connect to your unverified app. Currently, connecting to unverified apps works in Make, but we cannot guarantee that Google will allow connections to unverified apps for an indefinite period.

**Solution 2**

If you keep your project in the **Testing** status, you will be required to reauthorize your connection in Make every week.

To reauthorize your Google connection:

1

Log in to Make.

2

In the left sidebar, click **Connections**.

3

Find your Google connection and click the **Reauthorize** button.

### Error 400: redirect\_uri\_mismatch

This error message can appear if you haven't added the required redirect URIs for your Google app. Verify you're using the required Redirect URIs as explained in step 4 [here](/connect-to-google-services-using-a-custom-oauth-client#create-your-client-credentials)﻿.

It may also happen that Google doesn't instantly recognize the Redirect URI used for the authentication. Once verified that you're using the proper Redirect URIs, wait for some time after creating your Google Cloud Platform project. Then, try to connect the Google app with your custom OAuth credentials once again.

### Error 401: invalid\_client – The OAuth client was not found

This error occurs when the OAuth credentials associated with your Google connection are no longer valid or properly configured. It indicates that the original workspace is tied to a deprecated or outdated Google OAuth client.

**To resove this**:

1. **Create a new Google connection**

* In your Make﻿ workspace, go to **Connections**.

* Follow the authentication flow to create a new connection to Google services. This generates fresh, valid OAuth credentials.

2. **Update your scenarios**

* Open your existing scenarios﻿ and replace the old, broken Google connection with the newly created one.

* Save the changes to ensure your scenarios﻿ run with the updated credentials.

3. **Remove the old connection**

* Delete the deprecated connection from your workspace to prevent confusion.

### [403] Access Not Configured

This error message may appear when you haven't enabled the corresponding API in your Google Cloud Platform.

To enable the API, complete the steps explained [here](/connect-to-google-services-using-a-custom-oauth-client#enable-apis)﻿. If the problem persists, delete the previous connection and connect your Google app toMake﻿ with your OAuth credentials once again.

### Authorization Error - Error 403: access\_denied

This error message may appear if you keep your Google project in the **Testing** status and haven't added a **Test user** email address associated with the Google account you want to connect to Make as a Test user.

To add the test user or change the status of your app, complete the step 3 explained [here](/connect-to-google-services-using-a-custom-oauth-client#configure-your-oauth-consent-screen)﻿. Then go to **Connections** in the left sidebar in Make﻿, and click the **Reauthorize** button. If the problem persists, delete the previous connection and connect your Google app toMake﻿ with your OAuth credentials once again.

### Error 403: Insufficient Permission

Verify you've added all the required scopes in the Google Cloud Platform project for the app you're using, as explained in step 6 [here](/connect-to-google-services-using-a-custom-oauth-client#configure-your-oauth-consent-screen)﻿.

Then, reauthorize your Google connection by following these steps:

1

Log in to Make.

2

In the left sidebar, click **Connections**.

3

Find your Google connection and click the **Reauthorize** button.

### Error message: It is not possible to use restricted scopes with customer @gmail.com accounts

This error message may appear if you haven't added the required scopes for your Google app.

To add the scopes, complete steps 6 and 7, as explained [here](/connect-to-google-services-using-a-custom-oauth-client#configure-your-oauth-consent-screen)﻿.

### 100 Logins Limit Per Day Has Been Reached

According to the [Google OAuth 2.0 protocol policy](https://developers.google.com/identity/protocols/oauth2#expiration "Google OAuth 2.0 protocol policy"), there’s a limit of 100 refresh tokens per Google Account per OAuth 2.0 client ID. If the limit is reached, creating a new refresh token automatically invalidates the oldest refresh token without warning. This limit does not apply to service accounts.

This happens rarely, but when it does, we recommend creating another OAuth client.

﻿

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

Connect to any web service using OAuth 2.0](/connect-to-any-web-service-using-oauth-20 "Connect to any web service using OAuth 2.0")[NEXT

Replace connections across multiple modules](/replace-connections-across-multiple-modules "Replace connections across multiple modules")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

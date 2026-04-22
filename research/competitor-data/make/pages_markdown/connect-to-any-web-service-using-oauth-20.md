# Connect to any web service using OAuth 2.0 - Help Center

Source: https://help.make.com/connect-to-any-web-service-using-oauth-20
Lastmod: 2026-04-08T14:40:13.704Z
Description: Establish OAuth 2.0 connections to securely connect any web service to Make
Explore more

Connections

# Connect to any web service using OAuth 2.0

8 min

To connect certain web services to Make, you need to establish an OAuth 2.0 connection.

**OAuth 2.0** (Open Authorization) is an industry-standard protocol used for granting secure, limited access to a user's data. It allows one web service to access the resources from another one on behalf of the user. It also ensures that the user consents to the access and that the client service only performs specific, allowed actions.

To establish the OAuth 2.0 connection, you must obtain **client credentials** from the service you want to connect to. These credentials are commonly called Client ID and Client Secret, though they may have different names. They authenticate your app to the authorization server. To obtain those credentials, you'd usually create an app within the service or app you want to connect to.

In an OAuth 2.0 connection, you also need to specify **scopes**. They define the level of access your web service requests and control what the connected app can do. For example, you may allow the app to read files, but not delete them.

## Example: Connect Make to Dropbox

Dropbox is a cloud storage service that uses the standardized OAuth 2.0 protocol for authorization. Thus, to connect Make to Dropbox using OAuth 2.0 authorization, you'll need to:

* ﻿[Obtain client credentials and scopes](/connect-to-any-web-service-using-oauth-20#obtain-client-credentials-and-scopes)﻿﻿

* ﻿[Establish the connection in Make](/connect-to-any-web-service-using-oauth-20#establish-the-connection-in-make)﻿

## Obtain client credentials and scopes

To obtain the client credentials in Dropbox, you need to create an application. There, you will get the **App key** (Client ID) and **App secret** (Client Secret), which are required to establish the OAuth 2.0 connection.

To do that:

1

Log in to your Dropbox account and go to the [Developers page](https://www.dropbox.com/developers/ "Developers page").

2

Click **Create** **apps**.

3

A window to create a new app on the DBX platform will appear. There, you should:

* Select **Scoped** **access** under **Choose an API.**

* Select **Full Dropbox** under **Choose the type of access you need.**

* Enter a **Name** for your app under **Name your app**.

* Click **Create** **app**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/rAEOAB-WvZAysoiK20hJG-20251117-131843.png?format=webp "Document image")

﻿

4

An app configuration window will appear. In the **Settings** tab, enter https://www.integromat.com/oauth/cb/oauth2 as a **Redirect URI** and click **Add**.

5

Copy the **App key** (Client ID) and **App secret** (Client Secret) and store them in a safe place. You will need them later to establish the connection in Make.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/dgwayNnx14mKPE1gVlKO3-20251117-132509.png?format=webp "Document image")

﻿

6

Switch to the **Permissions** tab. Select the scopes to let Make perform the required actions in Dropbox, and click **Submit** to save the changes. You will also need to add those selected scopes later when setting the connection in Make.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/f2CzmysDYO_P19eBdyO4M-20251117-135927.png?format=webp "Document image")

﻿

You can always check the API documentation of the service you're connecting to to see which scope is required for a particular action.

Once you have your client credentials and scopes, you can proceed with establishing the OAuth 2.0connection in Make.

## Establish the connection in Make

For some websites or apps that do not have a dedicated Make integration, you will need to use an [**HTTP > Make a request**](https://apps.make.com/http#pKx7q "HTTP > Make a request") module with an [OAuth 2.0 authentication type](https://apps.make.com/oauth-20-authentication-type "OAuth 2.0 authentication type").

If Make provides a relevant app module, you can just add that module to the scenario and establish the OAuth 2.0 connection. This is usually simpler, as the module handles most of the configurations automatically.

Since Make has a Dropbox app, we can look at both cases.

### Establish the connection in Make using the **HTTP app**

Suppose you need to create a folder in Dropbox via an HTTP POST request. Here's how to establish the OAuth connection and configure the module:

Check the required API details in the [Dropbox API documentation.](https://www.dropbox.com/developers/documentation/http/documentation "Dropbox")﻿

1

Create a new scenario, or open the existing one and add an **HTTP > Make a request** module.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/Enlxf9gxerQySvAJvFqYX-20251117-142731.png "Document image")

﻿

2

In the **Authentication type** field, select  **OAuth 2.0**.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/p1wFYel-X4zdvSQJkb6fQ-20251117-142911.png "Document image")

﻿

3

In the **Credentials** field, click **Create a connection** (or **Add** next to **Create a connection**) to create your OAuth 2.0 connection:

* In the **Connection n****ame** field, enter a name for your connection.

* In the **Flow** **type** field, select Authorization Code as you'll need to enter further both an **Authorize URI** and **Token URI**.

* In the **Authorize URI** field, enter the **Authorize URI** https://www.dropbox.com/oauth2/authorizeas it's defined in the Dropbox API documentation.

* In the **Token URI** field, enter the **Token** **URI** https://api.dropboxapi.com/oauth2/tokenas it's defined in the Dropbox API documentation.

* In the **Scope** field, click **+Add item** to add the required scope(s).

* In the **Client** **ID** field, add the **App** **key** you obtained from your Dropbox app.

* In the **Client** **Secret** field, add the **App** **secret** you obtained from your Dropbox app.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/3gcfNfs95KGWeBxHOwutV-20251219-135523.png?format=webp "Document image")

﻿

4

To avoid having to constantly refresh the connection, enable the **Advanced settings** toggle, and click **+Add item** to add the following **Authorize** **parameters**:

* **Key**: token\_access\_type **Value**: offline

* **Key**: force\_reapprove **Value**: true

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/e22akFm4NRTR1h9hjh7O4-20251219-135609.png?format=webp "Document image")

﻿

The **Authorize** **parameters** mentioned above only apply to Dropbox. Other services’ APIs may require similar parameters, but with different names.

Check the service’s API documentation to add the required **Authorize** **parameters** and avoid constant OAuth 2.0 connection refreshes.

5

Click **Save**.

6

Allow access in the emerging window.

Your connection is now successfully established. To check that it works, you can make an HTTP request. To create a folder in Dropbox:

1

In the URL field, add https://api.dropboxapi.com/2/files/create\_folder\_v2.

2

Select the **POST** method required for this API call.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/hGTtN_bb77rXkm_d0avtO-20251111-114522.png "Document image")

﻿

3

Leave the **Header** and the **Query** sections empty.

4

For the **Body** section:

* In the **Body content type** field, select application/json.

* In the **Body input method** field, select **Data structure**.

* In the **Body** **structure** field, click **Add** to create a new data structure. Add a text field path to indicate where the folder should be created and how it should be called. You can also add the Boolean autorename field to specify whether Dropbox can autorename the folder if there's a conflict. Click **Save**.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/RA7vFDMJMtqbdfz7nC2Du-20251111-130849.png "Document image")

﻿

* In the **Body** **content** **field**, add the path (/Make in this example) and disable the autorename.

5

Click **Save** and run the module.

You can now check your Dropbox storage. A new folder called **Make** will be created. You can also see it in the output:

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/BjJyhLJmf2pft5iMJ0VZb-20251111-131416.png "Document image")

﻿

### Establish the connection in Make through the Dropbox app

Since there's a Dropbox app in Make with a corresponding module, you can also add it to the scenario and establish the OAuth 2.0 connection. To do that:

1

Create a new scenario, or open an existing one, and add a **Dropbox > Create a Folder** module.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/6t918xC_tkXStCDFA_4ny-20251117-171629.png "Document image")

﻿

2

Click **Create a connection** (or **Add**) to create your OAuth 2.0 connection.

3

In the connection configuration window:

* In the **Connection n****ame** field, enter a name to distinguish your connection.

* In the **Client** **ID** field, add the **Client ID** you obtained from your Dropbox app.

* In the **Client Secret** field, add the **Client** **Secret** you obtained from your Dropbox app.

* In the **Scope** field, click **+Add item** to add the required scopes.

* Click **Save**.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/ReVOrDm37ydF4XHGJ09gK-20251117-172852.png "Document image")

﻿

4

Allow access in the emerging window.

Your connection is now successfully established. To verify that it works, you can configure the module settings and run it.

1

To replicate what we've done above with the **HTTP > Make a reques**t module, add 'Make' in the **Folder** **Name** field. Set the **Folder** to a general one.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/PpTWQPXS7iPTwGMBd__9I-20251117-174000.png "Document image")

﻿

You can now check your Dropbox storage. A new folder called **Make** will be created. You can also see it in the output:

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/rEnH5LkV3mZpkas3T64oB-20251117-174402.png "Document image")

﻿

﻿

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

Call Google APIs with OAuth 2.0 HTTP request](/call-google-apis-with-oauth-20-http-request "Call Google APIs with OAuth 2.0 HTTP request")[NEXT

Connect to Google services using a custom OAuth client](/connect-to-google-services-using-a-custom-oauth-client "Connect to Google services using a custom OAuth client")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

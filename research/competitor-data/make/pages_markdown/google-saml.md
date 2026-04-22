# Google SAML - Help Center

Source: https://help.make.com/google-saml
Lastmod: 2026-04-08T14:40:13.590Z
Description: Configure Google SAML single sign-on to authenticate users with their Google accounts.
Your organization

Access management

# Google SAML

6 min

This feature is available to Enterprise customers.

The following manual configuration creates an SAML SSO configuration for your Enterprise organization.

## Prerequisites

* Owner role in an Enterprise organization

* Google Admin console account

## Supported features

This configuration supports the following:

* Service Provider initiated SSO

* Single Log Out [optional]

## Configuration Steps

Before configuring SSO, you need to assign a namespace and download your service provider certificate in Make﻿. These steps provide information you need to enter later.

### Create your namespace in Make

1

Click **Organization** in the left sidebar.

2

Click the **SSO** tab.

3

Under **Namespace**, enter the namespace you want for your organization. For example, acmecorp. Your organization members enter this namespace when they log in via SSO.

4

Under **SSO type**, select **SAML 2.0**.

5

Copy the **Redirect URL** and save it in a safe place. You will use this later when you create your SAML integration in the Google admin portal.

### Create an SAML application in the Google admin portal

1

Login to the Google admin console.

2

From the dashboard's left menu, click **Apps > Web and mobile apps**.

![Google admin console](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-Q3Q4KT-Rqx_XNYlyLrd5I-20250228-142929.png?format=webp "Google admin console")

﻿

3

Click **Add app** and select **Add custom SAML app**.

![Add custom SAML app](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-MgIH94jUfHazZZ-TCL8kZ-20250228-143141.png?format=webp "Add custom SAML app")

﻿

4

Enter an **App name** and **Description**.

5

Copy the **SSO URL** and save it in a safe place. You will use this later.

6

On the same screen, download the certificate and save it in a safe place.

7

Click **Continue**.

8

Enter the **Service provider details**. You can find thise information in the Make﻿ SSO configuration tab.

**ACS URL:** https://www.make.com/sso/saml/{namespace}

**Entity ID:** https://www.make.com/sso/saml/{namespace}/metadata.xml

Replace {namespace} with your [namespace](/google-saml#create-your-namespace-in-make)﻿.

![Service provider details](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-2Q3hdFJhG4C4IhTAMIMv8-20250228-140928.png?format=webp "Service provider details")

﻿

9

Click **Continue**.

10

Enter the App attributes.

![App attributes](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-MoEzoFAaBw8TV8byrIIQA-20250228-140414.png?format=webp "App attributes")

﻿

11

Update the **User access** to On for everyone.

![User access](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-xd-cn2h216HDWl1q8dJ_0-20250228-140758.png?format=webp "User access")

﻿

### Update the SSO in Make

1

Click **Org** in the left sidebar.

2

Switch to the **SSO** tab.

3

Activate the **Service Provider Certificate** and download it.

4

In the **Identity Provider Certificate** section, click **Extract**. In the **P12, PFX or PEM file** field, upload the certificate downloaded from step 6 of [Create an SAML application in the Google admin portal](/google-saml#create-an-saml-application-in-the-google-admin-por)﻿ above. Then click **Save**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/3jW3Sv4rWQmjvIyWI09I7-20251015-093508.png?format=webp "Document image")

﻿

5

Enter the SSO URL from step 5 of [Create an SAML application in the Google admin portal](/google-saml#create-an-saml-application-in-the-google-admin-por)﻿ above and paste it into the **IDP Login URL** field in Make﻿.

6

Enter the **Login IML resolve**.

JS

1{
2 "email": "{{get(user.attributes.email, 1)}}",
3 "name": "{{get(user.attributes.firstName, 1)}}{{get(user.attributes.lastName, 1)}}",
4 "id": "{{get(user.attributes.email, 1)}}"
5}

{
"email": "{{get(user.attributes.email, 1)}}",
"name": "{{get(user.attributes.firstName, 1)}}{{get(user.attributes.lastName, 1)}}",
"id": "{{get(user.attributes.email, 1)}}"
}
/\*\*
\* Reset the text fill color so that placeholder is visible
\*/
.npm\_\_react-simple-code-editor\_\_textarea:empty {
-webkit-text-fill-color: inherit !important;
}
/\*\*
\* Hack to apply on some CSS on IE10 and IE11
\*/
@media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
/\*\*
\* IE doesn't support '-webkit-text-fill-color'
\* So we use 'color: transparent' to make the text transparent on IE
\* Unlike other browsers, it doesn't affect caret color in IE
\*/
.npm\_\_react-simple-code-editor\_\_textarea {
color: transparent !important;
}
.npm\_\_react-simple-code-editor\_\_textarea::selection {
background-color: #accef7 !important;
color: transparent !important;
}
}

﻿

Optional: It is a good practice to validate the JSON string in IML Resolve to ensure it is correct. You can use the [JSONLint](https://jsonlint.com/ "JSONLint") website to perform this validation.

7

Enter the following additional information:

**Allows Unencrypted Assertions**: No

**Allow Unsigned Responses**: No

**Sign Requests**: Yes

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/VWZT_sa_zTOmbwdrcTeTq-20251015-093124.png "Document image")

﻿

## Service provider initiated SSO

1

Go to [make.com](https://make.com "make.com").

2

Click **Sign in with SSO**.

3

Enter the namespace you chose for your organization.

4

Log in using your Microsoft credentials and consent to Make﻿'s access to your user data.

﻿

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

Single Sign-on](/single-sign-on "Single Sign-on")[NEXT

MS Azure AD OIDC](/ms-azure-ad-oidc "MS Azure AD OIDC")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

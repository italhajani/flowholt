# MS Azure AD SAML - Help Center

Source: https://help.make.com/ms-azure-ad-saml
Lastmod: 2026-04-08T14:40:14.779Z
Description: Configure SAML single sign-on with Microsoft Azure AD to authenticate organization users.
Your organization

Access management

# MS Azure AD SAML

8 min

This feature is available to Enterprise customers.

The following manual configuration creates an SAML SSO configuration for your Enterprise organization.

## Prerequisites

* Owner role in an Enterprise organization

* Administrative access to your organization's Microsoft Azure AD portal

## Supported features

This configuration supports the following:

* Service provider initiated SSO

* Single Log Out [optional]

## Configuration steps

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

Copy the **Redirect URL** and save it in a safe place. You will use this later when you create your SAML integration in the Microsoft Azure AD portal.

### Create an SAML application in the MS Azure portal

1

Log in to the [Microsoft Azure portal](https://azure.microsoft.com/en-in/ "Microsoft Azure portal") and navigate to the Azure Active Directory.

![MS Azure portal](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-tD6CsOpNFHk6XV8ajr8R5-20250212-104942.png?format=webp "MS Azure portal")

﻿

2

In the left navigation, click **Enterprise applications.**

![MS Azure Enterprise applications](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-plGd2Ny-t1DL-eWQw36Ui-20250212-105215.png?format=webp "MS Azure Enterprise applications")

﻿

3

Click **+ New Application**.

4

Click **+ Create your own application**.

5

Enter a name for your app and select **Integrate any other application you don't find in the gallery**.

![Create your own application](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-z-mCMqhk94EWS1ILQMWDt-20250212-112508.png?format=webp "Create your own application")

﻿

6

Click **Create**.

7

In the left navigation, click **Single Sign-on.**

![Single sign-on](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-E67JElULE2PkIdKkr6OH5-20250212-112942.png?format=webp "Single sign-on")

﻿

8

Click **SAML**.

9

Configure your Basic SAML settings using the Redirect URL (https://www.make.com/sso/saml/{namespace}) that you copied in the [the steps above](/ms-azure-ad-saml#create-your-namespace-in-make)﻿.

| **Field** | **Value** |
| --- | --- |
| Entity ID | https://www.make.com/sso/saml/{namespace}/metadata.xml |
| Reply URL | https://www.make.com/sso/saml/{namespace} |
| Logout URL | https://www.make.com/sso/saml/{namespace} |

![Basic SAML configuration](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-g_AKMUUHfRcYX4h00TJ_q-20250212-113753.png?format=webp "Basic SAML configuration")

﻿

10

In the **Attributes & Claims** section, click **Edit** to rename your attributes.

![Attributes and claims](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-4rtj_xdWWkHSkmGVus4zP-20250212-114014.png?format=webp "Attributes and claims")

﻿

11

Under **Additional claims**, find the value you want to edit and click that row.

12

Enter the new name in the Name field. Use the following chart to find the names required for your IML resolve.

| **Field** | **Value** |
| --- | --- |
| email | user.mail |
| name | user.displayname |
| id | user.userprincipalname |
| Unique User Identifier | user.userprincipalname |

13

Click **Save**.

14

Copy the **Login URL** and save it in a safe place.

![Login and logout URL](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-ASoASMJC8M9JVykO29Ihk-20250212-114639.png?format=webp "Login and logout URL")

﻿

### Download the SAML certificate

You need to download the base 64 SAML certificate from Microsoft Azure and upload it to the **Identity Provider Certificate** field of the **SSO** tab in your Make﻿ organization.

1

Find the **SAML Certificates** section of your single sign-on settings in the Microsoft Azure portal.

2

Next to **Certificate (Base64)**, click **Download**.

Your browser automatically downloads the .cer file.

### Update the SSO in Make

1

Click **Organization** in the left sidebar.

2

Click the **SSO** tab.

3

Under **Identity Provider Certificate**, click **Extract**. A pop-up appears.

4

Under **P12, PFX or PEM file**, click **Choose file** and select the .cer file you downloaded.

5

Enter the following information from MS Azure into the **IdP login URL** and **Identify provider certificate** fields.

| **Field** | **Value to enter from MS Azure** |
| --- | --- |
| IdP login URL | Login URL |
| Identity provider certificate | Certificate (Base 64) |

6

Enter the following in the **Login IML resolve** field:

JS

1{
2 "email":"{{get(user.attributes.email, 1)}}",
3 "name":"{{get(user.attributes.firstName, 1)}} {{get(user.attributes.lastName, 1)}}",
4 "id":"{{user.name\_id}}"
5}

{
"email":"{{get(user.attributes.email, 1)}}",
"name":"{{get(user.attributes.firstName, 1)}} {{get(user.attributes.lastName, 1)}}",
"id":"{{user.name\_id}}"
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

7

Select the following settings:

| **Field** | **Value** |
| --- | --- |
| Allow Unencrypted Assertions | Yes |
| Allow Unsigned Responses | No |
| Sign Requests | Yes |

![SSO Settings](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-3yxio08te9esClNkt-wjX-20250212-120230.png?format=webp "SSO Settings")

﻿

8

Click **Save**.

You will receive an email with the subject "Activation complete: SSO ready for your organization" upon successful activation. If you encounter any issues while logging in using SSO, disable SSO using the "one-time link" (valid for 24 hours).

﻿

## Service Provider initiated SSO

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

MS Azure AD OIDC](/ms-azure-ad-oidc "MS Azure AD OIDC")[NEXT

Okta SAML](/okta-saml "Okta SAML")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

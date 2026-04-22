# MS Azure AD OIDC - Help Center

Source: https://help.make.com/ms-azure-ad-oidc
Lastmod: 2026-04-08T14:40:16.442Z
Description: Configure OIDC single sign-on with Microsoft Azure AD to authenticate organization users.
Your organization

Access management

# MS Azure AD OIDC

11 min

This feature is available to Enterprise customers.

The following manual configuration creates an OIDC SSO configuration for your Enterprise organization.

## Prerequisites

* Owner or admin role in an Enterprise organization

* Administrative access to your organization's Microsoft Azure AD portal

## Supported features

This configuration supports the following:

* Service provider initiated SSO

* Single Log Out [optional]

## Configuration steps

Before configuring SSO, you need to assign a namespace and make files of your service provider certificate and private key. These steps provide the information you need to enter later.

### Create your namespace in Make

1

Click **Organization** in the left sidebar.

2

Click the **SSO** tab.

3

Under **Namespace**, enter the namespace you want for your organization. For example, acmecorp. Your organization members enter this namespace when they log in via SSO.

4

Under **SSO type**, select **Oauth2**.

5

Copy the **Redirect URL** and save it in a safe place. You will use this later when you create your SAML integration in the Microsoft Azure AD portal.

### Create an OIDC application in the MS Azure portal

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

Enter a name for your app and select **Register an application to integrate with Azure AD (App your're developing)**.

6

Click **Create**.

7

Enter and select the following:

| **Field on the Register an application page** | **Required information** |
| --- | --- |
| Name | Enter a name for your OIDC SSO app. |
| Supported account types | Select the optoin that is best for your user case.  For example, use **Accounts in this organizational directory** only if your application is only for internal use within your organization. |
| Redirect URI (optional) | Although Microsoft marks this field as optional, successful implementation with Make﻿ requires the following:  Select a platform - Web - https://next.integromat.com/sso/login |

﻿

8

Click **Register**.

### Create your client credentials in the MS Azure portal

1

In the Microsoft Azure AD portal go to **Home > Enterprise applications > {your OIDC app} > Single Sign-on** and click **Go to application**.

2

Under **Essentials**, find **Application (client) ID**. Copy this value and save it in a secure place. This is the required information for the **Client ID** field in your Make SSO configuration.

3

In the left navigation under **Manage**, click **Certificates & secrets**.

4

Click **+ New client secret**.

5

In the new dialog box, enter a short description and click **Add**.

6

Find the new client secret on the list. Copy the **Value** and save it in a secure place. This is the required information for the **Client secret** field in your Make SSO configuration.

### Configure tokens and optional claims in the MS Azure portal

1

In the left navigation under **Manage**, click **Token Configuration**.

2

Click **+ Optional claim**.

3

In the new dialog box, select **ID**.

4

A list appears. Select **Email**.

### Add API permissions in the MS Azure portal

1

In the left navigation under **Manage**, click **API Permissions**.

2

Click **+ Add permission**.

3

In the new dialog box, click **Microsoft Graph**.

4

Click **Application permissions**.

5

Use the search bar to find User.Read.All.

6

Select User.Read.All and click **Add permissions**.

### Add users to your application in the MS Azure portal

To provide access to your organization members, you need to add these users to your app in the MS Azure portal.

1

In the Microsoft Azure AD portal go to **Home > Enterprise applications > {your OIDC app}**.

2

Click **Users and groups**.

3

Click **+ Add user/group** to add the users you want to access your Make﻿ organization.

### Update the SSO in Make

1

Click **Organization** in the left sidebar.

2

Click the **SSO** tab.

3

Enter the following information:

| **Field** | **Value** |
| --- | --- |
| User information URL | https://graph.microsoft.com/v1.0/me |
| Client ID | Enter the **Application (client) ID** you copied in step 2 of [how to create your client credentials](/ms-azure-ad-oidc#create-your-client-credentials-in-the-ms-azure-por)﻿**.** |
| Token URL | https://login.microsoftonline.com/1234etc/oauth2/v2.0/token |
| Login scopes | User.Read.All |
| Scopes separator | Enter a single space. |
| Authorize URL | To find your Authorize URL:  1. In the MS Azure portal, go to **Home > Enterprise applications > {your OIDC app} > Single Sign-on** and click **Go to application.**  2. Click **Endpoints**. A window appears.  3. Find **OAuth 2.0 authorization endpoint (v1)**. Copy and paste this URL into your Make﻿ configuration. |
| Client secret | Enter the **Value** you copied in step 6 of [how to create your client credentials](/ms-azure-ad-oidc#create-your-client-credentials-in-the-ms-azure-por)﻿**.** |
| User infomration IML resolve | {"id":"{{id}}","email":"{{mail}}","name":"{{givenName}}"} |
| Redirect URL | No action required |
| Team provisioning for new users | Select an option based on your needs. |

4

Click **Save**.

You will receive an email with the subject "Activation complete: SSO ready for your organization" upon successful activation. If you encounter any issues while logging in using SSO, disable SSO using the "one-time link" (valid for 24 hours).

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

Google SAML](/google-saml "Google SAML")[NEXT

MS Azure AD SAML](/ms-azure-ad-saml "MS Azure AD SAML")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

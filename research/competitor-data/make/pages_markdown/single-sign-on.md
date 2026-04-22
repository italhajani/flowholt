# Single Sign-on - Help Center

Source: https://help.make.com/single-sign-on
Lastmod: 2026-04-08T14:40:14.466Z
Description: Set up single sign-on with your identity provider to authenticate users with OIDC or SAML 2.0.
Your organization

Access management

# Single Sign-on

6 min

This feature is available to Enterprise customers.

Single sign-on (SSO) allows you to use your own provider of user account management, authentication, and authorization services to register and log in to Make﻿ .

﻿Make﻿ supports the following protocols:

* Open ID Connect (OIDC)

* SAML 2

﻿Make﻿ supports the following identity providers (IdPs):

* Okta ([SAML](/okta-saml)﻿)

* Microsoft AD ([SAML](/ms-azure-ad-saml)﻿ [OIDC](/ms-azure-ad-oidc)﻿)

* Google ([SAML](/google-saml)﻿)

You configure SSO for each of your organizations separately.

You can prevent your organization members from accidentally creating their own self-service accounts by [claiming a domain](/domain-claim)﻿. After you set up SSO, claim your email domain so Make﻿ can recognize your new users. Any new user who signs in with your claimed email domain gets a prompt to use SSO.

## Enable single sign-on using Open ID Connect (OIDC) and SAML 2.0

Double-check your SSO configuration before you click **Save** on the SSO settings page. When you click **Save**, Make﻿ enables SSO with the settings you provided. You will be logged out immediately. You won't be able to log in with your Make﻿ credentials anymore.

1

Click **Organization** in the left sidebar.

2

Click the **SSO** tab.

3

Click **SSO configuration**.

4

Enter a **Namespace**. You can enter any text that describes your organization. Users will need to enter your organization's namespace on the SSO login page. Namespace must include only lowercase characters and dashes. An underscore may lead to errors.

5

Select an **SSO type**.

6

Fill in the protocol-specific information as described in either the [Open ID Connect](/single-sign-on#r65PQ)﻿ or [SAML](/single-sign-on#saml-20-settings) ﻿ section of this article.

7

Under **Team provisioning for new user**, select which teams new users who log in will become members of. You can choose to not add new users to any team.

![Team provisioning for new users](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/zc3h_EYdANFkNQbYFIwFU_uuid-a1eca43f-73b3-d12c-9f8e-b36bc3a87253.png?format=webp "Team provisioning for new users")

﻿

8

Click **Save**.

﻿Make﻿ enables SSO with the settings you provided and logs you out immediately. You can now log in with your SSO provider credentials. At the same time, you receive an email with a one-time link, which you can click to disable SSO.

When logging in using SSO for the first time, you must use an account that is the owner of the organization and has the same email address as the account that you used to configure SSO. Make sure that you assign the same email address to the user in your identity provider.

### Open ID Connect (OAuth 2.0 settings)

The following fields appear once you select OAuth 2.0 from the SSO menu:

| **Field** | **Required** | **Description** |
| --- | --- | --- |
| User Information URL | required | URL obtained from your identity provider.  Example: https://example.com/oauth2/v1/userinfo |
| Client ID | required | Obtained from your identity provider. Sometimes called Application ID. |
| Token URL | required | URL obtained from your identity provider.  Example: https://example.com/oauth2/v1/token |
| Login scopes | optional | Parameters used when accessing your identity provider. |
| Scopes separator | optional | The character used between scopes, such as a space or a comma. If your separator is a space, use the spacebar on your keyboard. |
| Authorize URL | required | URL obtained from your identity provider.  Example: https://example.com/oauth2/v1/authorize |
| Client secret | required | Obtained from your identity provider. |
| IML resolve | required | Because both Make and your Identity provider use attributes such as username and email, you need to [map these attributes using IML](/single-sign-on#create-and-enter-login-iml-resolve)﻿.  For Open ID Connect:  {"id":"{{sub}}","email":"{{email}}","name":"{{name}}"} |
| Redirect URL | optional | The location where the identity provider sends the user once successfully authorized and granted access. Must be unique to your application/instance. |

﻿

### SAML 2.0 settings

The following fields appear once you select SAML 2.0 from the SSO menu:

| **Field** | **Required** | **Description** |
| --- | --- | --- |
| Service provider certificate | required | Make provides certificates for you. Click the down arrow to copy or download a .pem file of your certificate.  At least one certificate must be active. If there is no active certificate, click **Activate**.  For more information, see our article on [SAML certificate management](/saml-certificate-management)﻿. |
| Identity provider certificate | required | An x.509 certificate created and stored by your IdP, for example, Google, Okta, or Microsoft Azure Directory. You can enter this information in the following ways:  * Copy and paste from your IdP's UI.  * Copy and paste from your IdP's metadata XML file.  * Extract from any of the following:  * P12  * PFX  * PEM |
| IdP login URL | required | Also called an authorization URL. The IdP login URL is available from your IdP, for example, Google, or Okta. The IdP metadata typically contains this information in XML. The IdP metadata is usually downloadable from your Identity provider. |
| IdP logout URL | optional | A URL created by your IdP to enable Single Log Out (SLO). Leave this field empty to disable SLO. |
| Login IML resolve | required | Because both Make and your Identity provider use attributes such as username and email, you need to [map these attributes using IML](/single-sign-on#create-and-enter-login-iml-resolve)﻿. |
| Redirect URL | optional | The location where the identity provider sends the user once successfully authorized and granted access. Must be unique to your application/instance. |
| Allow unencrypted assertions | optional | Your IdP may not support SAML 2.0 assertions with encryption. Check with your IdP to determine whether you need to enable this option. |
| Allow unsigned responses | optional | Your IdP may not support a signed SAML 2.0 response. Check with your IdP to determine whether you need to enable this option. |
| Sign requests | optional | Your IdP may require a signed SAML 2.0 response. Check with your IdP to determine whether you need to enable this option. |
| Audience | optional | Optional field to define the intended target. Typically this is a URL but can also be formatted as any string of data. |
| Audience URI | optional | This read-only field provides you with the path for metadata.xml file. This information might be needed to set up the SAML settings on the SSO provider side. |

### SAML certificate rotation

For more information on rotating your service provider certificate, see our article on [SAML certificate management](/saml-certificate-management)﻿.

### Create and enter Login IML resolve

To support a broad choice of identity providers (IdPs), Make﻿ lets you map values related to identifying users. The IML resolve maps the values from your IdP to Make﻿'s internal values by using IML, a JavaScript-based function notation. Your IML resolve must be specific to your IdP. You must map the following properties:

| **Property** | **Description** |
| --- | --- |
| email | You can map this to any valid email.  Aliases and alternate email suffixes can create problems. Be sure to map the most appropriate email in your IML resolve. |
| name | Used as the user's name in the application.  You can reuse email for this property.  If left blank, creates a user without a name that must be updated later. |
| id | External user ID  Can be an integer or string but must be mapped to an identifier. |

In the following example, the resolve maps the following values:

| **Make** | **Your IdP** |
| --- | --- |
| email | user.attribute.email |
| name | user.attributes.firstName and user.attributes.last  concatenated together |
| id | user.name\_id |

Javascript

1{
2 "email":"{{get(user.attributes.email, 1)}}",
3 "name":"{{get(user.attributes.firstName, 1)}} {{get(user.attributes.last}}
4 "id":"{{user.name\_id}}"
5}

{
"email":"{{get(user.attributes.email, 1)}}",
"name":"{{get(user.attributes.firstName, 1)}} {{get(user.attributes.last}}
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

## Log in using SSO

When Make﻿ is configured to use SSO, users don't use the default sign-in form. Instead, they use the dedicated SSO sign-in options.

1. Go to [https://www.make.com/en/login](https://www.make.com/en/login "https://www.make.com/en/login")﻿

2. Click **Sign in with SSO**.

3. Enter the namespace you chose for your organization.

4. Log in using your identity provider and consent to Make﻿'s access to your user data.

The user is now logged in. If the user was not assigned to your organization before, the system creates a new user account for them and assigns them to the selected default team.

If a user with the same email address already existed in the organization before you configure SSO, they will not have access to the organization's data. To solve this, delete the user from the organization and ask them to log in again using SSO.

﻿

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

Access management](/access-management "Access management")[NEXT

Google SAML](/google-saml "Google SAML")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

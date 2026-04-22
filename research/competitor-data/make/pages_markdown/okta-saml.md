# Okta SAML - Help Center

Source: https://help.make.com/okta-saml
Lastmod: 2026-04-08T14:40:15.638Z
Description: Set up SAML SSO for Enterprise organizations.
Your organization

Access management

# Okta SAML

7 min

This feature is available to Enterprise customers.

The following manual configuration creates an SAML SSO configuration for your Enterprise organization.

## Prerequisites

* Owner role in an Enterprise organization

* Okta account with admin access

## Supported features

This configuration supports the following:

* Service Provider initiated SSO

* Single Log Out [optional]

## Configuration steps

Before configuring SSO, you need to assign a namespace and create a Service Provider certificate and private key. These important steps provide information you need to enter later.

### Create your namespace

1

Click **Organization** in the left sidebar.

2

Click the **SSO** tab.

3

Under **Namespace**, enter the namespace you want for your organization. For example, acmecorp. Your organization members enter this namespace when they log in via SSO.

4

Under **SSO type**, select **SAML 2.0**.

5

Copy the **Redirect URL** and save it in a safe place. You will use this later when you create your SAML integration in Okta.

### Download your Make Service Provider certificate

1

Click **Organization** in the left sidebar.

2

Click the **SSO** tab.

3

Scroll down to find **Service Provider Certificates**.

4

Find your new certificate. Refer to the **Valid from** and **Expires** dates if you are unsure.

5

On the right side of the row for your certificate, click the icon.

6

Select **Download**.

Your browser downloads your SP certificate as a .pem file. You can find it in your downloads folder.

### Create an SAML integration

1

Log in to Okta and go to **Applications > Applications**.

![Okta - Applications](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-Z4pJ5QzVF8vN-HhMSCek4-20250210-120304.png?format=webp "Okta - Applications")

﻿

2

Click **Create App Integration**.

![Okta - Create App Integration](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-vjKb8zeRXvjjIOTDQWezs-20250210-120518.png?format=webp "Okta - Create App Integration")

﻿

3

Select **SAML 2.0** in the popup winder and click **Next**.

![Okta - SAML 2.0](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-YM-UtsSzf3VUED6AxqZrL-20250210-120611.png?format=webp "Okta - SAML 2.0")

﻿

4

In the **General Settings** tab, name your app and upload your icon.

![General Settings](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-Ccy4xYwXpFlMwZjqtLvpL-20250210-135617.png?format=webp "General Settings")

﻿

5

Click **Next**.

6

In the **Configure SAML** tab, enter the Single sign-on URL that you copied in the steps to [create your namespace](/okta-saml#create-your-namespace)﻿ above.

![SAML single sign on settings](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-hinxEv_xzreJUvGVmUZrD-20250210-134944.png?format=webp "SAML single sign on settings")

﻿

7

Enter the Audience URI (SP Enttity ID) as https://www.make.com/sso/saml/{{namespace}}/metadata.xml.

8

Keep the **Default Relay State** blank.

9

Enter the following information:

| **Field** | **Value** |
| --- | --- |
| Name ID format | EmailAddress |
| Application Username | Okta username |
| Update application username on | Create and update |

﻿

10

Click **Show Advanced Settings**.

11

Verify that all of the information provided matches the following:

![Advanced settings](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-peiF1UzXhPIWrbB3jqDm7-20250210-124821.png?format=webp "Advanced settings")

﻿

Set **Assertion Encryption** to **Encrypted**. For the Signature Certificate field, upload the Make﻿ [Service Provider Certificate](/okta-saml#download-your-make-service-provider-certificate)﻿ you downloaded above.

12

Under **Attibute Statements (optional)**, add the attribute as shown in the image and click **Next** to save.

![optional attributes](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-SiQbDIa-JShNXnnDKXv5I-20250210-130651.png?format=webp "optional attributes")

﻿

13

Select the following options and click **Finish**.

![Okta saml final steps](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-O8awu-iFAcJ71R18K-B_r-20250210-130411.png?format=webp "Okta saml final steps")

﻿

14

Assign people to your Make﻿ application under the **Assignments** tab in Okta.

15

Under the **Sign On** tab in Okta, view the SAML setup instructions.

16

Copy the **Identity Provider Single Sign-On URL** and the **Identify provider certficate** and save them in a safe place.

17

In Make﻿, under **Organization > SSO**, update the **IdP log URL** field and the **Identify provider certficate** field with the information obtained in Okta in step 16.

18

Enter the following in the **Login IML resolve** field:

Text

1{"email":"{{get(user.attributes.email, 1)}}","name":"{{get(user.attributes.profileFirstName, 1)}}{{get(user.attributes.profileLastName, 1)}}","id":"{{user.name\_id}}"}

{"email":"{{get(user.attributes.email, 1)}}","name":"{{get(user.attributes.profileFirstName, 1)}}{{get(user.attributes.profileLastName, 1)}}","id":"{{user.name\_id}}"}
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

19

Set:

* **Allow Unecrypted Assertions** to **No**

* **Allow Unsigned Responses** to **No**

* **Sign Requests** to **Yes**

20

Select the team and **Save**.

Once saved, the page will reload. Sign out.

You will receive an email with the subject **Activation complete: SSO ready for your organization** upon successful activation. If you encounter any issues while logging in using SSO, disable SSO using the "one-time link" (valid for 24 hours).

## Service Provider initiated SSO

1. Go to [make.com](https://make.com "make.com").

2. Click **Sign in with SSO**.

3. Enter the namespace you chose for your organization.

4. Log in using your Okta credentials and consent to Make﻿'s access to your user data.

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

MS Azure AD SAML](/ms-azure-ad-saml "MS Azure AD SAML")[NEXT

SAML certificate management](/saml-certificate-management "SAML certificate management")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

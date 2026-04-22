# SAML certificate management - Help Center

Source: https://help.make.com/saml-certificate-management
Lastmod: 2026-01-16T15:02:41.971Z
Description: Manage Enterprise SP certificates to ensure secure SSO and prevent login failures.
Your organization

Access management

# SAML certificate management

8 min

This feature is available to Enterprise customers.

The SSO setup page lets you manage your service provider (SP) certificates. You can activate, deactivate, copy, or download your SP certificates.

﻿Make﻿ provides a new certificate when your active SP certificate is close to expiring. Email notifications let you know when it's time to rotate your certificates.

## Rotate service provider certificates

To maintain the security of your SSO setup, Make﻿ supports service provider (SP) certificate rotation on a three-year basis. When your SP certificate is 90 days from expiring, Make﻿ provides a new certificate and sends you an email. Rotate your certificate before it expires to avoid login failure. You can see when your certificate expires by looking under the **Expires** column of the **Service Provider Certificates** section of your SSO setup.

You can activate your new certificate and copy or download it with the following steps:

1

Click **Organization** in the left sidebar.

2

Click the **SSO** tab.

3

Under **SSO configuration**, find your **Service Provider Certificates**.

4

Find your new certificate. Refer to the **Valid from** and **Expires** dates if you are unsure.

5

On the right side of the row for your new certificate, click **Activate**.

6

Next to **Activate**, click the icon to download or copy your certificate, depending on how you need to enter your certificates with your identity provider.

7

Go to your identity provider and update your service provider certificate. If you use Okta, refer to our [Okta SAML page](/okta-saml)﻿ for details.

If you have more than one active certificate, Make﻿ deactivates the certificate that expires first. You can check the **Expires** column to see when your certificates expire.

Only click **Save** if you make other changes to your setup. Clicking **Save**:

* is not required to activate and rotate your certificate.

* immediately logs out all organization members.

## Activate a certificate

You can see which certificates are active by looking in the **Status** column.

Active means the certificate is in use in your SAML SSO configuration. No further action required.

Inactive means the certificate is not used in your SAML SSO configuration. Make﻿ automatically deactivates certificates that expire as long as you have another valid active certificate.

1

Click **Organization** in the left sidebar.

2

Click the **SSO** tab.

3

Under **SSO configuration**, find your **Service Provider Certificates**.

4

Find the certificate in the list.

5

Under **Actions**, click **Activate**.

6

A popup asks you to confirm activation. Click **Activate**.

Only click **Save** if you make other changes to your setup. Clicking **Save**:

* is not required to activate your certificate.

* immediately logs out all organization members.

## Deactivate a certificate

You can only deactivate a certificate if there is another active certificate. This prevents accidental deactivation of your only active certificate. At least once certificate must be active.

If you have more than one active certificate, Make﻿ deactivates the older certificate for you when it expires. Don't worry, Make﻿ won't deactivate your only active certificate.

1

Click **Organization** in the left sidebar.

2

Click the **SSO** tab.

3

Under **SSO configuration**, find your **Service Provider Certificates**.

4

Find the certificate in the list.

5

Under **Actions**, click **Deactivate**.

## Copy a certificate

If your identity provider (IdP) lets you paste your service provider (SP) certificates into your setup, you can copy your SP certificate into your clipboard.

1

Click **Organization** in the left sidebar.

2

Click the **SSO** tab.

3

Under **SSO configuration**, find your **Service Provider Certificates**.

4

Find the certificate in the list.

5

On the right side of the row for your certificate, click the icon.

6

Select **Copy**.

Your SP certificate is copied to your clipboard and ready to paste into your IdP setup.

## Download a certificate

If your identity provider (IdP) lets you upload your service provider (SP) certificates into your setup, you can download your SP certificate as a .pem file.

1

Click **Organization** in the left sidebar.

2

Click the **SSO** tab.

3

Under **SSO configuration**, find your **Service Provider Certificates**.

4

Find the certificate in the list.

5

On the right side of the row for your certificate, click the icon.

6

Select **Download**.

Your browser downloads your SP certificate as a .pem file. You can find it in your downloads folder.

Updated 16 Jan 2026

Did this page help you?

Yes

No

[PREVIOUS

Okta SAML](/okta-saml "Okta SAML")[NEXT

Domain claim](/domain-claim "Domain claim")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

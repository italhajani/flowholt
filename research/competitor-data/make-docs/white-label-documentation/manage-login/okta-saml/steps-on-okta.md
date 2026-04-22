---
title: "Steps on Okta | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/manage-login/okta-saml/steps-on-okta
scraped_at: 2026-04-21T12:45:47.923440Z
---

1. Manage login chevron-right
2. Okta SAML

# Steps on Okta

1. Log in to Okta and go to Admin > Applications > Applications .
2. Click Create app integration and select SAML 2.0 .
3. Name your app and upload your icon.
4. Click Next .
5. Configure the following SAML settings including:

Log in to Okta and go to Admin > Applications > Applications .

Click Create app integration and select SAML 2.0 .

Name your app and upload your icon.

Click Next .

Configure the following SAML settings including:

Single sign-on URL

24.0.6

Audience URI (SP Entity ID)

1.28

Default RelayState

Leave this field blank

Name ID format

Select EmailAddress

Application username

Select Okta username

Update application username on

Select Create and update

1. Click Show advanced settings and enter the following:

Click Show advanced settings and enter the following:

Response

Select Signed

Assertion signature

Select Signed

Signature algorithm

Select RSA-SHA256

Digest algorithm

Select SHA256

Assertion encryption

Select Unencrypted

Optional:

If you want to encrypt assertions, you can select Encrypted and enter the following:

- Encryption algorithm : AES256-CBC
- Key transport algorithm : RSA-OAEP
- Encryption certificate : Upload the .pem file you created earlier.

Encryption algorithm : AES256-CBC

Key transport algorithm : RSA-OAEP

Encryption certificate : Upload the .pem file you created earlier.

```
.pem
```

Signature certificate

Upload a .pem file of the Service Provider Certificate. You need to also upload this to the Service Provider Certificate field of your Make SSO configuration tab. These two certificates must be the same for your SSO implementation to work successfully.

```
.pem
```

Enable Single Logout

Leave unchecked

Signed requests

Optional

Other requestable SSO URLs

Optional

Assertion inline hook

Select None (disable)

Authentication context class

Select PasswordProtectedTransport

Honor force authentication

Select Yes

SAML issuer ID

http://www.okta.com/${org.externalKey}

1. Enter the following attributes and click Next .

Enter the following attributes and click Next .

profileFirstName

Unspecified

24.0.6

profileLastName

Unspecified

1.28

email

Unspecified

user.email

1. In the Are you a customer or partner? field, select I'm an Okta customer adding an internal app.
2. In the App type field, select This is an internal app that we have created
3. Click Finish.

In the Are you a customer or partner? field, select I'm an Okta customer adding an internal app.

In the App type field, select This is an internal app that we have created

Click Finish.

### hashtag To locate your IdP login URL and certificate:

1. Go to Admin > Applications > Applications and select your SAML SSO app. to access the necessary information.
2. Go to the Sign on tab and click View SAML setup instructions.

Go to Admin > Applications > Applications and select your SAML SSO app. to access the necessary information.

Go to the Sign on tab and click View SAML setup instructions.

Last updated 5 months ago

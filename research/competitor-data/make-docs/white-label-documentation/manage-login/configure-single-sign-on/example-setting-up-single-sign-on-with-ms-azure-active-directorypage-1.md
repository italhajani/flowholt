---
title: "Example: Setting up single sign-on with MS Azure Active DirectoryPage 1 | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/manage-login/configure-single-sign-on/example-setting-up-single-sign-on-with-ms-azure-active-directorypage-1
scraped_at: 2026-04-21T12:42:56.394469Z
---

1. Manage login chevron-right
2. Configure Single Sign-on

# Example: Setting up single sign-on with MS Azure Active DirectoryPage 1

Microsoft Azure supports both OAuth 2.0 and SAML 2. Perform the following steps to connect Make with Azure Active Directory.

### hashtag OAuth 2.0

1. Log in to your Azure Portal and open Azure Active Directory.
2. Open App registrations and click New registration .
3. Give the registration a name.
4. Fill in the Redirect URL. Find the Redirect URL In Make > Organization > Settings after you select an SSO type.
5. Click Register .
6. Note down the Application (client) ID. Paste this ID into your Make settings.
7. Go to Certificates and secrets and click New client secret . Paste the secret value into your Make settings.
8. Go to Overview and click Endpoints . Paste the OAuth 2.0 authorization endpoint (v2) into the Authorize URL field in Make settings. Paste the OAuth 2.0 token endpoint (v2) into the Token URL field in Make settings.
9. Paste the following into the User information URL in Make settings. https://graph.microsoft.com/v1.0/me arrow-up-right
10. In Make, set up Login scopes and Scopes separator: Login scopes: openid , profile , email Scopes separator: space
11. In Make, paste the following into User information IML resolve. This tells Make how to map user information received from Azure to information in Make database. {"id":"{{id}}","email":"{{mail}}"}

Log in to your Azure Portal and open Azure Active Directory.

Open App registrations and click New registration .

Give the registration a name.

Fill in the Redirect URL.

- Find the Redirect URL In Make > Organization > Settings after you select an SSO type.

Find the Redirect URL In Make > Organization > Settings after you select an SSO type.

Click Register .

Note down the Application (client) ID.

- Paste this ID into your Make settings.

Paste this ID into your Make settings.

Go to Certificates and secrets and click New client secret .

- Paste the secret value into your Make settings.

Paste the secret value into your Make settings.

Go to Overview and click Endpoints .

- Paste the OAuth 2.0 authorization endpoint (v2) into the Authorize URL field in Make settings.
- Paste the OAuth 2.0 token endpoint (v2) into the Token URL field in Make settings.

Paste the OAuth 2.0 authorization endpoint (v2) into the Authorize URL field in Make settings.

Paste the OAuth 2.0 token endpoint (v2) into the Token URL field in Make settings.

Paste the following into the User information URL in Make settings.

- https://graph.microsoft.com/v1.0/me arrow-up-right

https://graph.microsoft.com/v1.0/me arrow-up-right

In Make, set up Login scopes and Scopes separator:

- Login scopes: openid , profile , email
- Scopes separator: space

Login scopes: openid , profile , email

```
openid
```

```
profile
```

```
email
```

Scopes separator: space

In Make, paste the following into User information IML resolve. This tells Make how to map user information received from Azure to information in Make database.

- {"id":"{{id}}","email":"{{mail}}"}

{"id":"{{id}}","email":"{{mail}}"}

```
{"id":"{{id}}","email":"{{mail}}"}
```

Last updated 1 year ago

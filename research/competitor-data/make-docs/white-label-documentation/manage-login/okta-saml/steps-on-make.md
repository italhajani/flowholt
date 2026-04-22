---
title: "Steps on Make | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/manage-login/okta-saml/steps-on-make
scraped_at: 2026-04-21T12:45:47.281665Z
---

1. Manage login chevron-right
2. Okta SAML

# Steps on Make

1. Go to Organization > SSO .
2. Enter the following information from Okta into the IdP login URL and Identity provider certificate fields.

Go to Organization > SSO .

Enter the following information from Okta into the IdP login URL and Identity provider certificate fields.

```
{"email":"{{get(user.attributes.email, 1)}}","name":"{{get(user.attributes.profileFirstName, 1)}}{{get(user.attributes.profileLastName, 1)}}","id":"{{user.name_id}}"}
```

1. In the Allow unencrypted assertions , select Yes .
2. In the Allow unsigned responses , select No .
3. To allow the Sign requests , select Yes .
4. Click Save .

In the Allow unencrypted assertions , select Yes .

In the Allow unsigned responses , select No .

To allow the Sign requests , select Yes .

Click Save .

Last updated 1 year ago

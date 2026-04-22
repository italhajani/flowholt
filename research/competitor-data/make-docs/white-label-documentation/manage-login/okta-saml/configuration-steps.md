---
title: "Configuration steps | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/manage-login/okta-saml/configuration-steps
scraped_at: 2026-04-21T12:45:46.776476Z
---

1. Manage login chevron-right
2. Okta SAML

# Configuration steps

Before configuring SSO, you need to assign a namespace and create a service provider certificate and private key. These important steps provide information you need to enter later.

Create your namespace:

1. Go to Administration > System settings .
2. Scroll down to SSO Type .
3. Under SSO type , select SAML 2.0 .

Go to Administration > System settings .

Scroll down to SSO Type .

Under SSO type , select SAML 2.0 .

Create your service provider primary key and certificate:

1. Use openssl or similar. Mac users can use Terminal
2. Enter the following command:

Use openssl or similar. Mac users can use Terminal

Enter the following command:

openssl req -newkey rsa:2048 -new -nodes -x509 -keyout key.pem -out cert.pem

```
openssl req -newkey rsa:2048 -new -nodes -x509 -keyout key.pem -out cert.pem
```

This example creates two separate files:

- key.pem
- cert.pem

key.pem

```
key.pem
```

cert.pem

```
cert.pem
```

Locate these files and have them ready to upload later.

Last updated 1 year ago

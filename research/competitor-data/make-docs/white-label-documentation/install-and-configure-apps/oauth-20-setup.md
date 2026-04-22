---
title: "OAuth 2.0 setup | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/install-and-configure-apps/oauth-2.0-setup
scraped_at: 2026-04-21T12:42:01.984393Z
---

1. Install and configure apps

# OAuth 2.0 setup

Some apps require an OAuth 2.0 connection to function on your instance. For example, Slack and Google Sheets need OAuth 2.0 credentials to access the relevant APIs. OAuth 2.0 configuration requires the following:

- A Client ID and Client Secret from the third-party app you want on your instance. In most cases, you need a developer account with the third party to get the required credentials.
- A redirect URI . You can find the appropriate redirect URI at Administration > Native apps > {app} > Connection in the Account parameters section. The general pattern for redirect URIs is: https://{yoursubdomain}.integromat.celonis.com/oauth/cb/{app_name}
- Enabled third-party scopes. Each module requires specific scopes to access the third-party app.

A Client ID and Client Secret from the third-party app you want on your instance. In most cases, you need a developer account with the third party to get the required credentials.

A redirect URI . You can find the appropriate redirect URI at Administration > Native apps > {app} > Connection in the Account parameters section. The general pattern for redirect URIs is: https://{yoursubdomain}.integromat.celonis.com/oauth/cb/{app_name}

```
https://{yoursubdomain}.integromat.celonis.com/oauth/cb/{app_name}
```

Enabled third-party scopes. Each module requires specific scopes to access the third-party app.

There may be multiple versions of an app if there are multiple API versions. You can add any number of versions as you want.

Last updated 1 year ago

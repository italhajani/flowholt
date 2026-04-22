---
title: "Authorization | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/app-components/base/authorization
scraped_at: 2026-04-21T12:44:31.693741Z
---

1. App components chevron-right
2. Base

# Authorization

The Base section is used to set up authorization. Most services require the authorization key be sent either in headers or in the qs (query string). If you set the authorization in the base, all modules and Remote Procedure Calls (RPCs) will inherit it.

```
headers
```

```
qs
```

## hashtag Common methods of authorization

### hashtag API key in headers

```
{"headers":{"x-api-key":"{{connection.apiKey}}"}}
```

### hashtag API key in query string

```
{"qs":{"apikey":"{{connection.apiKey}}"}}
```

### hashtag OAuth 2 access token in headers

```
{"headers":{"authorization":"Bearer {{connection.accessToken}}"}}
```

Last updated 5 months ago

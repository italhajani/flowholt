---
title: "Authorization and sanitization | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/best-practices/base/authorization-and-sanitization
scraped_at: 2026-04-21T12:44:21.149560Z
---

1. Best practices chevron-right
2. Base

# Authorization and sanitization

The Base section should also have authorization and sanitization that is common for all modules. The authorization should use the API key, access token, or username and password entered in the connection. The sanitization should hide all these sensitive parameters.

```
{..."headers":{"Authorization":"Token {{connection.apiKey}}"},"log":{"sanitize":["request.headers.authorization"]}...}
```

```
{..."qs":{"access_token":"{{connection.accessToken}}"},"log":{"sanitize":["request.qs.access_token"]}...}
```

Last updated 5 months ago

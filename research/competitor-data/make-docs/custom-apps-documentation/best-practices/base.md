---
title: "Base | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/best-practices/base
scraped_at: 2026-04-21T12:41:44.530883Z
---

1. Best practices

# Base

The Base section should contain data that is common to all (or most) requests. At the minimum, it should include the root URL, the authorization headers, the error-handling section, and the sanitization.

```
{"baseUrl":"https://www.example.com/api/v1","headers":{"Authorization":"Bearer {{connection.accessToken}}"},"response":{"error":{"message":"[{{statusCode}}] {{body.error.message}} (error code: {{body.error.code}})"}},"log":{"sanitize":["request.headers.authorization"]}}
```

Last updated 5 months ago

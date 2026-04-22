---
title: "Authentication | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/authentication
scraped_at: 2026-04-21T12:40:59.682676Z
---

# Authentication

The Make API requires authentication of the API requests with your API tokens or your OAuth 2.0 connection. If your requests are not authenticated, the Make API will return an authentication error.

## hashtag Authentication token

To authenticate your API request, send your API token in the following HTTP header parameter:

```
header
```

```
Authorization:Token 12345678-12ef-abcd-1234-1234567890ab
```

The authentication token always contains information about the access to the API resources. The authentication token access is defined with API scopes. If you want to learn about Make API scopes, continue to the Make API scopes overview .

To learn how to create and manage your API token, go to the creating and management sections.

## hashtag OAuth 2.0 connection

As an alternative to using an authentication token, you can request an OAuth 2.0 connection to access resources on the Make platform. OAuth 2.0 access is defined with API scopes. To learn more about this connection type and to request access, continue to the Requesting an OAuth 2.0 client section.

Last updated 2 months ago

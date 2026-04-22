---
title: "Best practices and error handling | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/authentication/oauth-flow/best-practices-and-error-handling
scraped_at: 2026-04-21T12:41:14.990242Z
---

1. Authentication chevron-right
2. OAuth 2.0 flow in the Make API

# Best practices and error handling

### hashtag Security best practices

- Validate the state parameter to prevent CSRF attacks
- Store secrets securely (confidential clients only)
- Implement proper error handling for expired or invalid tokens

Validate the state parameter to prevent CSRF attacks

```
state
```

Store secrets securely (confidential clients only)

Implement proper error handling for expired or invalid tokens

### hashtag Common scopes

- openid : Required for OpenID Connect authentication
- Add other Make-specific scopes as needed for your application

openid : Required for OpenID Connect authentication

```
openid
```

Add other Make-specific scopes as needed for your application

### hashtag Error handling

Common error responses from the token endpoint:

invalid_request

```
invalid_request
```

Missing or invalid parameters

invalid_client

```
invalid_client
```

Invalid client credentials

invalid_grant

```
invalid_grant
```

Invalid or expired authorization code

unsupported_grant_type

```
unsupported_grant_type
```

Grant type not supported

Always check the response status and handle errors appropriately in your application.

Last updated 10 months ago

---
title: "Authorization code flow with refresh token (confidential clients) | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/authentication/oauth-flow/authorization-code-flow-with-refresh-token-confidential-clients
scraped_at: 2026-04-21T12:43:12.800842Z
---

1. Authentication chevron-right
2. OAuth 2.0 flow in the Make API

# Authorization code flow with refresh token (confidential clients)

Use this flow when: Your application can securely store a Client Secret (server-side applications).

Benefits: Provides both access tokens and refresh tokens for long-term access.

#### hashtag Redirect user for authorization

Redirect the user to the authorization endpoint:

```
GET https://www.make.com/oauth/v2/authorize
```

Required parameters:

- client_id : Your application's Client ID
- response_type : Set to code
- redirect_uri : Pre-registered callback URL
- scope : Requested permissions (include openid for OpenID Connect)
- state : Random string for CSRF protection (recommended)

client_id : Your application's Client ID

```
client_id
```

response_type : Set to code

```
response_type
```

```
code
```

redirect_uri : Pre-registered callback URL

```
redirect_uri
```

scope : Requested permissions (include openid for OpenID Connect)

```
scope
```

```
openid
```

state : Random string for CSRF protection (recommended)

```
state
```

Example URL:

```
https://www.make.com/oauth/v2/authorize?  client_id=your_client_id&  response_ty
```

#### hashtag User authorization

The user:

1. Logs into Make.com (if not already authenticated)
2. Reviews and approves the requested permissions
3. Gets redirected to your redirect_uri with an authorization code

Logs into Make.com (if not already authenticated)

Reviews and approves the requested permissions

Gets redirected to your redirect_uri with an authorization code

```
redirect_uri
```

Callback URL format:

```
https://yourapp.com/callback?code=authorization_code&state=random_state_strin
```

#### hashtag Exchange code for tokens

Make a server-side POST request to the token endpoint:

```
POST https://www.make.com/oauth/v2/token
```

Required Parameters:

- client_id : Your Client ID
- client_secret : Your Client Secret
- grant_type : Set to authorization_code
- code : Authorization code from Step 2

client_id : Your Client ID

```
client_id
```

client_secret : Your Client Secret

```
client_secret
```

grant_type : Set to authorization_code

```
grant_type
```

```
authorization_code
```

code : Authorization code from Step 2

```
code
```

Response:

```
json{"access_token":"eyJ...","refresh_token":"eyJ...","id_token":"eyJ...","token_type":"Bearer","expires_in":3600}
```

#### hashtag Refresh access token

When the access token expires, use the refresh token:

```
POST https://www.make.com/oauth/v2/token
```

Required parameters:

- client_id : Your Client ID
- client_secret : Your Client Secret
- grant_type : Set to refresh_token
- refresh_token : Refresh token from Step 3

client_id : Your Client ID

```
client_id
```

client_secret : Your Client Secret

```
client_secret
```

grant_type : Set to refresh_token

```
grant_type
```

```
refresh_token
```

refresh_token : Refresh token from Step 3

```
refresh_token
```

Last updated 10 months ago

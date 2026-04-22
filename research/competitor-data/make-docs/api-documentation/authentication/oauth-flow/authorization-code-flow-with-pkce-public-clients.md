---
title: "Authorization code flow with PKCE (public clients) | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/authentication/oauth-flow/authorization-code-flow-with-pkce-public-clients
scraped_at: 2026-04-21T12:43:14.137798Z
---

1. Authentication chevron-right
2. OAuth 2.0 flow in the Make API

# Authorization code flow with PKCE (public clients)

Use this flow when: Your application cannot securely store secrets (SPAs, mobile apps).

Note: This flow typically does not provide refresh tokens for security reasons.

#### hashtag Generate PKCE parameters

Before starting authorization, generate:

1. Code Verifier : Random string (43-128 characters)
2. Code Challenge : SHA256 hash of code_verifier, Base64url encoded (no padding)

Code Verifier : Random string (43-128 characters)

Code Challenge : SHA256 hash of code_verifier, Base64url encoded (no padding)

Example (JavaScript):

```
javascript//Generate code verifierconst codeVerifier = generateRandomString(128);// Generate code challengeconst codeChallenge = base64URLEncode(sha256(codeVerifier));
```

#### hashtag Redirect user for authorization

Redirect to the authorization endpoint with PKCE parameters:

```
GET https://www.make.com/oauth/v2/authorize
```

Required parameters:

- client_id : Your Client ID
- response_type : Set to code
- redirect_uri : Pre-registered callback URL
- scope : Requested permissions
- state : Random string for CSRF protection
- code_challenge : Generated in Step 1
- code_challenge_method : Set to S256

client_id : Your Client ID

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

scope : Requested permissions

```
scope
```

state : Random string for CSRF protection

```
state
```

code_challenge : Generated in Step 1

```
code_challenge
```

code_challenge_method : Set to S256

```
code_challenge_method
```

```
S256
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

Make a POST request (can be from frontend or backend):

```
POST https://www.make.com/oauth/v2/token
```

Required Parameters:

- client_id : Your Client ID
- grant_type : Set to authorization_code
- code : Authorization code from Step 3
- code_verifier : Original code verifier from Step 1

client_id : Your Client ID

```
client_id
```

grant_type : Set to authorization_code

```
grant_type
```

```
authorization_code
```

code : Authorization code from Step 3

```
code
```

code_verifier : Original code verifier from Step 1

```
code_verifier
```

Response:

```
json{"access_token":"eyJ...","id_token":"eyJ...","token_type":"Bearer","expires_in":3600}
```

Last updated 10 months ago

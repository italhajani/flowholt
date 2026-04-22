---
title: "OAuth 2.0 flow in the Make API | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/authentication/oauth-flow
scraped_at: 2026-04-21T12:41:13.477494Z
---

1. Authentication

# OAuth 2.0 flow in the Make API

This guide explains how to integrate Make into your application using OAuth 2.0 authorization. For general OAuth 2.0 concepts, refer to the OAuth 2.0 protocol specification arrow-up-right .

Before implementing OAuth 2.0, you must register your OAuth 2.0 client arrow-up-right with Make's authorization server to obtain:

- Client ID (required for all clients)
- Client Secret (only for confidential clients)

Client ID (required for all clients)

Client Secret (only for confidential clients)

#### hashtag Supported protocols

- OIDC (OpenID Connect) : Simplified user authentication
- PKCE (Proof Key for Code Exchange) : Enhanced security for public clients ( mandatory for SPAs and mobile apps)

OIDC (OpenID Connect) : Simplified user authentication

PKCE (Proof Key for Code Exchange) : Enhanced security for public clients ( mandatory for SPAs and mobile apps)

#### hashtag API Endpoints

Authorization

https://www.make.com/oauth/v2/authorize arrow-up-right

Token

https://www.make.com/oauth/v2/token arrow-up-right

JWKS URI

https://www.make.com/oauth/v2/oidc/jwks arrow-up-right

User info

https://www.make.com/oauth/v2/oidc/userinfo arrow-up-right

Revocation

https://www.make.com/oauth/v2/revoke arrow-up-right

OpenID discovery

https://www.make.com/.well-known/openid-configuration arrow-up-right

Last updated 4 months ago

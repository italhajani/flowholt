---
title: "Token expiration | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/authentication/oauth-flow/token-expiration
scraped_at: 2026-04-21T12:43:14.923858Z
---

1. Authentication chevron-right
2. OAuth 2.0 flow in the Make API

# Token expiration

To ensure security and support proper token rotation, the tokens issued during the OAuth flow have the following defined expiration periods:

### hashtag Access token: 5 minutes

The Access token has a short lifespan and is intended for immediate use. It is  recommended to refresh the token to obtain a new access token when the current one expires.

### hashtag Refresh token: 6 months

The Refresh token provides long-term access without requiring the user to re-authorize frequently. The Refresh token should be securely stored and used to acquire new access tokens. In case of a token leak or compromise, the Refresh token can be immediately revoked by from your user profile in the API access section.

### hashtag Authorization code: 5 minutes

The Authorization code is intended for single-use and must be exchanged for an Access token and Refresh token within it's expiration window.

Last updated 2 months ago

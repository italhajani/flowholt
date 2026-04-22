---
title: "Connections | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/best-practices/connections
scraped_at: 2026-04-21T12:41:44.647361Z
---

1. Best practices

# Connections

Every connection should have a way to check if the used API key (token) is valid (a validation endpoint).

This means that each connection should have a part that uses the API key (token) against an endpoint that requires only the API key to run. For example, a user info endpoint, or any endpoint that is used to list data.

The validation endpoint is located:

- OAuth1 and OAuth2 - in the info directive
- API key, basic auth, digest auth, other - in the url in the Communication tab

OAuth1 and OAuth2 - in the info directive

```
info
```

API key, basic auth, digest auth, other - in the url in the Communication tab

```
url
```

There are APIs that don't have a validation endpoint. In this case, it is recommended to call an endpoint that will work in every case and, if possible, will return the account's data, e. g. an endpoint /about or /me , etc.

```
/about
```

```
/me
```

The API key is checked against the /whoami endpoint. If the API key is incorrect, this returns an error and the connection won't be created.

```
/whoami
```

Last updated 5 months ago

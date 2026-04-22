---
title: "Additional OAuth scopes | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/best-practices/connections/additional-oauth-scopes
scraped_at: 2026-04-21T12:44:25.360370Z
---

1. Best practices chevron-right
2. Connections

# Additional OAuth scopes

The Make an API Call module connection will not work if the required scopes of the endpoint are not in the OAuth connection. To correct this, allow users to define additional scopes when they create a connection.

## hashtag Make an API Call parameters: non-editable connection

```
{"type":"banner","text":"Your connection must contain the required scopes for your API call. If you receive an error, create a new connection with the necessary Additional scopes.","theme":"info"}
```

If you encounter the warning String is longer than the maximum length of 256. , wrap it in an RPC.

```
String is longer than the maximum length of 256.
```

## hashtag Make an API Call parameters: editable connection

## hashtag Connection parameters

## hashtag Connection communication

Last updated 5 months ago

---
title: "Connection metadata | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/best-practices/connections/connection-metadata
scraped_at: 2026-04-21T12:44:25.756917Z
---

1. Best practices chevron-right
2. Connections

# Connection metadata

We recommend you use the metadata parameter to store the account's name or email. This allows users to easily distinguish their stored connections.

```
metadata
```

Always save the metadata in the connection if:

- the endpoint that can obtain the authenticated user’s information is available, and
- the information provided is able to distinguish the connection.

the endpoint that can obtain the authenticated user’s information is available, and

the information provided is able to distinguish the connection.

Saving the metadata allows for better identification on the Connections page.

We suggest saving the following information:

- Name
- Email
- User ID
- Organization, Company, Location, etc.

Name

Email

User ID

Organization, Company, Location, etc.

When a string is stored as metadata , Make sets a limit of 512 characters.

```
metadata
```

The value in the brackets after the user's connection name is taken from the metadata parameter.

```
metadata
```

```
..."response":{"metadata":{"type":"email",//allowed values are "email" and "text""value":"{{body.data.user.email}}"}},...
```

Last updated 5 months ago

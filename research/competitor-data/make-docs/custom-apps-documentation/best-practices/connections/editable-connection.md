---
title: "Editable connection | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/best-practices/connections/editable-connection
scraped_at: 2026-04-21T12:44:24.999907Z
---

1. Best practices chevron-right
2. Connections

# Editable connection

We recommend allowing users to edit their connections arrow-up-right after they create them. Updating a connection simplifies scenario and user credential maintenance when there's a change in the user's organization.

To allow users to edit a connection:

Go to the Parameters tab of the connection.

For each parameter with a value that should be kept secret, make sure that it is marked as type password .

```
password
```

Parameters with the password type don't show the original connection's parameter value, while the parameters with the text type show the value used by the current connection.

```
password
```

```
text
```

Add the editable: true property for each parameter in the connection.

```
editable: true
```

```
[{"help":"Your MailerLite API Key.","name":"apiKey","type":"password","label":"API Key","editable":true,"required":true}]
```

Exception : If the service provides each user with a unique URL or domain, the corresponding URL or domain parameter must be non-editable to prevent any potential credential leaks.

Last updated 5 months ago

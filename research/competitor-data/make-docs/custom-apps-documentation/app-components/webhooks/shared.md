---
title: "Shared | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/app-components/webhooks/shared
scraped_at: 2026-04-21T12:44:35.213449Z
description: "Shared webhooks are not very common. They are used when the external service requires you to register a single URL for all events, for all users."
---

1. App components chevron-right
2. Webhooks

# Shared

Shared webhooks are not very common. They are used when the external service requires you to register a single URL for all events, for all users.

When the service sends all the notifications to only one webhook URL but the webhook has to be registered under a user account, that's a dedicated webhook , not a shared one.

In order to activate the shared webhook so it listens to incoming traffic, you must publish your app. Before doing so, please read the app visibility article arrow-up-right to understand how that affects your app.

## hashtag Implementation

Shared webhooks must be registered in the external platform by the developer of the app. All notifications from the service for all users will be sent to Make through this single URL, which is generated when creating the shared webhook. On Make's end, the corresponding user account will be matched by it's uid .

```
uid
```

You should always follow the API documentation for the platform for which you are developing the integration.

## hashtag Matching the user's account with an incoming event

Since the webhook URL is shared among multiple users, there must be a way to match the incoming events with their owners and deliver them correctly. This is done through the uid parameter, which must be defined both in the connection and in the webhook communication.

```
uid
```

Since the uid from the connection is needed to allow Make to match the incoming data to its intended recipient, all shared webhooks must have a connection attached to the webhook.

```
uid
```

```
{..."info":{"url":"https://example.com/api/me","headers":{"authorization":"Bearer {{connection.accessToken}}"},"response":{"uid":"{{body.user.id}}","valid":"{{body.ok}}","metadata":{"type":"text","value":"{{body.user.fullName}} ({{body.user.email}})"}},"log":{"sanitize":["request.headers.authorization"]}}...}
```

Notice the uid parameter in the response object.

```
uid
```

```
response
```

Notice the uid parameter in the webhook's communication.

```
uid
```

Last updated 5 months ago

---
title: "User team notifications | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/users/user-team-notifications
scraped_at: 2026-04-21T12:43:47.899657Z
---

1. API Reference chevron-right
2. Users

# User team notifications

The following endpoints update and retrieve data about user team notifications settings of a user in a team. Read more about user team notifications arrow-up-right .

### hashtag List user team notification settings

Gets settings for user notifications for a user specified by the userId and a team specified by the teamId . Get the mapping of the notificationId and the team notification setting type with the API call GET /enums/user-email-notifications .

```
userId
```

```
teamId
```

```
notificationId
```

```
GET /enums/user-email-notifications
```

- user:read

```
user:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the user.

```
3
```

The ID of the team.

```
3
```

Successful response

Successful response

### hashtag Check user's notification settings

Checks team notification settings for specific user, team and notification type with the specified userId , teamId and notificationId . Get the mapping of the notificationId and the team notification setting type with the API call GET /enums/user-email-notifications .

```
userId
```

```
teamId
```

```
notificationId
```

```
notificationId
```

```
GET /enums/user-email-notifications
```

- user:read

```
user:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the user.

```
1
```

The ID of the team.

```
1
```

The ID of the notification type. Get the mapping of the notificationId and the team notification setting type with the API call GET /enums/user-email-notifications .

```
notificationId
```

```
GET /enums/user-email-notifications
```

```
6
```

Successful response

Successful response

### hashtag Update user's notification settings

Updates team notification settings for the user identified with the userId , teamId and notificationId .

```
userId
```

```
teamId
```

```
notificationId
```

Get the mapping of the notificationId and the team notification setting type with the API call GET /enums/user-email-notifications .

```
notificationId
```

```
GET /enums/user-email-notifications
```

Note that you can only update notification settings for the user associated with the API key used for authentication.

- user:write

```
user:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the user.

```
1
```

The ID of the team.

```
1
```

The ID of the notification type. Get the mapping of the notificationId and the team notification setting type with the API call GET /enums/user-email-notifications .

```
notificationId
```

```
GET /enums/user-email-notifications
```

```
6
```

Enables or disables team notification type for the user.

Successful response

Successful response

Last updated 1 day ago

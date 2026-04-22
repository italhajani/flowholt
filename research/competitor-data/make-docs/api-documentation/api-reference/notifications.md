---
title: "Notifications | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/notifications
scraped_at: 2026-04-21T12:41:25.619542Z
---

1. API Reference

# Notifications

The Notifications feature keeps you informed about problems in your scenarios and keep you up to date when it comes to the new features and improvements in Make. The following endpoints allow you to manage the notifications.

### hashtag List notifications

Retrieves a collection of all notifications for the authenticated user. Returned notifications are sorted by ID in descending order.

- notifications:read

```
notifications:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

If set to true , this parameter returns only the unread notifications.

```
true
```

```
false
```

The unique ID of the Make zone. This parameter is required to retrieve notifications from the Make version. For other Make platforms, it can be ignored. The IDs of the zones can be obtained from the /enums/imt-zones endpoint.

```
/enums/imt-zones
```

```
2
```

The value that will be used to sort returned entities by. Notifications can be currently sorted only by ID.

```
id
```

The value of entities you want to skip before getting entities you need.

The sorting order. It accepts the ascending and descending direction specifiers.

```
asc
```

```
desc
```

Sets the maximum number of results per page in the API call response. For example, pg[limit]=100 . The default number varies with different API endpoints.

```
pg[limit]=100
```

Successful response

Successful response

### hashtag Delete notifications

Deletes notifications with given IDs and returns their IDs in the response. This endpoint allows deleting one or more notifications at once.

- notifications:write

```
notifications:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The unique ID of the Make zone. This parameter is required to retrieve notifications from the Make version. For other Make platforms, it can be ignored. The IDs of the zones can be obtained from the /enums/imt-zones endpoint.

```
/enums/imt-zones
```

```
2
```

The array with IDs of the notifications to delete. Since the number of notifications can reach a BigInt and because of the limitations of the Open API format, the IDs need to be strings.

```
BigInt
```

Successful response

Successful response

### hashtag Get notification detail

Retrieves details and full content of a notification with a given ID.

- notifications:read

```
notifications:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The unique ID of the notification. It can be retrieved from the List notifications endpoint. Since the number of notifications can reach a BigInt and because of the limitations of the Open API format, the IDs need to be strings.

```
BigInt
```

```
3
```

The unique ID of the Make zone. This parameter is required to retrieve notifications from the Make version. For other Make platforms, it can be ignored. The IDs of the zones can be obtained from the /enums/imt-zones endpoint.

```
/enums/imt-zones
```

```
2
```

Successful response

Successful response

### hashtag Mark all notifications as read

Marks all notifications as read and returns the IDs of the updated notifications in the response.

- notifications:write

```
notifications:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

Forces the request to mark all notifications as read. This parameter can only have the all value.

```
all
```

The unique ID of the Make zone. This parameter is required to retrieve notifications from the Make version. For other Make platforms, it can be ignored. The IDs of the zones can be obtained from the /enums/imt-zones endpoint.

```
/enums/imt-zones
```

```
2
```

Successful response

Successful response

Last updated 1 day ago

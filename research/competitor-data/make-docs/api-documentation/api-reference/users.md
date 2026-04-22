---
title: "Users | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/users
scraped_at: 2026-04-21T12:41:32.496175Z
---

1. API Reference

# Users

The following main user endpoints allow you to get a list of existing users and manage their basic details such as password change.

### hashtag List users

Retrieves a collection of all users for a team or an organization with a given ID. Returned users are sorted by id in descending order.

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

The unique ID of the organization whose users will be retrieved. If this parameter is set, the teamId parameter must be skipped. For each request either teamId or organizationId must be defined.

```
teamId
```

```
teamId
```

```
organizationId
```

The unique ID of the team whose users will be retrieved. If this parameter is set, the organizationId parameter must be skipped. For each request either teamId or organizationId must be defined.

```
organizationId
```

```
teamId
```

```
organizationId
```

```
1
```

Optional filter parameter.

Optional filter parameter.

Optional filter parameter. If this parameter is set, the teamId parameter must be set as well.

```
teamId
```

```
{"value":3}
```

Optional filter parameter. If this parameter is set, the organizationId parameter must be set as well.

```
organizationId
```

```
{"value":13}
```

Filter by team ID. Use 0 to find users not assigned to any team. Requires organizationId.

```
{"value":5}
```

The user's two-factor authentication (TFA) status. This field is available only on plans that have the TFA enforcement enabled.

```
{"value":1}
```

```
0
```

```
1
```

```
2
```

An array of columns that should be returned from the API. Can be used to save bandwidth when not all properties are needed.

The value that will be used to sort returned entities by. Users can be sorted by name, id and email.

```
name
```

```
id
```

```
email
```

The sorting order. It accepts the ascending and descending direction specifiers.

```
asc
```

```
desc
```

The number of entities you want to skip before getting entities you want.

The maximum number of entities you want to get in the response.

Successful response

Successful response

### hashtag Delete current user

Deletes the authenticated user's own account. Requires password and/or 2FA, if configured. Optionally deletes all user connections (accounts, webhooks, etc).

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

Whether to delete all user connections (accounts, webhooks, etc).

```
false
```

User's current password (required if user has a password set).

Two-factor authentication code (required if 2FA is enabled).

Successful response

Successful response

### hashtag Update user

Updates a user with a given ID by passing new data in the request body. Any property that is not provided will be left unchanged. As the response, it returns all details of the updated user including properties that were not changed.

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

The unique ID of the user. It can be retrieved from the List users endpoint.

```
1
```

The name of the user. The name must be at most 250 characters long and does not need to be unique. The name may contain only letters, numbers, spaces, and the following special characters: ' , - , . , ( , ) , * , + , , , @ , _ , / . The name must not start or end with a space.

```
'
```

```
-
```

```
.
```

```
(
```

```
)
```

```
*
```

```
+
```

```
,
```

```
@
```

```
_
```

```
/
```

The standardized language code. It sets the Make environment language.

The timezone ID corresponding to the local time. The list of all timezones can be retrieved from the GET /enums/timezones endpoint.

```
GET /enums/timezones
```

The location ID. It sets the Make environment date formats, hour formats, decimal separators, etc. The list of all locales can be retrieved from the GET /enums/locales endpoint.

```
GET /enums/locales
```

The country ID. It sets the region of use.

Successful response

Successful response

### hashtag Update user email

Updates an email for a user with a given ID by passing new data in the request body. It replaces the entire resource with the new values. In the response, it returns the confirmation if the email was changed.

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

The unique ID of the user. It can be retrieved from the List users endpoint.

```
1
```

User's current email address.

User's new email address.

User's current password.

Successful response

Successful response

### hashtag Update user password

Updates a password for a user with a given ID by passing new data in the request body. It replaces the entire resource with the new values. In the response, it returns the confirmation if the password was changed. This endpoint corresponds to changing a password in the user profile when the user is logged in to the Make interface.

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

The unique ID of the user. It can be retrieved from the List users endpoint.

```
1
```

The current user password.

The new user password. The password must be at least 9 characters long and must contain at least one uppercase letter, at least one number, and at least one special character.

The new user password for confirmation. This password must be the same as the password in the newPassword1 property.

```
newPassword1
```

Successful response

Successful response

### hashtag Send password reset demand

Sends password reset demand for a user with an email passed in the request body. This endpoint corresponds to the Lost password function on the login page in the Make interface. In the response, it returns the confirmation if the demand was sent successfully.

- organization:read

```
organization:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The email of the user for who the password should be reset.

Successful response

Successful response

### hashtag Set session for resetting lost password

Checks a hash and sets a session for the Reset lost password endpoint. This endpoint corresponds to clicking the Reset password link in the Password reset email.

- organization:read

```
organization:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The unique hash of the password reset session.

```
fab680b60044adb766128e713e44e15b
```

Successful response

Successful response

### hashtag Reset lost password

Updates a password for a user based on the session created when calling the Prepare session for password reset endpoint. This endpoint corresponds to setting a new password on the Lost password page in the Make interface.

- organization:read

```
organization:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The new user password.

This password must be the same as the password in the newPassword1 property.

```
newPassword1
```

Successful response

Successful response

Last updated 1 day ago

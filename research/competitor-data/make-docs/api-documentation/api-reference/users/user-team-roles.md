---
title: "User team roles | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/users/user-team-roles
scraped_at: 2026-04-21T12:43:47.654371Z
---

1. API Reference chevron-right
2. Users

# User team roles

The following endpoints update and retrieve data about user team roles of a user in a team. Check out the overview of user team roles and the associated permissions arrow-up-right .

### hashtag List user roles

Gets team roles of the user with the specified userId . The response contains user's team role ID for all teams the user is part of. Get the mapping of the userRoleId and the user role name with the API call GET /users/roles .

```
userId
```

```
userRoleId
```

```
name
```

```
GET /users/roles
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
111
```

Successful response

Successful response

### hashtag Get user team role detail

Gets user role detail in the team with the specified teamId . Get the mapping of the userRoleId and the user role name with the API call GET /users/roles .

```
teamId
```

```
userRoleId
```

```
name
```

```
GET /users/roles
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
111
```

The ID of the team.

```
22
```

Successful response

Successful response

### hashtag Update user role

Updates the user role in the team with the specified teamId . Get the mapping of the userRoleId and the user role name with the API call GET /users/roles .

```
teamId
```

```
userRoleId
```

```
name
```

```
GET /users/roles
```

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
111
```

The ID of the team.

```
22
```

The ID of the user role. Check the GET /users/roles API call for the available usersRoleId values.

```
GET /users/roles
```

```
usersRoleId
```

Successful response

Successful response

Last updated 1 day ago

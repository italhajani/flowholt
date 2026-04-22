---
title: "User organization roles | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/users/user-organization-roles
scraped_at: 2026-04-21T12:43:49.554379Z
---

1. API Reference chevron-right
2. Users

# User organization roles

The following endpoints update and retrieve data about user organization roles of a user in an organization. Check out the overview of user organization roles and the associated permissions arrow-up-right .

### hashtag List user roles in an organization

Gets list of all users and their roles in the organization with the specified organizationId . Get all user role IDs with the API call GET /users/roles .

```
organizationId
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

Specifies columns that are returned in the response. Use the cols[] parameter for every column that you want to return in the response. For example GET /endpoint?cols[]=key1&cols[]=key2 to get both key1 and key2 columns in the response.

```
cols[]
```

```
GET /endpoint?cols[]=key1&cols[]=key2
```

```
key1
```

```
key2
```

Check the "Filtering" section for a full example.

```
{"value":["userId","organizationId","usersRoleId","invitation","organizationTeamsCount","joinedTeamsCount"]}
```

Successful response

Successful response

### hashtag Get user organization role details

Gets information about user role in an organization with the specified userId and organizationId . Get all user role IDs with the API call GET /users/roles .

```
userId
```

```
organizationId
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

The ID of the user

```
254
```

The ID of the organization

```
11
```

Specifies columns that are returned in the response. Use the cols[] parameter for every column that you want to return in the response. For example GET /endpoint?cols[]=key1&cols[]=key2 to get both key1 and key2 columns in the response.

```
cols[]
```

```
GET /endpoint?cols[]=key1&cols[]=key2
```

```
key1
```

```
key2
```

Check the "Filtering" section for a full example.

```
{"value":["userId","organizationId","userRoleId","invitation","organizationTeamsCount","joinedTeamsCount"]}
```

Successful response

Successful response

### hashtag Update user role

Updates the specified user role in the organization. Only organization owners and admins can change the user organization roles. Refer to the Make Help center for a breakdown of the user role permissions arrow-up-right .

Specify the ID of the new role for the user in the request body. Get all available user role IDs and the corresponding user role names with the API call GET /users/roles .

```
GET /users/roles
```

You cannot change the organization "Owner" with this endpoint. Use the API call to transfer organization ownership instead.

If you send an empty request body, the user with the specified userId will be removed from the organization.

```
userId
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
5
```

The ID of the organization.

```
22
```

Specifies columns that are returned in the response. Use the cols[] parameter for every column that you want to return in the response. For example GET /endpoint?cols[]=key1&cols[]=key2 to get both key1 and key2 columns in the response.

```
cols[]
```

```
GET /endpoint?cols[]=key1&cols[]=key2
```

```
key1
```

```
key2
```

Check the "Filtering" section for a full example.

```
{"value":["userId","organizationId","usersRoleId","invitation","organizationTeamsCount","joinedTeamsCount"]}
```

Use this parameter when you are removing a user from an organization. Set this parameter to true is you want to delete the user's connections from the organization with the parameter deleteConnections .

```
true
```

```
deleteConnections
```

```
{"value":true}
```

Set this parameter to true if you are removing a user from an organization to delete also the user's connections. If you set this parameter to false , the API call won't delete the user's connections.

```
true
```

```
false
```

```
{"value":true}
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

### hashtag Transfer organization ownership

Transfer organization ownership to the user with the specified userId . Only organization owner can transfer their ownership to another user.

```
userId
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

The ID of the organization.

```
11
```

Successful response

Successful response

Last updated 1 day ago

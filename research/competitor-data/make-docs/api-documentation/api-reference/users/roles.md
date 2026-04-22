---
title: "Roles | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/users/roles
scraped_at: 2026-04-21T12:43:52.194260Z
---

1. API Reference chevron-right
2. Users

# Roles

The following endpoint retrieves the mapping of a userRoleId parameter and user role name.

```
userRoleId
```

### hashtag User role definitions

Gets list of all existing user role names and IDs. Set the user roles in an organization with the POST /users/{userId}/user-organization-roles/{organizationId} API call. Use the POST /users/{userId}/user-team-roles/{teamId} API call to set user roles in a team.

```
POST /users/{userId}/user-organization-roles/{organizationId}
```

```
POST /users/{userId}/user-team-roles/{teamId}
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
{"value":["id","name","identifier","subsidiary","category","permissions","description"]}
```

Set this parameter to organization or team to get user roles in an organization or in a team.

```
organization
```

```
team
```

```
team
```

```
organization
```

```
team
```

Successful response

Successful response

Last updated 1 day ago

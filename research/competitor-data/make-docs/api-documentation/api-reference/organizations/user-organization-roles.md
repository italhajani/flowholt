---
title: "User organization roles | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/organizations/user-organization-roles
scraped_at: 2026-04-21T12:43:29.844037Z
---

1. API Reference chevron-right
2. Organizations

# User organization roles

User organization roles define user permissions in the organization. The endpoints discussed further retrieve information about user roles in the organization. Use the /users/{userId}/user-organization-roles/{organizationIdId} to manage user organization roles. Check out the overview of user organization roles and the associated user permissions arrow-up-right .

```
/users/{userId}/user-organization-roles/{organizationIdId}
```

### hashtag List user roles

Retrieves information about all users and their roles in the organization with the specified organizationId .

```
organizationId
```

- organizations:read

```
organizations:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the organization.

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

### hashtag Get user organization role details

Retrieves information about a user role in an organization with the specified userId and organizationId . Get all user role IDs with the API call GET users/roles .

```
userId
```

```
organizationId
```

```
GET users/roles
```

- organizations:read

```
organizations:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the organization.

```
11
```

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
{"value":["userId","organizationId","userRoleId","invitation","organizationTeamsCount","joinedTeamsCount"]}
```

Successful response

Successful response

### hashtag Transfer organization ownership

Transfer organization ownership to the specified user. Only the user that has the user role "Owner" in the organization can transfer ownership.

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

The ID of the organization.

```
11
```

The ID of the user.

Successful response

Successful response

Last updated 1 day ago

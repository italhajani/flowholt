---
title: "User team roles | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/teams/user-team-roles
scraped_at: 2026-04-21T12:43:43.087670Z
---

1. API Reference chevron-right
2. Teams

# User team roles

User team roles define user permissions in the team. The endpoints discussed further retrieve information about user roles in the team. Use the /users/{userId}/user-team-roles/{userId} endpoint to manage user team roles. Check out the overview of user team roles and the associated permissions arrow-up-right .

```
/users/{userId}/user-team-roles/{userId}
```

### hashtag List user roles in the team

Gets list of all users and their roles in the team with the specified teamId . Get all user role IDs with the API call GET /users/roles .

```
teamId
```

```
GET /users/roles
```

- teams:read

```
teams:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the team.

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

The value that will be used to sort returned entities by.

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

### hashtag Get user team role details

Retrieves information about user role in a team with the specified userId and teamId . Get all user role IDs with the API call GET users/roles .

```
userId
```

```
teamId
```

```
GET users/roles
```

- teams:read

```
teams:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the team.

```
22
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

The value that will be used to sort returned entities by.

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

Last updated 1 day ago

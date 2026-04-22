---
title: "API Tokens | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/users/api-tokens
scraped_at: 2026-04-21T12:43:44.093942Z
---

1. API Reference chevron-right
2. Users

# API Tokens

The following endpoints manage and retrieve data about the API tokens assigned to the currently authenticated user.

### hashtag List users API tokens

Gets the API tokens of the currently authenticated user.

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

Successful response

Successful response

### hashtag Create new API token

Create a new API token for the currently authenticated user. Specify the API token scopes in the scope array parameter.

```
scope
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

The API token label visible in the Make user profile.

The API scopes provided to the API token. The API scopes determine the scope of operations that you can do with the API token.

Check the list of all existing Make API scopes with the API call GET /enums/user-api-tokes-scopes .

```
GET /enums/user-api-tokes-scopes
```

Successful response

Successful response

### hashtag Delete API token

Deletes currently authenticated user's API token with the specified creation timestamp. Get the API token creation timestamp with the API call GET /users/me/api-tokens in the parameter value created . Copy the timestamp string to the API call path to delete the API token.

```
GET /users/me/api-tokens
```

```
created
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

The timestamp of the moment when you created the API key in the ISO 8601 compliant format.

```
2020-03-27T05:53:27.368Z
```

Successful response

Successful response

Last updated 1 day ago

---
title: "Affiliate | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/affiliate
scraped_at: 2026-04-21T12:41:16.651716Z
---

1. API Reference

# Affiliate

### hashtag Register partner

Registers the user as a partner in the affiliate program.

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

Successful response

Successful response

### hashtag Get commission stats

Retrieves graph data for commisions in the past year for the current user.

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

```
2021-08-01
```

```
2021-11-01
```

Successful response

Successful response

### hashtag Get commissions

Retrieves detailed data about individual commisions of the current user.

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

```
1
```

```
2021-08-01
```

```
2021-11-01
```

The value that will be used to sort returned entities by.

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

### hashtag Get commission info

Retrieves general info about accumulated commissions of the current user.

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

```
2021-08-01
```

```
2021-11-01
```

Successful response

Successful response

### hashtag Request payout

Request a payout of available commissions.

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

Successful response

Successful response

Last updated 1 day ago

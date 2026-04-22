---
title: "Me | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/users/me
scraped_at: 2026-04-21T12:43:49.404138Z
---

1. API Reference chevron-right
2. Users

# Me

The following endpoints retrieve data about the currently authenticated user.

### hashtag Current user data

Retrieves data about the authenticated user. Refer to the cols[] parameter accepted values to get more information about the currently authenticated user.

```
cols[]
```

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

Set this parameter to true if you want to get also the user roles in organizations with pending invitation. The default value is false .

```
true
```

```
false
```

```
{"value":true}
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
{"value":["id","name","email","language","timezoneId","localeId","countryId","features","avatar","timezone","locale","emailNotifications","usersAdminsRoleId","userOrganizationRoles","userTeamRoles","forceSetPassword","hasPassword","tfaEnabled","isAffiliatePartner","hasAddedApp","supportEligible"]}
```

Successful response

Successful response

### hashtag Current user authorization

Returns current authorization information for the authenticated user including scope and authentication method used.

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

Successful response

Successful response

### hashtag User Organization invitations

Retrieves organization invitations of the currently authenticated user.

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

Last updated 1 day ago

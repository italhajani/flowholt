---
title: "Custom functions | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/custom-functions
scraped_at: 2026-04-21T12:41:23.666727Z
---

1. API Reference

# Custom functions

Custom functions are functions you or your team members create that you can use in a scenario. The following API endpoints allow you to:

- list
- evaluate
- create
- update
- delete
- check version history

list

evaluate

create

update

delete

check version history

of your custom functions.

Check the custom functions feature documentation in the Make Help center arrow-up-right .

### hashtag List custom functions

Retrieves a list of custom functions available in the team. The response contains id , name , description and a brief updates history of all custom functions available in the team.

```
id
```

```
name
```

```
description
```

Check availability of the custom functions feature with the API call GET /organizations/{organizationId} for the organization to which the team belongs. If the response contains "customFunctions": true pair in the license object then you have access to the custom functions feature.

```
GET /organizations/{organizationId}
```

```
"customFunctions": true
```

```
license
```

Refer to the Make pricing page arrow-up-right for Make pricing plans overview.

- function:read

```
function:read
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

Successful response

Successful response

### hashtag Create a custom function

Creates a custom function. Specify function name , description and code in the request body.

```
name
```

```
description
```

```
code
```

You cannot use a JavaScript reserved word for the function name . Check the list of JavaScript reserved words arrow-up-right .

```
name
```

Make sure to use the same function name in the name field and in the function's code . Otherwise, you get the IM005 error.

```
name
```

```
code
```

Make validates the custom function's code first. You get an IM005 error if the code validation fails. The validation might fail because of a syntax error in the function's code or when the code uses a JavaScript feature that Make doesn't support. Check the custom functions limitations arrow-up-right in the Make Help center.

Check availability of the custom functions feature with the API call GET /organizations/{organizationId} for the organization to which the team belongs. If the response contains "customFunctions": true pair in the license object then you have access to the custom functions feature.

```
GET /organizations/{organizationId}
```

```
"customFunctions": true
```

```
license
```

Refer to the Make pricing page arrow-up-right for Make pricing plans overview.

- functions:write

```
functions:write
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
11
```

The name of the custom function.

The description of the custom function.

The code of the custom function.

Successful response

Successful response

### hashtag Check custom function code

Checks the custom functions code. The response contains information whether Make validated the custom functions code successfully or whether there was an error.

The code validation might fail because of an syntax error in the function's code or when the code uses a JavaScript feature that Make doesn't support. Check the custom functions limitations arrow-up-right in the Make Help center.

Check availability of the custom functions feature with the API call GET /organizations/{organizationId} for the organization to which the team belongs. If the response contains "customFunctions": true pair in the license object then you have access to the custom functions feature.

```
GET /organizations/{organizationId}
```

```
"customFunctions": true
```

```
license
```

Refer to the Make pricing page arrow-up-right for Make pricing plans overview.

- functions:write

```
functions:write
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
11
```

The code of the custom function.

Successful response

Successful response

### hashtag Custom function detail

Gets detailed information about a custom function. The response contains function name , code , a list of scenarios which use the custom function and the custom function's history of updates.

```
name
```

```
code
```

- functions:read

```
functions:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the custom function.

```
44
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

Successful response

Successful response

### hashtag Delete custom function

Deletes the custom function. The response contains information whether the custom function is deleted or not.

If you or any of your team members use the custom function in a scenario you have to use the confirmed parameter to confirm the custom function deletion. Otherwise, you get an error with a list of scenarios that use the custom function.

```
confirmed
```

- functions:write

```
functions:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the custom function.

```
44
```

Confirms deleting of the custom function. If you are using the custom function in a scenario Make requires the confirmation.

```
true
```

Successful response

Successful response

### hashtag Update a custom function

Updates custom functions description or code . You cannot change the name of the custom function.

```
description
```

```
code
```

```
name
```

Make sure to use the same function name in the function's code . Otherwise, you get an IM005 error.

```
code
```

Make validates the custom function's code first. You get an IM005 error if the code validation fails. The validation might fail because of a syntax error in the function's code or when the code uses a JavaScript feature that Make doesn't support. Check the custom functions limitations arrow-up-right in the Make Help center.

- functions:write

```
functions:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the custom function.

```
44
```

The description of the custom function. You can use maximum of 128 characters.

The code of the custom function.

Successful response

Successful response

### hashtag Custom function updates history

Gets history of updates of the specified custom function. The response contains a list of code changes, the change author and date when the author made the change.

- functions:read

```
functions:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the custom function.

```
44
```

The ID of the team.

```
11
```

Successful response

Successful response

Last updated 1 day ago

---
title: "Teams | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/teams
scraped_at: 2026-04-21T12:41:30.381562Z
---

1. API Reference

# Teams

Teams are containers that contain scenarios and data accessible only by the members of the team. The API endpoints discussed further allow you to manage teams. Read more about teams arrow-up-right .

### hashtag List teams

Gets the list of teams in the organization with specified organizationId .

```
organizationId
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

The ID of the organization.

```
1
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

### hashtag Create a team

Create a new team in the organization with the specified organizationId .

```
organizationId
```

- teams:write

```
teams:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The name of the team.

The ID of the organization.

The maximum number of operations allowed for the team.

Successful response

Successful response

### hashtag Get team details

Returns information about the team with the specified teamId .

```
teamId
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

```
{"value":["id","name","organizationId","activeScenarios","activeApps","operations","transfer","centicredits","operationsLimit","transferLimit","consumedOperations","consumedTransfer","isPaused","consumedCenticredits"]}
```

Successful response

Successful response

### hashtag Delete a team

Deletes the team with the specified teamId . Make also deletes all data associated with the team, for example scenarios, webhooks or custom team variables.

```
teamId
```

- teams:write

```
teams:write
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

Set this parameter to true to confirm the team deletion. Otherwise, the API call returns an error and the team is not deleted.

```
true
```

```
true
```

Successful response

Successful response

### hashtag List team variables

Retrieves the collection of team variables. The response contains all team variables if your account has the custom variables feature available. Otherwise, the response contains only Make system variables.

Check availability of the custom variables feature with the API call GET /organizations/{organizationId} for the organization to which the team belongs. If the response contains "customVariables": true pair in the license object then you have access to the custom variables feature.

```
GET /organizations/{organizationId}
```

```
"customVariables": true
```

```
license
```

Refer to the Make pricing page arrow-up-right for Make pricing plans overview.

- team-variables:read

```
team-variables:read
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

Successful response

Successful response

### hashtag Create team variable

Creates new team variable. You can check the availability of the custom variables feature with the API call GET /organizations/{organizationId} for the organization to which the team belongs. If the API call response contains "customVariables": true pair in the license object then you have access to the custom variables feature.

```
GET /organizations/{organizationId}
```

```
"customVariables": true
```

```
license
```

A successful response contains all information about the new variable. If you don't have the custom variables feature available then the API call returns the error 404.

Refer to the Make pricing page arrow-up-right for Make pricing plans overview.

- team-variables:write

```
team-variables:write
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

Number representing the type of the custom variable. The mapping of typeId and variable types is as follows:

```
typeId
```

- 1: number ,
- 2: string ,
- 3: boolean ,
- 4: date in ISO 8601 compliant format YYYY-MM-DDTHH:mm:ss.sssZ . For example: 1998-03-06T12:31:00.000Z .

```
number
```

```
string
```

```
boolean
```

```
date
```

```
YYYY-MM-DDTHH:mm:ss.sssZ
```

```
1998-03-06T12:31:00.000Z
```

Value assigned to the custom variable.

The name of the variable. You can use letters, digits, $ and _ characters in the custom variable name.

```
$
```

```
_
```

Successful response

Successful response

### hashtag Delete team variable

Deletes team variable.

If you don't have the custom variables feature available then the API call returns error 404. Check the availability of the custom variables feature with the API call GET /organizations/{organizationId} for the organization in which the team belongs. If the response contains "customVariables": true pair in the license object then you have access to the custom variables feature.

```
GET /organizations/{organizationId}
```

```
"customVariables": true
```

```
license
```

Refer to the Make pricing page arrow-up-right for Make pricing plans overview.

- team-variables:write

```
team-variables:write
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

The name of the custom variable.

```
userID
```

Set to true to confirm deleting the custom variable. Otherwise the API call fails with the error IM004 (406).

```
true
```

```
true
```

Successful response

Successful response

### hashtag Update team variable

Updates custom team variable with the specified variable name . Only parameters specified in the request body are updated.

```
name
```

You can check the availability of the custom variables feature with the API call GET /organizations/{organizationId} for the organization to which the team belongs. If the response contains "customVariables": true pair in the license object then you have access to the custom variables feature.

```
GET /organizations/{organizationId}
```

```
"customVariables": true
```

```
license
```

A successful response contains all information about the updated variable. If you don't have the custom variables feature available then the API call returns the error 404.

Refer to the Make pricing page arrow-up-right for the Make pricing plans overview.

Update the variable typeId accordingly when you are updating the variable value . Make checks whether the variable type and value match in the request body. There is no check for incorrect variable type when you update only variable value and vice versa .

```
typeId
```

```
value
```

- team-variables:write

```
team-variables:write
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

The name of the custom variable.

```
userID
```

Number representing the type of the custom variable. The mapping of typeId and variable types is as follows:

```
typeId
```

- 1: number ,
- 2: string ,
- 3: boolean ,
- 4: date in ISO 8601 compliant format YYYY-MM-DDTHH:mm:ss.sssZ . For example: 1998-03-06T12:31:00.000Z .

```
number
```

```
string
```

```
boolean
```

```
date
```

```
YYYY-MM-DDTHH:mm:ss.sssZ
```

```
1998-03-06T12:31:00.000Z
```

Value assigned to the custom variable.

Successful response

Successful response

### hashtag History of custom variable updates

Gets the history of updates of the specified custom variable. The response contains the ID value of the variable history entry and a diffObject . The diffObject contains:

```
diffObject
```

```
diffObject
```

- the original value,
- the new value,
- the timestamp of the update,
- the author of the update.

the original value,

the new value,

the timestamp of the update,

the author of the update.

If the variable doesn't have any updates, the diffObject contains the current value of the variable instead of the original and new values.

```
diffObject
```

The update history entries are sorted from newest to latest.

- team-variables:read

```
team-variables:read
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

The name of the custom variable.

```
userID
```

Successful response

Successful response

### hashtag Get team usage

Retrieves a list of daily centicredits, operations, and data transfer usage for all scenarios within a specified team over the past 30 days.

By default, the endpoint uses the timezone of the user making the API call to define the start and end of each day in the 30-day timeframe.

To use the organization's timezone instead, set the organizationTimezone parameter to true . This ensures that the daily aggregates align with the organization's operational hours. This is especially useful for scenarios where aggregated data needs to align with the organization's operational hours.

```
organizationTimezone
```

```
true
```

For instance, a remote data analyst in India working for a Czech company can set organizationTimezone=true to ensure the usage data reflects the company's timezone, providing more relevant and accurate insights for organizational reporting and analysis.

```
organizationTimezone=true
```

For more information on timezones in Make, please refer to our Help Center article arrow-up-right .

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

When set to true , the endpoint will calculate and return usage data based on the organization's timezone instead of the user's local timezone.

```
true
```

```
true
```

Successfully retrieved usage data

Successfully retrieved usage data

### hashtag Get team LLM configuration

Gets the LLM configuration for the specified team, including AI mapping and AI toolkit settings with builtin tier information.

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

Successful response

ID of the account used for AI mapping

Name of the AI model used for mapping

The builtin tier for AI mapping (small, medium, large)

```
small
```

```
medium
```

```
large
```

Detailed information about the AI mapping builtin tier

ID of the account used for AI toolkit

Name of the AI model used for toolkit

The builtin tier for AI toolkit (small, medium, large)

```
small
```

```
medium
```

```
large
```

Detailed information about the AI toolkit builtin tier

Successful response

### hashtag Update team LLM configuration

Updates the LLM configuration for the specified team. Supports partial updates for AI mapping and AI toolkit settings.

- teams:write

```
teams:write
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

ID of the account used for AI mapping

Name of the AI model used for mapping

The builtin tier for AI mapping (small, medium, large)

```
small
```

```
medium
```

```
large
```

ID of the account used for AI toolkit

Name of the AI model used for toolkit

The builtin tier for AI toolkit (small, medium, large)

```
small
```

```
medium
```

```
large
```

Successful response

ID of the account used for AI mapping

Name of the AI model used for mapping

The builtin tier for AI mapping (small, medium, large)

```
small
```

```
medium
```

```
large
```

Detailed information about the AI mapping builtin tier

ID of the account used for AI toolkit

Name of the AI model used for toolkit

The builtin tier for AI toolkit (small, medium, large)

```
small
```

```
medium
```

```
large
```

Detailed information about the AI toolkit builtin tier

Successful response

### hashtag Get feature controls of an organization which the team belongs to

Retrieves all feature controls for the specified organization which the team belongs to.

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

The ID of the team.

```
11
```

The feature control name.

```
Make AI Tools
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

Successfully retrieved feature controls

Successfully retrieved feature controls

Last updated 1 day ago

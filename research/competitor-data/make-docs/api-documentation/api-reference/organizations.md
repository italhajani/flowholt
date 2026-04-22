---
title: "Organizations | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/organizations
scraped_at: 2026-04-21T12:41:26.680026Z
---

1. API Reference

# Organizations

Organizations are main containers that contain all teams, scenarios, and users. The API endpoints discussed further allow you to manage organizations. Read more about organizations arrow-up-right .

### hashtag List user organizations

Retrieves a collection of all organizations, in which the user has membership. The response contains information about the organization name , organizationId and timezoneId . You can get more data about the user organizations with specifying the cols[] query parameter.

```
name
```

```
organizationId
```

```
timezoneId
```

```
cols[]
```

However, the values for parameters license , serviceName and isPaused are returned only for organizations in your current Make zone.

```
license
```

```
serviceName
```

```
isPaused
```

Returned organizations are sorted by the organization name in ascending order by default. You can specify sorting order with the query parameter pg[sortBy].

```
pg[sortBy].
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

The URL of your Make instance domain.

```
eu1.make.com
```

Make White Label product instances use the externalId parameter for security reasons. This parameter has null value in the public Make Cloud instance.

```
externalId
```

```
null
```

```
{"value":"TESTORG003"}
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
{"value":["id","name","countryId","timezoneId","license","zone","serviceName","teams","isPaused","externalId","productName","tfaEnforced"]}
```

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

### hashtag Create an organization

Create a new organization using the data sent in the request body. Successful response contains all information about the created organization.

- admin:write
- organizations:write

```
admin:write
```

```
organizations:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The name of the organization. The name may contain only letters, numbers, spaces, and the following special characters: ' , - , . , ( , ) , * , + , , , @ , _ , / . The name must not start or end with a space.

```
'
```

```
-
```

```
.
```

```
(
```

```
)
```

```
*
```

```
+
```

```
,
```

```
@
```

```
_
```

```
/
```

ID of the Make region instance associated with the organization. Get the list of Make regions with the API call GET /enums/imt-regions .

```
GET /enums/imt-regions
```

The ID of the timezone associated with the organization. Get the list of the timezone IDs with the API call GET /enums/timezones .

```
GET /enums/timezones
```

The ID of the country associated with the organization. Get the list of the country IDs with the API call GET /enums/countries .

```
GET /enums/countries
```

Successful response

Successful response

### hashtag Invitation detail

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

```
bf1effe1-bc9d-4ab3-9414-9c3b66175305
```

Successful response

Successful response

### hashtag Accept invitation

- organizations:write

```
organizations:write
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

### hashtag Get organization details

Retrieves detail information of the organization with the specified organizationId .

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

Set this parameter to true if you are using the API call GET /organizations/{organizationId} shortly after creating the organization. The API call will first check synchronization of the Make backend and your Make zone data. If you don't use this argument, the API call might fail with an error due to unfinished data synchronization. The default value of this argument is false .

```
true
```

```
GET /organizations/{organizationId}
```

```
false
```

```
true
```

Successful response

Successful response

### hashtag Delete an organization

Deletes the organization with the specified organizationId . Make also deletes all the teams in the organization. You can only delete organizations that are associated with your current Make zone. Your current Make zone is specified in the API call URL. Currently, it is either:

```
organizationId
```

- eu1.make.com
- us1.make.com

eu1.make.com

```
eu1.make.com
```

us1.make.com

```
us1.make.com
```

- organizations:write

```
organizations:write
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

Set to true to confirm the organization deletion. Otherwise, if the organization has active scenarios, Make won't delete the organization and the API call returns an error.

```
true
```

```
true
```

Successful response

Successful response

### hashtag Update organization information

Updates the organization data with the values in the request body. If you don't use a parameter in the request body, Make won't change its value. You can update organization name, timezone, and country with the name , timezoneId , and countryId parameters.

```
name
```

```
timezoneId
```

```
countryId
```

Check the available values for the timezoneId and countryId parameters with the API calls GET /enums/timezones and GET /enums/countries .

```
timezoneId
```

```
countryId
```

```
GET /enums/timezones
```

```
GET /enums/countries
```

The request response returns all organization data.

- organizations:write

```
organizations:write
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

The new name of the organization. The name may contain only letters, numbers, spaces, and the following special characters: ' , - , . , ( , ) , * , + , , , @ , _ , / . The name must not start or end with a space.

```
'
```

```
-
```

```
.
```

```
(
```

```
)
```

```
*
```

```
+
```

```
,
```

```
@
```

```
_
```

```
/
```

The ID of the country associated with the organization. Get the list of the country IDs with the API call GET /enums/countries .

```
GET /enums/countries
```

The ID of the timezone associated with the organization. Get the timezoneId values with the API call GET /enums/timezones .

```
timezoneId
```

```
GET /enums/timezones
```

Successful response

Successful response

### hashtag Get a list of custom apps

Get list of custom apps associated with the users in the organization. The request response contains information of both published and unpublished custom apps. The custom app name is suffixed with a random text string.

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

Successful response

Successful response

### hashtag Get list of past payments

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

### hashtag Get detail of an active subscription

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

Successful response

Successful response

### hashtag Create a new subscription

- organizations:write

```
organizations:write
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

### hashtag Cancel the active subscription

- organizations:write

```
organizations:write
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

### hashtag Change subscription

- organizations:write

```
organizations:write
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

### hashtag List payment method types

Returns a list of available payment method types for the organization's subscription.

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

Successful response

Successful response

### hashtag List payment methods

Returns a list of payment methods for the organization's subscription.

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

Successful response

Successful response

### hashtag Delete a payment method

Deletes a payment method from the organization's subscription.

- organizations:write

```
organizations:write
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

The ID of the payment method.

Successful response

```
1
```

Successful response

### hashtag Set default payment method

Sets a payment method as the default for the organization's subscription.

- organizations:write

```
organizations:write
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

The ID of the payment method.

What to set as default. Defaults to 'both'. 'extras' and 'both' throw 400 if the payment method is not immediate. 'subscription' sets default for subscription only.

```
extras
```

```
both
```

```
subscription
```

Successful response

Successful response

### hashtag Sets Free plan subscription

- organizations:write

```
organizations:write
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

### hashtag Claim cancellation offer

Claims a cancellation offer discount for the organization. The user must have the 'payment edit' permission on the organization. The organization must be eligible (no existing universal discount, no active coupon/promo).

- organizations:write

```
organizations:write
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
10
```

Successful response

```
1
```

Successful response

### hashtag Invite a user to the organization

Invite a user to the organization. To automatically add the user to teams, specify IDs of the teams. The user gets the team role member . You can change the user team role with the API call POST /users/{userId}/user-team-roles/{teamId} .

```
POST /users/{userId}/user-team-roles/{teamId}
```

- organizations:write

```
organizations:write
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

The ID of the user organization role assigned to the invited user. Get list of user role IDs from the API call GET /users/roles .

```
GET /users/roles
```

The user registration email.

The user name visible in the team and organization interface. The name may contain only letters, numbers, spaces, and the following special characters: ' , - , . , ( , ) , * , + , , , @ , _ , / . The name must not start or end with a space.

```
'
```

```
-
```

```
.
```

```
(
```

```
)
```

```
*
```

```
+
```

```
,
```

```
@
```

```
_
```

```
/
```

Note added to the invitation.

The list of team IDs to which the invited user will be assigned. The invited user will receive the team role member .

Successful response

Successful response

### hashtag List organization variables

Retrieves the collection of organization variables. The response contains all organization variables if your account has the custom variables feature available. Otherwise, the response contains only Make system variables.

Check availability of the custom variables feature with the API call GET /organizations/{organizationId} . If the response contains "customVariables": true pair in the license object then you have access to the custom variables feature.

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

- organization-variables:read

```
organization-variables:read
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

Successful response

Successful response

### hashtag Create organization variable

Creates new organization variable. You can check the availability of the custom variables feature with the API call GET /organizations/{organizationId} . If the response contains "customVariables": true pair in the license object then you have access to the custom variables feature.

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

- organization-variables:write

```
organization-variables:write
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

### hashtag Delete organization variable

Deletes organization variable.

If you don't have the custom variables feature available then the API call returns the error 404. Check the availability of the custom variables feature with the API call GET /organizations/{organizationId} . If the response contains "customVariables": true pair in the license object then you have access to the custom variables feature.

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

- organization-variables:write

```
organization-variables:write
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

### hashtag Update organization variable

Updates custom organization variable with the specified variable name . Only parameters specified in the request body are updated.

```
name
```

You can check the availability of the custom variables feature with the API call GET /organizations/{organizationId} . If the response contains "customVariables": true pair in the license object then you have access to the custom variables feature.

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

- organization-variables:write

```
organization-variables:write
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

- organization-variables:read

```
organization-variables:read
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

The name of the custom variable.

```
userID
```

Successful response

Successful response

### hashtag Get organization usage

Retrieves a list of daily centicredits, operations, and data transfer usage across all scenarios within all teams in the specified organization for the past 30 days.

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

When set to true , the endpoint will calculate and return usage data based on the organization's timezone instead of the user's local timezone.

```
true
```

```
true
```

Successfully retrieved usage data

Successfully retrieved usage data

### hashtag Get organization feature controls

Retrieves all feature controls for the specified organization. Response order of the feature controls is by descending ID.

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

### hashtag Patch organization feature controls

Enable or disable feature control for the specified organization.

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

The ID of the feature control.

Indicates whether the feature control is enabled (true) or disabled (false).

Successful response

Successful response

### hashtag Set TFA enforcement for an organization

Enables or disables two-factor authentication (TFA) enforcement for the specified organization.

When TFA enforcement is enabled, all users in the organization are required to have two-factor authentication configured. Users who do. not have TFA enabled will be automatically logged out.

Note: This endpoint is available only for organizations with a plan that supports TFA enforcement.

- organizations:write

```
organizations:write
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

Set to true to enable TFA enforcement for the organization, or false to disable it.

```
true
```

```
false
```

Successful response

Partial organization object containing the updated TFA enforcement status

Bad request - TFA enforcement feature is not available

Payment required - Upgrade your plan to use TFA enforcement feature

Forbidden - Insufficient rights to modify organization settings

Successful response

### hashtag Check team permission within organization

Checks if the current user has a specific team (company) permission on any team within the specified organization. Returns hasPermission: true if the user has the permission on at least one team in the organization, otherwise returns hasPermission: false .

```
hasPermission: true
```

```
hasPermission: false
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

The ID of the organization to check permissions within.

```
123
```

The name of the team permission to check. This should be a valid company/team permission name
(e.g., 'scenario add', 'scenario view', 'team view', 'connection add').

```
scenario add
```

Successfully checked permission

Indicates whether the user has the specified permission on at least one team
within the organization.

Bad request - missing or invalid teamPermission parameter

User is not logged in

Access denied - user does not have access to the organization

Successfully checked permission

Last updated 1 day ago

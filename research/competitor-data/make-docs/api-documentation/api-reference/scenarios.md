---
title: "Scenarios | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/scenarios
scraped_at: 2026-04-21T12:41:27.751956Z
---

1. API Reference

# Scenarios

Scenarios allow you to create and run automation tasks. A scenario consists of a series of modules that indicate how data should be transferred and transformed between apps or services. The following endpoints allow you to create, manage and execute scenarios and also inspect and manage scenario inputs arrow-up-right .

### hashtag List scenarios

Retrieves a collection of all scenarios for a team or an organization with a given ID. Returned scenarios are sorted by proprietary setting in descending order.

- scenarios:read

```
scenarios:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The unique ID of the team whose scenarios will be retrieved. If this parameter is set, the organizationId parameter must be skipped. For each request either teamId or organizationId must be defined.

```
organizationId
```

```
teamId
```

```
organizationId
```

```
1
```

The unique ID of the organization whose scenarios will be retrieved. If this parameter is set, the teamId parameter must be skipped. For each request either teamId or organizationId must be defined.

```
teamId
```

```
teamId
```

```
organizationId
```

```
11
```

The array of IDs of scenarios to retrieve.

```
[1,2,3]
```

The unique ID of the folder containing scenarios you want to retrieve.

```
1
```

Set this parameter to true to get only active scenarios in the response.

```
true
```

```
true
```

This parameter is deprecated. Use the isActive parameter to filter for active scenarios instead.

```
isActive
```

```
true
```

If set to true , the response contains only scenario concepts.

```
true
```

```
true
```

Limits the type of scenarios to be retrieved.

```
false
```

```
scenario
```

```
tool
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

The number of entities you want to skip before getting entities you want.

The maximum number of entities you want to get in the response.

The value that will be used to sort returned entities by.

```
proprietal
```

```
id
```

```
name
```

```
teamId
```

```
folderId
```

```
isActive
```

```
islinked
```

```
isinvalid
```

```
islocked
```

```
lastEdit
```

```
createdByUserName
```

```
updatedByUserName
```

```
created
```

The sorting order. It accepts the ascending and descending direction specifiers.

```
asc
```

```
desc
```

Retrieved scenarios

Retrieved scenarios

### hashtag Create scenario

Creates a new scenario with data passed in the request body. In the response, it returns all details of the created scenario including its blueprint.

- scenarios:write

```
scenarios:write
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

If set to true this parameter confirms the scenario creation when the scenario contains the app that is used in the organization for the first time and needs installation. If the parameter is missing or it is set to false an error code is returned and the scenario is not created.

```
true
```

```
false
```

```
true
```

The scenario blueprint. To save resources, the blueprint is sent as a string, not as an object.

The unique ID of the team in which the scenario will be created.

The scenario scheduling details. To save resources, the scheduling details are sent as a string, not as an object.

The unique ID of the folder in which you want to store created scenario.

Defines if the scenario is created based on a template. The value is the template ID.

Scenario created successfully

Scenario created successfully

### hashtag Get scenario details

Retrieves all available properties of a scenario with a given ID. The returned details do not include a scenario blueprint. If you want to get a scenario blueprint, refer to the Get scenario blueprint endpoint.

- scenarios:read

```
scenarios:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the scenario. You can get the scenarioId with the List scenarios API call.

```
scenarioId
```

```
112
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

### hashtag Delete scenario

Deletes a scenario with a given ID and returns the ID in the response.

- scenarios:write

```
scenarios:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the scenario. You can get the scenarioId with the List scenarios API call.

```
scenarioId
```

```
112
```

Scenario deleted successfully

Scenario deleted successfully

### hashtag Update scenario

Updates a scenario with a given ID by passing new values in the request body. Any property that is not provided will be left unchanged. In the response, it returns all details of the updated scenario including properties that were not changed.

- scenarios:write

```
scenarios:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the scenario. You can get the scenarioId with the List scenarios API call.

```
scenarioId
```

```
112
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

If set to true this parameter confirms the scenario update when the scenario contains the app that is used in the organization for the first time and needs installation. If the parameter is missing or it is set to false an error code is returned and the scenario is not updated.

```
true
```

```
false
```

```
true
```

The scenario blueprint. To save resources, the blueprint is sent as a string, not as an object.

The scenario scheduling details. To save resources, the scheduling details are sent as a string, not as an object.

The unique ID of the folder in which you want to store created scenario.

A new name of the scenario. The name does not need to be unique.

Scenario was updated successfully

Scenario was updated successfully

### hashtag Get trigger details

Retrieves properties of a trigger included in a scenario with a given ID. A trigger is a module that is able to return bundles that were newly added or updated (depending on the settings) since the last run of the scenario. An example of a trigger is a hook.

- scenarios:read

```
scenarios:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the scenario. You can get the scenarioId with the List scenarios API call.

```
scenarioId
```

```
112
```

Successful response

Successful response

### hashtag Clone scenario

Clones the specified scenario. The response contains all information about the scenario clone.

You have to know which app integrations the scenario contains. You can get a list of apps used in the scenario with the API call GET /scenarios/{scenarioId} in the usedPackages array.

```
GET /scenarios/{scenarioId}
```

```
usedPackages
```

If you are cloning the scenario to a different team and the scenario contains an app module, webhook or data store, you have to either:

- map the entity ID to a different entity with the correct properties. For example, you can map an app module connection to a different connection of the same app with the same scopes, or
- use the notAnalyze query parameter to turn off the scenario clone blueprint analysis.

map the entity ID to a different entity with the correct properties. For example, you can map an app module connection to a different connection of the same app with the same scopes, or

use the notAnalyze query parameter to turn off the scenario clone blueprint analysis.

```
notAnalyze
```

When you turn off the scenario blueprint analysis you can map the entity ID to the null value, which omits the entity settings.

```
null
```

The scenario blueprint analysis makes sure that the scenario clone will work without further changes. If you turn off the scenario blueprint analysis, check the configuration of all entities in the scenario clone.

If you are cloning the scenario to a different team and the scenario contains a custom app or a custom function, which is not available for the users in the team, use the confirmed query parameter to confirm cloning of the scenario. Otherwise, you get an error listing the custom function that you have to create in the team.

```
confirmed
```

Refer to the request body parameters description and examples for more information.

- scenarios:write

```
scenarios:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the scenario. You can get the scenarioId with the List scenarios API call.

```
scenarioId
```

```
112
```

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

If the scenario contains a custom app or a custom function, that is not available in the team, you have to set the confirmed parameter to true to clone the scenario. Otherwise you get an error and the scenario is not cloned.

```
confirmed
```

```
true
```

```
{"value":true}
```

If you are cloning a scenario to a different team, you have to map the scenario entities (connections, data stores, webhooks, ...) from the original to the clone. If you cannot map all of the scenario entities, set the notAnalyze parameter to true to suppress the scenario blueprint analysis.

```
notAnalyze
```

```
true
```

```
{"value":true}
```

The name for the scenario clone. The maximum length of the name is 120 characters.

The ID of the team to which you want to clone the scenario.

Specify pairs of original and clone connection IDs to map connections to the cloned scenario.

Specify pairs of original and clone key IDs to map keys to the cloned scenario.

Specify pairs of original and clone hook IDs to map webhooks to the cloned scenario.

Specify pairs of original and clone device IDs to map devices to the cloned scenario.

Specify pairs of original and clone data structure IDs to map data structures to the cloned scenario.

Specify pairs of original and clone data store IDs to map data stores to the cloned scenario.

Set to true to clone also states of the scenario modules, for example last scenario trigger execution. Setting to false resets the state information of the scenario modules in the scenario clone.

```
true
```

```
false
```

Successful response

Successful response

### hashtag Check module data

Verifies whether the module data is set or not. This endpoint doesn't retrieve the module data.

- scenarios:write

```
scenarios:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the scenario. You can get the scenarioId with the List scenarios API call.

```
scenarioId
```

```
112
```

The unique ID of the scenario module. It is available in the scenario blueprint that can be retrieved from the Get scenario blueprint endpoint.

```
1
```

Successful response

Successful response

### hashtag Activate scenario

Activates the specified scenario. Also runs the scenario if the scenario is scheduled to run at regular intervals. Read more about scenario scheduling arrow-up-right .

The API call response contains the scenario ID and the scenario isActive property set to true .

```
isActive
```

```
true
```

- scenarios:write

```
scenarios:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the scenario. You can get the scenarioId with the List scenarios API call.

```
scenarioId
```

```
112
```

Successful response

Successful response

### hashtag Deactivate scenario

Deactivates and stops the specified scenario if the scenario is running. The API call response contains the scenario ID and the scenario isActive property set to false .

```
isActive
```

```
false
```

- scenarios:write

```
scenarios:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the scenario. You can get the scenarioId with the List scenarios API call.

```
scenarioId
```

```
112
```

Successful response

Successful response

### hashtag Run a scenario

Runs the specified scenario. The scenario has to be active. If your scenario has required scenario inputs you have to provide the scenario inputs in the request body. If the scenario provides scenario outputs, these are returned in the response.

Note: Organization request limits arrow-up-right do not apply for this endpoint.

- scenarios:read
- scenarios:write
- scenarios:run

```
scenarios:read
```

```
scenarios:write
```

```
scenarios:run
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the scenario. Get the ID of the scenario with the API call GET /scenarios .

```
GET /scenarios
```

```
111
```

If your scenario has inputs specify the input parameters and values in the data object.

```
data
```

If set to true the Make API waits until the scenario finishes. The response contains the scenario status and executionId . If the scenario execution takes longer than 40 seconds, the API call returns the time out error, but the scenario is still executed.

```
true
```

```
status
```

```
executionId
```

If set to false the API call returns immediately without waiting. The response contains only the executionId .

```
false
```

```
executionId
```

```
false
```

Url that will be called once the scenario execution finishes. If the run is responsive and finishes within 40 seconds, the url is not called since the result is present in the response.

The callbackUrl will be called using a POST request with the following body:

```
callbackUrl
```

```
POST
```

{
"executionId": executionId ,
"statusUrl": "url to retrieve execution status and outputs via GET"
}

```
executionId
```

Successful response

ID of the scenario execution.

Status of the scenario execution:

- 1 : success
- 2 : warning
- 3 : error.

```
1
```

```
2
```

```
3
```

Successful response

### hashtag Replay a scenario execution

Replays the specified scenario execution. The scenario has to be active.

- scenarios:run

```
scenarios:run
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the scenario. Get the ID of the scenario with the API call GET /scenarios .

```
GET /scenarios
```

```
111
```

An array of executionIds. Currently only the first one will be replayed.

202 Accepted - Successful response

404 Not Found

202 Accepted - Successful response

```
No content
```

No content

### hashtag Get scenario interface

Retrieves the scenario inputs and outputs specification for the specified scenario. Check out the scenario inputs and outputs documentation arrow-up-right in the Make help center.The scenario inputs and outputs feature is available with all plans. Read more about Make pricing. arrow-up-right

- scenarios:read

```
scenarios:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the scenario. Get the list of scenarios with the API call GET /scenarios .

```
GET /scenarios
```

```
111
```

Successful response

Successful response

### hashtag Update scenario interface

Updates specification of the scenario inputs. Check out the scenario inputs documentation arrow-up-right in the Make help center.

If you want to enable the scenario inputs you have to set the scenario scheduling to "On demand" first, otherwise you get error 422 (IM016). You can use the API call:

PATCH /scenarios/{scenarioId}?confirmed=true

```
PATCH /scenarios/{scenarioId}?confirmed=true
```

with the request body:

{"scheduling": "{\"type\":\"on-demand\"}"}

```
{"scheduling": "{\"type\":\"on-demand\"}"}
```

You can disable inputs for the specified scenario by sending a payload with an empty input array.

```
input
```

The response contains the updated scenario inputs specification.

The scenario inputs feature requires your account to have the pricing plan Pro or higher. Read more about Make pricing. arrow-up-right

- scenarios:write

```
scenarios:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the scenario. Get the list of scenarios with the API call GET /scenarios .

```
GET /scenarios
```

```
111
```

Contains the input array with specification of the scenario input parameters.

```
input
```

Successful response

Successful response

### hashtag Get scenario usage

Retrieves a list of daily centicredits, operations, and data transfer usage for a specified scenario over the past 30 days.

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

- scenarios:read

```
scenarios:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the scenario. You can get the scenarioId with the List scenarios API call.

```
scenarioId
```

```
112
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

### hashtag List buildtime variables

Retrieves buildtime variables of a scenario with the given ID. Buildtime variables could be team or user defined, team defined ones are prefixed with a TAC_ and user defined variables are prefixed with a PAC_ . TAC_ s can be used within the scenario as per its input spec by the entire team, whereas PAC_ s can only be used within the scenario by the user who added them.

```
TAC_
```

```
PAC_
```

```
TAC_
```

```
PAC_
```

- scenarios:read

```
scenarios:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the scenario. You can get the scenarioId with the List scenarios API call.

```
scenarioId
```

```
112
```

Successful response

Successful response

### hashtag Add new buildtime variables to scenario metadata

Adds new buildtime team or user defined variable/s. Buildtime variables should be prefixed either with a TAC_ (for team defined variables) or with a PAC_ (for personal user defined variables), followed by the connection value. If a variable already exists, an error will be thrown. If a variable's name is not within scenario input specification, an error will be thrown. If the adding of new variables was successful the reponse would be OK .

```
TAC_
```

```
PAC_
```

```
OK
```

- scenarios:write

```
scenarios:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the scenario. You can get the scenarioId with the List scenarios API call.

```
scenarioId
```

```
112
```

Buildtime variables added successfully

Buildtime variables added successfully

### hashtag Update buildtime variables in scenario metadata

Updates team or user defined buildtime variable/s. The endpoint updates and overwrites exsiting records with the newly provided values, meaning any existing buildtime variable which is not provided through the payload will be overwritten. Buildtime variables should be prefixed either with a TAC_ (for team defined variables) or with a PAC_ (for personal user defined variables), followed by the connection value. If a variable doesn't exist, it will be added provided that its name is within the scenario input specification. If the updating of variables was successful the reponse would be OK .

```
TAC_
```

```
PAC_
```

```
OK
```

- scenarios:write

```
scenarios:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the scenario. You can get the scenarioId with the List scenarios API call.

```
scenarioId
```

```
112
```

Buildtime variables updated successfully

Buildtime variables updated successfully

### hashtag Delete buildtime variable

Deletes a buildtime variable with a given value for a scenario with a given ID and returns OK in the response.

```
OK
```

- scenarios:write

```
scenarios:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the scenario. You can get the scenarioId with the List scenarios API call.

```
scenarioId
```

```
112
```

The value of the buildtime variable

```
PAC_123455551
```

Buildtime variable deleted successfully

Buildtime variable deleted successfully

### hashtag List AI agent scenarios

Retrieves scenarios that contain at least one AI agent module for the specified team. Results are sorted by last edit date in descending order.

- scenarios:read

```
scenarios:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The unique ID of the team whose scenarios folders will be retrieved.

```
1
```

The number of entities you want to skip before getting entities you want.

The maximum number of entities you want to get in the response.

Retrieved AI agent scenarios

Retrieved AI agent scenarios

Last updated 1 day ago

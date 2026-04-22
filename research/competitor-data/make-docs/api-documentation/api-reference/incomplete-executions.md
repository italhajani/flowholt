---
title: "Incomplete executions | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/incomplete-executions
scraped_at: 2026-04-21T12:41:22.124183Z
---

1. API Reference

# Incomplete executions

If a scenario terminates unexpectedly because of an error, then the scenario run is discarded. You can set the scenario to store the failed scenario run as an incomplete execution. With that, if an error occurs in your scenario, you can resolve it manually and avoid losing data.

Read more about the incomplete executions arrow-up-right .

### hashtag List scenario incomplete executions

Retrieves the list of incomplete executions of the specified scenario.

- dlqs:read

```
dlqs:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID value of the scenario. Use the API call GET /scenarios to get the ID of the scenario. If your scenario is placed in a folder, use the API call GET /scenarios-folders?teamId={teamId} first.

```
GET /scenarios
```

```
GET /scenarios-folders?teamId={teamId}
```

```
4
```

Successful response

Successful response

### hashtag Delete scenario incomplete executions

Deletes incomplete executions of the specified scenario. Specify the incomplete execution ID values in the ids array in the request body to delete the specified incomplete executions.

```
ids
```

You can set the "all": true pair to delete all incomplete executions of the specified scenario. If you use the "all": true parameter, you have to specify the confirmed=true query parameter to confirm the deletion. Otherwise, the API call returns the error IM004 (406).

```
"all": true
```

```
"all": true
```

```
confirmed=true
```

Add the exceptIds array to the request body to specify items you don't want to delete.

```
exceptIds
```

You get an error if you try to delete incomplete executions which are being processed. The rest of the specified items is still deleted.

- dlqs:write

```
dlqs:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID value of the scenario. Use the API call GET /scenarios to get the ID of the scenario. If your scenario is placed in a folder, use the API call GET /scenarios-folders?teamId={teamId} first.

```
GET /scenarios
```

```
GET /scenarios-folders?teamId={teamId}
```

```
4
```

Set to true to confirm deleting the incomplete executions. Otherwise the API call fails with the error IM004 (406).

```
true
```

```
true
```

The ID values of the scenario incomplete executions that you want to delete. Use the API call GET /dlqs/?scenarioId={scenarioId} to get the ID values of the webhook processing queue items.

```
GET /dlqs/?scenarioId={scenarioId}
```

If you are deleting all of the incomplete executions with the all:true parameter, you can specify the ID values of the incomplete executions that you want to keep. Use the API call GET /dlqs?scenarioId={scenarioId} to get the ID values of the incomplete executions.

```
all:true
```

```
GET /dlqs?scenarioId={scenarioId}
```

Set to true to delete all incomplete executions of the specified scenario.

```
true
```

Successful response

Successful response

### hashtag Incomplete execution detail

Gets detail of the specified incomplete execution.

- dlqs:read

```
dlqs:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the incomplete execution. Get the ID values of the incomplete executions of a scenario with the API call GET /dlqs?scenarioId={scenarioId} .

```
GET /dlqs?scenarioId={scenarioId}
```

```
a07e16f2ad134bf49cf83a00aa95c0a5
```

Successful response

Successful response

### hashtag Delete - deprecated

Required scope: datastores:write

- dlqs:write

```
dlqs:write
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

### hashtag Update incomplete execution

Updates the specified incomplete execution.

- dlqs:write

```
dlqs:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the incomplete execution. Get the ID values of the incomplete executions of a scenario with the API call GET /dlqs?scenarioId={scenarioId} .

```
GET /dlqs?scenarioId={scenarioId}
```

```
a07e16f2ad134bf49cf83a00aa95c0a5
```

The blueprint you want to use to resolve the incomplete execution. If you download the blueprint from a Make scenario as a JSON object, you have to escape the blueprint contents to be able to send it as a string.

The module ID which caused the incomplete execution of the scenario.

Successful response

Successful response

### hashtag Get failed scenario blueprint

Gets the blueprint of the scenario that caused the incomplete execution.

- dlqs:read

```
dlqs:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the incomplete execution. Get the ID values of the incomplete executions of a scenario with the API call GET /dlqs?scenarioId={scenarioId} .

```
GET /dlqs?scenarioId={scenarioId}
```

```
a07e16f2ad134bf49cf83a00aa95c0a5
```

Successful response

Successful response

### hashtag Get incomplete execution bundles

Gets bundles that caused the incomplete execution.

- dlqs:read

```
dlqs:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the incomplete execution. Get the ID values of the incomplete executions of a scenario with the API call GET /dlqs?scenarioId={scenarioId} .

```
GET /dlqs?scenarioId={scenarioId}
```

```
a07e16f2ad134bf49cf83a00aa95c0a5
```

Successful response

Successful response

### hashtag List incomplete executions logs

Gets data about attempts to resolve an incomplete execution.

- dlqs:read

```
dlqs:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the incomplete execution. Get the ID values of the incomplete executions of a scenario with the API call GET /dlqs?scenarioId={scenarioId} .

```
GET /dlqs?scenarioId={scenarioId}
```

```
a07e16f2ad134bf49cf83a00aa95c0a5
```

The status number of the incomplete execution. The status numbers correspond to the following statuses:

- 1: success,
- 2: warning,
- 3: error.

```
3
```

```
1
```

```
2
```

```
3
```

The moment from which you want to list the incomplete execution logs. The timestamp is in the UNIX timestamp format.

```
1548975600000
```

Limits the returned incomplete execution logs to those that were created before the specified moment. The timestamp is in the UNIX timestamp format.

```
1574782119387
```

Successful response

Successful response

### hashtag Incomplete execution log detail

Gets detail of the specified incomplete execution log.

- dlqs:read

```
dlqs:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the incomplete execution. Get the ID values of the incomplete executions of a scenario with the API call GET /dlqs?scenarioId={scenarioId} .

```
GET /dlqs?scenarioId={scenarioId}
```

```
a07e16f2ad134bf49cf83a00aa95c0a5
```

The ID of the incomplete execution log. Get the ID values of the incomplete execution logs with the API call GET /dlqs/{dlqId}/logs .

```
GET /dlqs/{dlqId}/logs
```

```
1356b72d781649a18692a0d4d09cd977
```

Successful response

Successful response

### hashtag Retry incomplete execution

Triggers a retry of the specified incomplete execution. The incomplete execution runs with the blueprint from when the error happened.

If you need to update the blueprint first, use the endpoint PATCH /dlqs/{dlqId} .

```
PATCH /dlqs/{dlqId}
```

- dlqs:write

```
dlqs:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the incomplete execution. Get the ID values of the incomplete executions of a scenario with the API call GET /dlqs?scenarioId={scenarioId} .

```
GET /dlqs?scenarioId={scenarioId}
```

```
a07e16f2ad134bf49cf83a00aa95c0a5
```

Successful response

Successful response

### hashtag Retry multiple incomplete executions

Triggers a retry of the specified incomplete executions. You can either use the all parameter to retry all incomplete executions of the scenario, or specify a list of incomplete execution IDs in the ids property.

```
all
```

```
ids
```

You can use the exceptIds parameter to exclude incomplete executions from retrying.

```
exceptIds
```

The incomplete executions run with the blueprint from when the error happened. If you need to update the blueprint first, use the endpoint PATCH /dlqs/{dlqId} .

```
PATCH /dlqs/{dlqId}
```

Make puts the incomplete executions in a queue. If you are retrying a large number of incomplete executions, there might be a delay between receiving the response and Make retrying the incomplete execution.

- dlqs:write

```
dlqs:write
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

The list of incomplete execution IDs you want to retry. All of the IDs have to belong to the same scenario.

Set to true to retry all incomplete executions of the scenario.

```
true
```

You can use this parameter together with the all parameter to specify incomplete execution IDs which shouldn't be retried.

```
all
```

Successful response

Successful response

Last updated 1 day ago

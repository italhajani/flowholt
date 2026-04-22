---
title: "Logs | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/scenarios/logs
scraped_at: 2026-04-21T12:43:31.536433Z
---

1. API Reference chevron-right
2. Scenarios

# Logs

The following endpoints allow you to manage scenarios logs.

### hashtag List scenario logs

Retrieves a collection of all logs for a scenario with a given ID. Returned logs are sorted by imtId in descending order.

```
imtId
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

The timestamp in milliseconds that defines the starting point of time from which the logs should be retrieved. Older logs will not be returned.

```
1632395547
```

The timestamp in milliseconds that defines the ending point of time to which the logs should be retrieved. Newer logs will not be returned.

```
1632395548
```

Filters logs by the execution status. 1 is for success, 2 is for warning, and 3 is for error.

```
1
```

```
2
```

```
3
```

```
2
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

Filters logs to only include executions with a duration greater than or equal to this value (in milliseconds).

```
1000
```

Filters logs to only include executions with a duration less than or equal to this value (in milliseconds).

```
5000
```

Filters logs to only include executions with an operations count greater than or equal to this value.

```
0
```

Filters logs to only include executions with an operations count less than or equal to this value.

```
100
```

Filters logs to only include executions with a data transfer greater than or equal to this value (in bytes).

```
0
```

Filters logs to only include executions with a data transfer less than or equal to this value (in bytes).

```
10000
```

Filters logs by the execution name (partial match).

```
My run
```

Filters logs to only include executions with credits greater than or equal to this value (in centicredits).

```
0
```

Filters logs to only include executions with credits less than or equal to this value (in centicredits).

```
1000
```

If set to true , this parameter specifies that check runs should be hidden in the returned results. Check runs concern scenarios starting with a trigger in cases when the trigger does not find anything new.

```
true
```

```
true
```

The number of entities you want to skip before getting entities you want.

The maximum number of entities you want to get in the response.

Include records with last value in the result set. Just in case of the last based paging.

```
last
```

```
last
```

```
true
```

The last retrieved key. In response, you get only entries that follow after the key.

```
10
```

The value that will be used to sort returned entities by.

The sorting order. It accepts the ascending and descending direction specifiers.

```
asc
```

```
desc
```

Successful response

Successful response

### hashtag Get execution log

Retrieves an execution log with a given ID for a scenario with a given ID. It returns the execution details such as execution duration, type, and status.

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

The unique ID of the scenario execution. It can be retrieved from the List scenario logs endpoint under the ID key.

```
cc1c49323b344687a324888762206003
```

Execution log retrieved

Execution log retrieved

### hashtag Get scenario execution details

Retrieves details about an execution.

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

The unique ID of the scenario execution. It can be retrieved from the List scenario logs endpoint under the ID key.

```
cc1c49323b344687a324888762206003
```

Successful response

Status of the scenario execution:

- RUNNING
- SUCCESS
- WARNING
- ERROR

Outputs of the scenario execution. The structure of the outputs depends on the scenario configuration.

```
{"output1":"text output","output2":123}
```

Successful response

### hashtag Operations by Module

Retrieves an aggregated list of operations per module within a specified time period.

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

Days to summarize retrospectively. Default 1, must be between 1 and 30.

```
1
```

Module log retrieved

Module log retrieved

### hashtag List module logs

Retrieves an operation logs of a given module within a given scenario. Returns the operation details such as execution id, timestamp or status.

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

The unique ID of the scenario module. It is available in the scenario blueprint that can be retrieved from the Get scenario blueprint endpoint.

```
1
```

The number of entities you want to skip before getting entities you want.

The maximum number of entities you want to get in the response.

Include records with last value in the result set. Just in case of the last based paging.

```
last
```

```
last
```

```
true
```

The last retrieved key. In response, you get only entries that follow after the key.

```
10
```

The value that will be used to sort returned entities by.

The sorting order. It accepts the ascending and descending direction specifiers.

```
asc
```

```
desc
```

Module logs retrieved

Module logs retrieved

Last updated 1 day ago

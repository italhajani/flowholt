---
title: "Logs | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/hooks/logs
scraped_at: 2026-04-21T12:43:28.295981Z
---

1. API Reference chevron-right
2. Hooks

# Logs

Make stores a log of every webhook execution. Make stores webhook logs for 3 days. The webhook logs for organizations with the Enterprise plan are stored for 30 days. Read more about webhook logs arrow-up-right .

The following endpoints allow you to retrieve webhook logs.

### hashtag Get webhook logs

Retrieves a list of the specified webhook execution logs. Use the to and from parameters to filter the returned logs. The response contains:

```
to
```

```
from
```

- statusId : the status of the webhook execution; 1 means successful execution, 3 means failed execution
- loggedAt : the moment when Make created the log
- id : the ID of the webhook execution log

statusId : the status of the webhook execution; 1 means successful execution, 3 means failed execution

```
statusId
```

```
1
```

```
3
```

loggedAt : the moment when Make created the log

```
loggedAt
```

id : the ID of the webhook execution log

```
id
```

- hooks:read

```
hooks:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the webhook. Use the GET /hooks API call to get the ID values of your webhooks.

```
GET /hooks
```

```
654
```

Limits data in the response to entries older than the specified timestamp. Use the UNIX timestamp format in milliseconds.

```
1663495749015
```

Limits data in the response to entries newer than the specified timestamp. Use the UNIX timestamp format in milliseconds.

```
1663495749015
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

### hashtag Get webhook execution detail

Retrieves the specified webhook execution log. The response contains:

- statusId : the status of the webhook execution; 1 means successful execution, 3 means failed execution
- loggedAt : the moment when Make created the log
- id : the ID of the webhook execution log
- data : information about the request, header, and payload sent to the webhook.

statusId : the status of the webhook execution; 1 means successful execution, 3 means failed execution

```
statusId
```

```
1
```

```
3
```

loggedAt : the moment when Make created the log

```
loggedAt
```

id : the ID of the webhook execution log

```
id
```

data : information about the request, header, and payload sent to the webhook.

```
data
```

Some webhooks don't return the data object due to their implementation. Most common examples include instant triggers for Slack, Zoom, Intercom and Facebook lead ads apps.

```
data
```

- hooks:read

```
hooks:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the webhook. Use the GET /hooks API call to get the ID values of your webhooks.

```
GET /hooks
```

```
654
```

The ID of the webhook execution log. Use the GET /hooks/{hookId}/logs API call to get the ID values of your webhook execution logs.

```
GET /hooks/{hookId}/logs
```

```
95b1c20c790ff5f9d2f1e805943ce95d
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

Last updated 1 day ago

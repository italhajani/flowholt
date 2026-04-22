---
title: "Incomings | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/hooks/incomings
scraped_at: 2026-04-21T12:43:29.587509Z
---

1. API Reference chevron-right
2. Hooks

# Incomings

When data arrive to a scheduled webhook, Make places the data in the webhook processing queue. Webhooks process data in the same order as they arrive. The following endpoints allow you to inspect and update the webhook processing queue.

### hashtag Get webhook queue

Retrieves a list of webhook queue items waiting for processing with the specified webhook. The request response contains:

- the incoming payload hash
- incoming data scope
- the size of the data in bytes
- timestamp of the moment when the data were placed in the processing queue

the incoming payload hash

incoming data scope

the size of the data in bytes

timestamp of the moment when the data were placed in the processing queue

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

### hashtag Delete items from webhook queue

Deletes items from the processing queue of the specified webhook. Specify the payload ID values that you want to delete in the request body in the ids array.

```
ids
```

You can set the "all": true pair to delete all items from the webhook processing queue. If you use the "all": true parameter, you have to specify the confirmed=true query parameter to confirm the deletion. Otherwise the API call returns the error IM004 (406).

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

The API call response will contain an error message if some of the specified queue items cannot be deleted. The rest of the specified items will be deleted. Deleting a webhook queue item is not allowed when the item is already being processed by the webhook.

- hooks:write

```
hooks:write
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

Set to true to confirm deleting the webhook queue items. Otherwise the API call fails with the error IM004 (406).

```
true
```

```
true
```

The ID values of the webhook processing queue items that you want to delete. Use the API call GET /hooks/{hookId}/incomings to get the ID values of the webhook processing queue items.

```
GET /hooks/{hookId}/incomings
```

If you are deleting all of the incomplete executions with the all:true parameter, you can specify the ID values of the webhook queue items that you want to keep. Use the API call GET /hooks/{hookId}/incomings to get the ID values of the webhook queue items.

```
all:true
```

```
GET /hooks/{hookId}/incomings
```

Set to true to delete all items in the webhook processing queue.

```
true
```

Successful response

Successful response

### hashtag Get webhook queue item detail

Retrieves detail information about the specified webhook queue item. You can get the webhook queue item ID value with the API call GET /hooks/{hookId}/incomings .

```
GET /hooks/{hookId}/incomings
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

The ID value of the webhook queue item. Get the list of webhook queue items with the API call GET /hooks/{hookId}/incomings .

```
GET /hooks/{hookId}/incomings
```

```
7a567f385d1a4f5ab7bff89162b7605e
```

Successful response

Successful response

### hashtag Get webhook queue stats

Gets webhook processing queue stats. The response contains the number of items in the webhook queue and the webhook queue limit.

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

Successful response

Successful response

Last updated 1 day ago

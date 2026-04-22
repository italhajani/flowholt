---
title: "Hooks | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/hooks
scraped_at: 2026-04-21T12:41:24.103724Z
---

1. API Reference

# Hooks

Hooks refer to the webhooks and mailhooks available in the various apps in the Make interface. They notify you whenever a certain change occurs in the connected app or service, such as sending an HTTP request or an email. The following endpoints allow you to create and manage hooks.

### hashtag List hooks

Retrieves a collection of all hooks for a team with a given ID. Returned hooks are sorted by name in ascending order.

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

The unique ID of the team whose hooks will be retrieved.

```
4
```

The hook type. Two native Make hook types are gateway-webhook and gateway-mailhook .

```
gateway-webhook
```

```
gateway-mailhook
```

```
gateway-webhook
```

Specifies if the hook is assigned to a scenario. If set to true , the request will return only the hooks which the scenarioId value is not set to null.

```
true
```

```
scenarioId
```

```
true
```

This parameter shows only the hooks that can be used by a scenario with a specific ID, which means hooks that are not assigned to another scenario yet and the hook that is already assigned to this scenario. This can be useful because Make allows assigning any hook to only one scenario. If this parameter is set the assigned parameter is ignored.

```
assigned
```

```
123
```

Successful response

Successful response

### hashtag Create hook

Creates a new hook with data passed in the request body. In the response, it returns all details of the created hook.

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

The name of the hook. The name must be at most 128 characters long and does not need to be unique.

The unique ID of the team in which a hook will be created.

The hook type strictly related to the app for which the hook was created.

Set the method parameter to true to add the HTTP method to the request body.

```
method
```

```
true
```

Set the headers parameter to true to add headers to the request body.

```
headers
```

```
true
```

Set the stringify parameter to true to return JSON payloads as strings.

```
stringify
```

```
true
```

The unique ID of the connection that will be included in the created hook.

The unique ID of the form that will be included in the created hook.

Successful response

Successful response

### hashtag Get hook details

Retrieves details of a hook with a given ID including hooks data.

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

### hashtag Delete hook

Deletes a hook with a given ID and returns the ID in the response.

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

Confirms the deletion if a hook is included in the scenario. Confirmation is required because the scenario will stop working without the hook. If the parameter is missing or it is set to false an error code is returned and the resource is not deleted.

```
false
```

```
true
```

Successful response

Successful response

### hashtag Update hook

Updates a hook with a given ID by passing new values in the request body. Any property that is not provided will be left unchanged. In the response, it returns all details of the updated hook including properties that were not changed.

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

The name of the updated hook. The name must be at most 128 characters long and does not need to be unique.

Successful response

Successful response

### hashtag Ping hook

Determines if a hook with a given ID is active and retrieves its properties that provide you with the address of the hook and inform if the hook is attached, what is its learning status, and if it was not used for a long time.

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

### hashtag Learn start

Starts the process of learning the request body structure by a hook with a given ID. When you send to the hook address a request with data in its body, you can use this endpoint to force the hook to start determining the payload data structure which will later be suggested in the scenario as the output of the hook. The data structure learning process also starts automatically when a new hook is created and stops once the data structure is determined. If you want to stop this process, you can use the Learn stop endpoint.

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

Successful response

Successful response

### hashtag Learn stop

Stops the process of learning the request body structure by a hook with a given ID. When you send to the hook address a request with data in its body, you can use the Learn start endpoint to force the hook to start determining the payload data structure which will later be suggested in the scenario as the output of the hook. The data structure learning process also starts automatically when a new hook is created and stops once the data structure is determined. You can use this endpoint to stop the learning process at any time.

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

Successful response

Successful response

### hashtag Enable hook

Enables a disabled hook with a given ID. Newly created hooks are enabled by default which means they are ready to accept data. In response, this endpoint returns the confirmation that the hook was successfully enabled.

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

Successful response

Successful response

### hashtag Disable hook

Disables a hook with a given ID. Newly created hooks are enabled by default which means they are ready to accept data. The disabled hook does not accept any data. This endpoint can be useful when you want to debug the scenario functionality. In response, this endpoint returns the confirmation that the hook was successfully disabled.

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

Successful response

Successful response

### hashtag Set hook details

Sets data for a hook with a given ID. Data differ depending on the hook type. It returns the confirmation if the hook data was changed ( true ) or not ( false ).

```
true
```

```
false
```

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

Successful response

Successful response

Last updated 1 day ago

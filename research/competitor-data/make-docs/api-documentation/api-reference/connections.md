---
title: "Connections | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/connections
scraped_at: 2026-04-21T12:41:19.145871Z
---

1. API Reference

# Connections

In Make, you need to create a connection for most apps. Make then uses this connection to communicate with the third-party service and to authenticate your requests to the third-party service. The following endpoints allow you to create and manage connections.

### hashtag List connections

Retrieves a collection of all connections for a team with a given ID. Returned connections are sorted by name in ascending order.

- connections:read

```
connections:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The unique ID of the team whose connections will be retrieved.

```
22
```

Specifies the type of the connections to return details for. The connection type is defined in the accountName property and you can get it from the Get connection details endpoint.

```
accountName
```

```
{"value":"airtable2"}
```

Allows utilizing the scopes check. The particular connection type ( <connectionType> ) should be one of the types specified in the type[] parameter. The values are the scopes to check for the given connection type. You can send multiple <connectionType> values with corresponding arrays to check multiple connection types scopes at once. The result of the check is reflected in the scoped property of the returned connection object.

```
<connectionType>
```

```
type[]
```

```
<connectionType>
```

```
scoped
```

```
{"value":["requestedScope","anotherRequestedScope"]}
```

Specifies the group of values to return. For example, you may want to check which returned connections can be upgraded.

```
{"summary":"Return all details","value":["id","name","accountName","accountLabel","packageName","expire","metadata","teamId","theme","upgradeable","scopesCnt","scoped","accountType","editable","uid","connectedSystemId","organizationId"]}
```

Successful response

Successful response

### hashtag Create connection

Creates a new connection with data passed in the request body. In the response, it returns all details of the created connection.

- connections:write

```
connections:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The unique ID of the team whose connections will be retrieved.

```
1
```

The connection name. The name must be at most 128 characters long and does not need to be unique.

The connection type corresponding to the connected app. For some connection types, this property may require providing additional properties in the request body,  such as clientId and clientSecret , in order to authorize the connection and make it functional.

```
clientId
```

```
clientSecret
```

The connection scope determining the module use. The format and number of available scopes vary depending on the accountType parameter.

```
accountType
```

Successful response

Successful response

### hashtag List updatable connection parameters

Gets a list of connection parameters that can be updated. You can update a connection with the API call POST /connections/{connectionId}/set-data .

```
POST /connections/{connectionId}/set-data
```

If the connection cannot be updated then the API call returns the error message "Cannot edit this connection." When this happens, create a new connection instead.

- connections:read

```
connections:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the connection. You can get connection ID's of all your connections with the the List connections endpoint.

```
128
```

Successful response

Successful response

### hashtag Update a connection

Updates the specified connection with data in the request body. Check which data you need to send to update the connection with the API call GET /connections/{connectionId}/editable-data-schema . The data might be different for each app and connection type.

```
GET /connections/{connectionId}/editable-data-schema
```

The new connection data replace the original connection data. Make sure to provide all relevant data. If a field is missing in the request body, Make replaces the field in the new connection with an empty value.

For OAuth connections, you need to log in to Make and confirm the changes with the Reauthorize button. For the rest of the connection types, Make starts using the new connection data immediately.

If the connection cannot be updated then the API call returns the error message "Cannot edit this connection." When this happens, create a new connection instead.

- connections:write

```
connections:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the connection. You can get connection ID's of all your connections with the the List connections endpoint.

```
128
```

The request body has to contain the parameters listed in the response from the API call GET /connections/{connectionId}/editable-data-schema and the new values associated with them.

```
GET /connections/{connectionId}/editable-data-schema
```

Successful response

Successful response

### hashtag Get connection details

Retrieves details of a connection with a given ID.

- connections:read

```
connections:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the connection. You can get connection ID's of all your connections with the the List connections endpoint.

```
128
```

Specifies the group of values to return. For example, you may want to retrieve only the name and scope for a given connection.

Successful response

Successful response

### hashtag Delete connection

Deletes a connection with a given ID and returns the ID in the response.

- connections:write

```
connections:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the connection. You can get connection ID's of all your connections with the the List connections endpoint.

```
128
```

Confirms the deletion if the connection is included in at least one scenario. Confirmation is required because the scenario will stop working without the connection. If the parameter is missing or it is set to false an error code is returned and the resource is not deleted.

```
false
```

```
true
```

Successful response

Successful response

### hashtag Rename a connection

Updates the specified connection's name. The response contains all information about the updated connection.

- connections:write

```
connections:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the connection. You can get connection ID's of all your connections with the the List connections endpoint.

```
128
```

Specifies the group of values to return. For example, you may want to retrieve only the expiration of the updated connection.

The updated connection name. The name must be at most 128 characters long and does not need to be unique.

Successful response

Successful response

### hashtag Verify connection

Verifies the connection status. This endpoint usually communicates with the API of the app that includes the given connection and verifies if credentials saved in Make are still valid. It returns the confirmation if the connection is verified ( true ) or not ( false ).

```
true
```

```
false
```

- connections:write

```
connections:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the connection. You can get connection ID's of all your connections with the the List connections endpoint.

```
128
```

Successful response

Successful response

### hashtag Verify if connection is scoped

Verifies if a scope for a given connection is set. This endpoint returns the information if the connection is scoped ( true ) or not ( false ).

```
true
```

```
false
```

- connections:write

```
connections:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the connection. You can get connection ID's of all your connections with the the List connections endpoint.

```
128
```

The array with IDs of the scopes for a given connection. The scope ID of a specific connection can be retrieved from the Get connection details endpoint.

Successful response

Successful response

Last updated 1 day ago

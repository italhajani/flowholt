---
title: "Data stores | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/data-stores
scraped_at: 2026-04-21T12:41:21.252472Z
---

1. API Reference

# Data stores

Data stores are used to store data from scenarios or for transferring data in between individual scenarios or scenario runs. The following endpoints allow you to create and manage data stores.

### hashtag List data stores

Retrieves a collection of all data stores for a team with a given ID. Returned data stores are sorted by name in ascending order.

- datastores:read

```
datastores:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The unique ID of the team whose data stores will be retrieved.

```
1
```

Specifies the group of values to return. For example, you can retrieve only names and IDs of data stores for a team with a given ID.

```
{"summary":"Return all details","value":["id","name","teamId","records","size","maxSize","datastructureId"]}
```

The value that will be used to sort returned entities by.

```
name
```

The number of entities you want to skip before getting entities you want.

The sorting order. It accepts the ascending and descending direction specifiers.

```
asc
```

```
desc
```

The maximum number of entities you want to get in the response.

Successful response

Successful response

### hashtag Create data store

Creates a new data store with data passed in the request body. In the response, it returns all details of the created data store.

- datastores:write

```
datastores:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The data store name. The name must be at most 128 characters long and does not need to be unique.

The unique ID of the team in which the data store will be created.

The unique ID of the data structure that will be included in the data store. All data structures IDs for a given team can be retrieved from the List data structures endpoint.

The maximum size of the data store (defined in MB).

Successful response

Successful response

### hashtag Delete data stores

Deletes data stores with given IDs and returns their IDs in the response. This endpoint allows deleting one or more data stores at once.

- datastores:write

```
datastores:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

Confirms the deletion if a data store is included in at least one scenario. Confirmation is required because the scenario will stop working without the data store. If the parameter is missing or it is set to false an error code is returned and the resource is not deleted.

```
false
```

```
true
```

The unique ID of the team from which the data store will be deleted.

```
1
```

Successful response

Successful response

### hashtag Get data store details

Retrieves details of a data store with a given ID.

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

The ID of the data store. Get the dataStoreId from the List data stores endpoint.

```
dataStoreId
```

```
137
```

Specifies the group of values to return. For example, you can retrieve only names and IDs of data stores for a team with a given ID.

Successful response

Successful response

### hashtag Update data store

Updates properties of a data store with a given ID in a team with a given ID by passing new values in the request body. In the response, it returns all details of the updated data store including properties that were not changed. Any property that is not provided will be left unchanged. This endpoint cannot be used to update data included in the data store - for this use the endpoints for managing data stores data.

- datastores:write

```
datastores:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the data store. Get the dataStoreId from the List data stores endpoint.

```
dataStoreId
```

```
137
```

The data store name. The name must be at most 128 characters long and does not need to be unique.

The unique ID of the data structure included in the data store. All data structures IDs for a given team can be retrieved from the List data structures endpoint.

The maximum size of the data store (defined in MB).

Successful response

Successful response

Last updated 1 day ago

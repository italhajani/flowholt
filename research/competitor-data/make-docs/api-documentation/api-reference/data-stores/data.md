---
title: "Data | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/data-stores/data
scraped_at: 2026-04-21T12:43:17.313523Z
---

1. API Reference chevron-right
2. Data stores

# Data

The following endpoints allow you to create and manage records in data stores.

### hashtag List data store records

Retrieves a collection of all records from a data store with a given ID. Each returned record consists of the key (custom or automatically generated) and data .

```
key
```

```
data
```

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

The ID of the data store. Get the dataStoreId from the List data stores endpoint.

```
dataStoreId
```

```
137
```

The maximum number of entities you want to get in the response.

The number of entities you want to skip before getting entities you want.

Successful response

Successful response

### hashtag Create data store record

Creates a new record in a data store with a given ID and returns all record details.

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

The unique key of the data store record. If no key is provided, it will be automatically generated.

The data of the data store record. The structure strictly depends on the included data structure. If no data is provided, in response the values will be set to null.

Successful response

The unique key of the data store record. If no key is provided, it will be automatically generated.

The data of the data store record. The structure strictly depends on the included data structure. If no data is provided, in response the values will be set to null.

Successful response

### hashtag Delete data store records

Deletes records from the specified data store.

Specify the keys of the records you want to delete in the keys array in the request body.

```
keys
```

```
keys
```

Use the all parameter in the request body to delete all records from the data store. You have to add the confirmed parameter in the API call query to confirm deleting the data, otherwise you get an error.

```
all
```

```
confirmed
```

When you are deleting all records, you can use the exceptKeys parameter to specify keys of the records which you want to keep.

```
exceptKeys
```

The response contains keys of the deleted records.

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

Set to true to confirm deleting of the data store records. Otherwise, you get an error and Make won't delete the data store records.

```
true
```

```
{"value":true}
```

The keys of data store records you want to delete. Use the all and confirmed parameters if you want to delete all records in the data store.

```
all
```

```
confirmed
```

Set to true to delete all records in the data store. Use the confirmed parameter to confirm the deletion. You can also use the exceptKeys parameter to specify keys of the records that you want to keep in the data store.

```
true
```

```
confirmed
```

```
exceptKeys
```

Specify the keys of the data store records you want to keep when deleting all records from the data store.

Successful response

Successful response

### hashtag Update entire data store record

Updates a data store record with a given key by passing new data in the request body. It replaces the entire resource with the new values. In the response, this endpoint returns all details of the updated data.

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

The key of the data store record. It can be retrieved from the List data store records endpoint.

```
ecc4819b2260
```

The data is different for each data store so there are no predefined body properties to use. Please see the request example for more details.

Successful response

The unique key of the data store record. If no key is provided, it will be automatically generated.

The data of the data store record. The structure strictly depends on the included data structure. If no data is provided, in response the values will be set to null.

Successful response

### hashtag Update data store record details

Updates a data store record with a given key by passing new data in the request body. Any property that is not provided will be left unchanged. In the response, it returns all details of the updated data including properties that were not changed.

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

The key of the data store record. It can be retrieved from the List data store records endpoint.

```
ecc4819b2260
```

The data is different for each data store so there are no predefined body properties to use. Please see the request example for more details.

Successful response

The unique key of the data store record. If no key is provided, it will be automatically generated.

The data of the data store record. The structure strictly depends on the included data structure. If no data is provided, in response the values will be set to null.

Successful response

Last updated 1 day ago

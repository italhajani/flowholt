---
title: "Data structures | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/data-structures
scraped_at: 2026-04-21T12:41:21.596201Z
---

1. API Reference

# Data structures

Data structures define the format of the data being transferred to the Make platform. For example, they are widely used by the Data stores component. The following endpoints allow you to create and manage data structures.

### hashtag List data structures

Retrieves a collection of all data structures for a team with a given ID. Returned data structures are sorted by name in ascending order.

- udts:read

```
udts:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The unique ID of the team whose data structures will be retrieved.

```
123
```

Specifies the group of values to return. For example, you can retrieve only names of data structures for a team with a given ID.

The value that will be used to sort returned entities by.

```
name
```

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

### hashtag Create data structure

Creates a new data structure with data passed in the request body. In the response, it returns all details of the created data structure including its full specification.

- udts:write

```
udts:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The unique ID of the team in which the data structure will be created.

The name of the data structure. The maximum length of the name is 128 characters.

Set to true to enforce strict validation of the data put in the data structure. With the strict validation enabled, the data structure won't store data that don't fit into the structure and the storing module will return an error.

```
true
```

The default value of this parameter is false . With the default setting, the modules using the data structure will process data that don't conform to the data structure.

```
false
```

```
true
```

Sets the data structure specification.

Successful response

Successful response

### hashtag Get data structure

Retrieves a data structure with a given ID

- udts:read

```
udts:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The data structure ID. Get the dataStructureId with the list data structures endpoint.

```
dataStructureId
```

```
1459
```

Specifies the group of values to return. For example, you can retrieve only name of a data structure.

Successful response

Successful response

### hashtag Delete data structure

Deletes a data structure with a given ID and returns the ID in the response.

- udts:write

```
udts:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The data structure ID. Get the dataStructureId with the list data structures endpoint.

```
dataStructureId
```

```
1459
```

Confirms the deletion if a data structure is included in at least one scenario. Confirmation is required because the scenario will stop working without the data structure. If the parameter is missing or it is set to false an error code is returned and the resource is not deleted.

```
false
```

```
true
```

Successful response

Successful response

### hashtag Update data structure

Updates the specified data structure. Make updates only parameters you send in the request body. Note that when you update the data structure specification with the spec parameter, you have to provide all structure fields you want to use. Make replaces the old structure specification with the new one. The response contains all details about the updated data structure.

```
spec
```

- udts:write

```
udts:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The data structure ID. Get the dataStructureId with the list data structures endpoint.

```
dataStructureId
```

```
1459
```

The name of the data structure. The maximum length of the name is 128 characters.

Set to true to enforce strict validation of the data put in the data structure. With the strict validation enabled, the data structure won't store data that don't fit into the structure and the storing module will return an error.

```
true
```

The default value of this parameter is false . With the default setting, the modules using the data structure will process data that don't conform to the data structure.

```
false
```

```
false
```

Sets the data structure specification.

Note that when you update the data structure specification with the spec parameter, you have to provide all structure fields you want to use. Make replaces the old structure specification with the new one."

```
spec
```

Successful response

Successful response

### hashtag Clone data structure

Clones the specified data structure. Use the targetTeamId to clone the data structure to the specified team.

```
targetTeamId
```

The response contains all details of the data structure clone with data structure full specification.

- udts:write

```
udts:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The data structure ID. Get the dataStructureId with the list data structures endpoint.

```
dataStructureId
```

```
1459
```

The name of the data structure clone. The maximum length of the name is 128 characters.

The ID of the team that should use the data structure clone. If you don't specify the targetTeamId Make clones the data structure in the original team.

```
targetTeamId
```

Successful response

Successful response

Last updated 1 day ago

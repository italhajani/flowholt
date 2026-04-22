---
title: "Scenarios folders | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/scenarios-folders
scraped_at: 2026-04-21T12:41:29.437871Z
---

1. API Reference

# Scenarios folders

Scenarios can be grouped into folders for better organization. The following endpoints allow you to create and manage scenarios folders.

### hashtag List scenario folders

Retrieves a collection of all scenarios folders for a team with a given ID. Returned folders are sorted by name in ascending order.

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

Unique ID of the Team.

```
1
```

Specifies the group of values to return. For example, you may want to receive in response only the names and IDs of folders.

Successful response

Successful response

### hashtag Create scenario folder

Creates a new scenario folder with data passed in the request body. As the response, it returns all details of the created scenario folder.

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

The name of the scenario folder. The name must be at most 100 characters long and does not need to be unique.

The unique ID of the team in which the scenario folder will be created.

Created a Folder

Created a Folder

### hashtag Delete scenario folder

Deletes a scenario folder with a given ID and returns the ID in the response.

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

The unique ID of the scenario folder. It can be retrieved from the List scenarios folders endpoint.

```
1
```

Successful response

Successful response

### hashtag Update scenario folder

Updates a scenario folder with a given ID by passing new values in the request body. Any property that is not provided will be left unchanged. In the response, it returns all details of the updated folder including properties that were not changed.

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

The unique ID of the scenario folder. It can be retrieved from the List scenarios folders endpoint.

```
1
```

Specifies the group of values to return. For example, you may want to receive in response only the names and IDs of folders.

The name for the updated scenario folder. The name must be at most 100 characters long and does not need to be unique.

Folder updated

Folder updated

Last updated 1 day ago

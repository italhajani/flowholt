---
title: "Tools | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/scenarios/tools
scraped_at: 2026-04-21T12:43:33.554370Z
---

1. API Reference chevron-right
2. Scenarios

# Tools

The following endpoints allow you to manage tools.

### hashtag Update tool configuration

Updates a tool configuration with a given scenario ID by passing new values in the request body. Any property that is not provided will be left unchanged. In the response, it returns all details of the updated tool underlaying scenario including properties that were not changed.

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

The ID of the scenario. You can get the scenarioId with the List scenarios API call.

```
scenarioId
```

```
112
```

Specifies columns that are returned in the response. Use the cols[] parameter for every column that you want to return in the response. For example GET /endpoint?cols[]=key1&cols[]=key2 to get both key1 and key2 columns in the response.

```
cols[]
```

```
GET /endpoint?cols[]=key1&cols[]=key2
```

```
key1
```

```
key2
```

Check the "Filtering" section for a full example.

The name of the tool.

A description of the tool.

The module of the tool. The module is a JSON object that contains the module ID, version, mapper, parameters, and metadata.

Scenario was updated successfully

Scenario was updated successfully

Last updated 1 day ago

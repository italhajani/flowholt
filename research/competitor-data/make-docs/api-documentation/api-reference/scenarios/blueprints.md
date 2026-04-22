---
title: "Blueprints | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/scenarios/blueprints
scraped_at: 2026-04-21T12:43:31.741526Z
---

1. API Reference chevron-right
2. Scenarios

# Blueprints

The following endpoints allow you to manage scenarios blueprints.

### hashtag Get scenario blueprint

Retrieves a blueprint of a scenario with a given ID.

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

The unique ID of the blueprint version. It can be retrieved from the Get blueprint versions endpoint. This parameter can be useful when you want to retrieve the older version of the blueprint.

```
12
```

If this parameter is set to true , the draft version of the scenario blueprint will be retrieved. If set to false , the live version of the blueprint will be retrieved. In case that the blueprintId parameter is set to the query as well, this parameter is ignored.

```
true
```

```
false
```

```
blueprintId
```

```
false
```

Blueprint retrieved

Blueprint retrieved

### hashtag Get blueprint versions

Retrieves a collection of all blueprints versions for a scenario with a given ID. Due to the regular archiving process, only the versions that are not older than 60 days can be retrieved. Each returned blueprint version consists of the date and time of the blueprint creation, IDs of the blueprint version and related scenario, and the information if the blueprint was created for the draft or live scenario version.

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

Blueprints versions successfully retrieved

Blueprints versions successfully retrieved

Last updated 1 day ago

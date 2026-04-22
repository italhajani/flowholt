---
title: "HTTP methods | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/getting-started/http-methods
scraped_at: 2026-04-21T12:41:11.687225Z
---

1. Getting started

# HTTP methods

Make API uses standard HTTP methods to interact with endpoints. The following table lists the available HTTP methods and shows examples of endpoints these methods can be used with.

HTTP method

Description

GET

```
GET
```

Retrieves a resource representation without modifying it.

Example: /scenarios returns all available Make scenarios

```
/scenarios
```

POST

```
POST
```

Creates a resource.

Example: /scenarios creates a scenario

```
/scenarios
```

PUT

```
PUT
```

Updates a resource. If the resource does not exist yet, this method creates it.

Example: /scenarios/{scenarioId}/custom-properties sets custom properties data for a scenario with the specified ID

```
/scenarios/{scenarioId}/custom-properties
```

PATCH

```
PATCH
```

Makes a partial update on a resource. Does not replace the entire resource.

Example: /scenarios/{scenarioId} updates properties (for example, scheduling or blueprint) of the scenario with a given ID

```
/scenarios/{scenarioId}
```

DELETE

```
DELETE
```

Removes a resource.

Example: /scenarios/{scenarioId} deletes the scenario with a given ID

```
/scenarios/{scenarioId}
```

Last updated 1 year ago

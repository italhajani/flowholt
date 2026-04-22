---
title: "Public | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/templates/public
scraped_at: 2026-04-21T12:43:42.992163Z
---

1. API Reference chevron-right
2. Templates

# Public

The following endpoints focus on the public (approved) templates that are available to every user regardless of the organization and team.

### hashtag List public (approved) templates

Retrieves a collection of all public (approved) templates that are available for anyone. Returned templates are sorted by usage in descending order.

- templates:read

```
templates:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

If this parameter is set to true , it means English templates should be included in the response. This is relevant only if the user's language is not English.

```
true
```

```
true
```

The name of the template. This parameter allows limiting returned results to the template(s) with the given name.

```
my first template
```

The array with the text IDs of the apps used in the templates. This parameter allows you to get only the templates containing specific apps.

```
["http"]
```

Specifies the group of values to return. For example, you may want to retrieve only the names and IDs of the public templates.

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

### hashtag Get public (approved) template details

Retrieves details of a public (approved) template with a given publicUrl .

```
publicUrl
```

- templates:read

```
templates:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The unique URL of the public (approved) template consisting of the template ID and name. It can be retrieved from the List templates endpoint.

```
16-multiple-apps-template-example
```

The unique ID of the public version of the approved template. It can be retrieved from the List templates endpoint as one of the following IDs: publishedId for all published templates that are waiting for approval or not, or approvedId for approved templates.

```
publishedId
```

```
approvedId
```

```
18
```

Specifies the group of values to return. For example, you may want to retrieve only information about the apps used in the template.

Successful response

Successful response

### hashtag Get public (approved) template blueprint

Retrieves a blueprint of a public (approved) template with a given publicUrl .

```
publicUrl
```

- templates:read

```
templates:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The unique URL of the public (approved) template consisting of the template ID and name. It can be retrieved from the List templates endpoint.

```
16-multiple-apps-template-example
```

The unique ID of the public version of the approved template. It can be retrieved from the List templates endpoint as one of the following IDs: publishedId for all published templates that are waiting for approval or not, or approvedId for approved templates.

```
publishedId
```

```
approvedId
```

```
18
```

Successful response

Successful response

Last updated 1 day ago

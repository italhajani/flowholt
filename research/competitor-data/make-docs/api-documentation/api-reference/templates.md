---
title: "Templates | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/templates
scraped_at: 2026-04-21T12:41:31.829825Z
---

1. API Reference

# Templates

The Templates feature allows you to create and use templates as a starting point for your Make scenarios. By default, Make offers hundreds of templates containing the scenarios of most-used apps. The following endpoints allow you to create and manage templates.

### hashtag List templates

Retrieves a collection of all templates for a team with a given ID. Returned templates are sorted by ID in ascending order.

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

The unique ID of the team whose templates will be retrieved.

```
1
```

Indicates if the template is public which means that it was published and approved, and can be accessed by anyone.

```
true
```

The array with the text IDs of the apps used in the templates. This parameter allows you to get only the templates containing specific apps.

```
["http"]
```

Specifies the group of values to return. For example, you may want to retrieve only the names and IDs of the templates.

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

### hashtag Create template

Creates a new template with data passed in the request body. In the response, it returns all details of the created template.

- templates:write

```
templates:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

Specifies the group of values to return. For example, you may want to retrieve only names and IDs of the newly created template.

```
["id","name"]
```

The unique numeric ID of the team in which the template will be created.

The language of the template determining in which language template details such as module names will be displayed. This property also impacts the visibility of the created template and cannot be changed later.

The full blueprint of the scenario or template. It contains information about the general setup and all included apps and modules, and their settings.

The scheduling details of the template.

The controller of the template. This property refers to wizards that can be added to each module in the template from the Make interface. The wizards contain short instructions for other users explaining how to use the template step by step.

Successful response

Successful response

### hashtag Get template details

Retrieves details of a template with a given ID.

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

The unique ID of the private template. It can be retrieved from the List templates endpoint.

```
164
```

Specifies the group of values to return. For example, you may want to retrieve only the ID and name of the template.

```
{"summary":"Return ID and name","value":["id","name"]}
```

Successful response

Successful response

### hashtag Delete template

Deletes a template with a given ID and returns the ID in the response.

- templates:write

```
templates:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The unique ID of the private template. It can be retrieved from the List templates endpoint.

```
164
```

Confirms the deletion of the private or published template. If the parameter is missing or it is set to false an error code is returned and the resource is not deleted. The public (approved) templates can only be deleted by administrators.

```
false
```

```
true
```

Successful response

Successful response

### hashtag Update template

Updates a template with a given ID by passing new values in the request body. Any property that is not provided will be left unchanged. In the response, it returns all details of the updated template including properties that were not changed.

- templates:write

```
templates:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The unique ID of the private template. It can be retrieved from the List templates endpoint.

```
164
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

Specifies the group of values to return. For example, you may want to retrieve only the description of the template.

```
["description"]
```

The new name of the template. The name does not need to be unique.

The full blueprint of the template. It contains information about the general setup and all included apps and modules, and their settings.

The scheduling details of the template.

The controller of the template. This property refers to wizards that can be added to each module in the template from the Make interface. The wizards contain short instructions for other users explaining how to use the template step by step.

Successful response

Successful response

### hashtag Get template blueprint

Retrieves a blueprint of a template with a given ID.

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

The unique ID of the private template. It can be retrieved from the List templates endpoint.

```
164
```

If this parameter is set to true , it means the blueprint should be used for creating a scenario from the template.

```
true
```

```
true
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

### hashtag Publish template

Publishes a private template with a given ID. In the response, it returns all details of the template.

- templates:write

```
templates:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The unique ID of the private template. It can be retrieved from the List templates endpoint.

```
164
```

Specifies the group of values to return. For example, you may want to retrieve only the name and ID of the published template.

```
{"summary":"id, name","value":["id","name"]}
```

Successful response

Successful response

### hashtag Request approval

Requests approval of the published template with the given IDs of its private and published versions. In the response, it returns all details of the template.

- templates:write

```
templates:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The unique ID of the private template. It can be retrieved from the List templates endpoint.

```
164
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

Specifies the group of values to return. For example, you may want to retrieve only the ID and name of the template you requested approval for.

```
{"summary":"All columns","value":["id","name","teamId","description","usedApps","public","published","approved","approvedId","requestedApproval","publishedId","publicUrl","approvedName","publishedName"]}
```

Successful response

Successful response

Last updated 1 day ago

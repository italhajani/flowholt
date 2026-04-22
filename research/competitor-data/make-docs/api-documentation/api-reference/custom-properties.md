---
title: "Custom properties | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/custom-properties
scraped_at: 2026-04-21T12:41:20.280647Z
---

1. API Reference

# Custom properties

The following endpoints allow you to create and list custom property structures.

To use custom properties, you have to:

1. Create a custom properties structure.
2. Create custom properties structure items.
3. Fill the items with data.

Create a custom properties structure.

Create custom properties structure items.

Fill the items with data.

Read more about custom properties in the custom properties feature documentation arrow-up-right .

### hashtag List custom property structures

Gets a list of custom properties structures in the organization.

- custom-property-structures:read

```
custom-property-structures:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the organization.

```
57
```

Successful response

Successful response

### hashtag Create a custom property structure

Creates a custom properties structure. You can have only one custom properties structure for each combination of associatedType , belongerType and belongerId values.

```
associatedType
```

```
belongerType
```

```
belongerId
```

For example, you can create only one custom properties structure for scenarios in a specific organization.

To create a structure for custom scenario properties, fill in the request body:

- associatedType : scenario
- belongerType : organization

associatedType : scenario

```
associatedType
```

```
scenario
```

belongerType : organization

```
belongerType
```

```
organization
```

Check out the example API call.

To define the custom properties structure items, use the API call to create custom properties structure item.

- custom-property-structures:write

```
custom-property-structures:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The type of the entity which uses the custom properties structure. Fill in scenario to create custom scenario properties structure.

```
scenario
```

The type of the entity that owns the custom properties structure. Fill in organization to create custom scenario properties structure.

```
organization
```

The ID of the entity that owns the custom properties structure.

Successful response

Successful response

Last updated 1 day ago

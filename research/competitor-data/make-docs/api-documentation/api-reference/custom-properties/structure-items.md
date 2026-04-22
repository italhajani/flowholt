---
title: "Structure items | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/custom-properties/structure-items
scraped_at: 2026-04-21T12:43:19.910979Z
---

1. API Reference chevron-right
2. Custom properties

# Structure items

The following endpoints allow you to manage items in a custom property structure.

To use custom properties, you have to:

1. Create a custom properties structure.
2. Create custom properties structure items.
3. Fill the items with data.

Create a custom properties structure.

Create custom properties structure items.

Fill the items with data.

Read more about custom properties in the custom properties feature documentation arrow-up-right ."

### hashtag List custom property structure items

Gets the list of structure items in the specified custom properties structure.

Use the API call GET /custom-property-structures?{organizationId} to get the ID of the custom property structure.

```
GET /custom-property-structures?{organizationId}
```

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

The ID of the custom property structure.
Use the API call GET /custom-property-structures?organizationId={organizationId} to get the ID of a custom property structure.

```
GET /custom-property-structures?organizationId={organizationId}
```

```
2
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

Specify the custom property item attribute. The custom property items in the response are sorted by the value of the attribute.

```
id
```

```
name
```

```
label
```

```
description
```

```
type
```

```
required
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

### hashtag Create a custom property structure item

Creates custom properties structure items.

After creating a structure item, you cannot change its name and type .

```
name
```

```
type
```

To add data to the custom properties, use the API call to fill in custom properties data.

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

The ID of the custom property structure.
Use the API call GET /custom-property-structures?organizationId={organizationId} to get the ID of a custom property structure.

```
GET /custom-property-structures?organizationId={organizationId}
```

```
2
```

The ID of the structure item. The name has to be unique in the custom properties structure.

```
name
```

Make displays the item label to users in the scenario table header.

The description of the custom property structure item. You can review the item description in the Scenario properties tab in the Organization dashboard.

The data type of the custom property structure item. The data types dropdown and multiselect allow you to specify available options for the item data.

```
dropdown
```

```
multiselect
```

```
boolean
```

```
number
```

```
shortText
```

```
longText
```

```
date
```

```
dropdown
```

```
multiselect
```

The options available to users when filling in the item data. For the data types dropdown and multiselect , fill in an object like {"options":[{"value": "Marketing"}, {"value": "Sales"}]} .
You can omit the options parameter for the rest of the data types.

```
dropdown
```

```
multiselect
```

```
{"options":[{"value": "Marketing"}, {"value": "Sales"}]}
```

```
options
```

Set to true in order to make a structure item required when adding custom property data. Default value is false .

```
true
```

```
false
```

Successful response

Successful response

### hashtag Delete custom property structure item

Deletes the specified custom property structure item. Use the confirmed parameter to confirm deleting the structure item. When you delete a custom property item, Make deletes the data filled in the item as well. Deleting custom property item data is irreversible.

```
confirmed
```

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

The ID of the custom property structure item. Get the item ID with the API call to list custom property structure items .

```
2
```

```
true
```

Successful response

Successful response

### hashtag Update custom property structure item

Updates the specified item of a custom property structure. Specify the attributes you want to update in the request body.

You cannot update the item name and type .

```
name
```

```
type
```

You can get the item ID with an API call to list custom property structure items.

When you want to update the options of a multiselect or dropdown item, specify all the options for the property. The new set of options replaces the current options.

```
options
```

```
multiselect
```

```
dropdown
```

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

The ID of the custom property structure item. Get the item ID with the API call to list custom property structure items .

```
2
```

Make displays the item label to users in the scenario table header.

The description of the custom property structure item. You can review the item description in the Scenario properties tab in the Organization dashboard.

The options available to users when filling in the item data. For the data types dropdown and multiselect , fill in an object like {"options":[{"value": "Marketing"}, {"value": "Sales"}]} .
You can omit the options parameter for the rest of the data types.

```
dropdown
```

```
multiselect
```

```
{"options":[{"value": "Marketing"}, {"value": "Sales"}]}
```

```
options
```

Set to true if you require to fill in data to the structure item when adding custom property data. Default value is false .

```
true
```

```
false
```

Successful response

Successful response

Last updated 1 day ago

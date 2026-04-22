---
title: "Custom properties data | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/scenarios/custom-properties-data
scraped_at: 2026-04-21T12:43:34.904184Z
---

1. API Reference chevron-right
2. Scenarios

# Custom properties data

The following endpoints allow you to manage custom scenario properties data.

To use custom properties, you have to:

1. Create a custom properties structure.
2. Create custom properties structure items.
3. Fill the items with data.

Create a custom properties structure.

Create custom properties structure items.

Fill the items with data.

Read more about custom properties in the custom properties feature documentation arrow-up-right .

### hashtag Get custom properties data

Gets custom properties data of the specified scenario.

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

The ID of the scenario.

```
22
```

Successful response

Successful response

### hashtag Fill in custom properties data

Fills in custom properties data for the specified scenario. The scenario has to have no custom properties data.

The data you fill in has to conform to the current custom scenario properties structure. You have to specify a value for every required item, otherwise you get an error.

To update existing data, use the following API calls:

- Update custom properties data
- Set custom properties data

Update custom properties data

Set custom properties data

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

The ID of the scenario.

```
80
```

Successful response

Successful response

### hashtag Set custom properties

Sets custom properties data for the specified scenario. Make replaces the original data with the data you send in the request body.

You have to specify a value for every required custom properties structure item, otherwise you get an error.

The scenario has to have custom property data already. The new data set has to conform to the current custom scenario properties structure. If the initial data is empty, then the API call returns an error.

To fill in first values to the custom properties, use the API call to fill in custom properties data.

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

The ID of the scenario.

```
80
```

Successful response

Successful response

### hashtag Delete custom properties data

Deletes custom properties data. Deleting custom properties data is irreversible. Use the confirmed parameter to confirm deleting the data, otherwise you get an error and the data are not deleted.

```
confirmed
```

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

The ID of the scenario.

```
28
```

```
true
```

Successful response

Successful response

### hashtag Update custom properties data

Updates custom properties data of the specified scenario. Make updates only the custom properties data you specify in the request body.

The custom property has to contain data already. The update data have to conform to the current custom scenario properties structure. If the initial value is empty, then the API call returns an error.

To fill in first values to the custom properties, use the API call to fill in custom properties data.

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

The ID of the scenario.

```
80
```

Successful response

Successful response

Last updated 1 day ago

---
title: "Processing of input parameters | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/best-practices/input-parameters/processing-of-input-parameters
scraped_at: 2026-04-21T12:44:18.637342Z
---

1. Best practices chevron-right
2. Input parameters

# Processing of input parameters

## hashtag Mapping all parameters

```
{..."body":{"firstName":"{{parameters.firstName}}","lastName":"{{parameters.lastName}}","email":"{{parameters.email}}"},//... other directives}
```

In this example you have to map every parameter correctly.

There is a risk of a typo or omission of a parameter.

```
{//..."body":"{{parameters}}",//...}
```

With this approach, all parameters from the modules will be sent to the API.

```
[{"name":"email","type":"email","label":"Email address","required":true},{"name":"firstName","type":"text","label":"First Name","required":true},{"name":"lastName","type":"text","label":"Last Name","required":true}]
```

## hashtag Using an IML function or omitting a parameter

Sometimes, you don't want to map all parameters in the body . Some reasons may include:

```
body
```

- The parameter shouldn't be sent at all (technical parameters such as selects, etc.).
- The parameter should be sent somewhere else than in the body , e.g. in the url .
- The parameter has to be wrapped in an IML or custom IML function.

The parameter shouldn't be sent at all (technical parameters such as selects, etc.).

The parameter should be sent somewhere else than in the body , e.g. in the url .

```
body
```

```
url
```

The parameter has to be wrapped in an IML or custom IML function.

In this example you have to map every parameter correctly.

There is a risk of a typo or omission of a parameter.

Note that "{{...}}" lists all available parameters from the module and allows adding other parameters.

```
"{{...}}"
```

The omit() function allows the removal of parameters that are used somewhere else, shouldn't be used, or require special attention.

```
omit()
```

In this case, the id parameter is already used in the url , and the registrationDate parameter is wrapped in formatDate IML function.

```
id
```

```
url
```

```
registrationDate
```

```
formatDate
```

## hashtag Handling arrays, nulls, and empty strings

Make and other third-party services transport values in many different formats. It is important to know how to handle the value types of arrays, nulls, and empty strings.

### hashtag Bad practices

It isn't possible to send a null value to a service.

```
null
```

It isn't possible to send a null , empty string, and 0 (zero) value to a service.

```
null
```

It isn't possible to send an empty array to a service. E.g. User wants to remove all tags from a task.

Let users decide which parameters they want to send to the service. Make has a feature to show how to process values. This feature allows users to define exactly how Make should behave when the value is "empty".

For example, if a user defines that they want to send a specific field to a service even if the value is null , empty string, or an empty array, it will be sent to the service. In module communication, config passes parameters without any modification.

```
null
```

## hashtag Query string (qs)

Query string parameters should be defined using the qs directive as a key-value collection, where the key is the parameter name and the value is the parameter value. Values in the qs collection are automatically encoded, so you don't need to escape them manually.

```
qs
```

```
qs
```

The same automatic encoding applies to the headers and body collections for request headers and body payloads, respectively.

```
headers
```

```
body
```

This will issue the request to URL in this way:

http://yourservice.com/api/items?limit=100&since=2023-01-01&until=2023-01-31

```
http://yourservice.com/api/items?limit=100&since=2023-01-01&until=2023-01-31
```

If you provide a query string directly in the url directive, it won't be automatically encoded. You have to encode it manually. But in common cases, entering the query string in the url is not a recommended approach, especially when values are inserted dynamically. See the Special case: Query string parameters in the URL section for more details.

```
url
```

```
url
```

### hashtag Special case: Query string parameters in the URL

In most cases, having the query string in the URL is not the best practice. It is better to use the qs collection, but sometimes there may be a special case when you need to use the query string directly in the URL.

```
qs
```

The main difference is that the query string in the URL is not encoded automatically, so you have to do it manually. This can be useful when the third-party service requires a very specific format or encoding of the query string parameters. In that case, you can add a query string directly to the url directive string and manage the encoding yourself.

```
url
```

Example of specific query string parameters in the URL:

The most common use case for this is when a third-party service requires special symbols like brackets [] or parentheses () to be unencoded in the query string.

```
[]
```

```
()
```

Important: Never mix the qs directive together with the query string in the URL. This will lead to invalid escaping of parameters specified in the url .

```
qs
```

```
url
```

### hashtag Using arrays in qs

```
qs
```

You can also use an array as a value in the qs collection. In this case, the resulting query string will repeat the key for each value in the array, e.g. ?tag=one&tag=two&tag=three .

```
qs
```

```
?tag=one&tag=two&tag=three
```

This will issue the request to URL in this way:

http://yourservice.com/api/items?anytag=one&anytag=two&anytag=three

```
http://yourservice.com/api/items?anytag=one&anytag=two&anytag=three
```

### hashtag Using structured data in qs

```
qs
```

qs (and also headers ) are single-level collections only, meaning that you cannot specify a nested collection in their parameters.

```
qs
```

```
headers
```

This example will not work .

Since there is no defined standard for how to encode nested objects in a query string, you need to implement it manually based on special requirements of the third-party service. The most common approach is to use dot notation (use a . to separate the keys in the query string) for nested properties.

```
.
```

This will issue the request with the query string:

?someProp.anotherOne.and-one-more=THIS%20WILL%20WORK

```
?someProp.anotherOne.and-one-more=THIS%20WILL%20WORK
```

Last updated 5 months ago

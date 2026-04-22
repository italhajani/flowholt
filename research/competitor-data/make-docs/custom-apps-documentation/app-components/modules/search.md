---
title: "Search | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/app-components/modules/search
scraped_at: 2026-04-21T12:44:41.442551Z
description: "The search module makes a request (or several) and returns multiple results. It doesn\u2019t have state nor any internal complex logic."
---

1. App components chevron-right
2. Modules

# Search

The search module makes a request (or several) and returns multiple results. It doesn’t have state nor any internal complex logic.

Use this module when you need to allow the user to search for items or simply return multiple items.

## hashtag Components

### hashtag Communication

For additional information, see our communication documentation.

#### hashtag Pagination

If API supports pagination, you can implement it by using the pagination directive .

### hashtag Static Parameters

You can use static parameters inside the search module without any restrictions.

### hashtag Mappable Parameters

You can use mappable parameters inside the search module without any restrictions.

### hashtag Interface

Unlike the action module, the search module can return multiple bundles at once .

### hashtag Samples

To help the users with setting up your module, provide samples .

### hashtag ​Scope​

When using an OAuth type of connection, use the scope to define scopes required by this module.

### hashtag Available IML variables

These IML variables are available for you to use everywhere in this module:

now

```
now
```

Current date and time

environment

```
environment
```

TBD

temp

```
temp
```

Contains custom variables created via the temp directive.

```
temp
```

parameters

```
parameters
```

Contains the module’s input parameters.

connection

```
connection
```

Contains the connection’s data collection.

common

```
common
```

Contains the app’s common data collection.

data

```
data
```

Contains the module’s data collection.

scenario

```
scenario
```

TBD

metadata.expect

```
metadata.expect
```

Contains the module’s raw parameters array in the way you have specified it in the configuration.

metadata.interface

```
metadata.interface
```

Contains module’s raw interface array in the way you have specified it in the configuration.

Additional variables available for the response object:

output

```
output
```

When using the wrapper directive, the output variable represents the result of the output directive.

```
wrapper
```

```
output
```

```
output
```

limit

```
limit
```

When using a limit, the process of retrieving items will stop once the requested number of items has been obtained or if a page doesn't contain any items. Additionally, the module will return only the exact number of items that was specified.

iterate

```
iterate
```

Iterates the array in the response into items.

Additional variables available after using the iterate directive, i.e. in wrapper or pagination directives:

```
iterate
```

```
wrapper
```

```
pagination
```

iterate.container.first

```
iterate.container.first
```

Represents the first item of the array you iterated.

iterate.container.last

```
iterate.container.last
```

Represents the last item of the array you iterated.

Additional variables available for pagination and response objects:

body

```
body
```

Contains the body that was retrieved from the last request.

headers

```
headers
```

Contains the response headers that were retrieved from the last request.

items

```
items
```

When iterating this variable represents the current item that is being iterated.

## hashtag Example

Last updated 5 months ago

---
title: "Components | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/app-components/modules/action/components
scraped_at: 2026-04-21T12:46:19.139241Z
---

1. App components chevron-right
2. Modules chevron-right
3. Action

# Components

## hashtag Communication

For more information, see the communication documentation .

- The communication response is extended with the wrapper object.
- limit is not available in response as the result of the action should always be only one bundle
- Communication can be request-less .

The communication response is extended with the wrapper object.

```
response
```

```
wrapper
```

limit is not available in response as the result of the action should always be only one bundle

```
limit
```

```
response
```

Communication can be request-less .

### hashtag Static parameters

You can use static parameters inside the action module without any restrictions.

### hashtag Mappable parameters

You can use mappable parameters inside the action module without any restrictions.

### hashtag Interface

The action module should always output only one bundle .

### hashtag Samples

To help the users with setting up your module, you can provide samples .

### hashtag Scope

When using an OAuth type of connection, use the scope to define scopes required by this action.

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

## hashtag Action module example

Last updated 5 months ago

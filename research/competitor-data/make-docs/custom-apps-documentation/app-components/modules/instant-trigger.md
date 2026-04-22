---
title: "Instant trigger (webhook) | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/app-components/modules/instant-trigger
scraped_at: 2026-04-21T12:44:29.174554Z
description: "The instant trigger is executed immediately when the data arrives to Make."
---

1. App components chevron-right
2. Modules

# Instant trigger (webhook)

The instant trigger is executed immediately when the data arrives to Make.

There is nothing to configure in this module except the interface. The data processing is handled by a selected webhook .

## hashtag Components

### hashtag Communication

- Communication is only optional in the instant trigger.
- It can be used for retrieving additional data.
- The iterate directive is not available.
- The pagination directive is not available.
- Only a single request can be performed.

Communication is only optional in the instant trigger.

It can be used for retrieving additional data.

The iterate directive is not available.

```
iterate
```

The pagination directive is not available.

```
pagination
```

Only a single request can be performed.

#### hashtag Retrieving additional data for each bundle

If you need to retrieve additional data for each bundle, describe a request to execute for each bundle of the webhook

```
{"url":"http://example.com/api/item/{{payload.id}}","response":{"output":{"id":"{{payload.id}}","data":"{{body}}"}}}
```

### hashtag Interface

Exactly one bundle is generated with each incoming webhook.

### hashtag Samples

To help the users with setting up your module, provide samples .

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

Additional variables available in the instant trigger:

payload

```
payload
```

Represents the current webhook item that is being processed.

## hashtag Example

Last updated 5 months ago

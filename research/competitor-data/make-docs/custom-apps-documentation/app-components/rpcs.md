---
title: "Remote Procedure Calls | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/app-components/rpcs
scraped_at: 2026-04-21T12:41:50.256595Z
description: "Remote Procedure Calls (RPCs) are API requests made from the module to improve usability when mapping certain values to modules."
---

1. App components

# Remote Procedure Calls

Remote Procedure Calls (RPCs) are API requests made from the module to improve usability when mapping certain values to modules.

Remote Procedure Calls are used to retrieve live data from a service for an input field.

You can use RPCs to retrieve dynamic options in a field to clarify the expected input for a user. For example, selecting a country in a dropdown could trigger an RPC to retrieve corresponding states or cities.

These requests are invoked while the user interacts with the modules when building a scenario.

## hashtag Types of RPCs

- Dynamic fields RPCs generate dynamic fields inside a module.
- Dynamic options RPCs dynamically fill the fields in a module.
- Dynamic sample RPCs replace hard-coded samples that might become outdated quickly.

Dynamic fields RPCs generate dynamic fields inside a module.

Dynamic options RPCs dynamically fill the fields in a module.

Dynamic sample RPCs replace hard-coded samples that might become outdated quickly.

## hashtag Components

### hashtag Communication

Communication can be request-less .

As with modules, you can use pagination in RPCs to iterate the records.

### hashtag Parameters

Parameters from the modules are passed automatically to linked RPCs.

## hashtag Available IML variables

The following IML variables are available to use anywhere in a module within IML strings.

now

```
now
```

Current date and time with milliseconds in UTC timezone, in ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ .

```
YYYY-MM-DDTHH:mm:ss.sssZ
```

environment

```
environment
```

TBD

temp

```
temp
```

Contains custom variables created using the temp directive.
Example: "temp": { "id": 123 }, "url": "/user/{{temp.id}}" // url === "/user/123"

```
temp
```

```
"temp": {
```

```
"id": 123
```

```
},
```

```
"url": "/user/{{temp.id}}" // url === "/user/123"
```

parameters

```
parameters
```

The module's input parameters collection ( static and mappable ).. The keys are the parameter `name` values, and the values are the data mapped by the user.

connection

```
connection
```

The connection data collection (access token or API key and other values).

common

```
common
```

The collection defined in the app's Base common data . This will typically include the module 'timeout' limit and Client ID and secret when using OAuth 2.0 code grant connections.

data

```
data
```

The module's data collection.

scenario

```
scenario
```

TBD

metadata.expect

```
metadata.expect
```

The module's raw mappable parameters as they were specified in the configuration.

metadata.interface

```
metadata.interface
```

The module’s raw interface array the way you have specified it in the configuration.

Additional variables available within the response collection:

```
response
```

output

```
output
```

When using the wrapper directive , the 'output' variable represents the result of the output directive.

Additional variables available when using the iterate directive, for example within the wrapper or pagination collections:

```
iterate
```

iterate.container.first

```
iterate.container.first
```

The first item of the iterated array.

iterate.container.last

```
iterate.container.last
```

The last item of the iterated array.

Additional variables available within the pagination and response collections:

body

```
body
```

The response body received from the last request.

headers

```
headers
```

The response headers received from the last request.

item

```
item
```

When using the iterative directive, this variable represents the current item that is being iterated.

```
iterative
```

Additional variables available in the webhook attach RPC.

webhook.id

```
webhook.id
```

Internal webhook ID.

webhook.url

```
webhook.url
```

The webhook URL that you can use to automatically register the webhook in the external platform via the API, when it's supported.

Additional variables available in the webhook detach RPC and in the expect mappable parameter and the interface section of an instant trigger module.

```
expect
```

webhook

```
webhook
```

The webhook’s data collection.

## hashtag Limits

Max Execution Timeout

... seconds

40

Request Count

... calls performed by RPC

3

Record Count

... paginated records

3 * number of objects per page

## hashtag Best Practices

Review the best practices for RPCs .

Last updated 6 months ago

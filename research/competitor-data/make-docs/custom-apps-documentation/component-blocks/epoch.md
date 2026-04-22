---
title: "Epoch | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/component-blocks/epoch
scraped_at: 2026-04-21T12:41:53.780589Z
description: "The epoch panel is a popup window offered to the user when selecting from when to start when configuring a polling trigger."
---

1. Component blocks

# Epoch

The epoch panel is a popup window offered to the user when selecting from when to start when configuring a polling trigger.

## hashtag Specification

If the Epoch configuration is defined, there is at least one item available in the Epoch panel: Choose where to start that allows the user to select an item the user wants to start with. Other items depend on the trigger type. The underlying data is retrieved via the Epoch RPC .

```
Epoch configuration
```

```
Choose where to start
```

If the trigger type is id , then there is one more option available: All , which allows the user to process all the items from the beginning. But, if the Epoch configuration is not specified, then the Epoch panel will not be available to the user.

```
id
```

```
All
```

```
Epoch configuration
```

If the trigger type is date , then three additional options are available for the user: All , Since specific date and From now on . Since specific date allows the user to start processing items from a specific day forward and From now on is similar, except the date is automatically set to the current date and time.

```
date
```

```
All
```

```
Since specific date
```

```
From now on
```

```
Since specific date
```

```
From now on
```

## hashtag Retrieving data for the Epoch panel

You can customize how the data for the Epoch panel is retrieved by providing specific request overrides in the Epoch section. These overrides are then merged with trigger configuration to retrieve the data.

```
Epoch
```

You also have to provide the labels and dates for the returned items. You can do that with the response.output directive. Dates are not required, but it is best to provide them for a better user experience.

```
response.output
```

To correctly return Epoch panel items from your Epoch RPC, the output section of response should contain only two items: label and date . The limit is used to limit the number of items displayed to the user when using the Epoch panel. Label is what the user sees when selecting items from the select box and date is when this item was created (updated), which the user will see in gray.

```
output
```

```
response
```

```
label
```

```
date
```

```
Label
```

```
date
```

All other directives are inherited from the trigger's communication and can be overridden by specifying them inside the Epoch RPC.

All other directives (like URL, pagination, method, iterate) are inherited from the trigger's communication and can be overridden by specifying them inside the Epoch RPC.

## hashtag Output best practices

Request Count

... calls performed by RPC

3

Record Count

... paginated records

300 or 3 * number of objects per page

## hashtag Available IML variables

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

All variables available in polling trigger communication are also available in Epoch.

Last updated 5 months ago

---
title: "Trigger (polling) | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/app-components/modules/trigger
scraped_at: 2026-04-21T12:44:42.160418Z
description: "The trigger module is a special module that saves the information about the last item processed and continues the execution from that item."
---

1. App components chevron-right
2. Modules

# Trigger (polling)

The trigger module is a special module that saves the information about the last item processed and continues the execution from that item.

You can configure the trigger module to:

- process all available items and wait for new ones, without repeated processing of the old item.
- process items starting from a specific date and time.
- process items starting with a specific item.

process all available items and wait for new ones, without repeated processing of the old item.

process items starting from a specific date and time.

process items starting with a specific item.

Use this module when you need to process items sequentially in the order they were created or updated.

## hashtag Components

### hashtag Communication

The communication response is extended with the trigger object.

#### hashtag response.trigger

The trigger collection specifies directives that control how the trigger works and how your data is processed.

type

```
type
```

Date or ID

Specifies how the trigger will behave and sort items

order

```
order
```

Asc or desc

Specifies in what order the remote API returns items

id

```
id
```

IML string

Must return the current item’s Id

date

```
date
```

IML string

When used, must return the current item’s date

#### hashtag response.trigger.type

Required : yes Values : id or date

```
id
```

```
date
```

This directive specifies how the trigger will sort and iterate through items.

If the processed item has a create/update date, then date should be used as a value and a correct method should be specified in the trigger.date directive. The trigger sorts all items by their date and id fields and returns only unprocessed items.

```
date
```

```
trigger.date
```

If the processed item does not have a create/update date, but only an id, then id should be used as a value, and a correct method should be specified in the trigger.id directive.

```
id
```

```
trigger.id
```

#### hashtag response.trigger.order

Required : yes Values : asc , desc or unordered

```
asc
```

```
desc
```

```
unordered
```

This directive specifies in what order the remote API is returning items - descending, ascending, or unordered. This information is needed to correctly determine if there are more pages to be fetched or not. It is also needed to correctly sort the incoming items and display them to the user in ascending order.

If the API returns items in ascending order (low to high), then asc should be used. If the API returns items in descending order (high to low), then desc should be used. If the API returns items in no specific order, then unordered should be used.

```
asc
```

```
desc
```

```
unordered
```

When specifying the trigger's communication, sort the results in descending order.

Make's limit is a return of 3200 records.

If you sort results in ascending order and the user has more than 3200 records, the trigger won't be able to fetch the latest records. We do not recommending using ascending order for polling triggers.

#### hashtag response.trigger.id

Required : yes

This directive specifies the item’s id. It must always be present.

For example, if the item looks like this:

then specify the trigger.id directive like this: {{item.id}}:

```
trigger.id
```

```
{{item.id}}:
```

#### hashtag response.trigger.date

Required : yes, if the trigger type is date

```
date
```

This directive specifies the item’s date. It must be specified when the trigger.type is set to date . Note that trigger.id must always be specified.

```
trigger.type
```

```
date
```

```
trigger.id
```

For example, if the item looks like this:

Then specify the trigger.date directive like this: {{item.created_date}} , and the trigger collection might look something like this:

```
trigger.date
```

```
{{item.created_date}}
```

### hashtag Epoch

The Epoch panel is a specific component of the trigger allowing a user to choose the starting item.

### hashtag Static Parameters

The trigger module can only have static parameters . There's no reason to have anything mappable in the trigger as this module is always the first module in the scenario.

### hashtag Interface

The trigger module can return multiple bundles at once .

### hashtag Samples

To help the users with setting up your module, provide samples .

### hashtag Scope​

When using an OAuth type of connection, use the scope to define scopes required by this trigger.

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

data.lastDate

```
data.lastDate
```

Returns the date from the last retrieved item in a previous execution.

data.lastID

```
data.lastID
```

Returns the ID of the last retrieved item in a previous execution.

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

In the Trigger module, the iterate.container.last can be used for handling the pagination of the new items correctly/

```
iterate.container.last
```

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

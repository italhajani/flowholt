---
title: "Dynamic options RPC | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/app-components/rpcs/dynamic-options-rpc
scraped_at: 2026-04-21T12:43:57.656249Z
---

1. App components chevron-right
2. Remote Procedure Calls

# Dynamic options RPC

You can use the dynamic options RPC to display dynamic options for a specific select field or use a search button to help the users find a specific item and map it to the field.

## hashtag Syntax of RPC output

The output of the RPC must be an array of objects, each with a label and a value .

```
label
```

```
value
```

The label is what the user sees when selecting items from the select dropdown/search button, while the value is what is sent to the API once the module is executed.

```
label
```

```
value
```

You must define a limit to the output if the API endpoint returns a large number of items (>500)

You can optionally use "default": true to automatically pre-select the first item from the RPC response. This works for select parameters, but should not be used for search buttons.

```
"default": true
```

```
"response":{"limit":500,"iterate":"{{body.users}}","output":{"label":"{{item.name}}","value":"{{item.id}}","default":true}}
```

```
"response":{"iterate":"{{body.users}}","output":"{{item}}"}
```

## hashtag Select parameter

### hashtag Select parameter with dynamic options

You can customize labels and values by combining multiple properties together. For example:

- "label": "{{item.name}}" or
- "label": "{{item.firstname + ' ' + item.lastname}}"

"label": "{{item.name}}" or

```
"label": "{{item.name}}"
```

"label": "{{item.firstname + ' ' + item.lastname}}"

```
"label": "{{item.firstname + ' ' + item.lastname}}"
```

Both are accepted.

When the mode is switched to mapping, labels aren't accessible. Values are used instead.

### hashtag Filtering options in an RPC

If your RPC returns unwanted items, you can filter them out by using the iterate directive together with the container and condition objects.

```
iterate
```

```
container
```

```
condition
```

This approach is only recommended when the filtering of unwanted items is not supported on the API side.

Notice the iterate directive uses the container and the condition objects. The container defines what should be iterated while the condition defines the criteria each item must satisfy to be included in the list.

```
iterate
```

```
container
```

```
condition
```

### hashtag Select parameter with nested RPCs

Sometimes, you may have a value that depends on another, for example, selecting a file inside a folder in an account. In this case, you'd have three API calls, and so three RPCs, each depending on the selected value from the previous one:

1. List accounts
2. List folders in the selected account
3. List files inside the selected folder

List accounts

List folders in the selected account

List files inside the selected folder

It is possible to nest RPCs under each other in Make. Here is an example of how it would look inside a module's mappable parameters and an RPC's communication.

Put all of your options to store property inside options . Without it, nested will not work.

```
store
```

```
options
```

```
nested
```

Notice, that {{parameters.parameter_1}} is inherited from the 1st RPC and passed as query to the 2nd RPC call.

```
{{parameters.parameter_1}}
```

Notice, that {{parameters.parameter_2}} is inherited from the 2nd RPC and passed as query to the 3rd RPC call.

```
{{parameters.parameter_2}}
```

You're not restricted from using inherited parameters in qs only. In this example, the nested RPCs obtain a value from the parent's RPC and it is passed to the nested RPC in the URL.

```
qs
```

The {{parameters.team_id}} parameter is inherited from the first RPC.

```
{{parameters.team_id}}
```

The {{parameters.team_id}} and {{parameters.space_id}} parameters are inherited from the first and second RPC.

```
{{parameters.team_id}}
```

```
{{parameters.space_id}}
```

## hashtag Search button

Sometimes, a select parameter may not be the best option. If you're dealing with a lot of items and the API allows you to filter/search results, a search button may provide a better user experience than a select, which may not have all values listed.

However, there's an important UI difference between these two:

- When using a select parameter, the user will always see a label even though the value is mapped. This makes it easier to identify the mapped values.
- When using the search button, the user sees the label when choosing which item to map. But once an item is selected, the value is shown in the field.

When using a select parameter, the user will always see a label even though the value is mapped. This makes it easier to identify the mapped values.

```
label
```

```
value
```

When using the search button, the user sees the label when choosing which item to map. But once an item is selected, the value is shown in the field.

```
label
```

```
value
```

### hashtag Search button for a query

Instead of going through a list of available post IDs, the user is prompted to use a search button to first find the board associated with the posts.

The RPC executes a call to an endpoint that returns the author's ID for an email.

### hashtag Search button with nested RPCs

### hashtag Advanced search button

Some services have a lot of records, like mailboxes, task-tracking platforms, and CRMs. In these cases, it may be worth implementing a more advanced search, as long as the API supports that.

You may even want to nest one or more search buttons inside your first search button popup.

In this example for Freshdesk, users can filter results to find exactly what they're looking for.

## hashtag Reusable options in a select

Sometimes it is better to keep the list of available options outside of mappable parameters code, to keep the code cleaner or to reuse the same piece of code in multiple places.

In this case, we can create a request-less RPC, where we manually define the list of available options that will be returned in the RPC's output.

## hashtag Send query to RPC

You might create an RPC and realize that some other module needs an RPC that does almost the same thing.

Instead of creating a new RPC with small differences, in some cases you can modify the first RPC and use a query string parameter with different values depending on the module.

For example, you have one general search endpoint that requires you to specify the items for which to search: companies or contacts .

```
companies
```

```
contacts
```

Instead of creating rpc://searchCompanies and rpc://searchContacts , use rpc://search?type=companies&active=true

```
rpc://searchCompanies
```

```
rpc://searchContacts
```

```
rpc://search?type=companies&active=true
```

Both type and active are passed to the RPC as parameters.

```
type
```

```
active
```

The values sent to the RPC as a query are inherited and accessed in the RPC by "{{parameters.active}}" and "{{parameters.type}}"

```
"{{parameters.active}}"
```

```
"{{parameters.type}}"
```

### hashtag Send array to RPC

You can send an array to an RPC.

Last updated 5 months ago

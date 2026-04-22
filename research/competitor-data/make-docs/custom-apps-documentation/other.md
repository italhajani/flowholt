---
title: "Processing of 'empty' Values | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/other
scraped_at: 2026-04-21T12:45:22.462623Z
description: "How Make processes mapped values and how empty values are passed to a service."
---

1. Other

# Processing of 'empty' Values

How Make processes mapped values and how empty values are passed to a service.

The new approach for processing empty values, as described in this document, is applicable only for apps with Apps platform version 2 (apps created after 11/02/2019). Apps with Apps platform version 1 behave according to the old rules due to backward compatibility.

In this approach, almost every input parameter of a module is ignored if there is no value. If the user wants to rewrite (erase) the value of a field in service, the user has to use the erase keyword. Here is an example of how to erase the values for the Query string and Body fields.

```
erase
```

The processing of "empty" values is completely managed by Make. So you don't have to implement this in your app. Keep in mind that when an empty value comes to a module, a value still has to be sent to the service.

For example, when a user updates a task and in the module configuration there is a multiple-select with labels that they leave untouched, it is unclear what action should be performed. Does this mean that they want to leave the task labels unchanged or want to remove all the labels?

The new behavior for parameter processing solves this problem.

By default, if the user doesn't select any label, Make ignores the field. If the user wants to remove all assigned labels from the task, they have to use the erase keyword.

```
erase
```

## hashtag How Make evaluates empty values

string

null

```
null
```

undefined

```
undefined
```

null

```
null
```

string (forced empty string using IML)

""

```
""
```

""

```
""
```

​

number

null

```
null
```

undefined

```
undefined
```

null

```
null
```

boolean

undefined

```
undefined
```

undefined

```
undefined
```

undefined

```
undefined
```

array

[]

```
[]
```

undefined

```
undefined
```

[]

```
[]
```

multiple select

[]

```
[]
```

undefined

```
undefined
```

[]

```
[]
```

select (nothing selected)

null

```
null
```

undefined

```
undefined
```

​

select (selected value is "" )

```
""
```

null

```
null
```

undefined

```
undefined
```

​

select (selected value is null )

```
null
```

invalid value

invalid value

​

select (map mode)

null

```
null
```

undefined

```
undefined
```

null

```
null
```

collection

not changed (collection of empty values)

Recursively processed corresponding to the rules in this table

Recursively processed corresponding to the rules in this table

### hashtag Collection example

When using a collection parameter in a module, behavior differs depending on whether fields are left empty or the erase pill is applied:

```
erase
```

If the user leaves all fields empty, the request contains an empty collection.

If the user applies the erase pill to one of the parameters inside collection, Make sends the collection with explicit null values for its fields.

This difference can cause issues in some apps. If the collection values are not modified inside module IML functions and the empty collection is passed directly into the request body or query string, the API may receive {}, which can result in unexpected behavior.

```
{},
```

## hashtag When the erase pill is shown

```
erase
```

The erase keyword is shown for the update and universal modules.

```
erase
```

The type of module is defined in the metadata of a module. A universal module is a module without a defined module action field.

Last updated 5 months ago

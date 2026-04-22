---
title: "Iterate | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/component-blocks/api/handling-responses/iterate
scraped_at: 2026-04-21T12:46:24.179941Z
---

1. Component blocks chevron-right
2. Communication chevron-right
3. Handling responses

# Iterate

Required : no

This directive specifies the container of an array of items that the module must process and output. In its simplest form, the iterate directive is an IML string that points to a container of your items. It must be an array.

```
iterate
```

```
{"response":{"iterate":"{{body.data}}"}}
```

When you need to filter out some items for processing, you can specify the iterate directive as an object, in which case it will have the following properties:

```
iterate
```

container

```
container
```

IML string

Specifies the array with the data you want to process.

condition

```
condition
```

IML string

Specifies a filter that can be used to filter out unwanted items.

## hashtag Properties

### hashtag container

Required : yes

The iterate.container directive must point to an array of items that are to be processed.

```
iterate.container
```

### hashtag condition

Required : no Default : true

```
true
```

An optional expression to filter out unwanted items. It must resolve into a Boolean value where true passes the item through and false drops the item from processing. The item variable is available in this directive, which represents the current item being processed.

```
true
```

```
false
```

```
item
```

## hashtag Example

The iterate directive changes the behavior of the output directive and allows you to use a special variable item that represents the currently processed item. The output directive is executed for each item in the container that you have specified in iterate.container . You can use the item variable in the output directive to access properties of iterated objects.

```
iterate
```

```
output
```

```
item
```

```
output
```

```
iterate.container
```

```
item
```

```
output
```

To iterate this response:

To process all items contained in the data array, specify the iterate directive:

```
data
```

```
iterate
```

Specify how the output should look in the output directive. The item variable represents the currently processed item from the data array.

```
output
```

```
item
```

```
data
```

Last updated 5 months ago

---
title: "Filter | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/block-elements/parameters/filter
scraped_at: 2026-04-21T12:45:02.928906Z
description: "An advanced parameter used for filtering"
---

1. Block elements chevron-right
2. Parameters

# Filter

An advanced parameter used for filtering

## hashtag Specification

### hashtag options

Available types:

array

Left-side operands specified like option objects.

string

A URL of the RPC returning the list of left-side operands.

object

Detailed configuration for receiving the left-side operands.

Available parameters:

store

array

An array of left-side operands specified like an Option object.

store

string

A URL of the RPC returning the list of left-side operands.

logic

string

Allowed values: both, and, or . Specifies if only and , or or both types of filters are available.

```
both, and, or
```

```
and
```

```
or
```

```
both
```

operators

array

Custom operators. The data structure is the same as the grouped select box.

If the left-side operands field is not filled, it can be filled manually.

## hashtag Examples

### hashtag Basic usage of a filter

```
[{"name":"search","label":"Search criteria","type":"filter","options":[{"label":"Email","value":"email"},{"label":"Username","value":"username"}]}]
```

### hashtag Custom operators

Many services have their own search options and syntax. That's why you may need to define your own operators. You can specify them inside the options object. You can create multiple groups of operators.

```
options
```

### hashtag Only and , only or logic

```
and
```

```
or
```

You may need to set up an only and or only or filter. You can do this by setting the logic option. In this example, you can see how to create the filter parameter with only and logic. For the or alternative, change the keyword.

```
and
```

```
or
```

```
logic
```

```
and
```

```
or
```

### hashtag Custom options, custom operators, and custom logic

This example combines custom options, custom operators, and custom logic.

Last updated 5 months ago

---
title: "Number | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/block-elements/parameters/number
scraped_at: 2026-04-21T12:45:04.842503Z
description: "A number that can include a decimal or fractional parts"
---

1. Block elements chevron-right
2. Parameters

# Number

A number that can include a decimal or fractional parts

## hashtag Specification

### hashtag validate

- Type: Object
- Specifies parameter validation

Type: Object

```
Object
```

Specifies parameter validation

Available parameters:

max

number

Specifies the maximum numeric value.

min

number

Specifies the minimum numeric value.

### hashtag nested

Available types:

array

Provides an array of nested parameters that are shown when the value of the parameter is set (value is not empty)

string

Provides the URL address of an RPC to load the list of nested parameters.

object

Provides a detailed specification of nested parameters.

```
{"name":"myNumber","type":"number","label":"My Number","nested":"rpc://getNestedFields"}
```

## hashtag Example

### hashtag Basic numeric input

For more examples, see the Integer/Uinteger parameter specification .

Last updated 5 months ago

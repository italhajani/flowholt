---
title: "Integer, Uinteger | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/block-elements/parameters/integer-uinteger
scraped_at: 2026-04-21T12:45:04.714641Z
description: "A whole number or positive whole number"
---

1. Block elements chevron-right
2. Parameters

# Integer, Uinteger

A whole number or positive whole number

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

Provides the URL address of an RPC to load a list of nested parameters.

object

Provides a detailed specification of nested parameters.

```
{"name":"myInteger","type":"integer","label":"My Integer","nested":"rpc://getNestedFields"}
```

## hashtag Examples

### hashtag Basic integer and uinteger input

### hashtag Set minimum and maximum value

Last updated 5 months ago

---
title: "Color | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/block-elements/parameters/color
scraped_at: 2026-04-21T12:44:57.700364Z
description: "Hexadecimal color input"
---

1. Block elements chevron-right
2. Parameters

# Color

Hexadecimal color input

## hashtag Specification

### hashtag nested

Available types:

array

Provides an array of nested parameters that are shown when the value of the parameter is set (value is not empty).

string

Provides the URL address of an RPC to load a list of nested parameters.

object

Provides a detailed specification of nested parameters.

```
{"name":"myColor","type":"color","label":"My Color","nested":"rpc://getNestedFields"}
```

## hashtag Example

### hashtag Color input

Color input accepts three or six hexadecimal characters prefixed with # .

```
#
```

Last updated 5 months ago

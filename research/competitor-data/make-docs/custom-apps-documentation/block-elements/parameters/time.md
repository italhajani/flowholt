---
title: "Time | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/block-elements/parameters/time
scraped_at: 2026-04-21T12:45:16.575790Z
description: "Time in hh:mm format"
---

1. Block elements chevron-right
2. Parameters

# Time

Time in hh:mm format

## hashtag Specification

### hashtag nested

Available types:

array

Provides an array of nested parameters that are shown when the value of the parameter is set (value is not empty).

string

Provides the URL address of an RPC to load list of nested parameters.

object

Provides a detailed specification of nested parameters.

```
{"name":"myTime","type":"time","label":"My Time","nested":"rpc://getNestedFields"}
```

## hashtag Example

### hashtag Basic time input

The time field expects a time entry in hh:mm format.

```
hh:mm
```

Last updated 5 months ago

---
title: "Timestamp | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/block-elements/parameters/timestamp
scraped_at: 2026-04-21T12:45:15.276663Z
description: "A timestamp in Unix epoch format (number of seconds since 01/01/1970 00:00:00 UTC)"
---

1. Block elements chevron-right
2. Parameters

# Timestamp

A timestamp in Unix epoch format (number of seconds since 01/01/1970 00:00:00 UTC)

## hashtag Specification

### hashtag nested

Available types:

array

Provides an array of nested parameters that are shown when the value of the parameter is set (value is not empty)

string

Provides a URL address of an RPC to load a list of nested parameters.

object

Provides a detailed specification of nested parameters.

```
{"name":"myTimestamp","type":"timestamp","label":"My Timestamp","nested":"rpc://getNestedFields"}
```

## hashtag Example

### hashtag Basic timestamp input

The value from the timestamp input is validated as a UNIX timestamp. If it doesn't match the UNIX timestamp pattern, the validation will fail.

Last updated 5 months ago

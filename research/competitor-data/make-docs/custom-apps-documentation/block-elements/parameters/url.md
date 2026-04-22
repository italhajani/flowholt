---
title: "URL | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/block-elements/parameters/url
scraped_at: 2026-04-21T12:45:18.418420Z
description: "A URL address"
---

1. Block elements chevron-right
2. Parameters

# URL

A URL address

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
{"name":"myUrl","type":"url","label":"My URL","nested":"rpc://getNestedFields"}
```

## hashtag Example

The URL address is validated as protocol://host:port/path/file?parameters#anchor

```
protocol://host:port/path/file?parameters#anchor
```

```
[{"name":"url","type":"url","label":"URL"}]
```

Last updated 5 months ago

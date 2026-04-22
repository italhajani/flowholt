---
title: "Email | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/block-elements/parameters/email
scraped_at: 2026-04-21T12:44:59.368559Z
description: "Allows only a valid email address to be filled in"
---

1. Block elements chevron-right
2. Parameters

# Email

Allows only a valid email address to be filled in

## hashtag Specification

### hashtag nested

Available types:

array

Provides an array of nested parameters that are shown when the value of the parameter is set (value is not empty)

string

Provides the URL address of an RPC to load the list of nested parameters.

object

Provides a detailed specification of nested parameters.

```
{"name":"myEmail","type":"email","label":"My Email","nested":"rpc://getNestedFields"}
```

## hashtag Example

### hashtag Email input

```
[{"name":"contact","label":"Contact email","type":"email"}]
```

Last updated 5 months ago

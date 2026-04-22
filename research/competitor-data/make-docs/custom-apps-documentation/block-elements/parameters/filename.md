---
title: "Filename | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/block-elements/parameters/filename
scraped_at: 2026-04-21T12:44:59.966578Z
description: "A file name with extension"
---

1. Block elements chevron-right
2. Parameters

# Filename

A file name with extension

## hashtag Specification

### hashtag extension

- Type: String or Array .
- Allowed extension or array of allowed extensions.

Type: String or Array .

```
String or Array
```

Allowed extension or array of allowed extensions.

### hashtag nested

Available types:

array

Provides an array of nested parameters that are shown when the value of the parameter is set (value is not empty).

string

Provides the URL address of an RPC to load the list of nested parameters.

object

Provides a detailed specification of nested parameters.

```
{"name":"myFilename","type":"filename","label":"My Filename","nested":"rpc://getNestedFields"}
```

## hashtag Examples

### hashtag File input

When combined with filename parameter, the buffer can be used for a file input dialog.

```
filename
```

### hashtag Allowed file extensions

Restrict allowed extensions by adding extension option.

```
extension
```

Last updated 5 months ago

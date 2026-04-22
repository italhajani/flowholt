---
title: "Buffer | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/block-elements/parameters/buffer
scraped_at: 2026-04-21T12:44:54.428652Z
description: "A binary buffer (file data)"
---

1. Block elements chevron-right
2. Parameters

# Buffer

A binary buffer (file data)

## hashtag Specification

### hashtag codepage

- Type: String
- The semantic of the buffer

Type: String

```
String
```

The semantic of the buffer

In combination with type filename the buffer can be used for better file input dialog.

```
filename
```

```
[{"name":"fileName","type":"filename","label":"File name","semantic":"file:name"},{"name":"data","type":"buffer","label":"Data","semantic":"file:data"}]
```

## hashtag Examples

### hashtag Basic buffer

A simple binary buffer field. You can use the toBinary() function to convert data to a binary format.

```
toBinary()
```

### hashtag File input

When combined with the filename parameter, the buffer can be used for a file input dialog.

```
filename
```

Last updated 5 months ago

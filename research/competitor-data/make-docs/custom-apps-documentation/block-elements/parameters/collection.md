---
title: "Collection | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/block-elements/parameters/collection
scraped_at: 2026-04-21T12:44:55.484209Z
description: "An object with key: value pairs"
---

1. Block elements chevron-right
2. Parameters

# Collection

An object with key: value pairs

## hashtag Specification

### hashtag spec

- Type: Array
- Description of the collection.
- Array of parameters. Standard parameters syntax is used.

Type: Array

```
Array
```

Description of the collection.

Array of parameters. Standard parameters syntax is used.

```
{"name":"myCollection","type":"collection","label":"My Collection","spec":[{"name":"email","type":"email"},{"name":"phone","type":"text"}]}
```

### hashtag sequence

- Type: Boolean
- If set to true , all properties of the object will be in the same order as they are defined in the spec .

Type: Boolean

```
Boolean
```

If set to true , all properties of the object will be in the same order as they are defined in the spec .

```
true
```

```
spec
```

## hashtag Examples

### hashtag Simple collection

Create a collection by specifying its parameters in the spec .

```
spec
```

### hashtag Collection in a collection

Collections can be also nested in another collection.

Last updated 5 months ago

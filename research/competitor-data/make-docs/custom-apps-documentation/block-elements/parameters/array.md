---
title: "Array | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/block-elements/parameters/array
scraped_at: 2026-04-21T12:44:55.911645Z
description: "An array of items of the same type"
---

1. Block elements chevron-right
2. Parameters

# Array

An array of items of the same type

## hashtag Specification

### hashtag spec

- Describes the data structure of array items.
- Parameters inside spec use the syntax of the regular parameters.

Describes the data structure of array items.

Parameters inside spec use the syntax of the regular parameters.

Available types:

object

The output is an array of primitive types. If the object contains a name , it will be ignored.

```
name
```

array

The output is a complex array of Objects.

```
{"name":"tags","spec":{"type":"text","label":"Tag"},"type":"array","label":"Tags"}
```

When no spec is provided, the array behaves as a primitive array of strings. However, the preferred approach is setting the spec to {"type": "text"} .

```
{"type": "text"}
```

```
{"name":"contacts","spec":[{"name":"email","type":"email","label":"Email"},{"name":"name","type":"text","label":"Name"}],"type":"array","label":"Contacts"
```

### hashtag validate

- Type: Object
- Collection of validation directives.

Type: Object

```
Object
```

Collection of validation directives.

Available parameters:

maxItems

number

Specifies the maximum length that an array parameter can have.

minItems

number

Specifies the minimum length that an array parameter can have.

enum

array

Array of allowed values in the array.

### hashtag mode

- Type: String
- Allowed values are edit and choose .

Type: String

```
String
```

Allowed values are edit and choose .

```
edit
```

```
choose
```

When the array is editable , you can set the default state by using mode .

```
editable
```

```
mode
```

### hashtag labels

Available parameters:

add

string

Default: Add item . The text is displayed on the adding button.

```
Add item
```

## hashtag Examples

### hashtag Primitive array

The primitive array is an array of simple variables, like numbers or strings.

### hashtag Complex array

The complex array is an array of complex objects - collections.

### hashtag Complex array with labeled collections

### hashtag Amount of items

Use the validate object to set minItems and maxItems to control the minimum and/or maximum amount of items in the array.

```
validate
```

```
minItems
```

```
maxItems
```

### hashtag Custom labels

Customize the button labels using the labels object.

```
labels
```

Last updated 5 months ago

---
title: "Boolean | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/block-elements/parameters/boolean
scraped_at: 2026-04-21T12:44:53.481460Z
description: "A true or false value"
---

1. Block elements chevron-right
2. Parameters

# Boolean

A true or false value

## hashtag Specification

### hashtag nested

Available types:

array

Provides an array of nested parameters that are shown when the value of the parameter is true (the checkbox is checked).

string

Provides the URL address of an RPC to load list of nested parameters.

object

Provides a detailed specification of nested parameters.

### hashtag editable (deprecated)

- Type: Boolean
- Default: false
- If set to true , the user can map (or manually edit) the value of the parameter.

Type: Boolean

```
Boolean
```

Default: false

```
false
```

If set to true , the user can map (or manually edit) the value of the parameter.

```
true
```

## hashtag Example

### hashtag Basic Boolean

A basic Boolean offers three options: true , false and undefined .

```
true
```

```
false
```

```
undefined
```

```
[{"type":"boolean","label":"My Boolean","name":"myBoolean"}]
```

### hashtag Checkbox style

You can turn the radio buttons into a checkbox by adding a "required": true property. Additionally, you can set the default state by setting the default property.

```
"required": true
```

```
default
```

### hashtag Nested parameters

By adding nested fields, you can add fields that will be shown to the user if this field’s value is true .

```
true
```

### hashtag Editable (deprecated)

Since Apps platform version 2 , all Booleans have set mappable (editable) to true by default.

```
mappable
```

```
true
```

You can allow mapping to the field by setting editable to true .

```
editable
```

```
true
```

Last updated 5 months ago

---
title: "Select | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/block-elements/parameters/select
scraped_at: 2026-04-21T12:45:14.246681Z
description: "A selection from predefined values"
---

1. Block elements chevron-right
2. Parameters

# Select

A selection from predefined values

## hashtag Specification

### hashtag multiple

- Type: Boolean
- Default: false
- If true , multiple selections are allowed.

Type: Boolean

```
Boolean
```

Default: false

```
false
```

If true , multiple selections are allowed.

```
true
```

### hashtag sort

- Type: String
- Allowed values: text or number
- Items are unsorted by default. However, you can sort them using this option.

Type: String

```
String
```

Allowed values: text or number

```
text
```

```
number
```

Items are unsorted by default. However, you can sort them using this option.

### hashtag grouped

- Type: Boolean
- If true , options can be grouped by using grouped options syntax.

Type: Boolean

```
Boolean
```

If true , options can be grouped by using grouped options syntax.

```
true
```

```
[{label:"Group",options:[{label:"Option",value:1}]}]
```

### hashtag options

Available types:

array

An array of options for this select field. Example:

string

Specifies an options RPC URL that retrieves dynamic options for this selection.

object

Allows specifying the detailed configuration of options and nested parameters for this select field.

Available parameters :

store

array

Specifies options for the select field.

store

string

Specifies an options RPC URL that retrieves dynamic options for the select.

label

string

Specifies the name of a property as the label of an option.

value

string

Specifies the name of a property as the value of an option. Value cannot be null .

```
null
```

placeholder

string

Specifies the label shown when no option is selected. Available parameters:

- label ( string ) - Specifies the label shown when no option is selected.
- nested ( array ) - Specifies an array of nested parameters shown when no option is selected.

label ( string ) - Specifies the label shown when no option is selected.

```
label
```

```
string
```

nested ( array ) - Specifies an array of nested parameters shown when no option is selected.

```
nested
```

```
array
```

placeholder

object

Specifies a detailed configuration of a placeholder. Available parameters:

- label ( string ) - Specifies the label shown when no option is selected.
- nested ( array ) - Specifies an array of nested parameters shown when no option is selected.

label ( string ) - Specifies the label shown when no option is selected.

```
label
```

```
string
```

nested ( array ) - Specifies an array of nested parameters shown when no option is selected.

```
nested
```

```
array
```

nested

array

Specifies an array of nested parameters shown when an option is selected.

When the select is multiple , the nested parameters are generated and displayed for the selected options.

```
multiple
```

nested

string

Specifies an RPC URL that retrieves dynamic nested options.

### hashtag mode

- Type: String .
- Accepted values: edit or choose .

Type: String .

```
String
```

Accepted values: edit or choose .

```
edit
```

```
choose
```

### hashtag validate

- Type: Object or Boolean .
- Specifies parameter validation.

Type: Object or Boolean .

```
Object
```

```
Boolean
```

Specifies parameter validation.

When set to false , the validation against the provided options gets disabled for manual input.

```
false
```

Available parameters:

maxItems

number

Specifies the maximum number of selected items when multiple is true .

```
multiple
```

```
true
```

minItems

number

Specifies the minimum number of selected items when multiple is true .

```
multiple
```

```
true
```

### hashtag spec

- Type: Object .

Type: Object .

```
Object
```

Available parameters:

type

string

Specifies a data type of value from the select that is validated.

Useful when your API returns numerical IDs in strings but you want them to be typed as numbers in the output of your module.

### hashtag dynamic

- Type: Boolean
- Default: false

Type: Boolean

```
Boolean
```

Default: false

```
false
```

Defines whether a mapped value in the select should be validated against the option values.

If true , the value is treated as dynamic and validation is disabled. The value is set to true automatically if select options are generated using an RPC.

```
true
```

### hashtag mappable

- Type: Boolean or Object Set to false to make field non-mappable. If Object , it specifies the detailed configuration of the mapping toggle.

Type: Boolean or Object

```
Boolean or Object
```

- Set to false to make field non-mappable.
- If Object , it specifies the detailed configuration of the mapping toggle.

Set to false to make field non-mappable.

```
false
```

If Object , it specifies the detailed configuration of the mapping toggle.

```
Object
```

Available parameters:

help

string

Alternative help text is shown only when the mappable toggle is turned on.

## hashtag Examples

### hashtag Basic select

A basic select with few options that can't be changed manually.

### hashtag Select with grouped options

Sort options into groups by enabling grouped options.

```
grouped
```

### hashtag Multiple choice

Turn on multiple choice by setting multiple to true .

```
multiple
```

```
true
```

### hashtag Multiple choice with validation

You can validate the number of selected options by using validate object.

```
validate
```

### hashtag Mappable select with help

You can display a custom help message when the mappable toggle is turned on.

### hashtag Preselected value

Set a preselected value by setting a default . The value of desired option and default has to match.

```
default
```

### hashtag Placeholder

Choose what to display when no option is selected by specifying a placeholder. You need to put options inside the store array to make this work.

```
store
```

### hashtag Nested options

Use nested options to display a set of fields when an option is selected.

### hashtag Nested fields for specific options

Display certain fields only when a specific option is selected. In this case, you can nest fields under a specific option.

### hashtag Select under select

This is a special case of nested options that is used to specify a category and its subcategory.

### hashtag Mode edit as default

When your select is editable, you can set the default mode edit .

```
edit
```

### hashtag Nested RPCs

Nest RPCs when retrieving nested fields dynamically. The nested RPC receives the id parameter automatically.

```
id
```

Last updated 5 months ago

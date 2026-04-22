---
title: "Text | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/block-elements/parameters/text
scraped_at: 2026-04-21T12:45:12.934415Z
description: "A plain text value"
---

1. Block elements chevron-right
2. Parameters

# Text

A plain text value

## hashtag Specification

### hashtag tags

- Type: String
- Specifies how to treat HTML tags.

Type: String

```
String
```

Specifies how to treat HTML tags.

Allowed values:

strip

Removes HTML tags.

stripall

Removes all HTML tags (including unclosed).

escape

Converts < , > and & to HTML entities.

```
<
```

```
>
```

```
&
```

### hashtag validate

- Type: Object
- Specifies parameter validation.

Type: Object

```
Object
```

Specifies parameter validation.

Available parameters:

max

number

Specifies the maximum length.

min

nNumber

Specifies the minimum length.

pattern

string

Specifies a RegExp pattern that a text parameter should conform to.

In most cases, the pattern has to be wrapped in ^ and $ e.g. ^[a-z]+$ in order to validate the whole input, not just a part.

```
^
```

```
$
```

```
^[a-z]+$
```

### hashtag nested

Available types:

array

Provides an array of nested parameters that are shown when the value of the parameter is set (value is not empty).

string

Provides the URL address of an RPC to load a list of nested parameters.

object

Provides a detailed specification of nested parameters.

## hashtag Examples

### hashtag Basic text field

A basic text input.

### hashtag Strip HTML tags

Enable HTML tags stripping or escaping using the tags option.

```
tags
```

Stripped field

Escaped field

### hashtag Validate length

Control the length of the inserted string value by setting validate.max and validate.min .

```
validate.max
```

```
validate.min
```

### hashtag Validate pattern

Use a regular expression to validate the text input.

### hashtag Search button

Add an RPC button (also called as a search button) to perform an RPC call inside the field. Usually used to find an ID of a specific item.

Last updated 5 months ago

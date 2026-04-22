---
title: "Data types | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/block-elements/types
scraped_at: 2026-04-21T12:41:55.413302Z
description: "Make data types are derived from normal JSON data types, with some limitations and additions."
---

1. Block elements

# Data types

Make data types are derived from normal JSON data types, with some limitations and additions.

## hashtag Primitive types

string

A string is a statically specified piece of text, like "Hello, world" .

```
"Hello, world"
```

number

A number is a sequence of digits, like 8452 or -123 .

```
8452
```

```
-123
```

boolean

A boolean is a binary type that has 2 values: true or false .

```
true
```

```
false
```

null

A null is a special type, that represents an absence of a value.

## hashtag Complex types

### hashtag Flat object

A flat object is a collection of key-value pairs, where the key is a string , and the value can be any primitive type .

```
{"id":1,"firstName":"James","lastName":"McManson",}
```

A flat object cannot contain nested collections and arrays.

### hashtag Object

An object is a collection of key-value pairs, where the key is a string , and the value can be any primitive or complex type.

### hashtag Array

An array is a collection of primitive and complex types.

## hashtag IML types

IML types are special strings or complex types that can contain IML expressions. An IML expression is a template expression that can resolve into a value.

### hashtag IML string

An IML string is a string that can contain IML expressions in between {{ and }} tags. Anything between these tags is considered an expression. IML strings are also known as template strings. IML string is an extension to string and, as such, can contain any value that a normal string can contain. It does not have to be just an IML expression. For example:

```
{{
```

```
}}
```

- A string of a single IML expression: "{{body.data.firstName + ' ' + body.data.lastName}}"
- A string without an IML expression: "Hello, World"
- A string with text and IML expression: "Hello, {{body.data.name}}"

A string of a single IML expression: "{{body.data.firstName + ' ' + body.data.lastName}}"

```
"{{body.data.firstName + ' ' + body.data.lastName}}"
```

A string without an IML expression: "Hello, World"

```
"Hello, World"
```

A string with text and IML expression: "Hello, {{body.data.name}}"

```
"Hello, {{body.data.name}}"
```

### hashtag IML flat object

An IML flat object is a flat object that can additionally contain IML strings as values.

### hashtag IML object

An IML object is an object that can additionally contain IML strings and IML arrays as values.

### hashtag IML array

An IML array is an array that can contain IML strings and IML objects as values.

Last updated 5 months ago

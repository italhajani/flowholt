---
title: "Type | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/component-blocks/api/handling-responses/type
scraped_at: 2026-04-21T12:46:22.289257Z
---

1. Component blocks chevron-right
2. Communication chevron-right
3. Handling responses

# Type

Required : no Default : automatic (based on Content-Type header) Values : automatic , json , urlencoded , text (or string ), binary , and xml .

```
automatic
```

```
Content-Type
```

```
automatic
```

```
json
```

```
urlencoded
```

```
text
```

```
string
```

```
binary
```

```
xml
```

This directive specifies how to parse the data received from the server.

When automatic is used for the response type, Make tries to parse the response based on its Content-Type header.

```
automatic
```

```
Content-Type
```

Currently, Make recognizes only text/plain , application/json , application/x-www-form-urlencoded and application/xml (or text/xml ).

```
text/plain
```

```
application/json
```

```
application/x-www-form-urlencoded
```

```
application/xml
```

```
text/xml
```

When specifying other types, Make ignores the Content-Type header and tries to parse the response in the format that you have specified.

```
Content-Type
```

```
{"response":{"type":"json"}}
```

This will parse all responses as JSON.

You can specify the type as a string , in which case every response, no matter the status code, will be processed based on your selected type.

```
string
```

## hashtag Custom response types based on status code

You can specify the type as a special object where keys are status codes, wildcard, or status code ranges. This may be necessary because some services return different responses with different status codes: JSON on success and TEXT on error, for example.

### hashtag Type object specification

- The * (wildcard) represents all responses and should always be present.
- The [number]-[number] represents a status code range.
- The [number] represents a status code.\

The * (wildcard) represents all responses and should always be present.

```
*
```

The [number]-[number] represents a status code range.

```
[number]-[number]
```

The [number] represents a status code.\

```
[number]
```

When specifying ranges and multiple ranges include the same status code, the smallest range is selected. The * has the largest range (1-999) and a number has the smallest range, for example, 455 is 455-455 range.

```
*
```

```
455
```

```
455-455
```

Ranges are counted inclusive from both sides, so if you specify a range 401-402 , both the 401 and 402 status codes will be processed by this range.

```
401-402
```

```
401
```

```
402
```

If a response returns with status 406 , it will be parsed as XML.
If a response returns with status 401 , it will be parsed as text.
If a response returns with status 200 , it will be parsed as JSON.

```
406
```

```
401
```

```
200
```

## hashtag XML type

It is not possible to convert XML to JSON objects one-to-one. However, in Make, there are methods to accessing nodes and attributes to parsed XML.

#### hashtag Everything is an array

Each parsed node is an array, even the root node. Even if in XML a node is single, it will still be represented in Make as an array.

Is parsed in Make as:

To access the value of <text> node in the output, for example:

```
<text>
```

Note the [] notation. This is a shortcut to getting the first element of an array in IML.

```
[]
```

#### hashtag Access the value of a node with attributes

If there are attributes present on the node you want to get the value of, you need to use _value .

```
_value
```

Here, the previous example will not work, because the <text> node has attributes.

```
<text>
```

Use this to access the value of the <text> node:

```
<text>
```

#### hashtag Access node attributes

In a similar manner, you can access node attributes with _attributes :

```
_attributes
```

_attributes is a collection where you can access each attribute’s value by its name:

```
_attributes
```

#### hashtag Access nested nodes

When accessing nested XML nodes, access them via the array notation. When accessing nested elements, it doesn’t matter if the parent has attributes or not:

To process these two items in the iterate directive:

```
iterate
```

It is the item array that contains <item> nodes, and not the items array.

```
item
```

```
<item>
```

```
items
```

## hashtag Rounded long ID numbers

In some cases, services might send JSON or XML with long IDs:

Since Make uses JavaScript, numbers exceeding the MAX_SAFE_INTEGER value arrow-up-right may be rounded.

In this case, use type: text to handle the response. Then, use the replace (with RegEx) and parseJSON functions to convert these long numbers to strings.

```
type: text
```

```
replace
```

```
parseJSON
```

This is not a problem when the third party sends an ID as a string .

```
string
```

Last updated 5 months ago

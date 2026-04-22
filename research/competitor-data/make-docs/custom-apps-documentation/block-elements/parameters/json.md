---
title: "JSON | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/block-elements/parameters/json
scraped_at: 2026-04-21T12:45:05.990741Z
description: "A valid JSON string"
---

1. Block elements chevron-right
2. Parameters

# JSON

A valid JSON string

## hashtag Specification

This type of parameter has no extra options.

It acts as a multi-line text field to the user, with one notable difference: the module automatically converts the input to a JSON object. So if you map "{{parameters.myJsonField}}" in Communication, that value will be an object (or array).

```
"{{parameters.myJsonField}}"
```

If the provided value is not valid JSON, the module throws a validation error.

### hashtag Example

#### hashtag JSON input

```
[{"name":"json","label":"JSON","type":"json"}]
```

Last updated 5 months ago

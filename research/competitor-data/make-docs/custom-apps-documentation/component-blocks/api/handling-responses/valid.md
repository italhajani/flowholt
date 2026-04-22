---
title: "Valid | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/component-blocks/api/handling-responses/valid
scraped_at: 2026-04-21T12:46:20.632971Z
description: "HTTP response validation"
---

1. Component blocks chevron-right
2. Communication chevron-right
3. Handling responses

# Valid

HTTP response validation

Required : no Default : true

```
true
```

This directive lets you decide whether the HTTP response returned by a service is valid or not. If this directive is not present, the response is considered always valid when the status code is between 200 and 399 (inclusive).

Some services might return an HTTP status code >= 400 if there is an error. These are handled by standard error handling . But some services might return an HTTP status code < 400 (mostly the HTTP 200) and indicate an error in the response body or headers. In that case, it makes no sense to output anything from the module, but instead indicate that there is an error.

## hashtag Behavior

- If the valid directive evaluates to a false value ( false , undefined , null , etc.), module execution stops and Make throws an error. The execution log will display either your custom error message or a fallback message.
- If the valid directive resolves to a truthy value, the module will continue execution normally.

If the valid directive evaluates to a false value ( false , undefined , null , etc.), module execution stops and Make throws an error. The execution log will display either your custom error message or a fallback message.

```
valid
```

```
false
```

```
undefined
```

```
null
```

If the valid directive resolves to a truthy value, the module will continue execution normally.

```
valid
```

### hashtag Basic usage examples

Both of the following forms are equivalent. You can define valid as as simple condition ( valid": "{{!body.error}} ) or as an object within a condition property plus optional message and type.

```
valid
```

```
valid": "{{!body.error}}
```

```
{"response":{"valid":{"condition":"{{!body.error}}"//Causes error 'Response marked as invalid.' if `error` property exists in HTTP json response body.}}}
```

```
{"response":{"valid":"{{!body.error}}"//Causes error 'Response marked as invalid.' if `error` property exists in HTTP json response body.}}
```

## hashtag Custom error message

It is also possible to define an expected error message in this way:

If no type is specified, the default RuntimeError is used. In the example above, setting " type": "UnknownError" overrides this default.

```
RuntimeError
```

```
type": "UnknownError"
```

## hashtag Fallback error messages

The response.error.<statusCode> directive is used as a fallback if valid.message is not specified.

```
response.error.<statusCode>
```

```
valid.message
```

The response.error directive is used as a fallback if valid.message and response.error.<statusCode> are not specified.

```
response.error
```

```
valid.message
```

```
response.error.<statusCode>
```

The priority of error message resolution is as follows. The first matching is used, the rest are ignored.

1. Directive response.valid.message
2. Directive response.error.<statusCode>.message
3. Directive response.error.message
4. Static message: Response marked as invalid.

Directive response.valid.message

```
response.valid.message
```

Directive response.error.<statusCode>.message

```
response.error.<statusCode>.message
```

Directive response.error.message

```
response.error.message
```

Static message: Response marked as invalid.

```
Response marked as invalid.
```

## hashtag Error type resolution

The priority of error type resolution is the same as for error message above:

```
message
```

1. Directive response.valid.type
2. Directive response.error.<statusCode>.type
3. Directive response.error.type
4. Default type: RuntimeError

Directive response.valid.type

```
response.valid.type
```

Directive response.error.<statusCode>.type

```
response.error.<statusCode>.type
```

Directive response.error.type

```
response.error.type
```

Default type: RuntimeError

```
RuntimeError
```

Last updated 5 months ago

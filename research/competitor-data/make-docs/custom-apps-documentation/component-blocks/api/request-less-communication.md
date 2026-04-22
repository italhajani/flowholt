---
title: "Request-less communication | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/component-blocks/api/request-less-communication
scraped_at: 2026-04-21T12:44:45.410398Z
description: "Use when you need to output static content"
---

1. Component blocks chevron-right
2. Communication

# Request-less communication

Use when you need to output static content

When you need the module to output some static (or computed) content, you can use the request-less/static mode by omitting the URL and specifying only the response.output directives.

```
response.output
```

## hashtag Specification

You can mix static definitions with normal requests and have more than two static requests.

When using this mode, the following directives are completely ignored: method , qs , headers , body , ca , type and pagination - almost all request-related directives.

```
method
```

```
qs
```

```
headers
```

```
body
```

```
ca
```

```
type
```

```
pagination
```

All response-related directives, such as response.output , response.wrapper , response.iterate are available, as well as response.valid and response.error . However, the latter directives lose their value in static mode.

```
response.output
```

```
response.wrapper
```

```
response.iterate
```

```
response.valid
```

```
response.error
```

## hashtag Examples

### hashtag Example 1 :

```
{"response":{"output":{"id":"{{parameters.itemId}}","text":"[{{parameters.itemId}}] {{parameters.text}}"}}}
```

```
[{"condition":"{{parameters.mode == 'self'}}","response":{"output":{"text":"No items"}}},{"condition":"{{parameters.mode != 'self'}}","response":{"output":{"text":"Some items found"}}}]
```

Includes different outputs depending on condition.

Last updated 6 months ago

---
title: "Handling responses | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/component-blocks/api/handling-responses
scraped_at: 2026-04-21T12:44:36.758759Z
description: "By default, a module outputs the response it receives from the remote server."
---

1. Component blocks chevron-right
2. Communication

# Handling responses

By default, a module outputs the response it receives from the remote server.

## hashtag Response specification

Below is a list of directives controlling the processing of the response. When used, they must be placed inside the response collection.

```
response
```

type

```
type
```

String or type specification

Specifies how data is parsed from the body.

valid

```
valid
```

IML string or object

An expression that parses whether the response is valid or not.

error

```
error
```

IML string or rrror specification

Specifies how the error is shown to the user, if it occurs.

limit

```
limit
```

IML string or number

Controls the maximum number of returned items by the module.

iterate

```
iterate
```

IML string or iterate specification

Specifies how response items are retrieved and processed, in case of multiple.

temp

```
temp
```

IML object

Creates/updates variable temp which you can access in subsequent requests.

```
temp
```

output

```
output
```

Any IML type

Describes the structure of the output bundle.

Last updated 7 months ago

---
title: "Error | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/component-blocks/api/handling-responses/error
scraped_at: 2026-04-21T12:46:24.050777Z
---

1. Component blocks chevron-right
2. Communication chevron-right
3. Handling responses

# Error

Required : yes Default : Make shows a generic message

The error directive specifies the error type and the error message to show the user.

```
error
```

You can specify different error messages based on different status codes. The error object has the following attributes:

message

IML string

An expression that parses an error message from the response body.

type

IML string

An expression that specifies the error type.

<status code>

Error specification

An object that customizes the error message and type based on the status code.

See error handling for more details.

## hashtag Properties

### hashtag message

Required : yes

The error.message directive specifies the message that the error will contain. It can be a statically specified string, or it can point to a message in a response body or header.

```
error.message
```

### hashtag type

Required : no Default : RuntimeError

The error.type directive specifies a type of error message. Different error types are handled differently by Make. The default error type is RuntimeError . See error handling for more details.

```
error.type
```

```
RuntimeError
```

### hashtag <status-code>

Required : no

You can specify custom errors for different status codes by specifying the status code as the key in the error directive object and using the same error specification as a value.

```
error
```

Last updated 6 months ago

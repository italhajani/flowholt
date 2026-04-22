---
title: "Base | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/app-components
scraped_at: 2026-04-21T12:44:32.375490Z
---

1. App components

# Base

Base serves as the repository for all components that are common across all modules and remote procedures. Any elements placed in Base will be inherited by each module and remote procedure.

These components are:

- Base URL
- Authorization
- Error handling
- Sanitization

Base URL

Authorization

Error handling

Sanitization

baseUrl

```
baseUrl
```

String

Base URL is the main URL to a web service. It should be used for every module and remote procedure in an app.

headers

```
headers
```

Object

Default headers that every module will use.

qs

```
qs
```

Object

Default query string parameters that every module will use.

body

```
body
```

Object

Default request body that every module will use when issuing a POST or PUT request.

response

```
response
```

Object

Default directives for handling response, such as error handling.

log

```
log
```

Object

Default directive for handling logs, such as sanitization of sensitive data.

oauth

```
oauth
```

OAuth 1.0 Parameter Specification

Collection of directives containing parameters for the OAuth 1 protocol.

```
{"baseUrl":"https://my.api.cz/2.0","headers":{"authorization":"Basic {{base64(connection.username + ':' + connection.password)}}"},"response":{"valid":{"condition":"{{body.status != 'error'}}"},"error":{"200":{"message":"{{ifempty(errors(body.message), body.message)}}"},"message":"[{{statusCode}}]: {{body.reason}}"}},"log":{"sanitize":["request.headers.authorization"]}}
```

Everything specified in the base is inherited by all modules and RPCs. You can see the baseUrl , authorization being sent in headers, an error handler and sanitization . Those parameters will be used across all the modules and RPCs.

```
baseUrl
```

```
authorization
```

```
headers,
```

```
error
```

```
sanitization
```

## hashtag Common data

Once the app is approved, the common data gets locked and it cannot be changed due to security reasons.

Common data can be accessed by the common.variable IML expression.

```
common.variable
```

Common data is stored in encrypted form in Make.

The secret is defined in the common data. Then it can be used in base and in all other communication objects inside modules and RPCs. Once the app becomes approved, it will not be possible to change the secret.

```
common
```

```
base
```

By default, requests time out after 40 seconds. If your API typically performs tasks that
exceed this duration, you can increase the timeout up to a maximum of 300 seconds (or
300,000 milliseconds).

To adjust the timeout, specify the desired duration in the base and common data settings
(in milliseconds). This timeout will apply to the entire custom app. We recommend the
following approach (example using a 300 seconds timeout):

The timeout should only be extended if the API performs legitimately
resource-intensive operations, such as video/image processing, file conversion, or
complex AI computations.

Last updated 5 months ago

---
title: "Error handling | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/best-practices/base/error-handling
scraped_at: 2026-04-21T12:44:20.981324Z
---

1. Best practices chevron-right
2. Base

# Error handling

It is important to implement error handling in your app so your users clearly understand the cause of the error.

Each service sends an error message when an error occurs. This usually happens when the request has wrong parameters or values or when the service has an outage.

When an error occurs, the module should indicate the error as well as a detailed message that can then be used in filters. The message should be clear and user-friendly. For example, instead of "Error: contact_not_found", your message should be "[404] The specified contact was not found."

The error handling code should correspond to the structure of the server response.

## hashtag Error handling example

In this example, the JSON response has the following format in cases where something goes wrong:

```
{"error":{"code":"E101","message":"The company with the given ID does not exist."}}
```

Here's how the error section should (and should not) look:

```
"response":{"error":{"message":"[{{statusCode}}] {{body.error.message}} (error code: {{body.error.code}})"}}
```

The error object in this example contains the code and message fields. It is also important to show the status code of the error. This can be accessed using the statusCode keyword. In the case of HTTP error 400, for example, the error message could look like this:

```
code
```

```
message
```

```
statusCode
```

[400] The company with the given ID does not exist. (error code: E101)

```
[400] The company with the given ID does not exist. (error code: E101)
```

```
"response":{"error":{"message":"{{body.error.text}}"}}
```

The error object in this example contains the code and message fields, but not a text field.

```
code
```

```
message
```

```
text
```

## hashtag Common error messages

### hashtag 4xx: Client Error

4xx errors arrow-up-right indicate something wrong on the client side.

### hashtag 5xx: Server Error

5xx errors arrow-up-right indicate something wrong on the side of the third-party service.

## hashtag Handling status code 200

Sometimes the API returns status code 200 with an error in the body. In this situation, use the valid directive, which tells whether the response should be processed or an error should be thrown.

```
status code 200
```

It is NOT possible to use specific HTTP code 200-399 error directives without the using valid directive.

Sometimes the API returns status code 200 without errors to an incorrect request. This can happen, for example, if the Get a/an [item] module is developed based on the search endpoint and not based on a separate endpoint. This may be the case if a separate endpoint for that action is not implemented on the service’s side.

```
status code 200
```

Incorrect example of the search approach for a Get module:

If an incorrect ID is provided, this will return an empty response. It is important to validate the call's response and, if empty, return a formatted error message.

Correct example of Search approach with validation:

In this case, we mark the response as invalid if it has no ID, as the ID should always be returned with other data.

Note that this approach will trigger error handler from the Base, so make sure you have meaningful error messages there.

Last updated 5 months ago

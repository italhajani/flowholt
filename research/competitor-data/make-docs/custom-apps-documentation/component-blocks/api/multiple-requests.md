---
title: "Multiple Requests | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/component-blocks/api/multiple-requests
scraped_at: 2026-04-21T12:44:46.605899Z
---

1. Component blocks chevron-right
2. Communication

# Multiple Requests

To make multiple requests, put all of your requests in an array.

All requests are executed sequentially and the output of the last request is used as the module's output.

During the execution of multiple calls in a module, when the service returns an HTTP error, it is not possible to evaluate it as a success. Therefore, handling the error by another call is not possible.

## hashtag Examples

### hashtag Extending data by executing an additional call

```
[{"url":"http://example.com/api/user","response":{"temp":{"username":"{{body.username}}"}}},{"url":"http://example.com/items","response":{"iterate":"{{body}}","output":{"username":"{{temp.username}}","text":"{{item.text}}"}}}]
```

### hashtag Full update approach

When the endpoint for updating a record has a full update approach, to update a record correctly you need to provide all parameters. If some parameters are omitted, they will be cleared or overridden to default values. This is not user friendly and should be handled on the app's side.

### hashtag Asynchronous approach

When a web service doesn't support a synchronous approach and the common use case of the module requires support, it should be added on the app's side.

Last updated 5 months ago

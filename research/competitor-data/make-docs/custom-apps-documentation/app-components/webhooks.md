---
title: "Webhooks | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/app-components/webhooks
scraped_at: 2026-04-21T12:41:49.337250Z
description: "Webhooks are used with instant triggers that execute the flow immediately after the remote server sends data."
---

1. App components

# Webhooks

Webhooks are used with instant triggers that execute the flow immediately after the remote server sends data.

To use webhooks, you must always create an instant trigger and link it to a webhook.

## hashtag Specification

Specifies how to get data from the payload and how to reply to a remote server.

```
{"verification":{"condition":String|Boolean,"respond":{"type":Enum[json,urlencoded,text],"status":String|Number,"headers":Object"body":String|Object,}},"respond":{"type":Enum[json,urlencoded,text],"status":String|Number,"headers":Object"body":String|Object,},"iterate":{"container":String,"condition":String|Boolean},"output":String|Object,"condition":String|Boolean,"uid":String}
```

If the webhook returns multiple items in one batch, you might need to use the iterate directive to specify which items to output. Then you might want to specify the output directive to map items to output. If you do not specify the output directive, items will be returned as-is.

```
iterate
```

```
output
```

```
output
```

respond

```
respond
```

Response specification

Specifies how to respond to the remote server.

verification

```
verification
```

Verification specification

Specifies how to reply to the remote server. Used for webhooks that require a verification mechanism, such as challenge responses.

iterate

```
iterate
```

IML string or iterate specification

Specifies how the response items (in case of multiple) are retrieved and processed.

output

```
output
```

Any IML type

Describes the structure of the output bundle.

condition

```
condition
```

IML string or boolean

Determines whether to execute the current request.

uid

```
uid
```

IML string

Specifies how to get the user ID from the request body. Necessary to associate the recipient when using a shared webhook.

### hashtag respond

Required : no

This directive lets you customize Make's response on the webhook or a verification request.

type

```
type
```

IML string

no

Specifies how to encode data into the body.

Default: json

```
json
```

Available values: json , urlencoded , text

```
json
```

```
urlencoded
```

```
text
```

status

```
status
```

IML string

no

Specifies the HTTP status code that will be returned with the response.

headers

```
headers
```

IML flat object

no

Specifies custom headers that are to be sent with the response.

body

```
body
```

Any IML type

no

Specifies the response body.

### hashtag verification

Required : no

This directive allows you to reply to webhook verification requests. Some systems issue a verification request during webhook creation to ensure your webhook is prepared to handle incoming data. Such systems may send a code and request Make to return it and maybe some other value with it. In such case, this directive will help you.

condition

```
condition
```

IML string

Specifies when to treat the incoming data as a verification request.

respond

```
respond
```

IML string

Specifies the response.

#### hashtag verification.condition

Required : no

Default : true

```
true
```

This directive distinguishes normal webhook requests from verification requests. Usually, the remote service will send some code to verify that Make is capable of receiving data. In such cases, you want to check for the existence of this code variable in the request body. If it exists, this request is a verification request. Otherwise, it would be a normal webhook request with data.

#### hashtag verification.respond

Required : no

This directive is exactly the same as the respond directive, except that it is nested in verification . The behavior of verification.respond , is the same as the normal respond .

```
respond
```

```
verification
```

```
verification.respond
```

```
respond
```

### hashtag iterate

Properties of the iterate directive are described in the communication documentation.

### hashtag output

Properties of the output directive are described in the communication documentation.

### hashtag condition

Properties of the condition directive are described in the communication documentation.

### hashtag uid

Required : only in shared webhooks

Specifies how to get the user ID from the request body. This value is then used to search for the recipient of the message in the database of connections. Remember to specify the uid parameter in the connection definition.

```
uid
```

## hashtag Available IML variables

These IML variables are available for you to use everywhere in a webhook:

now

```
now
```

Current date and time

environment

```
environment
```

TBD

parameters

```
parameters
```

Contains the webhook's input parameters.

data

```
data
```

Alias for parameters.

body

```
body
```

Contains the body of an incoming webhook.

query

```
query
```

Contains query string parameters of an incoming webhook.

method

```
method
```

Contains HTTP method of an incoming webhook.

headers

```
headers
```

Contains headers of an incoming webhook.

## hashtag Types of webhooks

### hashtag Shared

Shared webhooks are used when the external service sends all events from all users to a single URL that you control. With this, the user is not able to see the URL and you must use the uid in the connection and in the webhook communication to associate the payloads to the right users.

```
uid
```

### hashtag Dedicated

​Dedicated webhooks are the most common type. An individual URL is created and either automatically registered to the external platform or the user may need to configure it manually. The user can see the URL and copy it from the scenario.

Last updated 5 months ago

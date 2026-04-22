---
title: "Outgoings | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/devices/outgoings
scraped_at: 2026-04-21T12:43:26.772341Z
---

1. API Reference chevron-right
2. Devices

# Outgoings

### hashtag List

Required scope: devices:read

- devices:read

```
devices:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

```
new_sms
```

The value that will be used to sort returned entities by.

The value of entities you want to skip before getting entities you need.

The sorting order. It accepts the ascending and descending direction specifiers.

```
asc
```

```
desc
```

Sets the maximum number of results per page in the API call response. For example, pg[limit]=100 . The default number varies with different API endpoints.

```
pg[limit]=100
```

Successful response

Successful response

### hashtag Delete

"ids" and "all" can no be used together
"ids" or "all" has to be set
"exceptIds" is possible to use only with "all"
It could happen, that some incoming messages are deleted and others not. In this case, the API returns a successful status code, and the response additionally contains an error object with a error description.

- devices:write

```
devices:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

```
true
```

Successful response

Successful response

### hashtag Detail

Required scope: devices:read

- devices:read

```
devices:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

Successful response

Successful response

Last updated 1 day ago

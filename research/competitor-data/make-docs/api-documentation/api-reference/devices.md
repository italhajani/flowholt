---
title: "Devices | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/devices
scraped_at: 2026-04-21T12:41:22.109446Z
---

1. API Reference

# Devices

### hashtag List

Get a list of devices of a given team.

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
1
```

true = devices with scenarioId; false = devices without scenarioId - this filter only affects the trigger scope

```
true
```

Devices assigned to the scenario and not assigned devices. If this parameter is set assigned parameter is ignored.

```
4
```

```
call
```

```
name
```

Successful response

Successful response

### hashtag Detail

The ID can be id or udid.

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
1
```

```
name
```

Successful response

Successful response

### hashtag Delete

Errors:
IM004 - Confirmation required (error with metadata) - needs confirmation
IM405 - Device can't be deleted because it contains messages in queue (error with metadata) - needs confirmation
IM005 - Device is locked by a running scenario and thus can't be deleted

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
2
```

```
true
```

Successful response

Successful response

### hashtag Partial update

Update a device

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
name
```

Successful response

Successful response

### hashtag Create request

Required scope: devices:write

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
1
```

Successful response

Successful response

Last updated 1 day ago

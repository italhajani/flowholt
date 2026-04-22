---
title: "Connections | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/sdk-apps/connections
scraped_at: 2026-04-21T12:43:37.108462Z
---

1. API Reference chevron-right
2. SDK Apps

# Connections

### hashtag List App Connections

- sdk-apps:read

```
sdk-apps:read
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

### hashtag Create Connection

- sdk-apps:write

```
sdk-apps:write
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
oauth
```

```
oauth-refresh
```

```
oauth-resowncre
```

```
oauth-clicre
```

```
oauth-1
```

```
apikey
```

```
basic
```

```
other
```

Successful response

Successful response

### hashtag Get Connection

- sdk-apps:read

```
sdk-apps:read
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

### hashtag Delete Connection

- sdk-apps:write

```
sdk-apps:write
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

### hashtag Update Connection

- sdk-apps:write

```
sdk-apps:write
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

### hashtag Get Connection Section

Available sections: api, parameters, scopes, scope, install, installSpec

- sdk-apps:read

```
sdk-apps:read
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

### hashtag Set Connection Section

Available sections: api, parameters, scopes, scope, installSpec, install

- sdk-apps:write

```
sdk-apps:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The structure of the request body varies depending on the section being updated. It can be a JSON object or array.

Successful response

Successful response

### hashtag Get Connection Common

- sdk-apps:read

```
sdk-apps:read
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

The common data for the connection. The structure of this object is not fixed and depends on the connection's configuration.

Successful response

### hashtag Set Connection Common

- sdk-apps:write

```
sdk-apps:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The common data for the connection. The structure of this object is not fixed and depends on the connection's configuration.

Successful response

Successful response

### hashtag Recreate Connection

Recreates an existing app connection and synchronises it with HQ.

- sdk-apps:write

```
sdk-apps:write
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

An empty object is returned on successful recreation.

Successful response

Last updated 1 day ago

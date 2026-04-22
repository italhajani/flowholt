---
title: "SDK Apps | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/sdk-apps
scraped_at: 2026-04-21T12:41:29.691073Z
---

1. API Reference

# SDK Apps

### hashtag List Apps

Retrieves a collection of all apps available to the authenticated user.

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

If set to true , this parameter returns apps available to all users. If set to false , it retrieves the apps available to the authenticated user.

```
true
```

```
false
```

Specifies the group of values to return. For example, you may want to retrieve only the names of the available apps.

```
name
```

Successful response

Successful response

### hashtag Create App

Creates a new app with data passed in the request body. In the response, it returns all details of the created app.

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

### hashtag Get App

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

Specifies the group of values to return.

Successful response

Successful response

### hashtag Delete App

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

### hashtag Patch App

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

### hashtag Clone App

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

### hashtag Clone App Major Version

Clones the app to the next major version with the same app name. Requires the "allow_apps" feature flag to be enabled.

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

### hashtag Get App Review

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

### hashtag Request Review

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
true
```

```
application/json
```

Successful response

Successful response

### hashtag Submit App Review Form

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

### hashtag Get App Events Log

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

### hashtag Get App Common

Get app client id and client secret.

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

The numeric version of the app.

The numeric version of the app.

```
1
```

Successful response

Successful response

### hashtag Set app common data

Sets the common data for the app based on the parameters passed in the request body. In the response, it returns all details of common data. Common data usually contain sensitive information like API keys or API secrets and these details are shared across all modules.

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

The name of the app.

The app version.

The JSON object containing the common data.

Successful response

Successful response

### hashtag Get App Docs

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

```
true
```

Successful response

Successful response

### hashtag Set App Docs

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
true
```

```
text/markdown
```

```
I see you.
```

Successful response

Successful response

### hashtag Set App Base

Set app base configuration.

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
application/jsonc
```

Successful response

Successful response

### hashtag Patch App Base

Patch app base configuration.

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
application/jsonc
```

Successful response

Successful response

### hashtag Set App Section

Available sections: base, groups, install, installSpec

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

### hashtag Set App Section

Available sections: base, groups, install, installSpec

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

### hashtag Set App Visibility

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
public
```

```
private
```

Successful response

Successful response

### hashtag Set App Opensource

beta, stable

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
text/plain
```

Successful response

Successful response

### hashtag Set App ClosedSource

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

### hashtag Get Change

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

### hashtag Commit Changes

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
application/json
```

Successful response

Successful response

### hashtag Rollback Changes

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
application/json
```

Successful response

Successful response

### hashtag Get App Logo

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

### hashtag Set App Logo

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

### hashtag Uninstall App from Organization

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

Last updated 1 day ago

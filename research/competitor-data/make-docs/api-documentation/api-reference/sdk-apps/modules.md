---
title: "Modules | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/sdk-apps/modules
scraped_at: 2026-04-21T12:43:40.110080Z
---

1. API Reference chevron-right
2. SDK Apps

# Modules

### hashtag List App Modules

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

### hashtag Create Module

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

Module type id. Allowed values:

- 1 = TRIGGER (Trigger - polling) Use if you wish to watch for any changes in your app/service. Examples are Watch a New Book, which will be triggered whenever a new book has been added to the library.
- 4 = ACTION Use if the API endpoint returns a single response. Examples are Create a book, Delete a book or Get a Book.
- 9 = SEARCH Use if the API endpoint returns multiple items. An example is List Books that will find specific books according to search criteria.
- 10 = CONVERGER (Instant Trigger / webhook) Use if the API endpoint has a webhook available (dedicated or shared). Example is Watch a New Event.
- 11 = HITL (Responder) Use if you need to send a processed data back to a webhook.
- 12 = RETURNER (Universal) Use if you want to enable users to perform an arbitrary API call to the service. Examples are Make an API Call and Execute a GraphQL Query.

```
4
```

```
1
```

```
4
```

```
9
```

```
10
```

```
11
```

```
12
```

Module init mode:

- blank -  Creates a new blank module (code is empty).
- example - Creates a module from a model app (which contains the example codes).
- module - Creates module from existing user's module.

```
blank
```

```
example
```

```
model
```

```
module
```

```
blank
```

```
blank
```

```
example
```

```
module
```

Required when moduleInitMode is module . Specifies the name of the source module to clone.

```
moduleInitMode
```

```
module
```

The name of the connection to use.

The name of the webhook to use.

The CRUD operation type.

Successful response

Successful response

### hashtag Get Module

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

### hashtag Delete Module

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

### hashtag Patch Module

Updates a module.

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

### hashtag Set Module Section

Available sections: api, epoch, parameters, expect, interface, samples, scope

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

### hashtag Set Module Section

Available sections: api, epoch, parameters, expect, interface, samples, scope

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

Request URL

This directive controls the encoding of URLs. It is on by default, so if you have any special characters in your URL, they will be automatically encoded. But there might be situations where you don't want your URL to be encoded automatically, or you want to control what parts of the URL are encoded. To do this, set this flag to false.

```
true
```

```
GET
```

```
POST
```

```
PUT
```

```
PATCH
```

```
DELETE
```

```
^.*[{][{].*[}][}].*$
```

Request headers

Query string parameters

Custom Certificate Authority

Request body

```
json
```

```
urlencoded
```

```
multipart/form-data
```

```
text
```

```
string
```

```
raw
```

```
binary
```

```
^.*[{][{].*[}][}].*$
```

Temporary variables accessible during execution

```
true
```

Helper directive, that will simplify generating AWS signatures.

Helper directive, that will simplify generating an OAuth1 Authorization headers.

Add an Accept-Encoding header to request compressed content encodings from the server (if not already present) and decode supported content encodings in the response.

```
false
```

This directive specifies whether to follow GET HTTP 3xx responses as redirects or never.

```
true
```

This directive specifies whether to follow non-GET HTTP 3xx responses as redirects or never.

```
true
```

This directive specifies logging options for both the request and the response.

Directive to specify how to process paginated responses.

Repeats a request under a certain condition with a predefined delay in milliseconds. The maximum number of repeats can be bounded by the repeat.limit.

Successful response

Successful response

### hashtag Set Module Section

Available sections: api, epoch, parameters, expect, interface, samples, scope

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

### hashtag Set Module Section

Available sections: api, epoch, parameters, expect, interface, samples, scope

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

### hashtag Set Module Section

Available sections: api, epoch, parameters, expect, interface, samples, scope

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

### hashtag Set Module Section

Available sections: api, epoch, parameters, expect, interface, samples, scope

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

### hashtag Get Module Section

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
api
```

```
epoch
```

```
parameters
```

```
expect
```

```
interface
```

```
samples
```

```
scope
```

Successful response

Successful response

### hashtag Set Module Visibility

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

### hashtag Clone Module

Creates a duplicate of a module.

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

### hashtag Set Module Deprecation

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
deprecate
```

```
undeprecate
```

Successful response

Successful response

### hashtag Set Module Consumable

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

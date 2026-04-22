---
title: "Base URL | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/app-components/base/base-url
scraped_at: 2026-04-21T12:44:31.575708Z
---

1. App components chevron-right
2. Base

# Base URL

Base URL is the main URL to a web service that should be used for every module and remote procedure in an app, e.g. https://mywebservice.com/api/v1.

```
https://mywebservice.com/api/v1.
```

There might be situations when you need to have a variable base URL. For example, if the web service uses multiple domains you may want to let your users have access to the one they use.

## hashtag Base URL example: two types of accounts

This is an example of how to handle two types of accounts - sandbox and production .

```
sandbox
```

```
production
```

Add a checkbox in your connection parameters that can be checked when the condition is met:

```
[{"name":"sandbox","type":"boolean","label":"Sandbox"},...]
```

Implement a condition in both the connection and the base:

```
{"baseUrl":"https://{{if(connection.sandbox,'sandbox.', '')}}yourapi.com/api"}
```

All modules and remote procedures can then use hard-coded "url": "/uniqueEndpoint"

```
"url": "/uniqueEndpoint"
```

## hashtag Base URL example: two environments

This is an example of how to handle two types of accounts - eu and us .

```
eu
```

```
us
```

Set up select in your connection parameters, where you let your users choose from available environments:

```
select
```

```
[{"name":"environment","type":"select","label":"Environment","options":[{"label":"EU","value":"eu"},{"label":"US","value":"us"}],"default":"production"},...]
```

Map the environment in both the connection and the base.

```
{"baseUrl":"https://{{connection.environment}}.yourapi.com",...}
```

All modules and remote procedures can then use hard-coded "url": "/uniqueEndpoint"

```
"url": "/uniqueEndpoint"
```

See the best practices for Base URL for more information.

Last updated 5 months ago

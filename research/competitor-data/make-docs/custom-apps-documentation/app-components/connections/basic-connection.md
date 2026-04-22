---
title: "Basic connection | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/app-components/connections/basic-connection
scraped_at: 2026-04-21T12:44:35.915565Z
description: "Connection is a link between Make and a third-party service or app."
---

1. App components chevron-right
2. Connections

# Basic connection

Connection is a link between Make and a third-party service or app.

Basic connections include different authentication methods that don't need any token exchange mechanism. The most common case uses API keys where you send the key with the request to the endpoint you want to use. Types of authentication supported by basic connections include:

- API key (or similar single-token auth types)
- Basic Auth (a username and password pair encoded with base64 ),
for example: "{{base64('user:pass')}}"
- Digest Auth (a pair of credentials hashed with md5 )

API key (or similar single-token auth types)

Basic Auth (a username and password pair encoded with base64 ),
for example: "{{base64('user:pass')}}"

```
base64
```

```
"{{base64('user:pass')}}"
```

Digest Auth (a pair of credentials hashed with md5 )

```
md5
```

## hashtag Components

### hashtag Communication

For more information, see the communication documentation.

- aws directive is not available
- Only a single request can be performed
- pagination directive is not available
- response.limit is not available
- response.iterate directive is not available
- response.output is not available
- response is extended with data , uid and metadata

aws directive is not available

```
aws
```

Only a single request can be performed

pagination directive is not available

```
pagination
```

response.limit is not available

```
response.limit
```

response.iterate directive is not available

```
response.iterate
```

response.output is not available

```
response.output
```

response is extended with data , uid and metadata

```
response
```

```
data
```

```
uid
```

```
metadata
```

#### hashtag response.data

The data directive saves data to the connection so it can be accessed later from a module through the connection variable. It functions similarly to the temp directive, except that data is persisted in the connection.

```
data
```

```
connection
```

```
temp
```

```
data
```

This accessToken can be later accessed in any module that uses this connection.

```
accessToken
```

#### hashtag response.metadata

The metadata directive allows you to save the user’s name or username (or any other text field) so multiple connections of the same type can be easily recognized. A common practice is to save either username, email, or full name to metadata.

```
metadata
```

The metadata object has 2 properties: value and type . value is used to store the value and type is used to specify what the value is. Currently, there are only 2 types: email and text .

```
value
```

```
type
```

```
value
```

```
type
```

```
email
```

```
text
```

#### hashtag response.uid

The response.uid directive allows you to save the user’s remote service ID. This is required when using shared webhooks .

```
response.uid
```

### hashtag Parameters​

Parameters the user needs to provide when setting up a new connection.

### hashtag ​Common data​

Non-user-specific sensitive values like secrets.

## hashtag Available IML variables

These IML variables are available for you to use everywhere in this module:

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

temp

```
temp
```

Contains custom variables created via temp directive.

```
temp
```

parameters

```
parameters
```

Contains the connection’s input parameters.

common

```
common
```

Contains the connection’s common data collection.

data

```
data
```

Contains the connection's data collection.

## hashtag API key-based connection example

## hashtag Basic Auth connection example

Last updated 5 months ago

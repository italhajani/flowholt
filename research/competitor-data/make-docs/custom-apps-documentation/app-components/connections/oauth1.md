---
title: "OAuth 1.0 | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/app-components/connections/oauth1
scraped_at: 2026-04-21T12:44:36.095664Z
description: "Connection is a link between Make and a third-party service or app. The OAuth 1.0 connection handles the token exchange automatically."
---

1. App components chevron-right
2. Connections

# OAuth 1.0

Connection is a link between Make and a third-party service or app. The OAuth 1.0 connection handles the token exchange automatically.

While OAuth 1.0 is supported, it is not commonly used. Unless you are dealing with a legacy platform, we suggest you use a basic connection or OAuth 2.0 .

Before you start to configure your OAuth 1.0 connection, create an app on a third-party service. When creating an app, use https://www.integromat.com/oauth/cb/app-oauth1 as a callback URL.

```
https://www.integromat.com/oauth/cb/app-oauth1
```

## hashtag Components

### hashtag Communication

For more information, see the communication documentation.

- aws directive is not available
- Communication is extended with oauth
- pagination directive is not available
- response.limit is not available
- response.iterate directive is not available
- response.output is not available
- response is extended with data

aws directive is not available

```
aws
```

Communication is extended with oauth

```
oauth
```

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

response is extended with data

```
response
```

```
data
```

#### hashtag oauth

It is sometimes tedious and difficult to generate an OAuth 1.0 Authorization header. Below are all the properties that you can use to customize the header generation.

consumer_key

```
consumer_key
```

IML String

Your consumer key

consumer_secret

```
consumer_secret
```

IML String

Your consumer secret

private_key

```
private_key
```

IML String

Instead of consumer_secret you can specify a private_key string in PEM format

```
consumer_secret
```

```
private_key
```

token

```
token
```

IML String

An expression that parses the oauth_token string.

```
oauth_token
```

token_secret

```
token_secret
```

IML String

An expression that parses the oauth_token_secret string.

```
oauth_token_secret
```

verifier

```
verifier
```

IML String

An expression that parses the oauth_verifier string.

```
oauth_verifier
```

signature_method

```
signature_method
```

String

Specifies the desired method to use when calculating the signature. Can be either HMAC-SHA1 , RSA-SHA1 , PLAINTEXT . Default is HMAC-SHA1 .

```
HMAC-SHA1
```

```
RSA-SHA1
```

```
PLAINTEXT
```

```
HMAC-SHA1
```

transport_method

```
transport_method
```

String

Specifies how OAuth parameters are sent: via query params, header or in a POST body. Can be either query , body or header . Default is header

```
query
```

```
body
```

```
header
```

```
header
```

body_hash

```
body_hash
```

IML String

To use Request Body Hash, you can either manually generate it, or you can set this directive to true and the body hash will be generated automatically

```
true
```

#### hashtag response.data

The data directive saves data to the connection so that it can be later accessed from a module through the connection variable. It functions similarly to the temp directive, except that data is persisted to the connection.

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

### hashtag ​Parameters​

Parameters the user needs to provide when setting up a new connection.

### hashtag Default scope

Default scope for every new connection.

### hashtag Scope list

Collection of available scopes .

### hashtag ​Common data​

Non-user-specific sensitive values like secrets.

## hashtag OAuth 1.0 authentication process

The OAuth 1.0 authentication process consists of multiple steps. You can fill in the necessary sections and delete those that are unnecessary.

oauth

```
oauth
```

OAuth 1 parameters specification

Allows you to specify special OAuth 1.0 properties to simplify OAuth 1.0 header generation.

requestToken

```
requestToken
```

Request specification

Describes a request that retrieves the request token

authorize

```
authorize
```

Request specification

Describes the authorization process.

accessToken

```
accessToken
```

Request specification

Describes a request that exchanges credentials and the request token for the access token.

info

```
info
```

Request specification

Describes a request that validates a connection. The most common way to validate the connection is to call a method to get user’s information. Most of the APIs have such a method.

When using an OAuth 1.0 connection there is a special object available globally: the oauth object. You can use it in the connection specification as well as in module specifications to avoid generating the OAuth 1.0 header yourself. This object is available at the root of the connection specification, in the Base and in the Request Specification.

```
oauth
```

If the oauth object is present in the root of the connection specification, it will be merged with each of the directives described above. If you wish to override some properties of the root object, you can do so in the respective directive by specifying the oauth object and overriding the properties.

```
oauth
```

```
oauth
```

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

oauth.scope

```
oauth.scope
```

Contains an array of scope required to be passed to the OAuth 1.0 authorization process.

oauth.redirectUri

```
oauth.redirectUri
```

Contains the redirect URL for the OAuth 1.0 authorization process.

Last updated 5 months ago

---
title: "OAuth 2.0 | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/app-components/connections/oauth2
scraped_at: 2026-04-21T12:44:35.060217Z
description: "Connection is a link between Make and a third-party service or app. The OAuth 2.0 connection handles the token exchange automatically."
---

1. App components chevron-right
2. Connections

# OAuth 2.0

Connection is a link between Make and a third-party service or app. The OAuth 2.0 connection handles the token exchange automatically.

Before you start configuring your OAuth 2.0 connection, create an app on a third-party service.

When creating an app, use:

- https://www.make.com/oauth/cb/app as a callback URL together with the oauth.makeRedirectUri variable, or:
- https://www.make.com/oauth/cb/app as a callback URL together with the oauth.localRedirectUri variable, if you are going to request approval of your app, or:
- https://www.integromat.com/oauth/cb/app as an old callback URL together with the oauth.redirectUri variable. This option is not suggested for new apps.

https://www.make.com/oauth/cb/app as a callback URL together with the oauth.makeRedirectUri variable, or:

```
https://www.make.com/oauth/cb/app
```

```
oauth.makeRedirectUri
```

https://www.make.com/oauth/cb/app as a callback URL together with the oauth.localRedirectUri variable, if you are going to request approval of your app, or:

```
https://www.make.com/oauth/cb/app
```

```
oauth.localRedirectUri
```

https://www.integromat.com/oauth/cb/app as an old callback URL together with the oauth.redirectUri variable. This option is not suggested for new apps.

```
https://www.integromat.com/oauth/cb/app
```

```
oauth.redirectUri
```

## hashtag OAuth 2.0 authentication process

OAuth 2.0 authentication processes consist of multiple steps that need to be defined in the Connection communication. The communication should be a collection with the keys below. You can use the keys the particular flow requires and disregard those that are unnecessary.

preauthorize

```
preauthorize
```

Request specification

Describes a request that should be executed prior to the authorize directive.

```
authorize
```

authorize

```
authorize
```

Request specification

Describes the authorization process.

token

```
token
```

Request specification

Describes a request that exchanges credentials for tokens.

info

```
info
```

Request specification

Describes a request that validates a connection. The most common way to validate the connection is to call an API’s method to get a user’s information. Most of the APIs have such a method. The info directive can be used to store account's metadata.

```
info
```

refresh

```
refresh
```

Request specification

Describes a request that refreshes an access token.

invalidate

```
invalidate
```

Request specification

Describes a request that invalidates acquired access token.

Each section is responsible for executing its part in the OAuth 2.0 flow.

You can describe the initial OAuth 2.0 flow as follows:

```
preauthorize => authorize => token => info
```

with preauthorize and info sections being optional, and refresh and invalidate not being a part of the initial OAuth 2.0 flow.

```
preauthorize
```

```
info
```

```
refresh
```

```
invalidate
```

If the authorize directive isn't used, the condition in the token directive has to be set to true. Otherwise, the token directive will not be successfully triggered.

```
authorize
```

```
condition
```

```
token
```

```
true.
```

## hashtag Components

### hashtag Communication

For more information, see the communication documentation.

- aws directive is not available
- pagination directive is not available
- response.limit is not available
- response.iterate directive is not available
- response.output is not available
- response is extended with data
- response is extended with expires

aws directive is not available

```
aws
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

response is extended with expires

```
response
```

```
expires
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

This accessToken can be later accessed in any module that uses this connection or in the app base.

```
accessToken
```

#### hashtag response.expires

The expires directive indicates the expiration datetime for tokens.

```
expires
```

It's generally used only in the token and refresh blocks of the connection communication and there are two variations:

```
token
```

```
refresh
```

- response.data.expires is used to trigger the token refresh request.
- response.expires is used to prompt the user to manually reauthorize the connection. This is necessary when the access token can no longer be automatically refreshed, such as when a refresh token expires. This is generally defined by the refresh_expires_in value in the response from the access token request, or specified in the documentation.

response.data.expires is used to trigger the token refresh request.

```
response.data.expires
```

response.expires is used to prompt the user to manually reauthorize the connection. This is necessary when the access token can no longer be automatically refreshed, such as when a refresh token expires. This is generally defined by the refresh_expires_in value in the response from the access token request, or specified in the documentation.

```
response.expires
```

```
refresh_expires_in
```

When the date is reached, the connection needs to be reauthorized manually, either from a scenario or the Connections tab.

If refresh_expires_in is not included in the reply but the API documentation mentions refresh tokens expire after a certain time, you should use that value. For example, for a year: "{{addYears(now, 1)}}"

```
refresh_expires_in
```

```
"{{addYears(now, 1)}}"
```

### hashtag Parameters​

Parameters the user needs to provide when setting up a new connection.

### hashtag Default scope

Default scope for every new connection.

### hashtag Scope list

Collection of available scopes .

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

Contains the connection’s data collection.

oauth.scope

```
oauth.scope
```

Contains an array of scope required to be passed to the OAuth 2.0 authorization process.

oauth.redirectUri

```
oauth.redirectUri
```

Contains the redirect URL for the OAuth 2.0 authorization process in this format: https://www.integromat.com/oauth/cb/app

```
https://www.integromat.com/oauth/cb/app
```

oauth.localRedirectUri

```
oauth.localRedirectUri
```

Contains the redirect URL for the OAuth 2.0 authorization process in this format: https://www.make.com/oauth/cb/app or this format: https://www.private-instance.com/oauth/cb/app

```
https://www.make.com/oauth/cb/app
```

```
https://www.private-instance.com/oauth/cb/app
```

oauth.makeRedirectUri

```
oauth.makeRedirectUri
```

Contains the redirect URL for the OAuth 2.0 authorization process in this format: https://www.make.com/oauth/cb/app

```
https://www.make.com/oauth/cb/app
```

## hashtag Code grant example

## hashtag OAuth 2.0 code grant example with PCKE

## hashtag Client credentials example

In the client credentials flow, the user must provide the Client ID and secret, so no common data is defined.

Last updated 4 months ago

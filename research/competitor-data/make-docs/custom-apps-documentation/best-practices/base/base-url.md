---
title: "Base URL | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/best-practices/base/base-url
scraped_at: 2026-04-21T12:44:20.725752Z
---

1. Best practices chevron-right
2. Base

# Base URL

Base URL is the main URL to a web service that should be used for every module and remote procedure in an app, for example: https://mywebservice.com/api/v1.

```
https://mywebservice.com/api/v1.
```

Make sure that the base URL is a production endpoint with a domain that belongs to the app itself.

Apps with development or staging URLs, or apps with a domain belonging to a cloud computing service, will not be approved.

When the service has a different domain for each user, the domain should be requested in the connection and then the value should be used in the Base tab.

## hashtag Correct Base URL examples

An example from the Mailerlite app:

```
{"baseUrl":"https://api.mailerlite.com/api/v2"}
```

An example from the Freshsales app:

```
{"baseUrl":"https://{{connection.domain}}.freshsales.io"}
```

## hashtag Incorrect Base URL examples

```
{"baseUrl":"https://mydomain.freshsales.io"}
```

The "mydomain" should be a variable used from the Connection.

```
{"baseUrl":"https://mailerlite.heroku.com/development"}
```

## hashtag Using the Base URL

All of the modules should build on top of the baseURL from the Base section (starting with a forward slash / ). It is very unlikely that a single module will need to have a completely different URL than the rest.

```
baseURL
```

```
/
```

The underlined part, which is the same for each module, should be in the Base tab.

Modules "url" should start with forward slash /

```
/
```

Last updated 5 months ago

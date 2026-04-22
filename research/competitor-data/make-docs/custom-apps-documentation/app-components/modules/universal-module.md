---
title: "Universal | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/app-components/modules/universal-module
scraped_at: 2026-04-21T12:44:06.183190Z
---

1. App components chevron-right
2. Modules

# Universal

A universal module can be used to perform an arbitrary API call to the service's API. It allows the user to specify all parameters of the request while using the app's connection.

Every app using API should have a universal module. An app can have only one universal module.

Security notice

As the universal module allows the user to specify the target URL, it's highly important that the universal module has to use a relative path . Otherwise, a user could point the request to their own custom servers and get access to the access tokens.

A universal module that doesn't match this condition won't be approved by Make to be used in scenarios.

There are two types of universal modules. Choose one depending on the API you use:

- REST API
- GraphQL API

REST API

GraphQL API

## hashtag Components

Components of the universal module are the same as for the action module .

## hashtag Available IML variables

You can use all of the IML variables available for action modules in the universal module, except for the iterate directive.

```
iterate
```

## hashtag Universal module in a scenario

When a universal module is used in a scenario, it is recommended to use it together with a JSON > Create JSON module. Not only it is much easier to create the structure of JSON for the universal, but also all characters, which are part of JSON definition and should be considered as letters, are escaped.

Last updated 5 months ago

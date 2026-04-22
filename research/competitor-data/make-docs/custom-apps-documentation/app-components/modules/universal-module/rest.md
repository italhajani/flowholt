---
title: "REST | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/app-components/modules/universal-module/rest
scraped_at: 2026-04-21T12:46:20.139236Z
---

1. App components chevron-right
2. Modules chevron-right
3. Universal

# REST

## hashtag Naming Convention

All REST universal modules should have the following module label and description:

- Module label : Make an API call
- Module description : Performs an arbitrary authorized API call.

Module label : Make an API call

Module description : Performs an arbitrary authorized API call.

## hashtag URL parameter

Expected input from users should start with / (for example /tasks ) so users can copy-paste the endpoint path from the service documentation.

```
/
```

```
/tasks
```

If the API has multiple versions of API available, the user should be allowed to use any of them. The URL set in the universal module should end before the version.

Set the correct URL in help and add a working endpoint example.

```
help
```

Communication

Mappable parameters

Even when the URL in Communication ends with / before {{parameters.url}}, we ask users to use / in the URL because it is automatically removed.

```
/
```

```
/
```

Communication

Mappable parameters

The "url" in the Communication has the API version in it.

The help has a misleading example, as the base URL should end without a slash and version, and the example should start with a slash and version.

```
help
```

## hashtag Rest universal module example

## hashtag OAuth scopes

When your app requires specifying scopes to access different groups of endpoints, you need to change the connection code to ensure that it works correctly with the universal module:

Add a new advanced parameter called scopes to the connection parameters.

```
scopes
```

In the authorize part of the connection, merge the original scopes with additional scopes added by the parameter from the previous step.

```
authorize
```

Now a user can add additional scopes manually when creating a connection and these scopes will work with the universal module.

Last updated 1 month ago

---
title: "Manage breaking changes | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/app-maintenance/updating-your-app/approved-apps/managing-breaking-changes
scraped_at: 2026-04-21T12:44:29.313835Z
description: "When you make changes in an app, make sure your changes will not break existing scenarios."
---

1. App Maintenance chevron-right
2. Update your app chevron-right
3. Approved apps

# Manage breaking changes

When you make changes in an app, make sure your changes will not break existing scenarios.

Ideally, the removal of the connections, modules, and fields should be announced to the users in advance.

Contact the help desk arrow-up-right with a request for email notification to users.

## hashtag Common breaking changes

Base

Any changes might break scenarios.

Connection

Changing the refresh call for OAuth connection.

```
refresh
```

Module's Communication

Changing response.output .

```
response.output
```

Changing response.type .

```
response.type
```

Adding response.valid for 2xx response.

```
response.valid
```

```
2xx
```

Changing response.trigger .

```
response.trigger
```

Adding a condition .

```
condition
```

Adding an additional call (chaining request).

Changing a linked connection.

Module's Parameters

Adding a new required parameter.

```
required
```

Changing required from false to true .

```
required
```

```
false
```

```
true
```

Removing a parameter.

Changing type (If the original type can be coerced to the new type, it’s fine. e.g. number -> text. See type coercions arrow-up-right .

```
type
```

Adding validate .

```
validate
```

Setting the select parameter mappable to false .

```
mappable
```

```
false
```

Setting the select parameter dynamic to false .
Removing or changing items in a list or dropdown.

```
dynamic
```

```
false
```

Webhook's Communication

Any changes might break scenarios.

RPC

Changing parameter required from false to true .

```
required
```

```
false
```

```
true
```

Changing RPCs building dynamic parameters.

Custom Functions

Any changes might break scenarios.

## hashtag Remove a parameter from a module

It's important to avoid removing mappable parameters from a module without a clear indication or notification to the user. Even if it doesn't immediately cause a scenario to fail, it could still impact its functionality or disrupt the underlying process. Therefore, it's best to communicate any changes to the user. Also, the user should be able to see and work with the original input in the deprecated parameter/s.

In situations where a mappable parameter needs to be removed, there are several ways to handle the deprecation. The appropriate approach depends on the specific circumstances and how the API manages parameter deprecation in its endpoint.

Below, are methods ranked in order of least to greatest impact:

1. Add the [Deprecated] string to the module's label

Add the [Deprecated] string to the module's label

The parameter should be put into advanced parameters and the [Deprecated] string should be attached to the label. Additionally, you can add instructions to the help.

```
[Deprecated]
```

1. Add a banner

Add a banner

If you need to make sure that the user notices the deprecated parameters, you can use the banner element.

There are three distinct message types available, each with a specific icon and guidelines for appropriate use. The recommended length of the message is 50 to 300 characters .

1. Perform an additional check before the request is sent and throw an error if the deprecated parameter is present in the payload

Perform an additional check before the request is sent and throw an error if the deprecated parameter is present in the payload

If the called API service is too strict about using the deprecated parameters, you can do the error execution on the app's side.

## hashtag Shut down a module

If you need to make sure that the module is not used anymore, you can throw an error whenever the module is executed.

## hashtag Deprecate a connection

If you need to deprecate a connection, create a new connection to use as the functional alternative and rename the now-deprecated connection so it contains the (deprecated) string.

```
(deprecated)
```

Then, do the following:

Remove the current primary connection.

Map the new connection as the primary connection.

Map the deprecated connection as the alternative connection.

Last updated 1 month ago

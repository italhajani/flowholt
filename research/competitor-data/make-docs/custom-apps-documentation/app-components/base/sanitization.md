---
title: "Sanitization | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/app-components/base/sanitization
scraped_at: 2026-04-21T12:44:01.155602Z
---

1. App components chevron-right
2. Base

# Sanitization

Sanitization protects sensitive data (passwords, secret keys, etc.) from leakage.

You should always sanitize the log so no personal tokens and/or keys are leaked.

If you don't use sanitization, the request and response logs will not be available in the console .

```
..."log":{"sanitize":["request.headers.accesstoken"]}...
```

Accesstoken is correctly mapped, so it's not exposed.

```
Accesstoken
```

Without sanitization, there isn't a log in the list of executions in Live Stream.

Additionally there will be no shown log in the Scenario Debugger, as shown in the screenshot above.

Neither the developer nor user can see the original request and respond to debug possible issues.

Notice, the accesstoken was mistaken for token . Therefore the accesstoken was exposed in the log.

```
accesstoken
```

```
token
```

```
accesstoken
```

Last updated 5 months ago

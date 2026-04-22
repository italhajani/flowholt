---
title: "Handling of PUT requests in action modules | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/app-components/iml-functions/handling-of-full-update-approach-in-update-modules
scraped_at: 2026-04-21T12:44:43.833788Z
description: "Full update approach"
---

1. App components chevron-right
2. Custom IML functions

# Handling of PUT requests in action modules

Full update approach

Some APIs use full updates instead of partial updates. This is usually seen when the endpoint uses the PUT method instead of PATCH .

```
PUT
```

```
PATCH
```

While PATCH allows you to provide just a few values and it will update only those, PUT generally requires you to send the entire object being updated. If you don't provide all values, missing fields may become empty or be changed to the default values.

```
PATCH
```

```
PUT
```

For more information, see the best practices on updating modules with the PUT request .

Last updated 5 months ago

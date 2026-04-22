---
title: "Advanced inheritance | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/app-components/base/advanced-inheritance
scraped_at: 2026-04-21T12:44:31.415304Z
---

1. App components chevron-right
2. Base

# Advanced inheritance

Consider this as the base:

```
{"headers":{"authorization":"Bearer {{connection.accessToken}}"}}
```

In a module, you need to add a custom header programmatically:

```
{"headers":"{{headerBuilderFunction()}}"}
```

This results in the base being overwritten by the result from the IML function.

To merge both collections, use this special IML syntax inside the module:

```
{"headers":{"{{...}}":"{{headerBuilderFunction()}}"}}
```

Last updated 5 months ago

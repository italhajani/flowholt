---
title: "Limit | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/component-blocks/api/handling-responses/limit
scraped_at: 2026-04-21T12:46:15.833572Z
---

1. Component blocks chevron-right
2. Communication chevron-right
3. Handling responses

# Limit

Required : no Default : unlimited

This directive specifies the maximum number of items that are returned by the module. In a multi-request configuration only the limit of the last request is used, even if it is not specified, because the limit has a default value.

The limit directive is also used by pagination logic to determine whether to fetch the next page or not.

```
limit
```

Last updated 5 months ago

---
title: "Pagination, sorting and filtering | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/pagination-sorting-filtering
scraped_at: 2026-04-21T12:41:00.010363Z
---

# Pagination, sorting and filtering

The majority of responses containing a collection of resources are paginated. Pagination limits the number of returned results per request to avoid delays in receiving a response and prevent overloading with results. Thanks to pagination, the API can run at its best performance.

You set pagination, sorting, and filtering parameters in query parameters. Separate multiple query parameters using the & symbol. The order of the parameters does not matter.

Pagination and filtering parameters contain square brackets -- [ and ] . Always encode them in URLs.

```
[
```

```
]
```

Last updated 1 year ago

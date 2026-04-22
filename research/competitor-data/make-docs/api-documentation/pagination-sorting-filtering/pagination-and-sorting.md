---
title: "Pagination and sorting | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/pagination-sorting-filtering/pagination-and-sorting
scraped_at: 2026-04-21T12:41:14.155669Z
---

1. Pagination, sorting and filtering

# Pagination and sorting

pg[limit]

```
pg[limit]
```

Defines the maximum number of results to return. For example, pg[limit]=100 . The default value varies with different resources.

```
pg[limit]=100
```

pg[offset]

```
pg[offset]
```

Defines the number of results you want to skip before getting the results you need. For example, pg[offset]=10 . The default value for most endpoints is 0 .

```
pg[offset]=10
```

```
0
```

pg[sortBy]

```
pg[sortBy]
```

Defines the property by which to sort results. For example, pg[sortBy]=id . By default, results are usually sorted by name or id .

```
pg[sortBy]=id
```

```
name
```

```
id
```

pg[sortDir]

```
pg[sortDir]
```

Defines the sorting order. Use asc for ascending order, use desc for descending order. The default ordering direction is usually ascending.

```
asc
```

```
desc
```

Example:

Let’s say we want to retrieve data stores that belong to the team with ID 212.

The request URL with the default pagination settings looks as follows:

```
{zone_url}/api/v2/data-stores?teamId=212
```

Where zone_url is the URL of your Make zone. For example: https://eu1.make.com

```
zone_url
```

```
https://eu1.make.com
```

Add the pagination parameters.

In this case, we want to skip the first 10 results, limit the results to 50 data stores and sort them in ascending order. Use the following query parameters:

```
&pg%5Boffset%5D=10&pg%5BsortDir%5D=asc&pg%5Blimit%5D=50
```

The full request URL looks like this:

```
{base_url}/data-stores?teamId=212&pg%5Boffset%5D=10&pg%5BsortDir%5D=asc&pg%5Blimit%5D=50
```

Where base_url is https://eu1.make.com/api/v2

```
base_url
```

```
https://eu1.make.com/api/v2
```

Last updated 1 year ago

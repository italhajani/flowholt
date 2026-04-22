---
title: "Search modules | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/best-practices/modules/search-modules
scraped_at: 2026-04-21T12:44:04.143856Z
---

1. Best practices chevron-right
2. Modules

# Search modules

Search modules are modules that returns multiple results, as opposed to action modules that return only a single result.

If you want to retrieve all users who are registered on your service, you can't use an action module because it only returns one result. Instead, use a search module.

For example, if you call /users , you will get a list of users in body.data .

```
/users
```

```
body.data
```

```
{"url":"/users",},"response":{"output":"{{item}}","iterate":"{{body.data}}","limit":"{{parameters.limit}}"}}
```

## hashtag Iteration and pagination

Since search modules return multiple results, they should contain pagination and iterative directives.

An action module should never contain pagination or the iterate directive. To return multiple objects, create a search module instead.

## hashtag Pagination parameters

The pagination section should only contain parameters that relate to pagination. These will be merged with the rest of the parameters defined in the qs section, so there is no need to define them all again.

```
pagination
```

```
qs
```

The pagination directive contains "since" , "until" and "limit" parameters that are already defined in query string ("qs").

```
"since"
```

```
"until"
```

```
"limit"
```

The pagination directive correctly contains only the "offset" parameter.

```
"offset"
```

## hashtag Page size in pagination

The page size should be as large as possible to reduce the number of requests, minimize delay, and avoid hitting the rate limit.

### hashtag Examples

#### hashtag ActiveCampaign

ActiveCampaign API pagination documentation arrow-up-right :

limit

```
limit
```

The number of results to display in each page (default = 20; max = 100 ).

offset

```
offset
```

The starting point for the result set of a page. This is a zero-based index. For example, if there are 39 total records and the limit is the default of 20, use offset=20 to get the second page of results.

```
limit
```

```
offset=20
```

In this case, set limit to 100 in the request.

```
limit
```

#### hashtag Productive

Productive API pagination documentation arrow-up-right :

current_page

```
current_page
```

1 by default or the value you put in page[number]

total_pages

```
total_pages
```

total_count/page_size rounded up

```
total_count/page_size
```

total_count

```
total_count
```

Total number of resources you have

page_size

```
page_size
```

30 by default or the value you put in page[size]

max_page_size

```
max_page_size
```

200

In this case, set page_size to 200.

```
page_size
```

## hashtag Limiting output

Search modules should allow users to limit their output (how many bundles they return).

This can be achieved by setting the limit parameter in the response.

```
limit
```

By default, this parameter is added to the trigger (polling) modules and should be required. In search modules, this parameter should NOT be required so if a user leaves it empty, the search modules return everything. Its default value should be set to 10.

The limit parameter should not be set to "required":true (except for polling trigger modules).

```
limit
```

```
"required":true
```

The limit parameter should never be set to "advanced":true .

```
limit
```

```
"advanced":true
```

Last updated 5 months ago

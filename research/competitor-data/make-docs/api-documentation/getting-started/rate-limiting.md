---
title: "Rate limiting | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/getting-started/rate-limiting
scraped_at: 2026-04-21T12:41:11.791460Z
---

1. Getting started

# Rate limiting

Make API limits the number of requests you can send to the Make API. Make sets the rate limits based on your organization plan:

- Core: 60 per minute
- Pro: 120 per minute
- Teams: 240 per minute
- Enterprise: 1 000 per minute

Core: 60 per minute

Pro: 120 per minute

Teams: 240 per minute

Enterprise: 1 000 per minute

If you exceed your rate limit, you get error 429 with the message:

```
error 429
```

```
Requests limit for organization exceeded, please try again later.
```

You can check your organization API rate limit with the API call GET {base-url}/organizations/{organizationId} . In the API call response, the license object contains the property apiLimit with your organization's rate limit.

```
GET {base-url}/organizations/{organizationId}
```

```
license
```

```
apiLimit
```

Check the organization detail API endpoint documentation .

Read more about Make pricing arrow-up-right .

Last updated 4 months ago

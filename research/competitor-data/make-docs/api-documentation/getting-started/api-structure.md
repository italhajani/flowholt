---
title: "Make API structure | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/getting-started/api-structure
scraped_at: 2026-04-21T12:41:10.864753Z
---

1. Getting started

# Make API structure

The URL of the Make API consists of three parts:

```
https://{zone_url}/api/{api_version}/{api_endpoint}
```

for example:

```
https://eu1.make.com/api/v2/users/me
```

### hashtag Base URL

Base URL is the core part of an API URL. API endpoint URLs are always relative to the base URL.

The {zone_url}/api/{version} form the base URL of the Make API. For example, the URL https://eu1.make.com/api/v2 is a base URL for the Make API for organizations in the EU1 zone.

```
{zone_url}/api/{version}
```

```
https://eu1.make.com/api/v2
```

### hashtag Zone URL

The zone URL refers to the geological location of the region and environment of your Make organization. Typically, this URL is connected with the infrastructure region (for example, The United States or Europe) and the pricing plan your organization (the Enterprise pricing plans or others).

You can find out the base URL for your organization in the URL address bar of your Make organization dashboard:

Example Make zone URLs:

- https://eu1.make.com/
- https://eu2.make.com/
- https://eu1.make.celonis.com/
- https://us1.make.com/
- https://us2.make.com/
- https://us1.make.celonis.com/

https://eu1.make.com/

```
https://eu1.make.com/
```

https://eu2.make.com/

```
https://eu2.make.com/
```

https://eu1.make.celonis.com/

```
https://eu1.make.celonis.com/
```

https://us1.make.com/

```
https://us1.make.com/
```

https://us2.make.com/

```
https://us2.make.com/
```

https://us1.make.celonis.com/

```
https://us1.make.celonis.com/
```

Make sure to use the correct base URL when running API calls otherwise your API requests will fail.

### hashtag API version

The version of the API. The Make API is currently the second version.

### hashtag API endpoint

Each endpoint represents a resource you can work with. Endpoints may contain required or optional parameters. The resources are described in detail in Make resources .

As a security best practice, make sure to use the correct case for your endpoints to work. You should review your scenarios to ensure that all API endpoints use the exact casing specified in the API documentation. Using incorrect casing, such as /v2/Organizations instead of /v2/organizations , or any other variation will cause the request to fail.

```
/v2/Organizations
```

```
/v2/organizations
```

Last updated 2 months ago

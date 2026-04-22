---
title: "Making your first API request | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/getting-started/making-your-first-api-request
scraped_at: 2026-04-21T12:41:01.063454Z
---

1. Getting started

# Making your first API request

This start guide will take you through making your first request to the Make API.

Example: Let's imagine that you would like to list all data stores available in your team. Your team ID is 35. Returned data should be ordered in descending order.

To make your first API call, you need to perform the following actions:

Create an authentication token . The token gives you access to Make API resources depending on your Make role and assigned scopes . You must include the token in the Authorization header of all requests. Add the word Token and a space before the token itself:

```
'Authorization: Token {Your authentication token}'
```

Choose the endpoint that corresponds to the resource you want to interact with. For this example, you need the /data-stores endpoint. The endpoint requires the teamId query parameter. Place the parameter after the question mark in the endpoint URL. To filter results, you also need the parameter for ordering data - pg[sortDir] :

```
/data-stores
```

```
teamId
```

```
pg[sortDir]
```

```
{zone_url}/api/v2/data-stores?teamId={teamId}&pg%5BsortDir%5D=asc
```

The zone_url refers to the Make zone you interact with. For example, https://eu1.make.com.

```
zone_url
```

```
https://eu1.make.com.
```

Prepare the full request and send it. In this case, use cURL to making the request. You want to retrieve data without modifying it - use the GET method. Let's put elements from the previous steps together.

```
GET
```

The following request example contains a sample authentication token. Don't use it in your requests. Generate your own token .

Request:

```
curl--location\--requestGET'https://eu1.make.com/api/v2/data-stores?teamId=35&pg%5BsortDir%5D=asc'\--header'Content-Type: application/json'\--header'Authorization: Token 93dc8837-2911-4711-a766-59c1167a974d'
```

Response:

```
{"dataStores":[{"id":15043,"name":"Old data store","records":10,"size":"620","maxSize":"1048576","teamId":35},{"id":13433,"name":"New data store","records":1,"size":"48","maxSize":"1048576","teamId":35}],"pg":{"sortBy":"name","limit":10000,"sortDir":"asc","offset":0}}
```

Always include a request body in POST , PUT , or PATCH requests.

```
POST
```

```
PUT
```

```
PATCH
```

Evaluate the response. The API returns 200 OK and a list of all data stores for the specified team. If your request failed, you receive an error code. Refer to Troubleshooting and error handling to troubleshoot the issue.

```
200 OK
```

Last updated 4 months ago

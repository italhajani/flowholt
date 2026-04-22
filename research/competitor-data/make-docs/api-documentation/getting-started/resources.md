---
title: "Resources | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/getting-started/resources
scraped_at: 2026-04-21T12:41:12.091144Z
---

1. Getting started

# Resources

API resources are grouped into sections corresponding with Make features and components.

Each endpoint resource contains the following details:

## hashtag Methods and endpoints

Methods define the allowed interaction and endpoints define how to access the resource — what URI should be used to interact with a resource.

Example: GET /data-stores

```
GET /data-stores
```

## hashtag Required scopes

Defines what resources you are allowed to interact with based on scopes you selected when creating your API access token .

Example: datastores:write

```
datastores:write
```

## hashtag Resource description

Describes the expected outcome when using an endpoint, and what Make features the resource relates to.

## hashtag Parameters

These are options you can include with a request to modify the response. Each parameter specifies whether it is required or not. Parameters are divided into two main groups:

- Path parameters — path parameters are always required. They are used to identify or specify the resource (usually by indicating its ID) and they should be placed inside the endpoint URI. Example: /data-stores/54
- Query parameters — query parameters are often optional. They can be used to specify the resource but they are usually used as parameters to sort or filter resources . They are placed at the end of the endpoint URI, after a question mark. Separate multiple parameters with an ampersand symbol. If a parameter contains square brackets, encode them. Example: /data-stores?teamId=123&pg%5Boffset%5D=10
- Request body — for some endpoints (mainly connected with the POST, PUT, or PATCH HTTP methods), you can also see the Request body section in the endpoint details. This section contains the description of the payload properties that are needed to modify the resource.

Path parameters — path parameters are always required. They are used to identify or specify the resource (usually by indicating its ID) and they should be placed inside the endpoint URI.

Example: /data-stores/54

```
/data-stores/54
```

Query parameters — query parameters are often optional. They can be used to specify the resource but they are usually used as parameters to sort or filter resources . They are placed at the end of the endpoint URI, after a question mark. Separate multiple parameters with an ampersand symbol. If a parameter contains square brackets, encode them.

Example: /data-stores?teamId=123&pg%5Boffset%5D=10

```
/data-stores?teamId=123&pg%5Boffset%5D=10
```

Request body — for some endpoints (mainly connected with the POST, PUT, or PATCH HTTP methods), you can also see the Request body section in the endpoint details. This section contains the description of the payload properties that are needed to modify the resource.

Example:

## hashtag Request examples

These are request samples that show how to make a request to the endpoint. They consist of the request URL and authentication token (if needed) and other elements required to make a request in the selected language.

Example of request for creating a data store:

## hashtag Response examples

These are response samples you would receive when calling the request in real life. The outcome strictly depends on the request sample. The response schema contains all possible elements available in the response. Each response has its status code . Example of created data store:

Last updated 4 months ago

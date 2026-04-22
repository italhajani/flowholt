---
title: "Modules | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/app-components/modules
scraped_at: 2026-04-21T12:41:49.587401Z
---

1. App components

# Modules

There are six basic types of modules:

​ Action​

Use if the API endpoint returns a single response. For example, Create a book , Delete a book , or Get a book .

​ Search​

Use if the API endpoint returns multiple items. For example, List books finds specific books according to search criteria.

​ Trigger (polling)​

Use to watch for any changes in your app or service. For example, Watch a new book is triggered whenever a new book has been added to the library.

​Instant trigger (webhook) ​

Use if the API endpoint has a webhook available (dedicated or shared). For example, Watch a new event .

​Universal​

Use to enable users to perform an arbitrary API call to the service. For example, Make an API call and Execute a GraphQL query .

​ Responder​

Use to send processed data back to a webhook.

Last updated 6 months ago

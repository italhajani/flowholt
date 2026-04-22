---
title: "Module actions | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/app-components/modules/action/types
scraped_at: 2026-04-21T12:46:25.858620Z
description: "You can define a module's actions to take advantage of features."
---

1. App components chevron-right
2. Modules chevron-right
3. Action

# Module actions

You can define a module's actions to take advantage of features.

## hashtag Create

Used for modules that are creating an object. Most of the time these modules use a POST request.

```
{"url":"/contacts","method":"POST","body":{"{{...}}":"{{omit(parameters, 'date')}}","date":"{{formatDate(parameters.date, 'YYYY-MM-DD')}}"},"response":{"output":"{{body}}"}}
```

```
{"url":"/contacts","method":"POST","body":"{{parameters}}","response":{"output":"{{body}}"}}
```

```
{"url":"/contacts""method":"POST","qs":{},"headers":{},"body":{"name":"{{parameters.name}}","email":"{{parameters.email}}","phone":"{{parameters.phone}}","address":"{{parameters.address}}"},"response":{"output":"{{body}}"}}
```

There are two types of responsiveness - synchronous and asynchronous. Read more about it in responsiveness approaches .

## hashtag Read

Used for modules that are retrieving an object. Most of the time these modules use a GET request.

```
{"url":"/contacts/{{parameters.contact_id}}","method":"GET","response":{"output":"{{body}}"}}
```

There is a difference between List/Search and Get modules although they use the same GET method.

List/Search modules return multiple bundles and should be a Search module type.

Get modules return only one bundle (specified by the entered ID) and should be Action modules.

### hashtag Search module

If you happen to receive this error: Invalid module output. Expected Object, but found Array. , it means that your module should be a Search type. A search module expects an array output type and, unlike the action type module, supports the pagination directive.

```
Invalid module output. Expected Object, but found Array.
```

If you don't want to iterate the array returned from the API, you can wrap it in an object.

## hashtag Update

Used for modules that are updating an object. Most of the time these modules use a PATCH or PUT request.

When a module is type Update , a new keyword appears inside Make - erase .

There are two types of update approaches - partial and full.

## hashtag Delete

Used for modules that are deleting an object. Most of the time these modules use a DELETE request.

Last updated 5 months ago

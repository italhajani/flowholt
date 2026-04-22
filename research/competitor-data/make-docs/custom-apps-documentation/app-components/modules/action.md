---
title: "Action | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/app-components/modules/action
scraped_at: 2026-04-21T12:44:39.772199Z
description: "The action module is a module that makes a request (or several) and returns a result. It does not have a state or any internal complex logic."
---

1. App components chevron-right
2. Modules

# Action

The action module is a module that makes a request (or several) and returns a result. It does not have a state or any internal complex logic.

Action modules are straightforward modules that make one or more requests and return a single bundle as result. Each execution is isolated, so they do not have a state like polling triggers and they can't be used to output multiple bundles like search modules .

You should use an action module when the API endpoint returns a single item in the response.

Some examples of common action modules include:

- Create an object
- Update a user
- Delete an email
- Get a record (by its ID)
- Download/Upload a file

Create an object

Update a user

Delete an email

Get a record (by its ID)

Download/Upload a file

Last updated 7 months ago

---
title: "HTTP status error codes | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/troubleshooting/http-status-codes
scraped_at: 2026-04-21T12:41:15.117479Z
---

1. Troubleshooting and error handling

# HTTP status error codes

This article describes the most frequent error codes returned by the Make API. If you need help resolving common issues related to the Make API, refer to the Troubleshooting section. If your request is incorrect, in the response, you can find the details of the error that should help you to troubleshoot. All Make API errors have the same schema. Below you can see the example of a response for the request with the incorrect parameter. This can happen, for example, when you request a resource you do not have access to:

Example:

```
{"detail":"Access denied.","message":"Permission denied","code":"SC403",}
```

## hashtag Standard HTTP error statuses

HTTP status

Explanation

400 Bad request

The server could not understand the request due to invalid syntax. This could happen, for example, due to the invalid data type and prohibited data duplication. Below you can find examples of more specific error messages related to some features:

Connections

- Invalid connection type
- Invalid scope
- Common data must be a collection

Invalid connection type

Invalid scope

Common data must be a collection

Data stores and data structures

- teamId validation failed

teamId validation failed

```
teamId
```

Devices

- Unknown identifier format
- Some of the incoming messages could not be deleted because they are being processed right now
- Some of the outgoing messages could not be deleted because they are being processed right now
- Some of the executions could not be deleted because they are being processed right now

Unknown identifier format

Some of the incoming messages could not be deleted because they are being processed right now

Some of the outgoing messages could not be deleted because they are being processed right now

Some of the executions could not be deleted because they are being processed right now

DLQs

- Some of the executions could not be deleted because they are being processed right now

Some of the executions could not be deleted because they are being processed right now

Hooks

- Missing value of required parameter

Missing value of required parameter

Keys

- Invalid input file
- File is too big
- File is not a valid primary key
- File is not a valid certificate

Invalid input file

File is too big

File is not a valid primary key

File is not a valid certificate

Notifications

- User has no organization in the zone

User has no organization in the zone

Scenarios

- teamId and organizationId cannot be used together
- Missing required parameter teamId or organizationId
- Invalid key, not parsable to integer

teamId and organizationId cannot be used together

```
teamId
```

```
organizationId
```

Missing required parameter teamId or organizationId

```
teamId
```

```
organizationId
```

Invalid key, not parsable to integer

Templates

- Validation failed for templateUrl unknown format

Validation failed for templateUrl unknown format

Apps

- Invalid response from the repository
- Failed to attach to the pap installation
- Failed to finish installation
- App uninstallation failed
- Invalid install specification
- Install file of the pap is not valid

Invalid response from the repository

Failed to attach to the pap installation

Failed to finish installation

App uninstallation failed

Invalid install specification

Install file of the pap is not valid

403 Forbidden

You do not have access rights to the content which means that your request was unauthorized.

404 Not Found

The server cannot find the requested resource (probably it does not exist) even if the endpoint is valid. Servers may also send this response instead of 403 to hide the existence of a resource from an unauthorized client.

This code may appear, for example, when you try to get details of the nonexistent/removed scenario, team, template, user, organization or app.
Make API endpoints are case sensitive, you may see this error if you have used incorrect case for your endpoints.

413 Payload Too Large

The request entity exceeded the limits set on the server. Below you can find examples of more specific error messages related to the Apps feature:

Apps

- Failed to save image. Invalid upload
- Failed to save image. Image is too big
- Commit message is too big

Failed to save image. Invalid upload

Failed to save image. Image is too big

Commit message is too big

424 Failed Dependency

The request failed due to failure of a previous request. Below you can find examples of more specific error messages related to the Connections and Apps features:

Connections

- Connection action crashed
- Connection action timed out

Connection action crashed

Connection action timed out

Apps

- Failed to load manifest for app
- Remote procedure crashed
- Remote procedure timed out

Failed to load manifest for app

Remote procedure crashed

Remote procedure timed out

429 Too many requests

You have exceeded the rate limit of API requests for your organization. Wait for one minute for the limit period to reset. Check the API rate limiting section for more information.

503 Service Unavailable

A dependency is currently unavailable. This error code may appear, for example, in relation to unavailable dependencies for DLQs, scenarios or teams.

304 Account Does Not Exist

This error appears when the account does not exist or it was not found.

## hashtag Custom Make error codes

HTTP status

Explanation

IM001 Access Denied

This error code indicates the lack of rights to perform specific actions. Below you can find examples of more specific error messages related to the Apps feature:

Users

- The user cannot change the password
- The user cannot change the email

The user cannot change the password

The user cannot change the email

Apps

- Cannot disapprove app

Cannot disapprove app

IM002 Insufficient Rights

This error appears when you do not have sufficient rights to interact with the resource.

IM003 Storage Not Enough Space

This error appears when limit of data stores storage is exceeded.

IM004 Confirmation Required

This error appears when the removal process of the key in the data stores is not confirmed.

IM005 Invalid Input Parameters

This error appears when you use invalid parameters in a request. Below you can find examples of more specific error messages related to some features:

Hooks

- Invalid hook type

Invalid hook type

Connections

- There is nothing to configure in this connection

There is nothing to configure in this connection

Users

- The user cannot be part of any organization

The user cannot be part of any organization

Custom functions

- Your custom function's code has a syntax error or uses a JavaScript feature that Make doesn't support. Check the custom functions limitations arrow-up-right in the Make Help center.
- The custom function's name in the custom function's code and in the name field don't match.
- The custom function's name is the same as a JavaScript reserved word. A custom function cannot have the same name as a JavaScript reserved word. Check the list of JavaScript reserved words. arrow-up-right

Your custom function's code has a syntax error or uses a JavaScript feature that Make doesn't support. Check the custom functions limitations arrow-up-right in the Make Help center.

The custom function's name in the custom function's code and in the name field don't match.

```
name
```

The custom function's name is the same as a JavaScript reserved word. A custom function cannot have the same name as a JavaScript reserved word. Check the list of JavaScript reserved words. arrow-up-right

IM011 Entity Limit Exceeded

This error appears when you exceed the limit for password change attempts.

IM016 Action is not possible due to dependencies

This error appears when you don't fulfill requirements to execute the API call. For example:

Scenario inputs

- If you have required scenario inputs you have to set the scenario scheduling to On demand .

If you have required scenario inputs you have to set the scenario scheduling to On demand .

IM102 Invalid Credentials

This error appears when you use the invalid password.

Last updated 2 months ago

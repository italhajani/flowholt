---
title: "Error handling | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/app-components/base/error-handling
scraped_at: 2026-04-21T12:44:01.328070Z
description: "Handling errors returned from HTTP API endpoints"
---

1. App components chevron-right
2. Base

# Error handling

Handling errors returned from HTTP API endpoints

Since any API endpoint can return an error during an execution of a scenario, Make provides methods to handle errors and keep scenarios reliable and functional.

All apps in Make should implement error handling to ensure that users understand the cause of any errors. Error handling should always be customized to the type of error and how the API returns the error.

Read more about error handling in the Help Center:

- Introduction to errors and warnings arrow-up-right
- Overview of error handling arrow-up-right
- Error handlers arrow-up-right

Introduction to errors and warnings arrow-up-right

Overview of error handling arrow-up-right

Error handlers arrow-up-right

When the service returns an HTTP error, it is not possible to evaluate it as a success.

## hashtag Error handling: 401 error

With error handling, details of the error are available and the user will know how to solve the problem.

## hashtag HTTP 4xx and 5xx error handling

When the response returns a 4xx or 5xx HTTP error code, this is automatically considered an error. If the error directive is not specified, the user will only see the status code that was returned. You should customize the message shown to the user with the error or error.message directive.

```
error
```

```
error
```

```
error.message
```

## hashtag HTTP 2xx and 3xx error handling

Some APIs signal an error with a 200 status code and a flag in the body. In this situation, use the valid directive to tell the user if the response is valid or not.

```
valid
```

## hashtag Custom error handling based on status codes

You can further customize what error message will be shown to the user based on the status code. To do this, add your status code to the error directive.

```
error
```

## hashtag Available error types

When handling an error, you can specify the type of the error.

UnknownError

```
UnknownError
```

RuntimeError (default)

```
RuntimeError
```

Primary error type. Execution is interrupted and rolled back.

InconsistencyError

```
InconsistencyError
```

DataError

```
DataError
```

Incoming data is invalid. If incomplete executions are enabled, execution is interrupted and the state is stored. The user is able to repair the data and resume execution.

RateLimitError

```
RateLimitError
```

Service responded with rate-limit related error. Applies delay to the next execution of a scenario.

OutOfSpaceError

```
OutOfSpaceError
```

The user is out of space.

ConnectionError

```
ConnectionError
```

Connection-related problem. Applies delay to the next execution of a scenario.

InvalidConfigurationError

```
InvalidConfigurationError
```

Configuration-related problem. Deactivates the scenario and notifies the user.

InvalidAccessTokenError

```
InvalidAccessTokenError
```

Access token-related problem. Deactivates the scenario and notifies the user.

UnexpectedError

```
UnexpectedError
```

MaxResultsExceededError

```
MaxResultsExceededError
```

IncompleteDataError

```
IncompleteDataError
```

Incoming data is incomplete.

DuplicateDataError

```
DuplicateDataError
```

Reports error as warning and does not interrupt execution. If incomplete executions are enabled, execution is interrupted and the state is stored. The user is able to repair the data and resume execution.

### hashtag Error handling with type

Last updated 5 months ago

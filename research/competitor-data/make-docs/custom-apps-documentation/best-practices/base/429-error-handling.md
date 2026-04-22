---
title: "429 error handling | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/best-practices/base/429-error-handling
scraped_at: 2026-04-21T12:44:21.221244Z
---

1. Best practices chevron-right
2. Base

# 429 error handling

An error with the status code 429 is an API rate limit error.

However, the default module error type for an error code between 400 - 500 is always a RuntimeError .

```
RuntimeError
```

There are advantages to handling a 429 error as a RateLimitError instead.

```
RateLimitError
```

## hashtag RuntimeError handling vs RateLimitError handling

In a scenario with scheduling turned on, if one of the scenario modules throws a RuntimeError , your scenario will break and retry to run according to the number of consecutive errors from your scenario settings (the default is 3 times).

```
RuntimeError
```

If the number of consecutive errors is consumed, the scenario scheduling will be switched off and you will need to manually switch your scenario scheduling on again.

To prevent this, use the module error type RateLimitError to handle the 429 error. This error type has the same functionality as ConnectionError and returns the warning message instead of the error sign.

```
RateLimitError
```

```
ConnectionError
```

The advantage of using RateLimitError is that, instead of using the number of consecutive errors and then switching the scheduling off, the retries continue with increasing time intervals arrow-up-right .

```
RateLimitError
```

For example:

- A scenario with scheduling turned on suddenly has one module throw a RateLimitError .
- It will retry after 1 minute.
- If it throws the RateLimitError again, it will retry after 2 minutes.
- Repeatedly the scenario increases the interval by 1, 2, 5, 10 minutes, and 1, 3, 12, and 24 hours.

A scenario with scheduling turned on suddenly has one module throw a RateLimitError .

```
RateLimitError
```

It will retry after 1 minute.

If it throws the RateLimitError again, it will retry after 2 minutes.

```
RateLimitError
```

Repeatedly the scenario increases the interval by 1, 2, 5, 10 minutes, and 1, 3, 12, and 24 hours.

```
{"response":{"error":{"429":{"type":"RateLimitError","message":"{{body.message}}"},"message":"{{body.message}}"}}}
```

Last updated 5 months ago

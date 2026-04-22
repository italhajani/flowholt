# Types of errors - Help Center

Source: https://help.make.com/types-of-errors
Lastmod: 2026-04-08T14:40:15.906Z
Description: Identify different error types in your scenarios and understand what causes them
Error handling

# Types of errors

8 min

A scenario﻿ is composed of multiple modules and item mappings working together. Each element has the potential to trigger an unexpected event, called an error.

## How errors are categorized

﻿Make﻿ classifies errors based on two primary factors, their origin and their underlyingcause.

**Example:** A ConnectionError typically occurs when a third-party service is down for maintenance. In this case, the origin is the external server, and the cause is the inability to establish a connection.

When a module returns an error, Make﻿ highlights it with a **caution** icon. To view the error type, click the caution icon displayed above the module.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/z8UxTCvWnMVKnHlJ6Ar-X_image.png?format=webp "Document image")

﻿

﻿Make﻿adheres to industry-standard error codes and definitions. However, it may be possible that the third party may not fully comply with these standards.

## Types of errors in Make﻿﻿

| AccountValidationError | |
| --- | --- |
| **Type of error** | AccountValidationError |
| **Description** | A module outputs the AccountValidationError when Make﻿ cannot authenticate you in the third-party app. For example, when you change your credentials in the app or your credentials expire and you don't update them in the connection, the app module will output the AccountValidationError.  The AccountValidationError also appears also with the [HTTP status codes 401 and 403](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes "HTTP status codes 401 and 403").  If a module outputs the AccountValidationError, the scenario﻿ ends with an error. When your scenario﻿ finishes with an error for the [number of consecutive errors](/overview-of-error-handling#number-of-consecutive-errors)﻿ in a row, Make﻿ disables the scheduling of your scenario﻿.  It is not possible to handle the AccountValidationError with an error handler, because the error happens during the intialization of the scenario. |
| **Solution** | To fix the AccountValidationError, review your credentials in the app and the connection in Make﻿. If necessary, create a new connection for the app. If you are getting the AccountValidationError frequently, contact our [Support](https://www.make.com/en/ticket "Support"). |

﻿

| BundleValidationError | |
| --- | --- |
| **Type of error** | BundleValidationError |
| **Description** | A module outputs the BundleValidationError when the bundle that enters the module doesn't pass validation. Validation means that before processing a bundle in a module, Make﻿ checks whether data types match in the module mappings and whether there are no missing values in the module required fields.  For example, you get the BundleValidationError when you map text to a module settings field that requires a date, or when you map an empty value to a required field in the module settings.  If a module outputs the BundleValidationError with no error handling, the scenario﻿ ends with an error. When your scenario﻿ finishes with an error for the [number of consecutive errors](/overview-of-error-handling#number-of-consecutive-errors)﻿ in a row, Make﻿ disables the scheduling of your scenario﻿. |
| **Solution** | The best way to handle this error is to review your mapping in the module settings.  For tips on how to handle missing data in a scenario﻿ check out the article about [how to fix missing data errors](/fix-missing-data-errors)﻿. |

| ConnectionError | |
| --- | --- |
| **Type of error** | ConnectionError |
| **Description** | A module outputs the ConnectionError when the third-party app is unavailable. For example, the third-party service might be offline because of maintenance. This error uses the [HTTP 502, 503 and 504 status codes](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes "HTTP 502, 503 and 504 status codes").  The default handling of the ConnectionError depends on the following attributes:  * Scheduled scenario﻿ with incomplete executions disabled: Make﻿ pauses the scheduling of the scenario for 20 minutes.Make﻿ doesn't rerun the scenario.  * Scheduled scenario﻿ with incomplete executions enabled: Make﻿ pauses the scheduling of the scenario for 20 minutes.Make﻿ retries the incomplete execution with the incomplete execution  [backoff](/exponential-backoff)﻿.  * Instant scenario﻿ with incomplete executions disabled: Make﻿ reruns the incomplete execution with the scenario﻿ [backoff](/exponential-backoff)﻿.  * Instant scenario﻿ with incomplete executions enabled: Make﻿ retries the incomplete execution with the incomplete execution [backoff](/exponential-backoff)﻿. |
| **Solution** | To fix the ConnectionError, see the [Fix connection errors](/fix-connection-errors)﻿ page. |

| DataError | |
| --- | --- |
| **Type of error** | DataError |
| **Description** | A module outputs the DataError when data sent by the module doesn't pass validation on the third-party side. For example, when you try to create a tweet with the **Twitter** > **Create a Tweet** module that has more than 280 characters, the **Create a Tweet** module outputs the DataError because tweets have a maximum length of 280 characters.  Another situation when you get the DataError is when you map an incorrect data type to a function. For example, when you map data with the text data type to the [parseDate](/date-and-time-functions#)﻿ function.  If a module outputs the DataError with no error handling, the scenario﻿ ends with an error. When your scenario﻿ finishes with an error for the [number of consecutive errors](/overview-of-error-handling#number-of-consecutive-errors)﻿ in a row, Make﻿ disables the scheduling of your scenario﻿.  To fix the DataError, review your mapping and identify the reason why the error happens. If you cannot fix the error with different mapping, you can use the [Resume](/resume-error-handler)﻿ and [Ignore](/ignore-error-handler)﻿ error handlers. |
| **Solution** | To fix the DataError, review your mapping and identify the reason why the error happens. If you cannot fix the error with different mapping, you can use the [Resume](/resume-error-handler)﻿ and [Ignore](/ignore-error-handler)﻿ error handlers. |

| DataSizeLimitExceededError | |
| --- | --- |
| **Type of error** | DataSizeLimitExceededError |
| **Description** | A module outputs the DataSizeLimitExceededError when you run out of data transfer quota. Your data transfer limit is calculated from the credits limit.  If a module outputs the DataSizeLimitExceededError with no error handling, the scenario﻿ ends with an error. Because the DataSizeLimitExceededError is a fatal error, Make﻿ immediately disables the scenario﻿ scheduling, regardless of the [number of consecutive errors](/overview-of-error-handling#number-of-consecutive-errors)﻿. |
| **Solution** | To fix the DataSizeLimitExceededError, consider buying [extra credits](/extra-credits)﻿ or upgrading your organization's subscription plan. |

| DuplicateDataError | |
| --- | --- |
| **Type of error** | DuplicateDataError |
| **Description** | A module outputs the DuplicateDataError when you send the same data to a module that doesn't allow duplicates. For example, when you try to create a new user in an app and the user's e-mail address has to be unique, but the e-mail address is used already. The module outputs the DuplicateDataError, because the e-mail address is registered with another user already.  If a module outputs the DuplicateDataError with no error handling, the scenario﻿ ends with an error. When your scenario﻿ finishes with an error for the [number of consecutive errors](/overview-of-error-handling#number-of-consecutive-errors)﻿ in a row, Make﻿ disables the scheduling of your scenario﻿. |
| **Solution** | If you get the DuplicateDataError in your scenario﻿, you should review your scenario﻿ design. For example, if you are using a database, you could first check if the database record exists with a search module. Or with the email example, you could just ignore the error with the [Ignore error handler](/ignore-error-handler)﻿. |

| IncompleteDataError | |
| --- | --- |
| **Type of error** | IncompleteDataError |
| **Description** | A module outputs the IncompleteDataError when the module can get only part of the data from the third-party app.  For example, when you are uploading new photos to Google Photos and you have a scenario﻿ that downloads the photos at the same time. Make﻿ tries to download the photo that you are currently uploading. The photo file won't be complete and the Google Photos module will output the IncompleteDataError.  If a module outputs the IncompleteDataError with no error handling, the scenario﻿ ends with an error. Make﻿ pauses the scenario for 20 minutes and then runs the scenario﻿ again until the scenario﻿ succeeds or reaches the [number of consecutive errors](/overview-of-error-handling#number-of-consecutive-errors)﻿. |
| **Solution** | If you want to handle the IncompleteDataError, you can use the [Break error handler](/break-error-handler)﻿. |

| InconsistencyError | |
| --- | --- |
| **Type of error** | InconsistencyError |
| **Description** | A module outputs the InconsistencyError when an error happens during the scenario﻿ rollback. This error can occur when you make changes to a data store with two scenarios﻿ that run at the same time. If one scenario﻿ encounters an error and attempts to undo the changes in the rollback phase, but the other scenario﻿ already finished making changes, the changes cannot be safely undone and you get the InconsistencyError from the data store module in the first scenario﻿.  For example, imagine two people making changes in the same part of a file. One of them saves changes before the other. What happens with the changes from the other person?  If a module outputs the InconsistencyError with no error handling, the scenario﻿ ends with an error. Because the InconsistencyError is a fatal error, Make﻿ immediately disables the scenario﻿ scheduling, regardless of the [number of consecutive errors](/overview-of-error-handling#number-of-consecutive-errors)﻿. |
| **Solution** | To fix the InconsistencyError, check your data and fix the data if necessary. If you are getting the InconsistencyError frequently, check the scenarios﻿ that use the database. |

| MaxFileSizeExceededError | |
| --- | --- |
| **Type of error** | MaxFileSizeExceededError |
| **Description** | A module outputs the MaxFileSizeExceededError when you try to process a file that exceeds the maximum file size. The maximum file size differs based on your organization's subscription. You can check the maximum file sizes in the Make﻿ [pricing](https://www.make.com/en/pricing "pricing").  For example, if you use the **Google Drive** > **Move a file** module in an organization with the Core plan to move a file larger than 100 MB, you would get the MaxFileSizeExceededError.  If a module outputs the MaxFileSizeExceededError with no error handling, the scenario﻿ ends with an error. When your scenario﻿ finishes with an error for the [number of consecutive errors](/overview-of-error-handling#number-of-consecutive-errors)﻿ in a row, Make﻿ disables the scheduling of your scenario﻿. |
| **Solution** | To fix the MaxFileSizeError, you have to either make the file smaller (compress or split the file) or upgrade your organization's subscription plan. |

| ModuleTimeoutError | |
| --- | --- |
| **Type of error** | ModuleTimeoutError |
| **Description** | This error occurs due to a module timeout when a request sent by a Make﻿ module does not receive a response within the expected timeframe. If the endpoint does not return any data, the module waits for a response for up to 40 seconds (most Make﻿ modules have a runtime limit of 40 or 60 seconds). When this limit is exceeded, Make returns a **ModuleTimeoutError - The Operation timed out** error.  This issue typically occurs when the external server delays its response because of temporary service issues or server overload. |
| **Solution** | To fix this issue and prevent the scenario from failing, configure a **Break error handler** and enable the storage of incomplete executions.  When configured, the Break directive automatically retries the same action up to three times, with delays of 5, 10, and 15 minutes. If the error persists after all retry attempts, the execution is stored under the **Incomplete Executions** tab, where it can be reviewed and resolved manually.  If incomplete execution storage is enabled without adding a Break error handler, failed runs are still stored under the **Incomplete Executions** tab. However, no automatic retry attempts will be made, and the executions must be resolved manually.  Detailed setup instructions are available in the resources linked below:  ﻿[Break error handler](/break-error-handler)﻿﻿  ﻿[Incomplete executions](/incomplete-executions)﻿﻿  ﻿  To increase the timeout for custom apps, see [https://developers.make.com/custom-apps-documentation/app-components/base#common-data](https://developers.make.com/custom-apps-documentation/app-components/base#common-data "https://developers.make.com/custom-apps-documentation/app-components/base#common-data"). |
| **Example** | **Airtable timeout error**  An error occurs when the Airtable server doesn't respond within Make's timeout window. It's typically caused by a temporary delay on Airtable's end rather than an issue with your scenario configuration. Make waits 40 seconds for a response (Airtable has an extended timeout of up to 80 seconds), but when the external server is slow to respond, the request times out.  **To fix this:**  1. Add a **Break error handler** to your Airtable module - This will automatically retry your operation 3 times - at 5, 10, and 15 minutes after the initial timeout.  2. Enable **Store incomplete executions** so if all retries fail, the execution is stored for manual resolution instead of being lost.  By doing so, temporary delays on Airtable's end won't cause your scenario to fail permanently, it will retry automatically and recover most of the time.  **If timeouts continue:** You can also review your **Look For Changes** settings to see if narrowing the search criteria or reducing the number of records processed helps.  Document image  ﻿ |

| OperationsLimitExceededError | |
| --- | --- |
| **Type of error** | OperationsLimitExceededError |
| **Description** | A module outputs the OperationsLimitExceededError when you run out of credits. Your credit limit is set with your organization's subscription. You can check your credit limit in [pricing](https://www.make.com/en/pricing "pricing").  If a module outputs the OperationsLimitExceededError, the scenario﻿ ends with an error. Because the OperationsLimitExceededError is a fatal error, Make﻿ immediately disables the scenario﻿ scheduling, regardless of the [number of consecutive errors](/overview-of-error-handling#number-of-consecutive-errors)﻿. |
| **Solution** | To fix the OperationsLimitExceededError, consider buying [extra credits](/extra-credits)﻿ or upgrading your organization's subscription plan. |

| RateLimitError | |
| --- | --- |
| **Type of error** | RateLimitError |
| **Description** | A module outputs the RateLimitError when you make too many requests over a time period to the app API. This error uses the [HTTP 429 status code](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes "HTTP 429 status code") and follows the [rate-limiting](https://en.wikipedia.org/wiki/Rate_limiting "rate-limiting") rules of the third party.  For example, the [Make app](G7Vz7fYsaoiCJDDxzCnCz#)﻿ modules output the RateLimitError when you reach the number of API calls per minute based on your [subscription](https://www.make.com/en/pricing "subscription").  The default handling of the RateLimitError depends on the following attributes:  * Scheduled scenario﻿ with incomplete executions disabled: Make﻿ pauses the scheduling of the scenario for 20 minutes.Make﻿ doesn't rerun the scenario.  * Scheduled scenario﻿ with incomplete executions enabled: Make﻿ pauses the scheduling of the scenario for 20 minutes.Make﻿ retries the incomplete execution with the incomplete execution [backoff](/exponential-backoff)﻿.  * Instant scenario﻿ with incomplete executions disabled: Make﻿ reruns the incomplete execution with the scenario﻿ [backoff](/exponential-backoff)﻿.  * Instant scenario﻿ with incomplete executions enabled: Make﻿ retries the incomplete execution with the incomplete execution [backoff](/exponential-backoff)﻿. |
| **Solution** | To fix the RateLimitError, see the [Fix rate limit errors](/fix-rate-limit-errors)﻿ page. |

| RuntimeError | |
| --- | --- |
| **Type of error** | RuntimeError |
| **Description** | A module outputs the RuntimeError when the error reported by the third-party app doesn't meet the criteria for any other error type. For example, you get the RuntimeError when you use up all your tokens with the **OpenAI** > **Create a Completion** module.  If a module outputs the RuntimeError with no error handling, the scenario﻿ ends with an error. When your scenario﻿ finishes with an error for the [number of consecutive errors](/overview-of-error-handling#number-of-consecutive-errors)﻿ in a row, Make﻿ disables the scheduling of your scenario﻿. |
| **Solution** | There's no general rule to fixing the RuntimeError. Check the error message in the scenario﻿ history or try to reproduce the error with the [Make DevTool](/make-devtool#)﻿.  The [Overview of error handling](/overview-of-error-handling)﻿ topic can help you create your error handling strategy. |

﻿

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

Rollback error handler](/rollback-error-handler "Rollback error handler")[NEXT

Types of warnings](/types-of-warnings "Types of warnings")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

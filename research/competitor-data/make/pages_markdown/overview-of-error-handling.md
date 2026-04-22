# Overview of error handling - Help Center

Source: https://help.make.com/overview-of-error-handling
Lastmod: 2026-04-08T14:40:12.977Z
Description: Learn how error handlers work and how to manage errors in your scenarios
Error handling

How to handle errors

# Overview of error handling

10 min

When you are creating scenarios﻿, you might encounter unexpected data or unexpected circumstances. Make﻿ notifies you about these events with an error to keep your scenarios﻿ reliable and functioning.

You can use error handlers to deal with errors or unexpected events in your scenario﻿. An error handler connects to a module with the error handling route. When the module outputs an error, the error handling route activates and runs the error handler.

If an error occurs that is handled by an error handler, Make﻿ keeps scheduling your scenario﻿ because Make﻿ can assume that you anticipated the situation and prepared for it.

There are 5 error handlers in Make﻿:

* ﻿[Ignore](/ignore-error-handler#)﻿﻿

* ﻿[Resume](/resume-error-handler#)﻿﻿

* ﻿[Commit](/commit-error-handler#)﻿﻿

* ﻿[Rollback](/rollback-error-handler#)﻿﻿

* ﻿[Break](/break-error-handler#)﻿﻿

## The error handling route

An error handler is always at the end of the error handling route. The error handling route has a transparent filling:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/nRg7X_HaHUZOf1ZojaJFD_uuid-15045767-f7d0-9659-d6a0-2af64c496d7e.png?format=webp "Document image")

﻿

When an error handler activates, it doesn't consume operations. Make﻿ doesn't bill you for handling unexpected events in your scenario﻿.

The error handling route doesn't have to have an error handler. For example, in the error handling route, there can be only a **Slack** > **Create a message** module to send you a Slack notification when an error happens.

If no module outputs an error in the error handling route, Make﻿ ignores the error. That means that the two error handling routes on the pictures work the same:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/PdeiAFpg-VrHRJnLgspH0_uuid-6e70dd27-c6ed-6e4f-6ba5-b434d9e35556.png?format=webp "Document image")

﻿

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/fjVVeYd8OlPAIzCgwFqp3_uuid-7b08eb3e-f8f0-ea0d-3259-3da78db52a55.png?format=webp "Document image")

﻿

If a module in the error handling route outputs an error, the scenario﻿ run ends with an error.

## How to identify errors

When you are building or checking your scenario﻿ in the Scenario Builder, Make﻿ highlights the module that caused the error with a warning sign in front of the module name and in the list of bundles.

When you click the bubble with the warning sign, you can check the bundle that caused the error in the module:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/kqowVJHGex5jBQNNqMT-8_uuid-7fccd401-9b2e-ac5d-1d6a-1a7659e076c7.png?format=webp "Document image")

﻿

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/tMSVwzz56xjY5p0cvpk4l_uuid-7dbe5032-3b94-0be6-a2b7-a9bc31bf533a.png?format=webp "Document image")

﻿

1. Shows the [error type](n4w0YAeoP7a-A4VfW-EBp#)﻿ and the error message.

2. The red fields are quick action buttons. You can click the buttons to connect the [Ignore error handler](/ignore-error-handler#)﻿ to the module.
   The first button connects the **Ignore** error handler with the module, to ignore all errors the module outputs.
   The second button inserts the Ignore error handler with a filter. The filter only allows errors that match the current error type to pass through. With the example on the pictures above, Make would ignore only the DataError.

3. The purple action button opens the Make﻿ Help Center in a pop-up window.

## How to approach error handling

You have multiple options on how to handle errors in Make﻿. Make handles some of the most frequent errors by default, and you'll typically need custom error handling only if you need to deal with a specific issue.

The most frequent errors in running scenarios are the RatelimitError and ConnectionError. You can rely on the default error handling for these errors if you enable [incomplete executions](/incomplete-executions)﻿. The details of the error handling of these errors are in their [dedicated articles](/fix-rate-limit-errors)﻿.

If you need to handle a different error type or if you need to customize the default error handling, you should consider:

* How important is the data the scenario﻿ processes?
  For important scenarios﻿, Make﻿ can store partial scenario﻿ runs in incomplete executions. You can resolve the incomplete scenario﻿ runs manually one by one or retry multiple of them at once.

* What type of error does the module output and how frequently?
  If the error occurs rarely and it's a temporary error, like the RateLimitError, you can rely on the default scenario﻿ error handling. But if the error is critical, like the InvalidAccessTokenError or the InconsistencyError, you should set up error handling.

* What is the impact of the error?

* If the error has no impact on your data or your processes, you could ignore the error with the [Ignore error handler](/ignore-error-handler#)﻿. If the error has a high impact on your processes, you should consider enabling incomplete executions in scenario﻿ settings.

For ideas about specific error handling strategies, you can check the [list of dedicated articles](/how-to-handle-errors#)﻿.

## Scenario settings that impact error handling

The scenario﻿ settings play a key role in error handling. The following list focuses on how some scenario﻿ settings influence error handling. For more info about Make settings, check the [dedicated article](/scenario-settings#)﻿.

### Store incomplete executions

Enable this option to store the incomplete scenario﻿ run when a module in the scenario﻿ outputs an error.

With incomplete executions enabled, Make﻿ stores the scenario﻿ state when the error happened as an incomplete execution. You can then check the scenario﻿ run, investigate why the error happened, and fix it to finish the scenario﻿ run successfully. In addition, all scenario﻿ errors turn into warnings.

* When you use the [Break error handler](/break-error-handler#)﻿ in your scenario﻿, you have to enable incomplete executions.

* ﻿Make﻿ doesn't store the incomplete scenario﻿ run in these conditions:

* When the error happens on the first module in the scenario.
  However, you can add the **Break** error handler to the first module in the scenario﻿. With the **Break** error handler, Make﻿ stores the incomplete execution even when the first module in the scenario﻿ outputs an error.

* When your incomplete executions storage is full. If your incomplete executions storage is full, Make﻿ checks the [enable data loss](/overview-of-error-handling#enable-data-loss)﻿ setting:

* If the data loss is disabled, Make﻿ disables the scenario﻿.

* If the data loss is enabled, Make﻿ keeps scheduling scenario﻿ runs and discards the incomplete execution if it cannot be stored in your account.

You can read more about incomplete executions in the [dedicated article](/incomplete-executions#)﻿.

### Sequential processing

Enable this option to postpone running the scenario﻿ until the previous run finishes and until all scenario﻿ incomplete executions are resolved. Sequential processing makes sure that:

* The scenario﻿ runs finish in the same order as they were triggered.

* There is only one scenario﻿ execution running at the same time.

Sequential processing has the highest impact on scenarios﻿ that start with an instant trigger (a webhook) or on scenarios﻿ that have incomplete executions enabled.

﻿Scenarios﻿ that start with an instant trigger run in parallel by default. For example:

If you have a scenario﻿ that starts with a webhook that runs for 5 minutes and you receive a webhook bundle at 12:00 and another one at 12:03, then from 12:03 to 12:05 there will be two instances of the scenario﻿ running at the same time in parallel.

In addition, if the scenario﻿ instance that started at 12:00 runs longer than usual, for example, until 12:12, the Make﻿ instance that started at 12:03 finishes sooner (at 12:08), even though it started later.

If you want to make sure that the scenario﻿ doesn’t start before the previous run finishes, enable the sequential processing.

See [webhooks](1yhUnJ8jvZyxiP9Cf3Ps1#)﻿ for more information.

The same applies to scenarios﻿ with the incomplete executions enabled. When there is an error and Make﻿ creates an incomplete execution, Make﻿ postpones the next scenario﻿ run until you resolve the incomplete execution or until it’s resolved automatically with the **Break** error handler.

You can read more in the [scenario settings](/scenario-settings#)﻿.

### Enable data loss

The enable data loss scenario﻿ setting influences the scenario﻿ incomplete executions storage. Enable this option to keep scheduling scenario﻿ runs regardless of not having enough space to store incomplete executions.

If you enable data loss, Make﻿ discards the data that doesn't fit into the size limits and continues running the scenario﻿ on schedule. Otherwise, Make﻿ disables the scenario﻿ scheduling instead.

﻿Make﻿ sets the size limits based on your organization plan. Check the Make﻿ [pricing](https://www.make.com/en/pricing "pricing") or read more about the [scenario settings](/scenario-settings#)﻿.

### Number of consecutive errors

This setting allows you to set how many times in a row the scenario﻿ can finish with an error and still keep being scheduled by Make﻿ for subsequent runs. When the scenario﻿ finishes with an error the specified number of times in a row, Make﻿ disables the scenario﻿.

To access the setting of the number of consecutive errors, switch the advanced settings toggle in scenario﻿ settings. The default number of consecutive errors is 3.

The number of consecutive errors doesn't apply:

* When the scenario﻿ is triggered with an [instant trigger](PDoPIBceCKCboMPpKplmY#gfYHC)﻿ (webhook). Make﻿ disables instantly triggered scenario﻿ immediately if an error happens.

* When an error happens with one of the following types:

* AccountValidationError

* OperationsLimitExceededError

* DataSizeLimitExceededError
  Make﻿ disables the scenario﻿ scheduling immediately after the error happens.

* When you get a warning. If a scenario﻿ finishes with a warning, Make﻿ will keep scheduling subsequent scenario﻿ runs.

### Auto-commit

Enable this option to commit changes right after they happen. For example, when a user triggers a scenario﻿ that updates their details.

If you disable this option, Make﻿ commits the changes after all modules finish successfully.

The setting affects only modules that support transactions. The modules supporting transactions are labeled with the "ACID" tag. They use a database app most of the time, like the Data Store or MySQL apps.

The modules that don't support transactions make changes immediately and don't provide the rollback functionality.

You can read more about the auto-commit option in the [scenario settings](/scenario-settings#)﻿ article.

### Commit trigger last

Enable this option to commit changes made by the first module in the scenario﻿ last. Otherwise, Make﻿ commits the changes in the same order as they happen.

The setting affects only modules that support transactions. The modules supporting transactions are labeled with the "ACID" tag. They use a database app most of the time, like the Data Store or MySQL apps.

The modules that don't support transactions make changes immediately and don't provide the rollback functionality.

You can read more about the commit trigger last option in the [scenario settings](/scenario-settings#)﻿ article.

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

How to handle errors](/how-to-handle-errors "How to handle errors")[NEXT

Fix rate limit errors](/fix-rate-limit-errors "Fix rate limit errors")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

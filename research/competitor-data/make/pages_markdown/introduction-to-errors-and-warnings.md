# Introduction to errors and warnings - Help Center

Source: https://help.make.com/introduction-to-errors-and-warnings
Lastmod: 2026-04-08T14:40:16.142Z
Description: Understand what errors and warnings mean in Make and learn how to handle them effectively
Error handling

# Introduction to errors and warnings

3 min

Sometimes, automation doesn't go the way you planned and takes a wrong turn. When this happens, Make﻿ gives you a warning or an error based on the situation. They protect your scenario﻿ by preventing the processing of unexpected data, and therefore saving operations usage.

## Errors in Make﻿

Errors notify you that your Make encountered an unexpected event that is not handled by an [error handler](/overview-of-error-handling#)﻿. Because of the situation, you should check the scenario﻿.

A module outputs an error when the module receives incorrect data from the previous modules or the module app. When you open your scenario﻿ in the scenario﻿ editor, Make﻿ highlights the module that outputs the error with the "Caution" sign:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/1pPnFk0bu4Q_UzmznURp7_uuid-e2f4e38d-9783-b3b1-3a34-141721f61af0.png?format=webp "Document image")

﻿

When a module outputs an error, Make﻿ stops the current scenario﻿ run and starts the rollback scenario phase. The rollback phase reverts changes if possible and puts back the [polling trigger epoch](PDoPIBceCKCboMPpKplmY#W-XCc)﻿ to the time before the scenario﻿ run.

When there are [consecutive](/overview-of-error-handling#number-of-consecutive-errors)﻿ scenario﻿ runs that end with an error, Make﻿ disables further scheduling of the scenario﻿. Disabling the scenario﻿ allows you to check the error and prevents consuming operations on scenario﻿ runs that finish with an error.

The most common situations when a module outputs an error include:

* Mapping a value to a required field in a module when the value is sometimes empty and causes missing required data.

* When you exhaust your resources in the third-party app. For example, when you can't store more data in the app.

* When the app is unavailable. For example, when the app is down for maintenance.

* When there is a change to your authentication or authorization in the app and you don't update your connection. For example, when your API key expires or when you change teams and lose access to some of the app features.

The best way to deal with errors in your scenario﻿ is to use an error handler. An error handler connects to a module with the error handling route. When the module outputs an error, the error handling route activates and runs the error handler.

When all errors are handled, Make﻿ keeps scheduling scenario﻿ runs instead of disabling the scenario﻿.

For more information, check the [Overview of error handling in Make](/overview-of-error-handling#)﻿ or pages about [error types](n4w0YAeoP7a-A4VfW-EBp#)﻿, [error handlers](/error-handlers#)﻿ or specific [error handling strategies](/how-to-handle-errors#)﻿.

## Error notifications

When an error happens and the error is not handled by any error handler, Make﻿ sends you an email notification:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/_okvzFUmEvcJx9XjfPbau_uuid-901553d1-77f3-4012-c86b-048959ef0519.png?format=webp "Document image")

﻿

﻿Make﻿ also sends out a notification when your scenario﻿ gets disabled because of repeated errors.

You can learn more about Make﻿ email notifications and their settings [here](/manage-your-email-preferences)﻿.

## Warnings in Make

Warnings alert you that there was an issue during the scenario﻿ run, but not as serious as an error. Also, scenarios﻿ can have the warning status when there were errors handled with your error handling.

When a module in a scenario﻿ returns a warning, your scenario﻿ keeps running and stays enabled. But it's a good idea to check the [scenario execution history](/scenario-history#)﻿ for the cause of the warning.

The situations when you get a warning include:

* When a module outputs an error, but you have enabled the [storing of incomplete executions](/scenario-settings#store-incomplete-executions)﻿ in the scenario﻿ settings.

* When you use up all of the capacity of a data store in your scenario﻿.

* When the duration of the scenario﻿ run exceeds the time limit for your subscription.

Learn more about warnings [here](/types-of-warnings#)﻿.

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

Error handling](/error-handling "Error handling")[NEXT

How to handle errors](/how-to-handle-errors "How to handle errors")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

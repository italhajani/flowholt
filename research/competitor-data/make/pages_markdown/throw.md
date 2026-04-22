# Throw - Help Center

Source: https://help.make.com/throw
Lastmod: 2026-01-13T23:55:26.527Z
Description: Explore workarounds to conditionally throw errors in your scenarios and control error handling behavior
Error handling

# Throw

4 min

﻿Make﻿ does not offer the **Throw** [error handling directive](/quick-error-handling-reference#)﻿. This feature implementation is being analyzed and evaluated.

This article describes alternatives and workarounds to mimic the **Throw** error handling directive.

## Alternate solution

To conditionally throw an error you may configure a module to make it optionally purposely fail during its operation. One possibility is to employ[JSON > Parse JSON](https://apps.make.com/json#)﻿ module configured to optionally throw an error (BundleValidationError in this case):

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/jjcZgfExUdyFAbvNIqz6L_uuid-a1cc3ee9-b4ce-f1cc-09e0-71ff675de398.png?format=webp "Document image")

﻿

You can then attach one of the [error handling directives](/quick-error-handling-reference#)﻿ to the error handling route to:

* force the scenario﻿ execution to stop and perform the rollback phase: Rollback

* force the scenario﻿ execution to stop and perform the commit phase: Commit

* stop the processing of a route: Ignore

* stop the processing of a route and storing it in the queue of [incomplete executions](/incomplete-executions#)﻿: Break

The following example shows the use of the Rollback directive:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/KGrFC3z6TY6hkhGN65i2M_uuid-626a1f51-0d48-6519-055b-350c022a8162.png?format=webp "Document image")

﻿

Workaround - Using HTTP Module

Usecase - Retry after some time if there is no record found using Break Directive. Usually, this is crucial when your record doesn't update instantly and you would like to process it later on in automation. Using this Break directive could be handy with the lesser complexity of the setup.

Current Barrier - Make﻿ does not offer a module that would enable you to easily conditionally generate (throw) errors.

To give you a better understanding here is the current setup without modification: This scenario﻿ search in Zendesk if there is no use it won’t throw an error forcefully to search it again you would need to implement a complex procedure by saving the record.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/hazxo1ayX8W4Kzm0MAMsS_uuid-e66e6b0e-77bf-ad6f-344d-6ccc5fbd8520.png?format=webp "Document image")

﻿

Solution - To conditionally throw an error you may replace the module where you want to throw an error, with an HTTP module then perform the search in a second scenario﻿ linking the HTTP module using webhook with a second scenario﻿. If no result found you can customize the module to throw an error

﻿Scenario﻿ One -

* Replace the Module where you want to throw an error with HTTP > Make a Request module

* Configure the URL within the query parameter that you will get from the Custom Webhook module and add an optional query parameter to search for the email

* Enable the advanced settings and check the evaluate all the states as errors.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/I8aId7P-yGCOqHNVBJ3vq_uuid-28a522c5-e56e-2152-3a68-641e265037b6.png?format=webp "Document image")

﻿

* Add a Break handler in that HTTP module and configure the setup to run later.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/Y9gz2ahzSeKqKfrUnUU0-_uuid-6d696de8-2ea0-29c1-69ce-49741b011f61.png?format=webp "Document image")

﻿

﻿Scenario﻿ 2 -

1. Setup Webhooks > Custom Webhooks as a trigger and copy the URL use it in the HTTP module as shown in the previous steps.

2. Here use the Zendesk > Search for a User module use the parameter from the HTTP module to perform a query. Enable Continue the execution of the route even if the module returns no results

3. Add a Router and create two routes

4. Consecutively setup the webhook response module

The following example returning the result - You will notice when the Zendesk module executes the API it doesn’t send any error message but in the action, we’re replicating the error using the HTTP module.

![Document image](https://archbee-image-uploads.s3.amazonaws.com/oAyFj2GHlBeBVWF5OAir2/6BGcZo4t40dN9N0SlF4cN_uuid-10343e53-6205-4ab2-dee4-5ed7e5f88dd3.gif "Document image")

﻿

﻿

Updated 14 Jan 2026

Did this page help you?

Yes

No

[PREVIOUS

Exponential backoff](/exponential-backoff "Exponential backoff")[NEXT

Your organization](/your-organization "Your organization")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

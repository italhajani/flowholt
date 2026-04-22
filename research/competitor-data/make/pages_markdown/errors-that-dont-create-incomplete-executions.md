# Errors that don't create incomplete executions - Help Center

Source: https://help.make.com/errors-that-dont-create-incomplete-executions
Lastmod: 2026-04-08T14:40:14.353Z
Description: Help Center
Explore more

...

Incomplete executions

# Errors that don't create incomplete executions

1 min

Most of the errors that can happen in Make﻿ are connected with the flow of data in your scenario (like the DataError) or with the third party application (like the ConnectionError).

However, some errors don't create an incomplete execution:

* When the error happens on the first module in the scenario﻿.
  However, you can add the **Break** error handler ot the first module in the scenario﻿. With the **Break** error handler, Make﻿ stores the incomplete execution even when the first module in the scenario﻿ outputs an error.

* When your incomplete executions storage is full. If your incomplete executions storage is full, Make﻿ checks the [enable data loss](/overview-of-error-handling#enable-data-loss)﻿ setting:

* If the data loss is disabled, Make﻿ disables the scenario.

* If the data loss is enabled, Make﻿ keeps scheduling scenario﻿ runs and discards the incomplete execution if it cannot be stored in your account.

* When the scenario﻿ runs longer than the scenario﻿ run duration limit. You can check the limit for your plan on the Make﻿ [pricing](https://www.make.com/en/pricing "pricing").

* When an error happens during the initialization or rollback [scenario phase](M3kmLkL8455cS-ZZ13YTb)﻿. Since these errors happen outside of the scenario﻿ operation phase, there is no incomplete scenario﻿ run.

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

Manage incomplete executions](/manage-incomplete-executions "Manage incomplete executions")[NEXT

Options related to incomplete executions](/options-related-to-incomplete-executions "Options related to incomplete executions")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

# Options related to incomplete executions - Help Center

Source: https://help.make.com/options-related-to-incomplete-executions
Lastmod: 2026-02-04T14:51:06.049Z
Description: Help Center
Explore more

...

Incomplete executions

# Options related to incomplete executions

0 min

The following options in Make﻿ scenario﻿ settings determine if and how the incomplete executions are stored:

* **Store incomplete executions**This option enables incomplete executions for the scenario﻿. If this option is disabled, Make﻿ doesn't store incomplete executions of the scenario﻿.

* **Sequential processing**Sequential processing ensures that the scenario﻿ runs in a sequence. If there is an incomplete execution of the scenario﻿, Make﻿ pauses further scheduling of the scenario﻿ to keep the processing in the chronological sequence. Make﻿ activates the scenario﻿ again after the scenario﻿ has no incomplete executions.
  If the scenario﻿ has instant scheduling, Make﻿ stores the arriving bundles in the webhook queue.

* **Enable data loss**
  Data loss setting controls what should happen when Make﻿ cannot create an incomplete execution of a failed scenario﻿ run. This happens in most cases because the incomplete execution storage is full. Incomplete execution storage is limited based on the usage allowance.
  If you keep data loss disabled, Make﻿ pauses scheduling of the scenario﻿ to avoid losing any more scenario﻿ runs, until you clear the incomplete execution storage and enable the scenario﻿ again.
  If you enable data loss, Make﻿ will continue scheduling the scenario﻿ even if it couldn't store the incomplete execution.

Updated 04 Feb 2026

Did this page help you?

Yes

No

[PREVIOUS

Errors that don't create incomplete executions](/errors-that-dont-create-incomplete-executions "Errors that don't create incomplete executions")[NEXT

Scenario execution, cycles, and phases](/scenario-execution-cycles-and-phases "Scenario execution, cycles, and phases")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

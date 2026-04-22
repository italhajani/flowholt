# Use scenario outputs - Help Center

Source: https://help.make.com/use-scenario-outputs
Lastmod: 2026-02-16T16:09:13.272Z
Description: Help Center
Explore more

...

Scenario inputs and outputs

# Use scenario outputs

1 min

Once you define your scenario﻿ outputs, you need to add the dedicated **Scenarios** > **Return output** module. Its module fields are based on scenario﻿ outputs setting.

Map the data you want to output from your scenario﻿ to the **Scenarios** > **Return output** module fields.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/MUgTKBmLYCVico_tKOlm3-20260121-142135.png?format=webp "Document image")

﻿

The **Scenarios** > **Return output** module always finishes the scenario﻿ run. It works similarly as the return statement in programming. You cannot add any subsequent modules after the **Scenarios** > **Return output** module in the current route.

Keep in mind that when using routers, the **Scenarios** > **Return output** module in a route finishes the scenario﻿. The modules in the subsequent routes won't run.

If you have multiple **Scenarios** > **Return output** modules in your scenario﻿, Make﻿ runs only the one that is reached first in the scenario﻿ flow. Subsequent **Return output** modules don't run.

﻿Scenario﻿ outputs are available to the entity that triggered the scenario﻿:

* If the scenario﻿ was triggered through the **Scenarios** > **Call a scenario** module, then scenario﻿ outputs are a part of the module output bundles.

* If the scenario﻿ was triggered through the Make API, then scenario﻿ outputs are in the request response.

Updated 16 Feb 2026

Did this page help you?

Yes

No

[PREVIOUS

Use scenario inputs](/use-scenario-inputs "Use scenario inputs")[NEXT

Edit the structure of a scenario input or output](/edit-the-structure-of-a-scenario-input-or-output "Edit the structure of a scenario input or output")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

# Best practices to use Make Grid - Help Center

Source: https://help.make.com/best-practices-to-use-make-grid
Lastmod: 2026-01-15T12:56:23.136Z
Description: Implement best practices in Make Grid to effectively organize, manage, and optimize your workflows for maximum efficiency
Make Grid

# Best practices to use Make Grid

2 min

Based on Make﻿ Grid's purpose of seeing dependencies, data flow, and overall structure, here are some best practices for using Make﻿ Grid to manage your automations effectively:

### Use folders

You can create folders in Make﻿ Grid to keep the landscape organized. Each folder in Make﻿ Grid represents a specific island.

### Naming convention

Use meaningful action-based naming conventions to stay organized. When working on complex projects, especially within a team, your naming conventions are critical for readability and maintenance. While naming a scenario﻿, consider a scenario﻿'s purpose, data flow, and potential impact. For example - use *Sync new gmail contacts to contacts list*, instead of *Google sheet - sync contacts*. Name individual modules to clearly describe the specific action they perform in the workflow; for example, *find users - {email address}* instead of *Google Sheets - Get values.*

### Plan **dependency migrations**

Use Make﻿ Grid as a pre-migration checklist to identify and isolate dependencies toprevent workflow breaks.

Before replacing any dependency, use the **Attributes** view to document data fields being consumed by downstream dependencies. This ensures that when you make changes to a dependency, you map each piece of data correctly, ensuring data integrity.

When replacing a core dependency such as a database, use the **Links** view. This view clearly shows if other, seemingly unrelated scenarios﻿ or folders rely on that dependency. This prevents unexpected outages across your entire workspace.

### Optimize performance and reduce cost

﻿Make﻿ Grid is a powerful tool for **identifying inefficiencies** that consume operations and slow down execution.

When troubleshooting scenarios﻿, use different layers to identify consumption. If the module is pulling large arrays or bundles, you have a bottleneck. The best practice is to always apply filters as early as possible in the scenario﻿ chain to reduce the size of the data being processed, saving both time and operations.

﻿

﻿

﻿

﻿

﻿

﻿

﻿

﻿

Updated 15 Jan 2026

Did this page help you?

Yes

No

[PREVIOUS

Tutorial: How to replace a dependency](/tutorial-how-to-replace-a-dependency "Tutorial: How to replace a dependency")[NEXT

Error handling](/error-handling "Error handling")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

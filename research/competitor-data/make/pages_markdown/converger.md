# Converger - Help Center

Source: https://help.make.com/converger
Lastmod: 2026-01-16T09:07:45.439Z
Description: Learn workarounds to converge multiple scenario routes into a single flow and avoid module duplication
Explore more

Tools

# Converger

5 min

This article describes alternatives and workarounds to a converger module, often requested by our customers.

Please note that there is no converger module available in Make﻿. At the moment, it is just a concept that provides a counterpart to the Router module, allowing you to reduce duplication of modules in different routes.

## Solution

To implement the converger concept, use one of the following workarounds to avoid the duplication of the common sequence.

### Data store

1

Add an extra filter-free route to the router to connect the common sequence (the one you would put after a converger module).

2

Add **Data store** **> Add/replace a record** modules at the end of each router's route (except the new extra route) to store the data output by the modules on the route that should be passed to the common sequence. The data store would contain just one record, the record's key can be, for example, MyKey.

3

Add a **Data store > Get a record** module at the beginning of the common sequence to obtain the previously stored data.

![Using a Data store](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-QhNLft6NIn_iGgjzBYTJA-20250228-092717.png?format=webp "Using a Data store")

﻿

### JSON

If you wish to avoid the use of the data store you can:

1

Use a **JSON > Create JSON** module followed by **Tools > Set variable** to store the resulting JSON in a variable (e.g. MyBundle).

2

Use **Tools > Get variable** to obtain the previously stored variable followed by **JSON > Parse JSON**.

![Using JSON](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-4K3rUp7aVLyql-BZmfZDO-20250228-093934.png?format=webp "Using JSON")

﻿

Please note that if no route is executed, the **JSON > Parse JSON** will throw the following error:

![Error is no route is executed](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-1kWXlfmPE42SbipbzmP---20250228-093137.png?format=webp "Error is no route is executed")

﻿

To avoid this, you may employ the ifemtpy() function as show below:

![ifempty function](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/jLsqzz8eXvwj0XuH74dPA_uuid-ee263ab9-2637-7891-8f3e-d68f036c39f5.png?format=webp "ifempty function")

﻿

### Set a variable

If there is a single value that you need to pass to the common sequence (e.g. ID), you can use the **Tools > Set variable** and **Get variable** modules.

﻿Make﻿ also allows you to use the **Set multiple variables** module.

### Use a separate new scenario

You may also place the common sequence to a separate new scenario﻿ and then:

1. Use the **HTTP > Make a request** module at the end of each route to pass the data to the new scenario﻿.

2. Use the **Webhooks > Custom webhook** module at the beginning of the new scenario﻿ to receive the data.

Updated 16 Jan 2026

Did this page help you?

Yes

No

[PREVIOUS

Flow control](/flow-control "Flow control")[NEXT

Tools](/util "Tools")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

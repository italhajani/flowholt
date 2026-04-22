# Aggregator - Help Center

Source: https://help.make.com/aggregator
Lastmod: 2026-04-08T14:40:15.117Z
Description: Use aggregators to merge multiple data bundles into one and group the results
Key concepts

Tools

# Aggregator

3 min

An **aggregator** is a [type of module](PDoPIBceCKCboMPpKplmY#)﻿ designed to merge several bundles of data into a single bundle.

When you run an aggregator, it:

1. accumulates all the bundles it receives (during a single source module's operation)

2. outputs a single bundle with an array containing one item per each accumulated bundle. The content of the array's items depends on particular aggregator module and its setup.

A typical example of an aggregator module is the [Array aggregator](/flow-control#array-aggregator)﻿ module. Aggregators usually feature the following fields:

| **Source Module** | The module from which the bundle aggregation will start. The source module is usually an [iterator](/flow-control#iterator)﻿ or a search module that outputs a series of bundles. Once you setup the aggregator's Source Module (and close the aggregator's setup), the route between the source module and the aggregator will be wrapped in a grey area to visualize the start and the end of the aggregation. |
| --- | --- |
| **Group by** | The aggregator's output can be split into several groups with the help of the *Group by* field. The *Group by* field can contain a formula that is evaluated for each aggregator's input bundle. The aggregator then outputs one bundle per each distinct formula's value. Each bundle contains two items:  * Key contains the distinct value.  * Array contains the aggregated data from the bundles for which the formula evaluated to the Key value. |
| **Stop processing after an empty aggregation** | By default, the aggregator outputs the result of the aggregation even in case no bundles reached the aggregator (e.g. because they have been all filtered out on their way). If the *Stop processing after an empty aggregation* option is enabled, the aggregator will not produce any output bundle in this case and the flow will stop. |

﻿

Bundles outputted from the source module and any other modules between the source module and the aggregator module are not outputted by the aggregator and thus items in these bundles are not accessible by the modules in the flow after the aggregator.

If you need to access items from bundles outputted from the source module and any other modules between the source module and the aggregator module, make sure to include them in the aggregator's setup, e.g. in the *Aggregated fields* field in the setup of the **Array aggregator** module.

## Example

### Use case: Zipping all email attachments and uploading the ZIP file to Dropbox

The scenario﻿ below shows how to:

1. Watch a mailbox for incoming emails: [Email > Watch emails](https://apps.make.com/email#bgxvr)﻿ trigger will output a bundle with item Attachments[] , which is an array containing all the email's attachments.

2. Iterate the email's attachments: [Email > Iterate attachments](https://apps.make.com/email#32ZXP)﻿ iterator takes the items from the Attachments[] array one by one and sends them further as separate bundles.

3. Aggregate the bundles outputted by the [Email > Iterate attachments](https://apps.make.com/email#32ZXP)﻿ module: [Archive > Create an archive](https://apps.make.com/archive#create-an-archive)﻿ aggregator accumulates all the bundles it receives and outputs a single bundle containing the ZIP file

4. Upload the resulting ZIP file to Dropbox: Dropbox > Upload a fileobtains the ZIP file from the [Archive > Create an archive](https://apps.make.com/archive#create-an-archive)﻿ module and uploads it to Dropbox.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/IS13UQrHtf7UZZqNPvsrG_uuid-8d3f464a-4279-1031-c635-9d9d638aed2f.png?format=webp "Document image")

﻿

Below is a sample setup of the **Archive > Create an archive** aggregator:

![Document image](https://images.archbee.com/4CkrlJIBl1di_p1x71ery-wnWEGa01PipW0Sh_qAOGB-20250213-140036.png?format=webp "Document image")

﻿

﻿

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

Tools](/tools "Tools")[NEXT

Iterator](/iterator "Iterator")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

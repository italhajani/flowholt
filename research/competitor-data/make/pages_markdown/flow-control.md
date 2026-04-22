# Flow control - Help Center

Source: https://help.make.com/flow-control
Lastmod: 2026-01-15T17:57:09.514Z
Description: Use repeaters, iterators, and array aggregators to control how your scenario processes multiple items and bundles
Explore more

Tools

# Flow control

15 min

## Repeater

A repeater is used in cases where you wish to repeat a task a set number of times. For example, if you would like to send five emails with subjects "Hello 1", "Hello 2", ... "Hello 5", this could be accomplished with connecting the **Email > Send an email** module after the **Repeater** module:

![Repeater](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/_hVv1pal-IC_fUjTNFEyR_uuid-a5521f9f-9bf9-bd43-1077-4456fa80dc47.png?format=webp "Repeater")

﻿

Module configuration details:

![Repeater configuration](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/PE7UYT9IWdwh1HTRGEw5S_uuid-8d9486a1-434b-9f5e-0fcd-8ff3954322fe.png?format=webp "Repeater configuration")

﻿

﻿

![Email module con](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/-xR0qbI0kyX0ZgTve7ZE5_uuid-8421211e-939e-9f84-ea39-427733f2ce16.png?format=webp "Email module con")

Flow\_Control\_3.png

﻿

﻿

You can imagine the **Repeater** module as a generator of bundles outputting one bundle after another. Each bundle contains one item named i of type Number. The initial value of the i item is specified in the **Initial value** field. The number of repetitions (= number of bundles) is specified in the **Repeats** field. The value of the i item is increased in each repetition by the value specified in the **Step** field, which is 1 by default (toggle the **Show advanced settings** box to reveal it).

## Iterator

An iterator is a special type of module that converts an array into a series of bundles. Each array item will output as a separate bundle.

### Setting up an iterator

Setting up an iterator is done in the same way as [setting any other module](/module-settings#)﻿. The **Array** field contains the array to be converted/split into separate bundles.

In this example, the scenario﻿ below shows how to retrieve emails with attachments and save the attachments as single files in a selected Google Drive folder.

![Save email attachments to Google Drive](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/6me7VXLBgnu4YVJzrjewX_uuid-afd56dcf-8ee1-119f-c8cf-9d1b8b93778a.png?format=webp "Save email attachments to Google Drive")

﻿

Emails can contain an array of attachments. The **Iterator** module inserted after the first module enables you to handle each attachment separately. The iterator splits the array of attachments into single bundles, each bundle with one attachment will then save one at a time in a selected Google Drive folder. The **Array** field should contain the Attachments[] array.

![Setting up an iterator](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/Z5TzLrnePyBiz8uz4CGc8_uuid-76ebf1a2-e19f-d998-5faa-366411cbe503.png?format=webp "Setting up an iterator")

﻿

### Specialized iterators

For your convenience, many Make﻿ apps offer specialized iterator modules with a simplified setup. For example, the Email app contains the special iterator **Iterate attachments** that will produce the same results as the general **Iterator** module without having to specify the array, just the source module.

![Specialized iterators](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/QhBwYdJiHid8iJz0thwvN_uuid-bd6d2f54-cd86-0526-3eaf-a1ff554dba42.png?format=webp "Specialized iterators")

﻿

### When to use an iterator in your scenario

The video below is module one of the three-part lesson titled **Iterator and Array Aggregator**. It explains the purpose of the iterator and the array aggregator and with the help of a sample scenario﻿, when to use an iterator, and what to do with the output.

﻿

### Mappable items under the Iterator module

When an iterator does not have information about the structure of the array's items, the mapping panel in the modules following the iterator will display only two items under the iterator: Total number of bundles and Bundle order position:

![Mappable items](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-fpqfCEuH5JFCsmle51Cmg-20250227-143211.png?format=webp "Mappable items")

﻿

The reason for this is that in Make﻿, each module is responsible for providing information about items it outputs so these items can be properly displayed in the mapping panel in the following modules. However, there are several modules that might be unable to provide this information in some cases, e.g. **JSON** **> Parse JSON** or **Webhooks >** **Custom Webhook** modules with missing [data structures](/data-structures#)﻿.

The solution is to manually execute the scenario﻿ to make the module learn about the items it outputs so it can provide the information to the following modules.

For example, if you have a **JSON > Parse JSON** module without a data structure and then you connect an **Iterator** module to it, you will not be able to map the output of the module to the **Array** field in the setup panel of the iterator.

![JSON without a data structure](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-U_3drUmjM4b52-7VDe82U-20250227-143733.png?format=webp "JSON without a data structure")

﻿

![Iterator module](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/lDcwWarEB3Bv0vz0TByn2_uuid-cdb106ba-05ba-4b5a-e0a2-b4999f852db6.png?format=webp "Iterator module")

﻿

﻿

To resolve this, manually start the scenario﻿ in the scenario﻿ editor. You can un-link the modules after the **JSON > Parse JSON** module to prevent the flow from proceeding further or right-click the **JSON > Parse JSON** module and choose **Run this module only** from the context menu to execute only the **JSON > Parse JSON** module.

Once the **JSON > Parse JSON** has been executed, it learns about the items it outputs and provides this information to all the following modules including the iterator. The mapping panel in the iterator's setup will then display the items:

![Json module with mappable items](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-I-Z-tLSekL4bnFkQ9gd9--20250227-144242.png?format=webp "Json module with mappable items")

﻿

The mapping panel in the modules connected after the iterator will display the items contained in the array's items:

![Mapping module in the iterator](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-OnOzCQPzw4sz8MytGLvgY-20250227-144601.png?format=webp "Mapping module in the iterator")

﻿

If you cannot see some items in a module's mapping panel, simply run the scenario﻿ once so all the modules can learn about the items they output and provide this information to the following modules.

## Array aggregator

An array aggregator is an aggregator module that allows you to merge several bundles into one single bundle. The following image shows a typical setup of the **Array aggregator** module.

![Array aggregator module](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/MMf0_51nYh0Hzef7F0Mz9_uuid-d192c60c-6758-6c44-26f1-e43ddc0e6de1.png?format=webp "Array aggregator module")

﻿

| **Field** | **Description** |
| --- | --- |
| Source Module | The module from which the bundle aggregation will start. The source module is usually an iterator or a search module that outputs a series of bundles. Once you setup the aggregator's Source Module (and close the aggregator's setup), the route between the source module and the aggregator will be wrapped in a grey area to visualize the start and the end of the aggregation. |
| Target structure type | The target structure into which the data shall be aggregated. The default option is Custom that enables you to choose items that should be aggregated into the Array aggregator's output bundle's Array item:  Target structure type  ﻿  Once you connect more modules after the **Array aggregator** module and get back to the module's setup, the **Target structure type** dropdown will contain all the following modules and their fields that are of type Array of Collections, like e.g. **Attachments** field of the **Slack > Create a Message** module:  Target structure type  ﻿ |
| Group by | The aggregator's output can be split into several groups with the help of the **Group by** field. The **Group by** field can contain a formula that is evaluated for each aggregator's input bundle. The aggregator then outputs one bundle per each distinct formula's value. Each bundle contains two items:  * Key contains the distinct value.  * Array contains the aggregated data from the bundles for which the formula evaluated to the Key value. |
| Stop processing after an empty aggregation | By default, the aggregator outputs the result of the aggregation even in case no bundles reached the aggregator (e.g. because they have been all filtered out on their way). If the **Stop processing after an empty aggregation** option is enabled, the aggregator will not produce any output bundle in this case and the flow will stop. |

Bundles output from the source module and any other modules between the source module and the aggregator module are not output by the aggregator and thus items in these bundles are not accessible by the modules in the flow after the aggregator.

If you need to access items from bundles output from the source module and any other modules between the source module and the aggregator module, make sure to include them in the **Aggregated fields** field in the setup of the **Array aggregator** module.

If items are nested (i.e. contained in a collection item) they currently cannot be easily selected in the array aggregator's **Aggregated fields** field. For example, if bundles contain collection item User with two items Name and Email:

![Bundle outputs](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-6s6dJ2HFcFHIYfgZ3X2D_-20250228-085421.png?format=webp "Bundle outputs")

﻿

Then only the User collection item can be selected:

![Array aggregator  field](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-uhDY_TJyJKghm2sQCqNkm-20250227-152522.png?format=webp "Array aggregator  field")

﻿

This setup will produce the following output:

![Bundle 1 output](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/EqFvxDz8xf4612Oo61fYD_uuid-0c7130f4-4f7e-df55-f3f7-13a962be5437.png?format=webp "Bundle 1 output")

﻿

### Customize the output

If you wish to fully customize the **Array aggregator**'s output structure:

1

Insert the **JSON > Create JSON** module after the **Array aggregator** module:

![JSON module after Array aggregator](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-n93_P8U0JpDgFINB94lhX-20250227-153525.png?format=webp "JSON module after Array aggregator")

﻿

2

Open the **JSON > Create JSON** module's setup.

3

Setup a Data structure for the items you want to be output from the array aggregator. The data structure should be an array of collections and the collections should contain the items you want to include in the output. Here is a sample data structure with two text items Name and Email:

![Document image](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-goXGiys4ARVrA1Kyj6XCO-20250227-154714.png?format=webp "Document image")

﻿

4

Open the **Array aggregator** module's setup.

5

In the **Target structure type** field, choose the **JSON > Create JSON** module's array field:

![Target structure type](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-40sqocnYuKfC547Xav2tq-20250228-085823.png?format=webp "Target structure type")

﻿

6

Fields corresponding to the Data structure created in step 3 will appear in the setup of the **Array aggregator** module. Map any items into the fields. You can now easily map nested items using the mapping panel and even use formulas:

![Map items into the fields](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-9iMIGpbwFR0w4YYfpAQXx-20250228-090138.png?format=webp "Map items into the fields")

﻿

7

The **Array aggregator** module's output will now look like this:

![Array aggregator output](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-laTS0oPZmY9Wyuca-LEmb-20250228-090327.png?format=webp "Array aggregator output")

﻿

If you wish to save the operation performed by the  **JSON > Create JSON** module, put it on a disabled route after a **Router**:

![Save JSON module on a disabled router](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/EG0ryD7UiTE0PDn7AuK9h_uuid-cd379018-b353-81ea-ade9-c24e70ac4034.png?format=webp "Save JSON module on a disabled router")

﻿

If you wish to conditionally omit an item from the module's output, use a formula that evaluates to ignore keyword:

![Ignore keywords](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/jcyA4VGX3U0ukw90OOHku_uuid-f81f07bb-6945-00c0-c0e0-b1a5e2bd5fe1.png?format=webp "Ignore keywords")

﻿

If the 4. User: Email is empty then the Email item will be completely omitted from the output:

### When to use an array aggregator in your scenarios

﻿

### ﻿

﻿

Updated 15 Jan 2026

Did this page help you?

Yes

No

[PREVIOUS

If-else and Merge](/if-else-and-merge "If-else and Merge")[NEXT

Converger](/converger "Converger")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

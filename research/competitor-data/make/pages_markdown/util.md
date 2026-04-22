# Tools - Help Center

Source: https://help.make.com/util
Lastmod: 2026-04-08T14:40:13.646Z
Description: Explore built-in tools to create variables, delay flows, aggregate data, and transform values in your scenarios
Explore more

Tools

# Tools

18 min

Our Tools section includes several useful modules that can enhance your scenario﻿.

![Tools menu](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-RRa8R1-PmEpVKiKReUFkx-20250228-094959.png?format=webp "Tools menu")

﻿

## Triggers

### Basic trigger

Allows you to create a custom trigger and define its input bundles.

![Basic trigger](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-Ql8UqBYNV3ajAfR93LRWV-20250228-095224.png?format=webp "Basic trigger")

﻿

Create custom bundles by adding array items. The array consists of the *name-value* pairs.

For example, you can use this tool for contacts or any other list that is scheduled to be sent to a specified email address (**Email > Send an Email***,* **Gmail > Send an Email** modules), or as a simple reminder to be triggered whenever it is necessary.

## Actions

### Get multiple variables

Retrieves values that were previously created by the [Set multiple variables](/util#set-multiple-variables)﻿ module within a single operation.

![Get multiple variables](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-adGkAExMR7G7nJa2HjoVF-20250228-103711.png?format=webp "Get multiple variables")

﻿

The main benefits of the **Set multiple variables**module are:

* one **Get multiple variables** module can replace a whole series of [Get variable](/util#get-variable)﻿ modules.

* one **Get multiple variables** module consumes just a single operation.

### Get variable

Retrieves a value that was previously created by the [Set variable](/util#set-variable)﻿ module.

![Get variable](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-EW6vXM1BMeLHhL7fxkueR-20250228-104220.png?format=webp "Get variable")

﻿

Note that this module can read a variable that was set anywhere in thescenario﻿. The only requirement is that the **Tools > Set Variable** module is executed before (in time) the **Tools > Get Variable** module. See the documentation for the [Router](/router#)﻿ module for information about the order in which routes are processed.

![Get variable example](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-tXAO-zILb5h83FFHK5wIe-20250228-104530.png?format=webp "Get variable example")

﻿

### Increment function

See our template [Controlled distribution of data flow](https://www.make.com/en/templates/2952-controlled-distribution-of-data-flow "Controlled distribution of data flow") for an example of the increment function tool.

Returns a value incremented by 1 after each module's operation. It is possible to configure the module to reset the value.

![Increment function](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-drXpWDwhzmQQQqmiHJGEK-20250228-102236.png?format=webp "Increment function")

﻿

One of this tool's uses is to implement a round robin assignment of tasks to users in a group. The algorithm chooses the assignees from a group in some rational order, usually going from the top to the bottom of a list and then repeating until finished (like you would deal a deck of cards).

The following scenario﻿ sends an email to the first recipient after every odd scenario﻿ run, and to the second recipient after every even scenario﻿ run.

![Increment function scenario](https://archbee-image-uploads.s3.amazonaws.com/oAyFj2GHlBeBVWF5OAir2/hQVW_jj0gNGYx8gOwA2na_uuid-f34d2312-c28a-2d3c-ea1b-d7667dff1164.gif "Increment function scenario")

﻿

1

Configure the module to never reset the value:

![Increment function](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/C2MkrykLq6eO8kjT8AdK6_uuid-805d861a-325c-2420-1bf6-3582ec935f56.png?format=webp "Increment function")

﻿

﻿

2

Add a router.

3

Set the first condition after the router:

Odd - use the mod math function set equal to 1.

![61d5a3ca16a69.gif](https://archbee-image-uploads.s3.amazonaws.com/oAyFj2GHlBeBVWF5OAir2/6L62httE_s0nc2Biv1YY-_uuid-29acf40f-51a0-cbfa-54b3-e7d9f8cb60c3.gif "61d5a3ca16a69.gif")

61d5a3ca16a69.gif

﻿

Do not forget to change the **Equal to** operator from the default *Text operator* to the **Numeric operator.**

![Set numeric operator - odd](https://archbee-image-uploads.s3.amazonaws.com/oAyFj2GHlBeBVWF5OAir2/pntkj5BZIdVRrAM3gIjZ7_uuid-ee8593f9-e79e-e225-bcf5-c46852f1d5be.gif "Set numeric operator - odd")

﻿

4

Set the second condition after the router.

Even – use the mod math function that equals 0:

![Set numeric operator - even](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-owXCndbffHO95r7_5jSWQ-20250228-103241.png?format=webp "Set numeric operator - even")

﻿

### Set multiple variables

Creates multiple variables that can be mapped by other modules in the route or by the [Get Multiple Variables](/util#get-multiple-variables)﻿ module for every route in the scenario﻿ **within a single operation**.

![Set multiple variables](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-_6I-PIjrkqh8_LE8RzGz5-20250228-101344.png?format=webp "Set multiple variables")

﻿

The main benefits of the **Set multiple variables**module are:

* one **Set multiple variables** module can replace a whole series of [Set variable](/util#set-variable)﻿ modules

* one **Set multiple variables** module consumes just a single operation

| ﻿ | ﻿ |
| --- | --- |
| **Variables** | Add multiple variables you want to set.  * Variable name: Enter the variable name. This name will be displayed when mapping the variable in other modules.  * Variable value: Enter the value of the variable. |
| **Variable lifetime** | One cycle : the variable is valid only for one cycle. Useful when multiple webhooks in one scenario﻿ run are received (more webhooks = more cycles).  One execution: The variable is valid for one execution. One execution can contain more cycles. |

### Set variable

Creates a variable that can be mapped by other modules in the route or by the [Get variable](/util#get-variable)﻿ module for every route in the scenario﻿.

![Set variable](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-20SdGfTB2xi0DisGlkTUD-20250228-100905.png?format=webp "Set variable")

﻿

| **Field** | **Description** |
| --- | --- |
| Variable name | Enter the variable name. This name will be displayed when mapping the variable in other modules. |
| Variable lifetime | One cycle : the variable is valid only for one cycle. Useful when multiple webhooks in one scenario﻿ run are received (more webhooks = more cycles).  One execution: The variable is valid for one execution. One execution can contain more cycles. |
| Variable value | Enter the value of the variable. |

### Sleep

Allows you to delay the scenario﻿ flow for up to 300 seconds (5 minutes).

![Sleep](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-DF_wEY87X6xrKNDatvTFd-20250228-100430.png?format=webp "Sleep")

﻿

This function can be useful, for example, if you want to lower the target service server load or to simulate more human behavior when sending bulk SMS or emails.

If you wish to pause the flow for longer periods of time, we suggest splitting your scenario﻿ into two scenarios﻿.

1. The first scenario﻿ would contain the part before the pause.

2. The second scenario﻿ would contain the part after it.

The first scenario﻿ would store all the necessary information in a data store together with the current timestamp. The second scenario﻿ would periodically check the data store for records with a timestamp older than the intended delay, retrieve the records, finalize the processing of the data, and remove the records from the data store.

## Aggregators

### Numeric aggregator

Allows you to retrieve numerical values, then apply one of the selected functions (SUM, AVG, COUNT, MAX,...), and return the result in one bundle.

In this example, the module sums up values under the *number* parameter.

![Number aggregator](https://archbee-image-uploads.s3.amazonaws.com/oAyFj2GHlBeBVWF5OAir2/WmYzkk2cf7tA0UnlBhmc4_uuid-df2f7351-e0e7-9168-0a11-35fb289a9809.gif "Number aggregator")

﻿

### Table aggregator

Merges values from the selected fields of received bundles into a single bundle using a specified column and row separator, allowing you to create a table.

![Table aggregator](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-hfS3aSN7V35rkNmUZpPU9-20250228-105131.png?format=webp "Table aggregator")

﻿

| **Field** | **Description** |
| --- | --- |
| Source module | Select the module you want to aggregate fields from. |
| Aggregated fields | Select the fields from the module selected above whose values you want to aggregate into one bundle. |
| Column separator | Select or enter the type of separator that will separate the field value columns in the resulting bundle. |
| Row separator | Select or enter the type of separator that will separate the field value rows in the resulting bundle. |
| Group by | Define an expression containing one or more mapped items. The aggregated data will then be separated into groups with the same expression's value. Each group outputs a separate bundle containing a key with the evaluated expression and the aggregated text. By doing this, you can use the key as a filter in subsequent modules. |

### Text aggregator

Merges values from the selected fields of received bundles into a single bundle.

![Text aggregator](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-4Gq6-PrQUB2NFIaGLdMLa-20250228-105329.png?format=webp "Text aggregator")

﻿

You can use the text aggregator tool to insert more values (e.g. customer names or notes) into a single bundle and send an email containing all the values in the email body or the email subject.

## Transformers

### Compose a string

Converts any value to a string data type (text), making the mapping easier when mapping, for example, binary data.

![Compose a string](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-wOqC5DoTobl_XkRUG4I7K-20250228-105619.png?format=webp "Compose a string")

﻿

### Convert the encoding of the text

Converts entered input text (or binary data) to the selected encoding.

![Convert encoding of the text](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-RLzRtvGgE_w-KTk_lPWcV-20250228-105807.png?format=webp "Convert encoding of the text")

﻿

| **Field** | **Description** |
| --- | --- |
| Input data | Enter the content you want to convert. |
| Input data codepage | Enter the input data encoding type. This is important for the binary form of data. |
| Output data codepage | Select the target encoding of your data. |

### Switch

Checks the input value for a match with the provided list of values. Returns output based on the result.

![Switch](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-RFASDuVEzE0tkJGiE4FnC-20250228-105943.png?format=webp "Switch")

﻿

| **Field** | **Description** |
| --- | --- |
| Input | Enter the expression you want to evaluate. |
| Cases | If the **Input** contains a value entered to the **Pattern** field, then the value entered to the **Output** field is returned. If the condition is not met, then no output is returned OR the value from the **Else** field (below) is returned.  When using regex patterns, make sure to adhere to the ECMAScript flavor. |
| Else | Enter the value that is returned when the criteria set in the **Cases** field is not met. |

﻿

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

Converger](/converger "Converger")[NEXT

Text parser](/regexp "Text parser")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

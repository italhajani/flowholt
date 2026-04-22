# Create the structure of scenario inputs or outputs - Help Center

Source: https://help.make.com/create-the-structure-of-scenario-inputs-or-outputs
Lastmod: 2026-02-16T16:05:53.023Z
Description: Help Center
Explore more

...

Scenario inputs and outputs

# Create the structure of scenario inputs or outputs

1 min

Before using scenario﻿ inputs or scenario﻿ outputs, you need to define their structure. When creating the scenario﻿ input structure, you can set any parameter as required, which allows you to validate the structure of the input data.

You can also add a description to each input parameter to document the data the parameter contains.

You can add scenario﻿ inputs and outputs anytime. To do that:

1

In the Scenario Builder, click the scenario﻿ inputs and outputs icon.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/o-lb8LI_Km7HY34Q-S8dg-20260121-125611.png?format=webp "Document image")

﻿

2

Select the **Scenario inputs** or **Scenario outputs** tab and click **Add item**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/oXJd_FJrek9ab1hzx1NiN-20260121-125800.png?format=webp "Document image")

﻿

3

In the **Name** field, enter the name of the input or output item. This field is mandatory.

You can't use spaces or special characters in the name. You can use letters, numbers, and the underscore symbol. You can not start with a number or an underscore followed by a number.

4

Optional: In the **Description** field, add information about the input or output item. For example, how it is used in the scenario﻿ or what information it contains.

5

In the **Type** field, select the [type of scenario input or output](https://help.make.com/scenario-inputs-and-outputs#scenario-input-and-output-types "type of scenario input or output") from the dropdown menu. This field is also mandatory.

* If you use the type **Array**, set the type of the array items in the nested **Type** field.

* If you use the type **Collection**, you can set the structure of the collection in the **Specification** field. Make﻿ validates the input data against the specification. If you keep the **Specification** empty, Make﻿ will accept any collection for the input data.

* If you use the type **Select**, add options for the dropdown selection in the **Options** field.

* If you use the type **Dynamic collection**, you can map a collection or a JSON string to the output field. The **Return output** module parses the JSON and returns it as output bundles. You can use the **Create JSON** module to create a custom data output.

6

Optional: In the **Default** field, enter the default value that is used if the value is missing in the original input.

7

Under **Required**, select whether this input is required or not to start your scenario﻿.

8

Under **Multi-line**, select how you want your text to be displayed if you selected **Text**, **Array**, **Collection** or **JSON** as the item data type**.**

Selecting **Yes** shows multiple lines of text. Selecting **No** shows only one line of text.

9

Repeat the process if you need to add more items.

10

Click **Save** in the **Scenario inputs** box and save your scenario﻿.

To work with scenario﻿ inputs, you should use the **Scenarios** > **Start scenario** module. To work with scenario﻿ outputs, you should use the **Scenarios** > **Return output** module.

Updated 16 Feb 2026

Did this page help you?

Yes

No

[PREVIOUS

Scenario inputs and outputs](/scenario-inputs-and-outputs "Scenario inputs and outputs")[NEXT

Use scenario inputs](/use-scenario-inputs "Use scenario inputs")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

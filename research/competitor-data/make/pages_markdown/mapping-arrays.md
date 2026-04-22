# Mapping arrays - Help Center

Source: https://help.make.com/mapping-arrays
Lastmod: 2026-01-15T17:26:43.705Z
Description: Understand how to map elements of simple and complex arrays to pass specific data
Key concepts

Data & mapping

# Mapping arrays

7 min

An array is a special type of item. A simple array contains one or more text values. A complex array contains one or more collections of the same type. An example of a complex array is the email attachment. The Watch emails module returns an array of attachments for every email. Every attachment represents a collection that may contain a name, content, size, etc.

## Mapping an array's first element

If you map the array's Recipient name item, it will appear in the field like this:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/OnXP3EqUTTvIsq1rY9OyJ_uuid-b7bff420-f9e9-808d-1556-88acb2c890fb.png?format=webp "Document image")

﻿

The number between the square brackets is an index that determines which element of the array will be used. Leaving it empty defaults to the first element.

## Mapping an array's element

If you wish to access another element, enter or map a value between the square brackets. In the below example, enter 2 to select the second element.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/yXQA3bzNRm38ekr1Fy9er_uuid-1f4657b7-6712-032a-ec36-ca96dfb0c3bd.png?format=webp "Document image")

﻿

## Mapping an array's element with a given key

Some arrays contain several collections with *key* and *value* items. These are typically various metadata, attributes, etc.

The following example shows the output of the *WooCommerce > Get a product* module that contains the item Meta data, which is an array of collections. Each collection contains the key item Meta Data ID and the value item Value:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/_jiBR3UL-9smC7q6xt6sQ_uuid-59a2b36c-22af-1820-97e3-5017f8013231.png?format=webp "Document image")

﻿

The typical requirement is to lookup an element by its given *key* value and to obtain the corresponding value from the *value* item. This can be achieved with a [formula](/use-functions#)﻿ employing a combination of the first () and [get ()](/general-functions#)﻿ functions.

The following example shows how to obtain the value of the Value item of the element with *key* Meta data ID item value equal to 20642

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/bw9OCMIpDwfXkIG3JFrei-20251021-110924.png "Document image")

﻿

The result of the formula will be "no".

The detailed breakdown of the formula follows:

1

The 1st parameter of the map() function is the whole array item.

2

The 2nd parameter is the **raw name** of the value item. To obtain the raw name, hover the mouse cursor over the item in the mapping panel:

![Document image](https://images.archbee.com/4CkrlJIBl1di_p1x71ery-iWp8r0ANjkYv0bxrdoFgl-20250212-120255.png?format=webp "Document image")

﻿

All parameters are case sensitive. Even though in this particular example the item's label differs from its raw name only in capitalization, it is necessary to use the raw name, which is all lowercase value in contrast to the label Value

3

The 3rd parameter is the raw name of the *key* item:

![Document image](https://images.archbee.com/4CkrlJIBl1di_p1x71ery-KTAwJVxsN89LhJDD78Rir-20250212-120424.png?format=webp "Document image")

﻿

4

The 4th parameter is the given *key* value.

﻿

Because the map() function returns an array (as there could be more elements with the given key value), it is necessary to apply the first () function to get its first element:

1

The 1st parameter of the first () function is the result of the map() function.

2

The 2nd parameter is the element's index - one.

See also our [Extract an item and/or its value from an array of collections](https://www.youtube.com/watch?v=W9CgDTeppmE "Extract an item and/or its value from an array of collections") video tutorial.

﻿

## Converting elements to a series of bundles

Arrays can be converted to a series of bundles using the [Iterator](/flow-control#)﻿ module:

![Mapping_iterator.png](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/qzkt2nyCjMyapRamavFkF_uuid-823e9289-d77f-e413-bd0b-5156e64a7d5d.png?format=webp "Mapping_iterator.png")

﻿

The outputs from modules wrapped between an Iterator and Aggregator are not accessible beyond the Aggregator module.

﻿

Updated 15 Jan 2026

Did this page help you?

Yes

No

[PREVIOUS

Filtering](/filtering "Filtering")[NEXT

Working with files](/working-with-files "Working with files")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

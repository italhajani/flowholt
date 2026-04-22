# Use functions - Help Center

Source: https://help.make.com/use-functions
Lastmod: 2026-01-15T17:59:37.112Z
Description: Apply built-in functions to transform data and create complex formulas within your scenarios
Explore more

Functions

# Use functions

3 min

When [mapping items](/mapping#)﻿, you can use functions to create complex formulas. The functions available in Make﻿ are similar to functions in Excel or those in other programming languages. The functions let you perform various transformations of item values, such as converting a text to uppercase, trimming a text, converting a date into a different format, and many others.

## Insert functions into fields

Functions can be inserted into fields the same way as items. Click a field to view the mapping panel.

The mapping panel contains several tabs:

![Using functions](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-SQ0IIEjBevOWtMvPzxgeY-20250226-090300.png?format=webp "Using functions")

﻿

The first tab (shown upon opening the panel) displays the items that you can map from other modules.

The other tabs contain various functions:

* ﻿[General functions](/general-functions)﻿

* ﻿[Math functions](/math-functions)﻿

* ﻿[Text and binary functions](/text-and-binary-functions)﻿

* ﻿[Date and time functions](/date-and-time-functions)﻿

* ﻿[Array functions](/array-functions)﻿

* ﻿[Custom functions](/custom-functions)﻿

* ﻿[Custom and system variables](5UJ3-0KGuD4jwffMxAm-9)﻿

To insert a function into a field, click the function name or drag it to the field.

### Example

When posting a new tweet with the **Twitter > Create a tweet** module, you should not exceed Twitter's 280-character limit. Otherwise, the module throws an error. If you map a text item that can contain more than 280 characters into the module's **Status** field, you can use the substring() function to limit the tweet to 280 characters:

![Substring function](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/TxWWjBp5q81m2jxckzAJl_uuid-17962706-05f1-025c-5f23-84c3fba03e7e.png?format=webp "Substring function")

﻿

## Google Sheets functions

If you miss a function, but it is featured by **Google Sheets**, you may use it like this:

1

In Google Sheets, create a new empty spreadsheet.

2

In Make﻿ open your scenario﻿.

3

Insert the **Google Sheets > Update a cell** module.

4

Configure the module:

1. Choose the newly created spreadsheet in the **Spreadsheet** field.

2. Instert your formula containing the Google Sheets function into the Value field.

![Value field](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm--uzAkYHo0yDmY4-BUV3Yn-20250226-091911.png?format=webp "Value field")

﻿

5

Insert the **Google Sheets > Get a cell** module to obtain the calculated result.

6

Configure the module. Fill in the same **Cell**ID as you filled in step 4.

![Cell ID](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-Jw-8V-7m2E42xPGYUod4J-20250226-091941.png?format=webp "Cell ID")

﻿

﻿

Updated 15 Jan 2026

Did this page help you?

Yes

No

[PREVIOUS

Functions](/functions "Functions")[NEXT

General functions](/general-functions "General functions")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

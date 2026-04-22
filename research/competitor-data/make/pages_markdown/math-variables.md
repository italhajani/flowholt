# Math variables - Help Center

Source: https://help.make.com/math-variables
Lastmod: 2026-01-15T18:00:31.217Z
Description: Generate random numbers to use in your formulas and functions
Explore more

Functions

# Math variables

2 min

Use math variables to insert a random number into your functions.

## random

Returns a floating-point, pseudo-random number in the range [0, 1) (inclusive of 0, but not 1).

Use the following formula to generate an integer pseudo-random number in the range [min, max] (inclusive of both, min and max):

![Math variable - random](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/gc7yTBq4zGHJH3DFAMrCq_uuid-81fd5f8a-8050-beef-9184-deff3b944d95.png?format=webp "Math variable - random")

﻿

Text

1{{floor(random \* (1.max - 1.min + 1)) + 1.min}}

{{floor(random \* (1.max - 1.min + 1)) + 1.min}}
/\*\*
\* Reset the text fill color so that placeholder is visible
\*/
.npm\_\_react-simple-code-editor\_\_textarea:empty {
-webkit-text-fill-color: inherit !important;
}
/\*\*
\* Hack to apply on some CSS on IE10 and IE11
\*/
@media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
/\*\*
\* IE doesn't support '-webkit-text-fill-color'
\* So we use 'color: transparent' to make the text transparent on IE
\* Unlike other browsers, it doesn't affect caret color in IE
\*/
.npm\_\_react-simple-code-editor\_\_textarea {
color: transparent !important;
}
.npm\_\_react-simple-code-editor\_\_textarea::selection {
background-color: #accef7 !important;
color: transparent !important;
}
}

﻿

### Example: Roll the dice

You can employ the random variable to create a dice game that randomly picks a number, for example between 1 and 6, and then returns that number to a user.

1

In the mapping panel of the **Tools > Set variable** module, select the **Math functions** tab.

![Random math variable](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-xyuY8nuBAllnvjQycz-mh-20250226-093022.png?format=webp "Random math variable")

﻿

2

Select the floor function.

3

Insert the following:

Text

1{{floor(random \* 6) + 1}}

{{floor(random \* 6) + 1}}
/\*\*
\* Reset the text fill color so that placeholder is visible
\*/
.npm\_\_react-simple-code-editor\_\_textarea:empty {
-webkit-text-fill-color: inherit !important;
}
/\*\*
\* Hack to apply on some CSS on IE10 and IE11
\*/
@media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
/\*\*
\* IE doesn't support '-webkit-text-fill-color'
\* So we use 'color: transparent' to make the text transparent on IE
\* Unlike other browsers, it doesn't affect caret color in IE
\*/
.npm\_\_react-simple-code-editor\_\_textarea {
color: transparent !important;
}
.npm\_\_react-simple-code-editor\_\_textarea::selection {
background-color: #accef7 !important;
color: transparent !important;
}
}

﻿

﻿

Updated 15 Jan 2026

Did this page help you?

Yes

No

[PREVIOUS

Math functions](/math-functions "Math functions")[NEXT

Text and binary functions](/text-and-binary-functions "Text and binary functions")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

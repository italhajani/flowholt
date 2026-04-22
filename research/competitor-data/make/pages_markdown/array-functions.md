# Array functions - Help Center

Source: https://help.make.com/array-functions
Lastmod: 2026-01-15T18:01:33.312Z
Description: Sort, filter, and transform arrays to manipulate complex data structures
Explore more

Functions

# Array functions

16 min

You can use array functions to transform [array data](/mapping-arrays)﻿. Array functions can, for example, search and sort the items in an array, perform mathematical operations, convert arrays to collections, reorder the items in an array, and more. Below is a list of supported array functions and a description what of each function does.

## add

**add (array; value1; value2; ...)**

Adds values specified in parameters to an array and returns that array.

## contains

**contains (array; value)**

Verifies if an array contains the value.

## deduplicate

**deduplicate (array)**

Removes duplicates from an array.

## distinct

**distinct (array; [key])**

Removes duplicates inside an array. Use the *key* argument to access properties inside complex objects. To access nested properties, use dot notation. The first item in an array is index 1.

Text

1distinct( Contacts[] ; name )
2Removes duplicates inside an array of contacts by comparing the name property.

distinct( Contacts[] ; name )
Removes duplicates inside an array of contacts by comparing the name property.
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

## first

**first (array)**

Returns the first element of an array.

## flatten

**flatten (array)**

Creates a new array with all sub-array elements concatenated into it recursively up to the specified depth.

More details about this function can be found in the [Array.prototype.flat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat "Array.prototype.flat") documentation.

## join

**join (array; separator)**

Concatenates all the items of an array into a string, using a specified separator between each item.

## keys

**keys (object)**

Returns an array of a given object's or array's properties.

## last

**last (array)**

Returns the last element of an array.

## length

**length (array)**

Returns the number of items in an array.

## map

**map (complex array; key;[key for filtering];[possible values for filtering separated by a comma])**

Returns a primitive array containing values of a complex array. Allows filtering values. Use raw variable names for keys.

Text

1map( Emails[] ; email )
2Returns a primitive array with emails.

map( Emails[] ; email )
Returns a primitive array with emails.
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

Text

1map( Emails[] ; email ; label ; work,home )
2Returns a primitive array with emails that have a label equal to work or home.

map( Emails[] ; email ; label ; work,home )
Returns a primitive array with emails that have a label equal to work or home.
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

## merge

**merge (array1; array2; ...)**

Merges two or more arrays into one array.

## remove

**remove (array; value1; value2; ...)**

Removes values specified in the parameters of an array. Effective only in case of primitive arrays of text or numbers.

## reverse

**reverse (array)**

The first element of the array becomes the last element and vice versa.

## shuffle

**shuffle (array)**

Shuffles (randomly reorders) elements of an array.

## slice

**slice (array; start; [end])**

Returns a new array containing only selected items. The first item in the array has an index of 0.

## sort

**sort (array; [order]; [key])**

Sorts values of an array. The valid values of the order parameter are:

* asc (default) - ascending order: 1, 2, 3, ... for type Number. A, B, C, a, b, c, ... for type Text.

* desc - descending order: ..., 3, 2, 1 for type Number. ..., c, b, a, C, B, A for type Text.

* asc ci - case insensitive ascending order: A, a, B, b, C, c, ... for type Text.

* desc ci - case insensitive descending order: ..., C, c, B, b, A, a for type Text.

Use the key parameter to access properties inside complex objects. Use raw variable names for keys. To access nested properties, use dot notation. The first item in an array is index 1.

Text

1sort( Contacts[] ; name )
2Sorts an array of contacts by the name property in default ascending order.

sort( Contacts[] ; name )
Sorts an array of contacts by the name property in default ascending order.
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

Text

1sort( Contacts[] ; desc ; name )
2Sorts an array of contacts by the name property in descending order.

sort( Contacts[] ; desc ; name )
Sorts an array of contacts by the name property in descending order.
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

Text

1sort( Contacts[] ; asc ci ; name )
2Sorts an array of contacts by the name property in case insensitive ascending order.

sort( Contacts[] ; asc ci ; name )
Sorts an array of contacts by the name property in case insensitive ascending order.
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

Text

1sort( Emails[] ; sender.name )
2Sorts an array of emails by the sender.name property.

sort( Emails[] ; sender.name )
Sorts an array of emails by the sender.name property.
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

## toArray

**toArray (collection)**

Converts a collection into an array of key-value collections.

## toCollection

**toCollection (array; key; value)**

Converts an array containing objects with key-value pairs into a collection.

Updated 15 Jan 2026

Did this page help you?

Yes

No

[PREVIOUS

Tokens for date/time formatting](/tokens-for-datetime-formatting "Tokens for date/time formatting")[NEXT

Custom functions](/custom-functions "Custom functions")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

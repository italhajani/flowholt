# Date and time functions - Help Center

Source: https://help.make.com/date-and-time-functions
Lastmod: 2026-03-24T08:12:57.331Z
Description: Format, parse, and calculate dates and times with timezone support
Explore more

Functions

# Date and time functions

37 min

Use date and time functions to convert and transform date and time data. For example, you can change the date format, convert time based on timezones, convert text to date or time data, and more. Below is a list of supported date and time functions with descriptions and details for each.

## **formatDate** (date; format; [timezone])

**When to use it:** You have a [date](hdc1mr5JWOaqEIiS266kB#)﻿ value that you wish to convert (format) to a [text](hdc1mr5JWOaqEIiS266kB#)﻿ value (textual human-readable representation) like 12-10-2019 20:30 or Aug 18, 2019 10:00 AM

### Parameters

The second column indicates the expected type. If different type is provided, [type coercion](/type-coercion#)﻿ is applied.

| **Parameter** | **Expected type** | **Description** |
| --- | --- | --- |
| date | date | Date value to be converted to a text value. |
| format | text | Format specified using [tokens for date/time formatting](/tokens-for-datetime-formatting#)﻿.  Example: DD.MM.YYYY HH:mm |
| timezone | text | Optional. The timezone used for the conversion.  See [List of tz database time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List "List of tz database time zones"), column "TZ database name" for the list of recognized timezones.  If omitted, Make﻿ uses the organization's timezone. You can [edit your time zone](/manage-time-zones)﻿. |

### Return value and type

Text representation of the given Date value according to the specified format and timezone. Type is Text.

### Example

The Organization's and Web's timezone were both set to Europe/Prague in the following examples.

| **Function** | **Result** |
| --- | --- |
| formatDate(1. Date created; MM/DD/YYYY ) | 10/01/2018 |
| formatDate(1. Date created; YYYY-MM-DD hh:mm A ) | 2018-10-01 09:32 AM |
| formatDate(1. Date created; DD.MM.YYYY HH:mm ; UTC ) | 01.10.2018 07:32 |
| formatDate(now; MM/DD/YYYY HH:mm ) | 19/03/2019 15:30 |

## **parseDate** (text; format; [timezone])

**When to use it:** You have a [text](hdc1mr5JWOaqEIiS266kB#)﻿ value representing a date (e.g. 12-10-2019 20:30 or Aug 18, 2019 10:00 AM) and you wish to convert (parse) it to a [Date](hdc1mr5JWOaqEIiS266kB#)﻿ value (binary machine-readable representation).

### Parameters

The second column indicates the expected type. If different type is provided, [Type Coercion](/type-coercion#)﻿ is applied.

| **Parameter** | **Expected type** | **Description** |
| --- | --- | --- |
| text | text | Text value to be converted to a date value. |
| format | text | Format specified using [tokens for date/time formatting](/tokens-for-datetime-formatting#)﻿.  Example: DD.MM.YYYY HH:mm |
| timezone | text | Optional. The timezone used for the conversion.  See [List of tz database time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List "List of tz database time zones"), column "TZ database name" for the list of recognized timezones.  If omitted, Make﻿ uses the organization's timezone. You can [edit your time zone](/manage-time-zones)﻿.  Example: Europe/Prague, UTC |

### Return value and type

Date representation of the given text value according to the specified format and timezone. Type is date.

### Examples

Please note that in the following examples the returned date value is expressed according to ISO 8601, but the actual resulting value is of type date.

Text

1parseDate( 2016-12-28 ; YYYY-MM-DD )
2= 2016-12-28T00:00:00.000Z

parseDate( 2016-12-28 ; YYYY-MM-DD )
= 2016-12-28T00:00:00.000Z
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

1parseDate( 2016-12-28 16:03 ; YYYY-MM-DD HH:mm )
2= 2016-12-28T16:03:00.000Z

parseDate( 2016-12-28 16:03 ; YYYY-MM-DD HH:mm )
= 2016-12-28T16:03:00.000Z
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

1parseDate( 2016-12-28 04:03 pm ; YYYY-MM-DD hh:mm a )
2= 2016-12-28T16:03:06.000Z

parseDate( 2016-12-28 04:03 pm ; YYYY-MM-DD hh:mm a )
= 2016-12-28T16:03:06.000Z
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

1parseDate( 1482940986 ; X )
2= 2016-12-28T16:03:06.000Z

parseDate( 1482940986 ; X )
= 2016-12-28T16:03:06.000Z
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

## **addDays** (date; number)

Returns a new date as a result of adding a given number of days to a date. To subtract days, enter a negative number.

Text

1addDays( 2016-12-08T15:55:57.536Z ; 2 )
2= 2016-12-10T15:55:57.536Z

addDays( 2016-12-08T15:55:57.536Z ; 2 )
= 2016-12-10T15:55:57.536Z
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

1addDays( 2016-12-08T15:55:57.536Z ; -2 )
2= 2016-12-6T15:55:57.536Z

addDays( 2016-12-08T15:55:57.536Z ; -2 )
= 2016-12-6T15:55:57.536Z
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

## **addHours** (date; number)

Returns a new date as a result of adding a given number of hours to a date. To subtract hours, enter a negative number.

Text

1addHours( 2016-12-08T15:55:57.536Z ; 2 )
2= 2016-12-08T17:55:57.536Z

addHours( 2016-12-08T15:55:57.536Z ; 2 )
= 2016-12-08T17:55:57.536Z
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

1addHours( 2016-12-08T15:55:57.536Z ; -2 )
2= 2016-12-08T13:55:57.536Z

addHours( 2016-12-08T15:55:57.536Z ; -2 )
= 2016-12-08T13:55:57.536Z
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

## **addMinutes** (date; number)

Returns a new date as a result of adding a given number of minutes to a date. To subtract minutes, enter a negative number.

Text

1addMinutes( 2016-12-08T15:55:57.536Z ; 2 )
2= 2016-12-08T15:57:57.536Z

addMinutes( 2016-12-08T15:55:57.536Z ; 2 )
= 2016-12-08T15:57:57.536Z
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

1addMinutes( 2016-12-08T15:55:57.536Z ; -2 )
2= 2016-12-08T15:53:57.536Z

addMinutes( 2016-12-08T15:55:57.536Z ; -2 )
= 2016-12-08T15:53:57.536Z
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

## **addMonths** (date; number)

Returns a new date as a result of adding a given number of months to a date. To subtract months, enter a negative number.

Text

1addMonths( 2016-10-08T15:55:57.536Z ; 2 )
2= 2016-12-08T15:57:57.536Z

addMonths( 2016-10-08T15:55:57.536Z ; 2 )
= 2016-12-08T15:57:57.536Z
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

1addMonths( 2016-10-08T15:55:57.536Z ; -2 )
2= 2016-08-08T15:57:57.536Z

addMonths( 2016-10-08T15:55:57.536Z ; -2 )
= 2016-08-08T15:57:57.536Z
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

## **addSeconds** (date; number)

Returns a new date as a result of adding a given number of seconds to a date. To subtract seconds, enter a negative number.

Text

1addSeconds( 2016-12-08T15:55:57.536Z ; 2 )
2= 2016-12-08T15:57:57.536Z

addSeconds( 2016-12-08T15:55:57.536Z ; 2 )
= 2016-12-08T15:57:57.536Z
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

1addSeconds( 2016-12-08T15:55:57.536Z ; -2 )
2= 2016-12-08T15:53:57.536Z

addSeconds( 2016-12-08T15:55:57.536Z ; -2 )
= 2016-12-08T15:53:57.536Z
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

## **addYears** (date; years)

Returns a new date as a result of adding a given number of years to a date. To subtract years, enter a negative number.

Text

1addYears( 2016-12-08T15:55:57.536Z ; 2 )
22018-08-08T15:55:57.536Z

addYears( 2016-12-08T15:55:57.536Z ; 2 )
2018-08-08T15:55:57.536Z
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

1addYears( 2016-12-08T15:55:57.536Z ; -2 )
22014-08-08T15:55:57.536Z

addYears( 2016-12-08T15:55:57.536Z ; -2 )
2014-08-08T15:55:57.536Z
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

## **setSecond** (date; number)

Returns a new date with the seconds specified in parameters. Accepts numbers from 0 to 59. If a number is given outside of this range, it will return the date with the seconds from the previous or subsequent minute(s), accordingly.

Text

1setSecond( 2015-10-07T11:36:39.138Z ; 10 )
2= 2015-10-07T11:36:10.138Z

setSecond( 2015-10-07T11:36:39.138Z ; 10 )
= 2015-10-07T11:36:10.138Z
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

1setSecond( 2015-10-07T11:36:39.138Z ; 61 )
2= 2015-10-07T11:37:01.138Z

setSecond( 2015-10-07T11:36:39.138Z ; 61 )
= 2015-10-07T11:37:01.138Z
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

## **setMinute** (date; number)

Returns a new date with the minutes specified in parameters. Accepts numbers from 0 to 59. If a number is given outside of this range, it will return the date with the minutes from the previous or subsequent hour(s), accordingly.

Text

1setMinute( 2015-10-07T11:36:39.138Z ; 10 )
2= 2015-10-07T11:10:39.138Z

setMinute( 2015-10-07T11:36:39.138Z ; 10 )
= 2015-10-07T11:10:39.138Z
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

1setMinute( 2015-10-07T11:36:39.138Z ; 61 )
2= 2015-10-07T12:01:39.138Z

setMinute( 2015-10-07T11:36:39.138Z ; 61 )
= 2015-10-07T12:01:39.138Z
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

## **setHour** (date; number)

Returns a new date with the hour specified in parameters. Accepts numbers from 0 to 59. If a number is given outside of this range, it will return the date with the hour from the previous or subsequent day(s), accordingly.

Text

1setHour( 2015-10-07T11:36:39.138Z ; 10 )
2= 2015-08-07T06:36:39.138Z

setHour( 2015-10-07T11:36:39.138Z ; 10 )
= 2015-08-07T06:36:39.138Z
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

1setHour( 2015-10-07T11:36:39.138Z ; 61 )
2= 2015-08-06T18:36:39.138Z

setHour( 2015-10-07T11:36:39.138Z ; 61 )
= 2015-08-06T18:36:39.138Z
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

## **setDay** (date; number/name of the day in english)

Returns a new date with the day specified in parameters. It can be used to set the day of the week, with Sunday as 1 and Saturday as 7. If the given value is from 1 to 7, the resulting date will be within the current (Sunday-to-Saturday) week. If a number is given outside of the range, it will return the day from the previous or subsequent week(s), accordingly.

Text

1setDay( 2018-06-27T11:36:39.138Z ; monday )
2= 2018-06-25T11:36:39.138Z

setDay( 2018-06-27T11:36:39.138Z ; monday )
= 2018-06-25T11:36:39.138Z
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

1setDay( 2018-06-27T11:36:39.138Z ; 1 )
2= 2018-06-24T11:36:39.138Z

setDay( 2018-06-27T11:36:39.138Z ; 1 )
= 2018-06-24T11:36:39.138Z
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

1setDay( 2018-06-27T11:36:39.138Z ; 7 )
2= 2018-06-30T11:36:39.138Z

setDay( 2018-06-27T11:36:39.138Z ; 7 )
= 2018-06-30T11:36:39.138Z
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

## **setDate** (date; number)

Returns a new date with the day of the month specified in parameters. Accepts numbers from 1 to 31. If a number is given outside of the range, it will return the day from the previous or subsequent month(s), accordingly.

Text

1setDate( 2015-08-07T11:36:39.138Z ; 5 )
2= 2015-08-05T11:36:39.138Z

setDate( 2015-08-07T11:36:39.138Z ; 5 )
= 2015-08-05T11:36:39.138Z
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

1setDate( 2015-08-07T11:36:39.138Z ; 32 )
2= 2015-09-01T11:36:39.138Z

setDate( 2015-08-07T11:36:39.138Z ; 32 )
= 2015-09-01T11:36:39.138Z
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

## **setMonth** (date; number/name of the month in English)

Returns a new date with the month specified in parameters. Accepts numbers from 1 to 12. If a number is given outside of this range, it will return the month in the previous or subsequent year(s), accordingly.

Text

1setMonth( 2015-08-07T11:36:39.138Z ; 5 )
2= 2015-05-07T11:36:39.138Z

setMonth( 2015-08-07T11:36:39.138Z ; 5 )
= 2015-05-07T11:36:39.138Z
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

1setMonth( 2015-08-07T11:36:39.138Z ; 17 )
2= 2016-05-07T11:36:39.138Z

setMonth( 2015-08-07T11:36:39.138Z ; 17 )
= 2016-05-07T11:36:39.138Z
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

1setMonth( 2015-08-07T11:36:39.138Z ; january )
2= 2015-01-07T12:36:39.138Z

setMonth( 2015-08-07T11:36:39.138Z ; january )
= 2015-01-07T12:36:39.138Z
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

## **setYear** (date; number)

Returns a new date with the year specified in parameters.

Text

1setYear( 2015-08-07T11:36:39.138Zv ; 2017 )
2= 2017-08-07T11:36:39.138Z

setYear( 2015-08-07T11:36:39.138Zv ; 2017 )
= 2017-08-07T11:36:39.138Z
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

### Calculate n-th day of the week in a month

If you need to calculate a date corresponding to the n-th day of week in a month (e.g. 1st Tuesday, 3rd Friday, etc.), you can use the following formula:

Text

1{{addDays(setDate(1.date; 1); 1.n \* 7 - formatDate(addDays(setDate(1.date; 1); "-" + 1.dow); "E"))}}

{{addDays(setDate(1.date; 1); 1.n \* 7 - formatDate(addDays(setDate(1.date; 1); "-" + 1.dow); "E"))}}
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

The formula contains the following items:

| Value | Description |
| --- | --- |
| 1.n | n-th day:  * 1 for **1**st Tuesday  * 2 for **2**nd Tuesday  * 3 for **3**rd Tuesday  * etc. |
| 2.dow | Day of the week:  * 1 for Monday  * 2 for Tuesday  * 3 for Wednesday  * 4 for Thursday  * 5 for Friday  * 6 for Saturday  * 7 for Sunday |
| 1.date | The date determines the month. To calculate n-th day of week in **current** month use the now variable |

If you want to calculate only one specific case, e.g. 2nd Wednesday, you may replace the items 1.n and 2.dow in the formula with the corresponding numbers. For 2nd Wednesday in the current month you would use the following values:

* 1.n = 2

* 1.dow = 3

* 1.date = now

* setDate(now;1) returns first of current month

* formatDate(....;E) returns day of week (1, 2, ... 6)

* see the [original source](https://exceljet.net/formula/get-nth-day-of-week-in-month "original source") for the rest

### Calculate days between dates

![Calculate days between d](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-8Msh41cFz4bOfwL3TLvMo-20250226-101332.png?format=webp "Calculate days between d")

﻿

Text

1{{round((2.value - 1.value) / 1000 / 60 / 60 / 24)}}

{{round((2.value - 1.value) / 1000 / 60 / 60 / 24)}}
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

The values of D1 and D2 above have to be of type date. If they are of type string (e.g. "20.10.2018"), use the parseDate() function to convert them to type date.

The round() function is used for cases when one of the dates falls within the daylight savings time period and the other does not. In these cases, the difference in hours is by one hour less/more and dividing it by 24 gives a non-integer results.

### Calculate the last day/millisecond of a month

When specifying a date range (e.g. in a search module) spanning the whole previous month as a closed interval (the interval that **includes** both its limit points), it is necessary to calculate the last day of the month.

2019-09-01 ≤ D ≤ **2019-09-30**

Text

1{{addDays(setDate(now; 1); -1)}}

{{addDays(setDate(now; 1); -1)}}
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

In some cases, it is necessary to calculate not only the last day of month, but its last millisecond:

2019-09-01T00:00:00.000Z ≤ D ≤ **2019-09-30T23:59:59.999Z**

Text

1{{parseDate(parseDate(formatDate(now; "YYYYMM01"); "YYYYMMDD"; "UTC") - 1; "x")}}

{{parseDate(parseDate(formatDate(now; "YYYYMM01"); "YYYYMMDD"; "UTC") - 1; "x")}}
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

If the result should respect your timezone settings, simply omit the UTC argument:

Text

1{{parseDate(parseDate(formatDate(now; "YYYYMM01"); "YYYYMMDD") - 1; "x")}}

{{parseDate(parseDate(formatDate(now; "YYYYMM01"); "YYYYMMDD") - 1; "x")}}
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

However, it is preferable to use a half-open interval instead (the interval that **excludes** one of its limit points), specifying the first day of the following month instead and replacing the **less or equal than** operator with **less than**:

2019-09-01 ≤ D **< 2019-10-01**

2019-09-01T00:00:00.000Z ≤ D **< 2019-10-01T00:00:00.000Z**

### Transform seconds into hours, minutes and second

Text

1{{floor(1.seconds / 3600)}}:{{floor((1.seconds % 3600) / 60)}}:{{((1.seconds % 3600) % 60)}}

{{floor(1.seconds / 3600)}}:{{floor((1.seconds % 3600) / 60)}}:{{((1.seconds % 3600) % 60)}}
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

Values of second should be number type. This function is suited only if the second value is less than 86400 ( less than a day ).

Updated 24 Mar 2026

Did this page help you?

Yes

No

[PREVIOUS

Text and binary functions](/text-and-binary-functions "Text and binary functions")[NEXT

Tokens for date/time parsing](/tokens-for-datetime-parsing "Tokens for date/time parsing")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

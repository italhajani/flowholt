# Tokens for date/time formatting - Help Center

Source: https://help.make.com/tokens-for-datetime-formatting
Lastmod: 2026-01-16T09:33:31.162Z
Description: Use special formatting tokens to change the format of the date and time data
Explore more

Functions

# Tokens for date/time formatting

3 min

Use date/time formatting tokens to change the format of date/time data. For example, you can convert a timestamp to a quarter of the year or day of the week. The following tables present the tokens supported for changes in formatting.

## Year, month, and day tokens

| **Token** | **Output** | **Description** |
| --- | --- | --- |
| YY | 70 71 ... 29 30 | 2 digit year |
| YYYY | 1970 1971 ... 2029 2030 | 4 digit year |
| Y | 1970 1971 ... 9999 +10000 +10001 | Year with any number of digits and sign |
| Q | 1 2 3 4 | Quarter of year |
| Qo | 1st 2nd 3rd 4th | Quarter of year with ordinal |
| M | 1 2 ... 11 12 | Month number |
| Mo | 1st 2nd ... 11th 12th | Month with ordinal |
| MM | 01 02 ... 11 12 | Month number with leading zero |
| MMM | Jan Feb ... Nov Dec | Month abbreviation |
| MMMM | January February ... November December | Month name |
| D | 1 2 ... 30 31 | Day of month |
| Do | 1st 2nd ... 30th 31st | Day of month with ordinal |
| DD | 01 02 ... 30 31 | Day of month with leading zero |
| DDD | 1 2 ... 364 365 | Day of year |
| DDDo | 1st 2nd ... 364th 365th | Day of year with ordinal |
| DDDD | 001 002 ... 364 365 | Day of year with leading zero |

## Week year, week, and weekday tokens

| **Token** | **Output** | **Description** |
| --- | --- | --- |
| d | 0 1 ... 5 6 | Day of week |
| do | 0th 1st ... 5th 6th | Day of week with ordinal |
| dd | Su Mo ... Fr Sa | Day abbreviation |
| ddd | Sun Mon ... Fri Sat | Day abbreviation |
| dddd | Sunday Monday ... Friday Saturday | Day name |
| E | 1 2 ... 6 7 | Day of week (ISO) |
| w | 1 2 ... 52 53 | Week of year |
| wo | 1st 2nd ... 52nd 53rd | Week of year with ordinal |
| ww | 01 02 ... 52 53 | Week of year with leading zero |
| W | 1 2 ... 52 53 | Week of year (ISO) |
| Wo | 1st 2nd ... 52nd 53rd | Week of year with ordinal (ISO) |
| WW | 01 02 ... 52 53 | Week of year with leading zero (ISO) |
| gg | 70 71 ... 29 30 | Week year |
| gggg | 1970 1971 ... 2029 2030 | Week year |
| GG | 70 71 ... 29 30 | Week year (ISO |
| GGGG | 1970 1971 ... 2029 2030 | Week year (ISO) |

## Hour, minute, second, millisecond, and offset tokens

| Token | Output | Description |
| --- | --- | --- |
| H | 0 1 ... 22 23 | 24 hour time |
| HH | 00 01 ... 22 23 | 24 hour time with leading zero |
| h | 1 2 ... 11 12 | 12 hour time |
| hh | 01 02 ... 11 12 | 12 hour time with leading zero |
| k | 1 2 ... 23 24 | 24 hour time |
| kk | 01 02 ... 23 24 | 24 hour time with leading zero |
| A | AM PM | Post or ante meridiem (upper case) |
| a | am pm | Post or ante meridiem (lower case) |
| m | 0 1 ... 58 59 | Minutes |
| mm | 00 01 ... 58 59 | Minutes with leading zero |
| s | 0 1 ... 58 59 | Seconds |
| ss | 00 01 ... 58 59 | Seconds with leading zero |
| S | 0 1 ... 8 9 | Fractional seconds |
| SS | 00 01 ... 98 99 | Fractional seconds with leading zero |
| SSS | 000 001 ... 998 999 | Fractional seconds with two leading zeros |
| SSSS ... SSSSSSSSS | 000[0..] 001[0..] ... 998[0..] 999[0..] | Fractional seconds |
| Z | -07:00 -06:00 ... +06:00 +07:00 | Time zone |
| ZZ | -0700 -0600 ... +0600 +0700 | Time zone |
| X | 1360013296 | Unix Timestamp |
| x | 1360013296123 | Unix Millisecond Timestamp |

﻿

Updated 16 Jan 2026

Did this page help you?

Yes

No

[PREVIOUS

Tokens for date/time parsing](/tokens-for-datetime-parsing "Tokens for date/time parsing")[NEXT

Array functions](/array-functions "Array functions")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

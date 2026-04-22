# Tokens for date/time parsing - Help Center

Source: https://help.make.com/tokens-for-datetime-parsing
Lastmod: 2026-01-16T09:34:52.869Z
Description: Use special parsing tokens to read and extract dates and times
Explore more

Functions

# Tokens for date/time parsing

3 min

Date/time parsing tokens are special combinations of letters you can use to read and extract date/time data. The following tables list the tokens you can use to parse data in your functions:

## Year, month, and day tokens

| **Input** | **Example** | **Description** |
| --- | --- | --- |
| YYYY | 2014 | 4 or 2 digit year |
| YY | 14 | 2 digit year |
| Y | -25 | Year with any number of digits and sign |
| Q | 1..4 | Quarter of a year Sets month to first month in quarter |
| M MM | 1..12 | Month number |
| MMM MMMM | Jan..December | Month name |
| D DD | 1..31 | Day of month |
| Do | 1st..31st | Day of month with ordinal numbers |
| DDD DDDD | 1..365 | Day of year |
| X | 1410715640.579 | Unix timestamp |
| x | 1410715640579 | Unix ms timestamp |

## Week year, week, and weekday tokens

| **Input** | **Example** | **Description** |
| --- | --- | --- |
| ddd dddd | Mon...Sunday | Day name |
| GGGG | 2014 | ISO 4 digit week year |
| GG | 14 | ISO 2 digit week year |
| W WW | 1..53 | ISO week of year |
| E | 1..7 | ISO day of week |

## Hour, minute, second, millisecond, and offset tokens

| **Input** | **Example** | **Description** |
| --- | --- | --- |
| H HH | 0..23 | Hours (24 hour time) |
| h hh | 1..12 | Hours (12 hour time used with a A) |
| k kk | 1..24 | Hours (24 hour time from 1 to 24) |
| a A | am pm | Post or ante meridiem (Note the one character a p are also considered valid) |
| m mm | 0..59 | Minutes |
| s ss | 0..59 | Seconds |
| S SS SSS | 0..999 | Fractional seconds |
| Z ZZ | +12:00 | Offset from UTC as +-HH:mm, +-HHmm, or Z |

﻿

Updated 16 Jan 2026

Did this page help you?

Yes

No

[PREVIOUS

Date and time functions](/date-and-time-functions "Date and time functions")[NEXT

Tokens for date/time formatting](/tokens-for-datetime-formatting "Tokens for date/time formatting")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

# Type coercion - Help Center

Source: https://help.make.com/type-coercion
Lastmod: 2026-01-15T17:25:12.348Z
Description: Explore how Make handles data mismatches and when it can automatically convert it into a different type
Key concepts

Data & mapping

# Type coercion

9 min

This document describes how Make﻿ behaves in situations when it receives values in expected and unexpected data formats.

## When array is expected:

| **Received** | **Description** |
| --- | --- |
| **array** | The value is handed over unchanged. |
| **other** | If the received value is not of the array type, Make﻿ will create an array and the first (and the only) element will be the received value. |

## When **Boolean** is expected:

| **Received** | **Description** |
| --- | --- |
| **boolean** | The value is handed over unchanged. |
| **number** | The value is converted to logical Yes, even if the value is 0 |
| **text** | If the value is equal to false or the value is empty, it is converted to logical No. If not, it is converted to logical Yes |
| **other** | The value is converted to logical Yes whenever the received value exists (is not null). |

## When **Buffer** is expected:

| **Received** | **Description** |
| --- | --- |
| **buffer** | The value is handed over unchanged only if the codepage is as expected. If the codepage differs, Make﻿ will try to convert the received value to the requested codepage. If this conversion is not supported, Make﻿ will return a validation error. |
| **boolean** | The value is converted to text (true/false) and then to binary data following the steps mentioned above for converting to **text**. |
| **date** | The value is converted to ISO 8601 text and then to binary data following the steps mentioned for converting to **text**. |
| **number** | The value is converted to text and then to binary data following the steps mentioned above for converting to **text**. |
| **text** | The value is converted to binary data and encoded as expected. If the expected encoding is not specified, utf8 encoding will be used. |
| **other** | ﻿Make﻿ returns a validation error. |

## When **Collection** is expected:

| **Received** | **Description** |
| --- | --- |
| **collection** | The value is handed over unchanged. |
| **other** | ﻿Make﻿ returns a validation error. |

## When **Date** is expected:

| **Received** | **Description** |
| --- | --- |
| **date** | The value is handed over unchanged. |
| **text** | ﻿Make﻿ will try to convert the text to a date. If the conversion fails, it will return a validation error. Date must contain day, month and year. Date may contain time and time zone. Default time zone is based on your settings. See these [examples](https://help.make.com/type-coercion#RNPRI "examples"). |
| **number** | ﻿Make﻿ will treat the number as milliseconds since Jan 01 1970 (UTC) and convert it to a corresponding date. |
| **other** | ﻿Make﻿ returns a validation error. |

### Examples of date format

* 2016-06-20T17:26:44.356Z

* 2016-06-20 19:26:44 GMT+02:00

* 2016-06-20 19:26+0200

* 2016-06-20 17:26:44

* 2016-06-20

* 2016/06/20 17:26:44

* 2016/06/20 19:26:44+02:00

* 2016/06/20 17:26

* 2016/06/20 5:26 PM

* 2016/06/20

* 06/20/2016 17:26:44

* 06/20/2016 19:26:44+02:00

* 06/20/2016 17:26

* 06/20/2016 5:26 PM

* 06/20/2016

* 20.6.2016 17:26:44

* 20.6.2016 19:26:44+02:00

* 20.6.2016 19:26:44+02:00

* 20.6.2016

## When **Number** is expected:

| **Received** | **Description** |
| --- | --- |
| **number** | The value is handed over unchanged. |
| **text** | ﻿Make﻿ will try to convert the text to a number. If the conversion fails, it will return a validation error. |
| **other** | ﻿Make﻿ returns a validation error. |

## When **Text** is expected:

| **Received** | **Description** |
| --- | --- |
| **text** | The value is handed over unchanged. |
| **array** | If the given array supports conversion to text, the value will be converted. If not, Make﻿ will return a validation error. |
| **collection** | The value is converted to a JSON string. An array of collections is converted separately to a comma-separated list. |
| **boolean** | The value is converted to text (true/false). |
| **buffer** | If text encoding is specified for binary data, the value will be converted to text. If not, Make﻿ will return a validation error |
| **date** | The value is converted to ISO 8601 text. |
| **number** | The value is converted to text. |
| **other** | ﻿Make﻿ returns a validation error. |

## When **Time** is expected:

| **Received** | **Description** |
| --- | --- |
| **time** | The value is handed over unchanged. |
| **text** | ﻿Make﻿ will try to convert time to the hours:minutes:seconds format. If the conversion fails, it will return a validation error. |
| **other** | ﻿Make﻿ returns a validation error. |

﻿

Updated 15 Jan 2026

Did this page help you?

Yes

No

[PREVIOUS

Item data types](/item-data-types "Item data types")[NEXT

Mapping](/mapping "Mapping")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

---
title: "Date | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/block-elements/parameters/date
scraped_at: 2026-04-21T12:44:58.409929Z
description: "Date or date with time (ISO 8601)"
---

1. Block elements chevron-right
2. Parameters

# Date

Date or date with time (ISO 8601)

Dates in the API world can come in different formats:

- One of the ISO-8601 date formats such as 2021-20-01T16:30:20.123Z
- Timestamp , such as 1637988627
- A simple text, such as 2021-01-13 16:30

One of the ISO-8601 date formats such as 2021-20-01T16:30:20.123Z

```
2021-20-01T16:30:20.123Z
```

Timestamp , such as 1637988627

```
Timestamp
```

```
1637988627
```

A simple text, such as 2021-01-13 16:30

```
2021-01-13 16:30
```

No matter what format an API has, Make users should be able to work with a user-friendly format on input and output.

Make stores the inserted dates as a timestamp with milliseconds in a text format and passes them to requests as ISO with milliseconds and universal a time zone YYYY-MM-DDThh:mm:ss.sssZ .

```
YYYY-MM-DDThh:mm:ss.sssZ
```

## hashtag Specification

### hashtag time

- Type: Boolean
- Default: true
- If false , the GUI will only display the date selection.

Type: Boolean

```
Boolean
```

Default: true

```
true
```

If false , the GUI will only display the date selection.

```
false
```

Even if "time": false , the date value will still have the time midnight 0:00 and the time zone of the user, which is then converted to UTC. If the user enters 17. 09. 2025 in the Prague time zone, it will be 2025-09-17T00:00.000+2:00 which is converted to 2025-09-16T22:00:00.000Z .

```
"time": false
```

```
2025-09-17T00:00.000+2:00
```

```
2025-09-16T22:00:00.000Z
```

### hashtag nested

Available types:

array

Provides an array of nested parameters that are shown when the value of the parameter is set (value is not empty).

string

Provides the URL address of an RPC to load a list of nested parameters.

object

Provides a detailed specification of nested parameters.

## hashtag Input parameters

Mappable parameters, which require a date in any format, should allow users to enter a date in a user-friendly manner and their own time zone (e.g. 1. 12. 2021 16:30 ) and also use our keyword now , timestamp , or any built-in date functions.

```
1. 12. 2021 16:30
```

```
now
```

```
timestamp
```

This means that any date formatting/parsing should happen inside the module in the Communication tab, either directly or via an IML function.

## hashtag Example

### hashtag Date and time input

The following example requires two types of dates: createdAt as timestamp , and dueDate as YYYY-MM-DDThh:mm:ss.sssZ (GMT timezone).

```
createdAt
```

```
timestamp
```

```
dueDate
```

```
YYYY-MM-DDThh:mm:ss.sssZ
```

By default, the field accepts date and time.

Notice that the time was entered in Europe/Prague time zone and was parsed to the universal (GMT) time zone.

### hashtag Output parameters

The dates returned by the API should be shown to the users in a user-friendly way, using their time zone and localization settings.

### hashtag Dates with time

Dates with time have to be formatted/parsed to our ISO 8601 format, so it is shown in the output of the module correctly. Make uses ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ .

```
YYYY-MM-DDTHH:mm:ss.sssZ
```

Any other format won't be shown correctly in the output and needs to be parsed in the Communication tab, either directly or using an IML function.

### hashtag Dates without time

Dates without time should have the same format as the API response and be "type":"text" in the Interface because in some cases adding the time (0:00) and the time zone can be counterproductive and change the date due to time zone conversion.

```
"type":"text"
```

### hashtag Direct formatting

In the following example, the API returns two types of dates: createdAt as timestamp , and dueDate as 2020-02-03T17:43:09+0000 .

```
createdAt
```

```
timestamp
```

```
dueDate
```

```
2020-02-03T17:43:09+0000
```

#### hashtag IML Function

- Processing of input parameters: Date parameters
- Processing of output parameters: Parse dates

Processing of input parameters: Date parameters

Processing of output parameters: Parse dates

Last updated 5 months ago

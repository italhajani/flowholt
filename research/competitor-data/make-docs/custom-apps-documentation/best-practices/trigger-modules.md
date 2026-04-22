---
title: "Polling triggers | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/best-practices/trigger-modules
scraped_at: 2026-04-21T12:41:45.207852Z
---

1. Best practices

# Polling triggers

A polling trigger checks for new data in a service account since the last scenario run, based on the scenario's schedule.

The polling trigger sends a request to the service. If new data exists, the scenario runs and you see the data in the module’s output as bundles. If not, you see no bundles.

Use a polling trigger only if the results:

- consist of either a numeric ID or a date as the identifier, or
- the results can be sorted or defaulted in descending order.

consist of either a numeric ID or a date as the identifier, or

the results can be sorted or defaulted in descending order.

Using unordered or asc order in a polling trigger may not work due to a 3200 pagination limit, which could result in the trigger not returning new items.

```
unordered
```

```
asc
```

However, if the API accepts filtering and gets results only after a specified numeric ID or date, this could reduce the number of items.

## hashtag Epoch

The Epoch tab of a polling trigger defines the look of the Choose where to start setting so a user can select a point in the past from where the trigger should start to process data.

Use the limit parameter to restrict the number of results returned in the RPC, to avoid issues should the user have too many objects.

```
limit
```

‌The limit parameter should be a static number that should be equal to, at maximum, 300 or 3 times the number of objects per page.

```
limit
```

The code is missing a limit parameter.

```
limit
```

The code includes a limit parameter.

```
limit
```

## hashtag API endpoint requires from and/or to date parameters

```
from
```

```
to
```

Some API services require date parameters that define the interval of records to be retrieved, for example from and to , fromDate and toDate , etc.

```
date
```

```
from
```

```
to
```

```
fromDate
```

```
toDate
```

In this case, it is important to handle the date parameters correctly.

```
date
```

In this module example, the From and To parameters are required.

```
From
```

```
To
```

Since triggers don't allow mapping/functions, the user has to hardcode the From and To dates. Therefore, Make will always request the same interval of records.

```
From
```

```
To
```

In this module example, there aren't any required From or To fields.

```
From
```

```
To
```

The mapped data.lastDate IML variable is available to the user in the Choose where to start setting, defined in the Epoch tab .

```
data.lastDate
```

The behavior of the supported options:

- From now on - The current date will be sent.
- Since specific date - The date provided will be sent.
- Choose manually - The date of the chosen item will be sent.
- All - The default date 1970-01-01 will be sent.

From now on - The current date will be sent.

Since specific date - The date provided will be sent.

Choose manually - The date of the chosen item will be sent.

All - The default date 1970-01-01 will be sent.

```
1970-01-01
```

Last updated 5 months ago

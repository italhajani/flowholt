---
title: "Analytics | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/analytics
scraped_at: 2026-04-21T12:41:18.298036Z
---

1. API Reference

# Analytics

The following endpoints allow you to get analytics data for your organization. Make uses the analytics data to create analytics dashboards arrow-up-right .

### hashtag Get organization analytics

Gets analytics data for the specified organization. This feature is available only for organizations with the Enterprise plan. You can get analytics data only for organizations where you have the "Owner" organization role. Otherwise, you get the 403 error.

The data entries in the response are sorted by the amount of operations used by a scenario in ascending order. Specify different sorting with the sortBy parameter. You can use query parameters (like timeframe[dateFrom] , timeframe[dateTo] or teamId ) to refine the results and pagination to navigate through a large number of entries.

```
sortBy
```

```
timeframe[dateFrom]
```

```
timeframe[dateTo]
```

```
teamId
```

Make keeps the analytics data for a maximum of one year. One year is also the default time frame for the analytics data you get the response.

- analytics:read

```
analytics:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the organization.

```
11
```

IDs of the teams for which you want to get the analytics data.

```
1
```

```
[1,2,3]
```

IDs of the scenario folders for which you want to get the analytics data.

```
1
```

```
[1,2,3]
```

You can use the status parameter to get analytics data about scenarios with specific scenario statuses. The available scenario statuses are:

```
status
```

- active : scenario is enabled
- inactive : scenario is disabled
- invalid : scenario is disabled due to errors

```
active
```

```
inactive
```

```
invalid
```

```
active
```

```
active
```

```
invalid
```

```
inactive
```

```
["inactive","invalid"]
```

Use the timeframe[dateFrom] parameter to get analytics data from the specified date. Specify the date and time in the ISO 8601 compliant format.

```
timeframe[dateFrom]
```

The default is the date since one year from today. You can't use a date older than a year from today.

```
2020-03-20T05:53:27.368Z
```

Use the timeframe[dateTo] parameter to get analytics data until the specified date. Specify the date and time in the ISO 8601 compliant format.

```
timeframe[dateTo]
```

The default is to get data until today.

```
2020-03-27T05:53:27.368Z
```

The number of entities you want to skip before getting entities you want.

The maximum number of entities you want to get in the response.

The last retrieved key. In response, you get only entries that follow after the key.

```
10
```

Specify which property Make will use to sort the analytics entries in the response. The default is operations .

```
operations
```

```
name
```

```
teamName
```

```
status
```

```
operations
```

```
executions
```

```
errors
```

```
errorRate
```

```
executionsChange
```

```
operationsChange
```

```
errorsChange
```

```
errorRateChange
```

The sorting order. It accepts the ascending and descending direction specifiers.

```
asc
```

```
desc
```

Set to true to get also the total number of analytics entries in the response.

```
true
```

```
true
```

Analytics entries for the specified organization.

Analytics entries for the specified organization.

Last updated 1 day ago

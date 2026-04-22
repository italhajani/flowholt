---
title: "Consumptions | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/scenarios/consumptions
scraped_at: 2026-04-21T12:43:32.086916Z
---

1. API Reference chevron-right
2. Scenarios

# Consumptions

Scenario consumption refers to information about the number of centicredits, operations, and data transfer used by a scenario. The following endpoints retrieve information about your scenario consumption during your current restart period. You can view the end of your current restart period in your dashboard under the Usage reset field.

### hashtag List scenario consumptions

Retrieves a list of scenarios and their current consumption. Make counts the number of consumed centicredits, operations, and transferred data according to your reset period.

If you have a monthly reset period, the response contains a list of scenarios that consumed at least one hundred centicredits (one operation) in the current reset period with their consumption and data transfer..

If you have a yearly reset period, the response contains a list of scenarios that consumed at least one hundred centicredits (one operation) in the last 60 days, or from the last reset if that period is shorter than 60 days.

60 days after the reset the scenario consumptions turn into running totals over the last 60 days.

For example, let's assume that you have a set of scenarios that consume 100000 centicredits (1000 operations) every day. On the 61st day from your last reset, you turn off a scenario that consumes 20000 centicredits (200 operations) every day, reducing your consumption to 80000 centicredits (800 operations) per day.

If you would have the yearly reset period and you would be tracking your scenario consumptions, you would get the following data:

Day

Consumptions

Delta

1

1000

2

2000

1000

3

3000

1000

...

60

60000

1000

61

59800

-200

62

59600

-200

The negative difference between scenario consumptions on the 60th and 61st day happens because on the 61st day, the endpoint doesn't collect data from the first day anymore. Your scenario consumptions contain a total over the time period from the second day until the 61st day.

For billing, Make uses a different system which ensures accurate billing.

Check the parameter lastReset in the response for the timestamp of the start of your current reset period. You can also view the end of your current restart period in your dashboard in the Usage reset field.

```
lastReset
```

Set the organizationId or teamId parameters to limit the results to a specific organization or team.

```
organizationId
```

```
teamId
```

- scenarios:read

```
scenarios:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The unique ID of the team whose scenarios folders will be retrieved.

```
1
```

The ID of the organization.

```
11
```

Retrieved a list of Consumptions

Retrieved a list of Consumptions

Last updated 1 day ago

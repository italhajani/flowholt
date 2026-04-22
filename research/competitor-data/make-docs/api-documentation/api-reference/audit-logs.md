---
title: "Audit logs | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/audit-logs
scraped_at: 2026-04-21T12:41:18.721529Z
---

1. API Reference

# Audit logs

The following endpoints allow you to get the organization and team audit logs and their details.

You can read more about audit logs in our Help Center arrow-up-right .

### hashtag List organization audit logs

Gets a list of all audit log entries for the specified organization.

The audit log entries in the response are sorted by the triggeredAt property in descending order by default. You can use pagination to navigate through a large number of entries.

```
triggeredAt
```

You can get the audit log entries only for organizations in which you have the "Admin" or "Owner" roles. Otherwise, you get the 403 error.

- organization:read

```
organization:read
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

The identification of the teams for which you want to get the audit log entries. You can use either team IDs or team names.

The team name can contain any valid UTF8 symbols and spaces.

```
team 1
```

```
1
```

```
["team 1","team 2"]
```

```
[1,2,3]
```

Use the dateFrom parameter to get audit log entries from the specified date or newer. Specify the date in the YYYY-MM-DD format.

```
dateFrom
```

```
2021-09-23T00:00:00.000Z
```

Use the dateTo parameter to get audit log entries until the specified date or older. Specify the date in the YYYY-MM-DD format.

```
dateTo
```

```
2021-09-24T00:00:00.000Z
```

The list of events for which you want to get audit log entries. To specify multiple events, use the array notation like: GET /audit-logs/organization/{organizationId}?event[0]=key_created&event[1]=connection_created .

```
GET /audit-logs/organization/{organizationId}?event[0]=key_created&event[1]=connection_created
```

You can check the list of supported events with the API call GET /audit-logs/organization/{organizationId}/filters in the events array in the response.

```
GET /audit-logs/organization/{organizationId}/filters
```

```
events
```

```
{"value":["key_created","connection_created"]}
```

```
webhook_disabled
```

```
["webhook_disabled","webhook_updated","webhook_deleted"]
```

The identification of the users for whose actions you want to get the audit log entries. You can use either user IDs or user names.

The user name can contain any valid UTF8 symbols and spaces.

```
author 1
```

```
1
```

```
["author 1","author 2"]
```

```
[1,2,3]
```

The number of entities you want to skip before getting entities you want.

The maximum number of entities you want to get in the response.

The last retrieved key. In response, you get only entries that follow after the key.

```
10
```

Specify the response property values that Make will use to sort the audit log entries in the response. The default is triggeredAt .

```
triggeredAt
```

```
createdAt
```

```
triggeredAt
```

```
eventName
```

```
organization
```

```
team
```

```
actor
```

```
targetId
```

The sorting order. It accepts the ascending and descending direction specifiers.

```
asc
```

```
desc
```

Set to true to get also the total number of audit log entries in the response.

```
true
```

```
true
```

Audit log entries for the specified organization.

Audit log entries for the specified organization.

### hashtag Get organization audit log filters

Gets available audit logs filters for the organization.

You can use the data in the response to filter audit log entries you get from the GET /audit-logs/organization/{organizationId} endpoint.

```
GET /audit-logs/organization/{organizationId}
```

- organization:read

```
organization:read
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

Successfully retrieve of available audit logs filters for the organization

Successfully retrieve of available audit logs filters for the organization

### hashtag List team audit logs

Gets a list of all audit log entries for the specified team.

The audit log entries in the response are sorted by the triggeredAt property in descending order by default. You can use pagination to navigate through a large number of entries.

```
triggeredAt
```

You can get the audit log entries only for teams in which you have the "Team Admin" role. Otherwise, you get the 403 error.

- organization:read

```
organization:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the team.

```
11
```

Use the dateFrom parameter to get audit log entries from the specified date or newer. Specify the date in the YYYY-MM-DD format.

```
dateFrom
```

```
2021-09-23T00:00:00.000Z
```

Use the dateTo parameter to get audit log entries until the specified date or older. Specify the date in the YYYY-MM-DD format.

```
dateTo
```

```
2021-09-24T00:00:00.000Z
```

The list of events for which you want to get audit log entries. To specify multiple events, use the array notation like: GET /audit-logs/team/{teamId}?event[0]=key_created&event[1]=connection_created .

```
GET /audit-logs/team/{teamId}?event[0]=key_created&event[1]=connection_created
```

You can check the list of supported events with the API call GET /audit-logs/team/{teamId}/filters in the events array in the response.

```
GET /audit-logs/team/{teamId}/filters
```

```
events
```

```
{"value":["key_created","connection_created"]}
```

```
webhook_disabled
```

```
["webhook_disabled","webhook_updated","webhook_deleted"]
```

The identification of the users for whose actions you want to get the audit log entries. You can use either user IDs or user names.

The user name can contain any valid UTF8 symbols and spaces.

```
author 1
```

```
1
```

```
["author 1","author 2"]
```

```
[1,2,3]
```

The number of entities you want to skip before getting entities you want.

The maximum number of entities you want to get in the response.

The last retrieved key. In response, you get only entries that follow after the key.

```
10
```

Specify the response property values that Make will use to sort the audit log entries in the response. The default is triggeredAt .

```
triggeredAt
```

```
createdAt
```

```
triggeredAt
```

```
eventName
```

```
organization
```

```
team
```

```
actor
```

```
targetId
```

The sorting order. It accepts the ascending and descending direction specifiers.

```
asc
```

```
desc
```

Set to true to get also the total number of audit log entries in the response.

```
true
```

```
true
```

Audit log entries for the specified team.

Audit log entries for the specified team.

### hashtag Get organization audit log filters

Gets available audit logs filters for the team.

You can use the data in the response to filter audit log entries you get from the GET /audit-logs/team/{teamId} endpoint.

```
GET /audit-logs/team/{teamId}
```

- organization:read

```
organization:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the team.

```
11
```

Successfully retried available audit logs filters for the team

Successfully retried available audit logs filters for the team

### hashtag Get audit log detail

Gets details of the audit log entry with the specified UUID.

- organization:read

```
organization:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The UUID of the audit log entry.

```
c37c7292-35cd-4dc4-9113-21b23beaea7d
```

Successful response

Successful response

Last updated 1 day ago

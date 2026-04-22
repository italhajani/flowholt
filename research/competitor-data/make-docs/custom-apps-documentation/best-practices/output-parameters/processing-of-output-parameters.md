---
title: "Processing of output parameters | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/best-practices/output-parameters/processing-of-output-parameters
scraped_at: 2026-04-21T12:44:18.844527Z
---

1. Best practices chevron-right
2. Output parameters

# Processing of output parameters

## hashtag Response output

A module's response output should be defined for the case when a request is fulfilled successfully. The output definition should not contain error messages (this belongs in the Base section's error handling) nor the additional metadata which may arrive bundled with the actual response information.

No matter the module type, the output shouldn't be defined like this:

The best approach is to return the API response as it is. In many cases, the response varies based on the user who is using the app, as responses can contain different custom fields. If the response returned is unchanged and if all the parameters still aren't described in the output parameters, Make will automatically suggest additional parameters from incoming data.

### hashtag Search modules

### hashtag Action modules

## hashtag Delete unnecessary output data

Your output data might include information related to a backend process. While you may use this information for error handling, for example, it's not necessary to pass this information to another service.

Sending superfluous information might cause confusion. For example, a 'status' value of a task could be easily mistaken for the 'status' of the processing of data.

To avoid confusion, structure your output in a user-friendly format and delete unnecessary output data.

## hashtag Parse dates

You should always parse datetime in the module output with the following exceptions :

- No date, only time. For example, 13:30 .
- No time, only date. For example, 2024-01-01 .
- With both date and time, but no time zone. For example: 2020-06-08 12:37:56 . Exception: If the API documentation specifies that the given datetime is in UTC or some other time zone. Do not use the Make user’s time zone or the Make organization’s time zone, because it may be different from the time zone configured in the third-party services.
- Time stamp in seconds or milliseconds. Exception: If it has a clear indication by its name, in the API documentation or metadata endpoints, that shows such fields are a Date type field. DO NOT try to parse time stamps by assuming a lengthy number must be a time stamp.

No date, only time. For example, 13:30 .

```
13:30
```

No time, only date. For example, 2024-01-01 .

```
2024-01-01
```

With both date and time, but no time zone. For example: 2020-06-08 12:37:56 .

```
2020-06-08 12:37:56
```

- Exception: If the API documentation specifies that the given datetime is in UTC or some other time zone.
- Do not use the Make user’s time zone or the Make organization’s time zone, because it may be different from the time zone configured in the third-party services.

Exception: If the API documentation specifies that the given datetime is in UTC or some other time zone.

Do not use the Make user’s time zone or the Make organization’s time zone, because it may be different from the time zone configured in the third-party services.

Time stamp in seconds or milliseconds.

- Exception: If it has a clear indication by its name, in the API documentation or metadata endpoints, that shows such fields are a Date type field. DO NOT try to parse time stamps by assuming a lengthy number must be a time stamp.

Exception: If it has a clear indication by its name, in the API documentation or metadata endpoints, that shows such fields are a Date type field. DO NOT try to parse time stamps by assuming a lengthy number must be a time stamp.

```
Date
```

### hashtag Examples

#### hashtag Pipedrive

Part of the response from Pipedrive API /activities :

```
/activities
```

API documentation: Date format arrow-up-right from Pipedrive

due_date

```
due_date
```

No

No time, only date.

due_time

```
due_time
```

No

No date, only time.

duration

```
duration
```

No

No date, only time.

add_time

```
add_time
```

Yes

Only date and time with no time zone.

BUT we know it’s UTC.

marked_as_done_time

```
marked_as_done_time
```

Yes

Only date and time with no time zone.

BUT we know it’s UTC.

update_time

```
update_time
```

Yes

Only date and time with no time zone.

BUT we know it’s UTC.

#### hashtag Virtuagym

Part of the response from Virtuagym API /api/v0/activity :

```
/api/v0/activity
```

timestamp_edit

```
timestamp_edit
```

Yes

Timestamp in seconds with clear indication by it’s name.

timestamp

```
timestamp
```

Yes

Timestamp in seconds with clear indication by it’s name.

## hashtag Flatten nested outputs

Deeply nested outputs result in undesirable UX when the user maps the values.

Consider:

- creating a mappable version of the key-value pairs, and
- flattening unnecessary nested collections.

creating a mappable version of the key-value pairs, and

flattening unnecessary nested collections.

See an additional example of implementing dynamic mappable parameters using a custom IML function .

Last updated 5 months ago

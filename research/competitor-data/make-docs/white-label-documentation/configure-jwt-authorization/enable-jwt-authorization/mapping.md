---
title: "Mapping | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/configure-jwt-authorization/enable-jwt-authorization/mapping
scraped_at: 2026-04-21T12:42:53.036292Z
---

1. Configure JWT authorization chevron-right
2. Enable JWT authorization

# Mapping

To enable JWT authorization to perform the above tasks, you need to map the values of your JWT payload so your instance can extract the relevant data.

You can map the decrypted JWT content by using the payload keyword. Also, body , headers , and query are available for mapping via the corresponding keywords.

```
payload
```

```
body
```

```
headers
```

```
query
```

In the configuration field, you need to map your values using IML, a templating language used by Make. You can use the following pattern:

{{payload.yourParameterName}}

```
{{payload.yourParameterName}}
```

The following are examples of IML mapping for the fields in the JWT configuration section:

### hashtag User

externalID

{{payload.userId}}

email

{{payload.userEmail}}

name

{{payload.userName}}

country

{{payload.country}}

Note: Countries must conform to ISO 3166-1 arrow-up-right .

timezone

{{payload.tz}}

Note: Time zones must conform to the tz database arrow-up-right .

locale

{{payload.userLocale}}

language

{{payload.lang}}

### hashtag Organization

externalId

{{payload.organizationId}}

name

{{payload.orgName}}

timezone

{{payload.orgName}}

timezone

{{payload.tz}}

### hashtag Team

externalId

{{payload.teamId}}

name

{{payload.teamName}}

The following are examples of IML mapping for the fields in the JWT configuration section:

### hashtag Custom contexts

In case you need to provide custom context to RPCs and Accounts based on the JWT token payload, you can add context keys. Once mapped, the context is then available as environment.context in AccountWorkers and RPCWorkers. You map values with IML the same way for custom contexts as you did for users, organizations, and teams. See the example of a custom base domain following the procedure.

```
environment.context
```

The following procedure creates a custom context:

1. Click + Add item .
2. In the property field, enter the internal Make parameter you want to map.
3. In the value field, map the payload parameter value you want extracted.
4. Click Save in the lower right corner.

Click + Add item .

In the property field, enter the internal Make parameter you want to map.

In the value field, map the payload parameter value you want extracted.

Click Save in the lower right corner.

Your custom context is now available as environment.context in AccountWorkers and RPCWorkers.

```
environment.context
```

### hashtag Example: A custom base domain

In this example, your JWT payload contains a custom base domain that you need for creating new accounts.

Use the following property and value to map the custom base domain:

- property: teamdomain
- value: {{payload.customBaseDomain}}

property: teamdomain

```
teamdomain
```

value: {{payload.customBaseDomain}}

```
{{payload.customBaseDomain}}
```

Last updated 1 year ago

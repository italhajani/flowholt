---
title: "Release 2024.04 | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/release-notes/release-2024.04
scraped_at: 2026-04-21T12:42:30.868232Z
---

1. Release notes

# Release 2024.04

## hashtag Current software version numbers

The following is a list of current software versions running in Make's release environment. You can also find announcements of planned updates and upcoming end-of-life support for specific versions here.

### hashtag Containerization

Docker CE

24.0.6

-

Kubernetes

1.25

-

### hashtag Databases

PostgreSQL

13.8

-

Redis

v6.2.10

-

MongoDB Cloud

5.0.24

-

ElasticSearch

7.17.15

-

### hashtag Message Queues

RabbitMQ

3.11.18

-

Erlang

25.3

-

### hashtag Filesystem

NFS

4.1

-

### hashtag Current service version numbers

The following are the current version numbers for services. You can verify them in your instance by going to Administration > Monitoring .

accman

```
accman
```

v2.15.1

Yes

apps-processor

```
apps-processor
```

v2.3.0

-

aws-rds-log-reader

```
aws-rds-log-reader
```

v1.0.2

-

agency

```
agency
```

4.0-beta

-

broker

```
broker
```

6.1.1

Yes

cron

```
cron
```

v1.0.14

-

datadog-agent

```
datadog-agent
```

7.40.1

-

datadog-cluster-agent

```
datadog-cluster-agent
```

7.40.1

-

db-updater

```
db-updater
```

v1.5.71

Yes

elasticsearch

```
elasticsearch
```

7.17.15

-

emails-processor

```
emails-processor
```

v2.5.1

-

engine

```
engine
```

v4.3.0

Yes

gateway

```
gateway
```

3.6.2

Yes

ipm-server

```
ipm-server
```

v3.21.2

Yes

ipm-service

```
ipm-service
```

v1.1.0

-

kibana

```
kibana
```

7.17.15

-

mongo

```
mongo
```

4.4.1

-

nginx

```
nginx
```

v1.22.1

-

notifications-processor

```
notifications-processor
```

v2.2.0

-

overseer

```
overseer
```

4.3.0

-

recycler

```
recycler
```

v2.2.1

-

redis

```
redis
```

v6.2.10.1

-

renderer-processor

```
renderer-processor
```

v3.2.0

-

scheduler

```
scheduler
```

v4.3.0

Yes

trackman

```
trackman
```

v2.6.0

-

trigger

```
trigger
```

2.2.0

-

web-api

```
web-api
```

v4.31.0-hotfix-2

Yes

web-streamer

```
web-streamer
```

5.4.2

-

web-zone

```
web-zone
```

v4.47.0

Yes

## hashtag Public-facing changes

### hashtag Improvements and changes

- Managing and rotating arrow-up-right SAML service provider (SP) certificates became easier for the Enterprise customers. Organization owners can now activate, deactivate, copy, and download SP certificates within the SSO settings. They can also see which certificates are active. When it's time to rotate certificates, users will receive a notification from Make, giving them time to schedule the switch and minimize downtime. Additionally, we’ve extended the validity of SP certificates to three years, instead of just one. To learn more, check out our SAML certificate management arrow-up-right article.
- We've updated the banners that let you know when you've reached your operations limit. Now, when you see one of these banners, you'll get all the details about your upgrade options right there. If you decide to upgrade or purchase more operations, you can just click the link in the banner.

Managing and rotating arrow-up-right SAML service provider (SP) certificates became easier for the Enterprise customers. Organization owners can now activate, deactivate, copy, and download SP certificates within the SSO settings. They can also see which certificates are active. When it's time to rotate certificates, users will receive a notification from Make, giving them time to schedule the switch and minimize downtime. Additionally, we’ve extended the validity of SP certificates to three years, instead of just one. To learn more, check out our SAML certificate management arrow-up-right article.

We've updated the banners that let you know when you've reached your operations limit. Now, when you see one of these banners, you'll get all the details about your upgrade options right there. If you decide to upgrade or purchase more operations, you can just click the link in the banner.

### hashtag Fixed issues

- Custom functions sometimes took too long to finish, which caused an error and disabled your scenario. We reviewed the timeout settings on custom functions. Before using custom functions, check the limits arrow-up-right .
- Webhooks migrated from the Integromat platform sometimes returned a ConnectionError . We fixed the issue so your legacy webhooks remain stable.
- In some cases, domain verification did not work for SSO domain claim. Verification now works as expected.
- Sharable links to templates went to the organization dashboard. These links now go directly to the specific template.
- Switching from one team to another sometimes resulted in an error message. Navigating to a different team now works just fine.
- Clicking the Details button in the webhook queue resulted in an error. We fixed it, so you can see all the data that webhooks received.
- Make built-in functions that use timezone information, like the addDays function, didn’t work in custom functions. We fixed the custom function’s context, so now you can use the date functions in your custom functions.

Custom functions sometimes took too long to finish, which caused an error and disabled your scenario. We reviewed the timeout settings on custom functions. Before using custom functions, check the limits arrow-up-right .

Webhooks migrated from the Integromat platform sometimes returned a ConnectionError . We fixed the issue so your legacy webhooks remain stable.

```
ConnectionError
```

In some cases, domain verification did not work for SSO domain claim. Verification now works as expected.

Sharable links to templates went to the organization dashboard. These links now go directly to the specific template.

Switching from one team to another sometimes resulted in an error message. Navigating to a different team now works just fine.

Clicking the Details button in the webhook queue resulted in an error. We fixed it, so you can see all the data that webhooks received.

Make built-in functions that use timezone information, like the addDays function, didn’t work in custom functions. We fixed the custom function’s context, so now you can use the date functions in your custom functions.

```
addDays
```

Last updated 1 year ago

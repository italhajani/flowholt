---
title: "Release 2024.11 | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/release-notes/release-2024.11
scraped_at: 2026-04-21T12:42:28.128773Z
---

1. Release notes

# Release 2024.11

## hashtag Current software version numbers

The following is a list of current software versions running in Make's release environment. You can also find announcements of planned updates and upcoming end-of-life support for specific versions here.

### hashtag Containerization

Docker CE

24.0.6

-

Kubernetes

1.28

-

### hashtag Databases

PostgreSQL

15.5

-

Redis

v6.2.10

-

MongoDB Cloud

5.0

-

ElasticSearch

7.17.15

-

### hashtag Message Queues

RabbitMQ

3.13.7

Yes

Erlang

26.2

Yes

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

2.16.7

Yes

apps-processor

```
apps-processor
```

v2.4.2

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

6.3.5

Yes

cron

```
cron
```

v1.0.15

Yes

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

v1.5.78

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

v2.9.0

Yes

engine

```
engine
```

v4.9.3

Yes

gateway

```
gateway
```

3.8.12

Yes

imt-auditman

```
imt-auditman
```

1.0.3

-

ipm-server

```
ipm-server
```

v3.28.0

Yes

ipm-service

```
ipm-service
```

v1.3.0

Yes

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

5.0

-

mongo-auto-indexer

```
mongo-auto-indexer
```

master

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

v2.5.0

-

overseer

```
overseer
```

4.4.0

-

recycler

```
recycler
```

v4.9.3

Yes

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

v3.2.2

Yes

scheduler

```
scheduler
```

v4.9.3

Yes

trackman

```
trackman
```

v2.11.0

-

trigger

```
trigger
```

2.5.2

-

web-api

```
web-api
```

v5.14.0-hotfix-1

Yes

web-streamer

```
web-streamer
```

5.8.1

Yes

web-zone

```
web-zone
```

v4.61.0-hotfix-1

Yes

We are excited to introduce imt-auditman service, now available as v1.0.3. This new service offers valuable functionality by making Audit Logs arrow-up-right available to private.

```
imt-auditman
```

## hashtag Public-facing changes

### hashtag Improvements and changes

- As an increased security measure, we’ve updated our process for deleting an account. Now, if you’d like to delete your account, you’ll be asked to provide the same level of verification that is required for administering your account. For example, if you have 2FA enabled, that will be required for deleting an account.
- It’s now possible to add or change your payment method on the Subscriptions page. You can still add your payment method from the Organization settings dropdown as well.
- We’ve added a new section in the organization dashboard: now you can monitor all your scenarios that Make automatically disabled due to some error appeared in a scenario.

As an increased security measure, we’ve updated our process for deleting an account. Now, if you’d like to delete your account, you’ll be asked to provide the same level of verification that is required for administering your account. For example, if you have 2FA enabled, that will be required for deleting an account.

It’s now possible to add or change your payment method on the Subscriptions page. You can still add your payment method from the Organization settings dropdown as well.

We’ve added a new section in the organization dashboard: now you can monitor all your scenarios that Make automatically disabled due to some error appeared in a scenario.

### hashtag Fixed issues

- Users rarely couldn’t see the operation usage in their organization dashboards. This is fixed now.
- Under specific conditions, the polling trigger starting point could reset to the original setting when you created the trigger. We fixed the issue, so the polling trigger metadata are always correct.
- When the HTTP module returned invalid Unicode characters after you ran the scenario manually, you couldn’t save the scenario. This is no longer happening.

Users rarely couldn’t see the operation usage in their organization dashboards. This is fixed now.

Under specific conditions, the polling trigger starting point could reset to the original setting when you created the trigger. We fixed the issue, so the polling trigger metadata are always correct.

When the HTTP module returned invalid Unicode characters after you ran the scenario manually, you couldn’t save the scenario. This is no longer happening.

#### hashtag Apps updates

New apps:

- Skai arrow-up-right - With a new Skai app, you can configure a report and run it, as well as download a report file.

Skai arrow-up-right - With a new Skai app, you can configure a report and run it, as well as download a report file.

Updated apps:

- Bigin by Zoho CRM arrow-up-right - Deals are now called Pipelines in Bigin by Zoho CRM. Our modules have been updated to match this change.
- LinkedIn Offline Conversions arrow-up-right - The app is called LinkedIn Conversions API and now includes a new module, Send Conversion Events. Additionally, we added a new connection type that allows connecting via OpenID Connect for enhanced security.

Bigin by Zoho CRM arrow-up-right - Deals are now called Pipelines in Bigin by Zoho CRM. Our modules have been updated to match this change.

LinkedIn Offline Conversions arrow-up-right - The app is called LinkedIn Conversions API and now includes a new module, Send Conversion Events. Additionally, we added a new connection type that allows connecting via OpenID Connect for enhanced security.

Last updated 10 months ago

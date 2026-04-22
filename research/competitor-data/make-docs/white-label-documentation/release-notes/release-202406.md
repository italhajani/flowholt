---
title: "Release 2024.06 | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/release-notes/release-2024.06
scraped_at: 2026-04-21T12:42:31.629178Z
---

1. Release notes

# Release 2024.06

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

5.0.26

Yes

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

v2.15.2

-

apps-processor

```
apps-processor
```

v2.4.0

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

6.3.1

-

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

v1.5.73

-

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

v2.7.0

-

engine

```
engine
```

v4.5.2

Yes

gateway

```
gateway
```

3.8.0

-

ipm-server

```
ipm-server
```

v3.23.0

Yes

ipm-service

```
ipm-service
```

v1.2.1

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

4.4.1

-

mongo-auto-indexer

```
mongo-auto-indexer
```

v1.0.0

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

v2.4.0

Yes

overseer

```
overseer
```

4.4.0

Yes

recycler

```
recycler
```

v4.5.2

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

v3.2.0

-

scheduler

```
scheduler
```

v4.5.2

Yes

trackman

```
trackman
```

v2.8.0

-

trigger

```
trigger
```

2.2.1

-

web-api

```
web-api
```

v5.2.0-hotfix-1

Yes

web-streamer

```
web-streamer
```

5.5.0

-

web-zone

```
web-zone
```

v4.51.3

Yes

## hashtag Public-facing changes

### hashtag Improvements and changes

- We’ve added a small but important improvement to the Users tab. Now you can filter users by their role at both organization and team levels. Simply click on the filter icon and select the role that you would like to see in the list.

We’ve added a small but important improvement to the Users tab. Now you can filter users by their role at both organization and team levels. Simply click on the filter icon and select the role that you would like to see in the list.

### hashtag Fixed issues

- Recently, when searching for modules in the scenario editor, the Instant tag was missing from instant triggers and they were mistakenly labeled as ACID (polling) triggers. This issue has been resolved, and it now works as expected.

Recently, when searching for modules in the scenario editor, the Instant tag was missing from instant triggers and they were mistakenly labeled as ACID (polling) triggers. This issue has been resolved, and it now works as expected.

### hashtag Apps updates

#### hashtag New apps:

- Google Search Console arrow-up-right - This app provides additional online marketing support to monitor and troubleshoot your website’s Google Search results.
- Flodesk arrow-up-right - This app allows users to create visually engaging emails for designing and managing email marketing campaigns.

Google Search Console arrow-up-right - This app provides additional online marketing support to monitor and troubleshoot your website’s Google Search results.

Flodesk arrow-up-right - This app allows users to create visually engaging emails for designing and managing email marketing campaigns.

For more details, go to our public release notes arrow-up-right .

Last updated 1 year ago

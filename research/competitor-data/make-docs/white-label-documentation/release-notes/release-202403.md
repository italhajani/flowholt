---
title: "Release 2024.03 | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/release-notes/release-2024.03
scraped_at: 2026-04-21T12:42:31.995567Z
---

1. Release notes

# Release 2024.03

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

v2.12.0

-

apps-processor

```
apps-processor
```

v2.3.0

Yes

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

6.1.0

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

v1.5.70

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

v3.9.2

-

gateway

```
gateway
```

3.4.17

-

ipm-server

```
ipm-server
```

v3.20.0

-

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

v2.10.3

-

trackman

```
trackman
```

v2.6.0

Yes

trigger

```
trigger
```

2.2.0

Yes

web-api

```
web-api
```

v4.29.0

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

v4.45.4

Yes

## hashtag Public-facing changes

### hashtag Improvements and changes

- Using templates to create scenarios is now much easier and more flexible. We added an X icon that allows you to easily close the module settings. This means you can now open and set up modules in any order you prefer.
- We introduced badges for each module to make sure you don't miss any important information: A green badge indicates that all required fields are filled in. An orange badge signals that you need to provide some additional information. A gray badge reminds you that you still need to get started with setting up the module.
- Filters also now have setup status badges: Checkmark means that your filter is set up and ready. Asterisk means that your filter has unsaved changes.
- Once you complete the setup and all your badges turn green, you will see a side panel that gives you the option to run, edit, or schedule your scenario.

Using templates to create scenarios is now much easier and more flexible.

- We added an X icon that allows you to easily close the module settings. This means you can now open and set up modules in any order you prefer.

We added an X icon that allows you to easily close the module settings. This means you can now open and set up modules in any order you prefer.

We introduced badges for each module to make sure you don't miss any important information:

- A green badge indicates that all required fields are filled in.
- An orange badge signals that you need to provide some additional information.
- A gray badge reminds you that you still need to get started with setting up the module.

A green badge indicates that all required fields are filled in.

An orange badge signals that you need to provide some additional information.

A gray badge reminds you that you still need to get started with setting up the module.

Filters also now have setup status badges:

- Checkmark means that your filter is set up and ready.
- Asterisk means that your filter has unsaved changes.

Checkmark means that your filter is set up and ready.

Asterisk means that your filter has unsaved changes.

Once you complete the setup and all your badges turn green, you will see a side panel that gives you the option to run, edit, or schedule your scenario.

### hashtag Fixed issues

- In some cases, it was not possible to remove users from a deleted organization. You can now remove users from any organization as expected.
- If a scenario contained an iterator followed by an aggregator, sometimes it would get stuck when processing a large number of bundles. The scenario then failed to create scenario logs. Now scenarios run smoothly and create scenario logs.
- Switching from one team to another sometimes resulted in an error message. Navigating to a different team now works normally.
- Custom functions sometimes took too long to finish, which caused an error and disabled your scenario. We reviewed the timeout settings on custom functions. Before using custom functions, try to measure or evaluate how long they run before using them in production.

In some cases, it was not possible to remove users from a deleted organization. You can now remove users from any organization as expected.

If a scenario contained an iterator followed by an aggregator, sometimes it would get stuck when processing a large number of bundles. The scenario then failed to create scenario logs. Now scenarios run smoothly and create scenario logs.

Switching from one team to another sometimes resulted in an error message. Navigating to a different team now works normally.

Custom functions sometimes took too long to finish, which caused an error and disabled your scenario. We reviewed the timeout settings on custom functions. Before using custom functions, try to measure or evaluate how long they run before using them in production.

Last updated 1 year ago

---
title: "Release 2024.01 | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/release-notes/release-2024.01
scraped_at: 2026-04-21T12:42:08.857999Z
---

1. Release notes

# Release 2024.01

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

4.4.26

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

v2.2.11

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

6.0.0

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

v1.5.66

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

v2.5.0

-

engine

```
engine
```

v3.9.1

-

gateway

```
gateway
```

3.4.15

-

ipm-server

```
ipm-server
```

v3.19.0

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

v2.1.1

-

overseer

```
overseer
```

4.2.0

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

v2.5.1

-

trigger

```
trigger
```

2.1.4

-

web-api

```
web-api
```

v4.23.0-hotfix-1

-

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

v4.40.0

-

## hashtag Public facing changes

- Previously, when users reduced the number of settings in the module settings window, it didn't automatically adjust its size. But now, the window shrinks based on the number of settings you have.
- When users searched for an app to add to the Favorites list, the search didn't show results. We fixed it: users can search for an app and get relevant results.
- After users tried to resolve the Incomplete execution, the diagram didn't load. This UX issue doesn't exist anymore.
- fter users deleted a custom variable, an incorrect warning message popped up when you tried to save the scenario.
- The Auto-align feature refused to align all modules in scenarios. Currently, it aligns all modules in the scenario.
- When signing in with SSO, Enter did not always work. It's fixed so you can stay on your keyboard when logging in and not bother with clicking.
- In some cases, the list of organization members did not immediately update after inviting a new member. Invited members now appear as expected.

Previously, when users reduced the number of settings in the module settings window, it didn't automatically adjust its size. But now, the window shrinks based on the number of settings you have.

When users searched for an app to add to the Favorites list, the search didn't show results. We fixed it: users can search for an app and get relevant results.

After users tried to resolve the Incomplete execution, the diagram didn't load. This UX issue doesn't exist anymore.

fter users deleted a custom variable, an incorrect warning message popped up when you tried to save the scenario.

The Auto-align feature refused to align all modules in scenarios. Currently, it aligns all modules in the scenario.

When signing in with SSO, Enter did not always work. It's fixed so you can stay on your keyboard when logging in and not bother with clicking.

In some cases, the list of organization members did not immediately update after inviting a new member. Invited members now appear as expected.

Last updated 1 year ago

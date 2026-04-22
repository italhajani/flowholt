---
title: "Release 2024.02 | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/release-notes/release-2024.02
scraped_at: 2026-04-21T12:42:32.697588Z
---

1. Release notes

# Release 2024.02

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

6.1.0

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

v1.5.68

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

Yes

engine

```
engine
```

v3.9.2

Yes

gateway

```
gateway
```

3.4.17

Yes

ipm-server

```
ipm-server
```

v3.20.0

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

Yes

overseer

```
overseer
```

4.3.0

Yes

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

v2.5.2

Yes

trigger

```
trigger
```

2.1.5

Yes

web-api

```
web-api
```

v4.26.0-hotfix-1

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

v4.42.4

Yes

## hashtag Public-facing changes

### hashtag Custom scenario properties

Custom scenario properties let your users add customized metadata to organize their scenarios. For example, they can use this feature to add client emails, URLs, or any other information to a scenario and use it to filter and sort scenarios. You can find more details in our public documentation of this feature arrow-up-right .

You can enable custom scenario properties by following the general procedure in the Customize user access to features article arrow-up-right . Use the license parameter customProperties . For users to access this feature, the parameter value must be higher than 0.

```
customProperties
```

### hashtag Dynamic connections

Dynamic connections allow users to use their connections as scenario inputs arrow-up-right . For example, a user creates a scenario with a dynamic connection. Other users with access to the scenario can input their connections instead of the original connections to run the scenario. To learn more about dynamic connections, check out the article in our public Help Center arrow-up-right .

You can enable dynamic connections by following the general procedure in the Customize user access to features arrow-up-right article. Use the following license parameters: dynamicDependencies and dynamicConnections .

```
dynamicDependencies
```

```
dynamicConnections
```

### hashtag Improvements and changes

- You can now get shared webhook URLs for apps directly in the native apps administration. Check the dedicated section arrow-up-right in the apps management.
- A link to Make Community arrow-up-right now appears in the sidebar Help submenu.

You can now get shared webhook URLs for apps directly in the native apps administration. Check the dedicated section arrow-up-right in the apps management.

A link to Make Community arrow-up-right now appears in the sidebar Help submenu.

### hashtag Fixed issues

- The list of users for both organizations and teams only displayed 10 users. User lists now include all members.
- It wasn't possible to delete records in a webhook queue: the Delete button wasn't clickable.
- The infinite scroll in the scenario history wasn't infinite: it got stuck and didn't show all records. Now you have access to the full history.
- The hints for creating names of custom functions and scenario inputs were incorrect. The hints now show the correct requirements for custom function and scenario inputs names.
- Doubled and unaligned texts appeared when you clicked the Create a connection button. We solved it, so you have beautifully aligned and correct texts.
- When you tried to resolve incomplete executions, the Run once button wasn't clickable. Also, a module that caused an error lost its mapping. We fixed both issues.
- Mapping pills showed their raw name. Pills now have descriptive names.
- When you ran the Explain flow option and then deleted one or more modules, the dot showing the flow was stuck. We unfroze the dot, and now it shows the full flow (and takes into account the deleted modules).
- On Administration > Roles , the toggle buttons did not load properly. These buttons now appear and behave normally. Only users with the SA role can edit instance-level permissions.

The list of users for both organizations and teams only displayed 10 users. User lists now include all members.

It wasn't possible to delete records in a webhook queue: the Delete button wasn't clickable.

The infinite scroll in the scenario history wasn't infinite: it got stuck and didn't show all records. Now you have access to the full history.

The hints for creating names of custom functions and scenario inputs were incorrect. The hints now show the correct requirements for custom function and scenario inputs names.

Doubled and unaligned texts appeared when you clicked the Create a connection button. We solved it, so you have beautifully aligned and correct texts.

When you tried to resolve incomplete executions, the Run once button wasn't clickable. Also, a module that caused an error lost its mapping. We fixed both issues.

Mapping pills showed their raw name. Pills now have descriptive names.

When you ran the Explain flow option and then deleted one or more modules, the dot showing the flow was stuck. We unfroze the dot, and now it shows the full flow (and takes into account the deleted modules).

On Administration > Roles , the toggle buttons did not load properly. These buttons now appear and behave normally. Only users with the SA role can edit instance-level permissions.

```
SA
```

Last updated 1 year ago

---
title: "Release 2024.12 | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/release-notes/release-2024.12
scraped_at: 2026-04-21T12:42:24.935052Z
---

1. Release notes

# Release 2024.12

## hashtag Current software version numbers

The following is a list of current software versions running in Make's release environment. You can also find announcements of planned updates and upcoming end-of-life support for specific versions here.

### hashtag Containerization

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

7.0

Yes

ElasticSearch

7.17.15

-

### hashtag Message Queues

RabbitMQ

3.13.7

-

Erlang

26.2

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

2.16.10

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

6.3.9

Yes

cron

```
cron
```

v1.0.15

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

v1.5.79

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

-

engine

```
engine
```

v4.10.1

Yes

gateway

```
gateway
```

3.11.0

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

-

ipm-service

```
ipm-service
```

v1.3.0

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

7.0

Yes

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

4.5.0

Yes

redis

```
redis
```

v6.2.10

-

renderer-processor

```
renderer-processor
```

v3.2.2

-

scheduler

```
scheduler
```

v4.10.1

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

2.5.5

Yes

web-api

```
web-api
```

v5.15.0-hotfix.3

Yes

web-streamer

```
web-streamer
```

5.8.5

Yes

web-zone

```
web-zone
```

v4.62.0

Yes

## hashtag Public-facing changes

### hashtag Improvements and changes

- We revamped the toolbar in our scenario editor! We have made numerous visual and functionality improvements, like moving the Run once button into the toolbar or making the toolbar expandable. Read more about the new toolbar here arrow-up-right .

We revamped the toolbar in our scenario editor! We have made numerous visual and functionality improvements, like moving the Run once button into the toolbar or making the toolbar expandable. Read more about the new toolbar here arrow-up-right .

- The subscenarios arrow-up-right are have left the closed beta and are now available to users in organizations with the Teams or Enterprise plan.
- The custom IML function for developing custom apps has been re-enabled! It was disabled because of security reasons, and is now available again.
- We are migrating the existing custom apps to the new technology in batches, so it might take time until you can edit a custom IML function in an already existing custom app. You can read more about the re-enablement here.

The subscenarios arrow-up-right are have left the closed beta and are now available to users in organizations with the Teams or Enterprise plan.

The custom IML function for developing custom apps has been re-enabled! It was disabled because of security reasons, and is now available again.

We are migrating the existing custom apps to the new technology in batches, so it might take time until you can edit a custom IML function in an already existing custom app. You can read more about the re-enablement here.

### hashtag Fixed issues

- We fixed a bug that was causing an error when multiple scenarios were called in an array using the scenario ID. Now, multiple scenario ID values are passed in the scenario URL.

We fixed a bug that was causing an error when multiple scenarios were called in an array using the scenario ID. Now, multiple scenario ID values are passed in the scenario URL.

### hashtag Documentation updates

- Types of modules arrow-up-right - We've updated the article to include complete information on each module type, along with their features and ways of usage. The advanced tips section offers expert users new tricks and examples for working with modules.
- Make Public API Documentation - We published the documentation for the keys API. You can check it out on our Developer Portal arrow-up-right .

Types of modules arrow-up-right - We've updated the article to include complete information on each module type, along with their features and ways of usage. The advanced tips section offers expert users new tricks and examples for working with modules.

Make Public API Documentation - We published the documentation for the keys API. You can check it out on our Developer Portal arrow-up-right .

### hashtag Apps updates

New apps:

- Schogini Image Wizard arrow-up-right - Easily edit images with the new Schogini Image Wizard app, allowing you to blur, resize, rotate, and more, all within Make.
- Poper arrow-up-right - Watch new leads in your Poper account using the new app in Make.

Schogini Image Wizard arrow-up-right - Easily edit images with the new Schogini Image Wizard app, allowing you to blur, resize, rotate, and more, all within Make.

Poper arrow-up-right - Watch new leads in your Poper account using the new app in Make.

Updated apps:

- SAP ECC Agent arrow-up-right - We’ve created a custom function that lets you apply padding to any values across all SAP ECC Agent modules.
- MailerSend arrow-up-right - Starting November 1, MailerSend has made changes that affect all modules. Check out the article and take the necessary steps to ensure smooth work with MailerSend.
- Anthropic Claude arrow-up-right - There is a new Make an API Call module for Anthropic Claude.

SAP ECC Agent arrow-up-right - We’ve created a custom function that lets you apply padding to any values across all SAP ECC Agent modules.

MailerSend arrow-up-right - Starting November 1, MailerSend has made changes that affect all modules. Check out the article and take the necessary steps to ensure smooth work with MailerSend.

Anthropic Claude arrow-up-right - There is a new Make an API Call module for Anthropic Claude.

Last updated 1 year ago

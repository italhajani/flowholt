---
title: "Release 2025.06 | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/release-notes/release-2025.06
scraped_at: 2026-04-21T12:42:19.373725Z
---

1. Release notes

# Release 2025.06

## hashtag Current software version numbers

The following is a list of current software versions running in Make's release environment. You can also find announcements of planned updates and upcoming end-of-life support for specific versions here.

### hashtag Containerization

Kubernetes

1.33

Yes

### hashtag Databases

PostgreSQL

15.12

-

Redis

v6.2.16

-

MongoDB Cloud

7.0

-

ElasticSearch

7.17.15

-

### hashtag Message Queues

RabbitMQ

3.13.7.1

Yes

Erlang

26.2.5.11

Yes

### hashtag Filesystem

NFS

4.1

-

The following are the current version numbers for services. You can verify them in your instance by going to Administration > Monitoring .

accman

```
accman
```

f54c9fba8d9856b5d6304517b3871fe4ff294b75

Yes

apps-processor

```
apps-processor
```

v2.4.3

-

agency

```
agency
```

4.0-beta

-

aws-rds-log-reader

```
aws-rds-log-reader
```

v1.1.1

Yes

broker

```
broker
```

2acbedef60afa6be8a3bab0139bdb4e1c651f7e7

Yes

broker-gw-logger

```
broker-gw-logger
```

2acbedef60afa6be8a3bab0139bdb4e1c651f7e7

Yes

cron

```
cron
```

v1.1.0

Yes

datadog-agent

```
datadog-agent
```

7.63.3

-

datadog-cluster-agent

```
datadog-cluster-agent
```

7.63.3

-

db-updater

```
db-updater
```

1346627ccc53a5a06070d93d0a4493ebdffdfbcf

Yes

emails-processor

```
emails-processor
```

14147969a6259d0969168433927553803fc9cf01

Yes

engine

```
engine
```

9c0da38-20250708

Yes

gateway

```
gateway
```

7ca2bbd95a216a4adb17844d3add1113edd47ad6

Yes

imt-auditman

```
imt-auditman
```

1.7.0

Yes

ipm-server

```
ipm-server
```

3.46.0

Yes

ipm-service

```
ipm-service
```

1.9.1

Yes

kibana

```
kibana
```

7.17.15

-

lickman

```
lickman
```

3de28dd5893d647a28260e51c058a79f95623a79

-

make-apps-processor

```
make-apps-processor
```

1.4.0

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

v1.27.4

-

notifications-processor

```
notifications-processor
```

d53c36e858f2d9fdb5be7d64b610d26405a80d62

Yes

overseer

```
overseer
```

b677aa22c364c453d590c057a526c03598e8c16f

Yes

renderer-processor

```
renderer-processor
```

b4b9a3b8c861532a1342f041c6d2edf7e0643d00

Yes

roleman

```
roleman
```

6f52b202697237178ec66a211ded5db2e25d6d36

Yes

scheduler

```
scheduler
```

9c0da38-20250708

Yes

trackman

```
trackman
```

2.17.1

-

trigger

```
trigger
```

06d5ee367beec935c40c6c10c31ec1400b00c08e

Yes

web-api

```
web-api
```

hot-fix-3-2025-6

Yes

web-streamer

```
web-streamer
```

b84110f1a5ba7b0d5faee2a837ca0a682271049b

Yes

web-zone

```
web-zone
```

2025.06-1

Yes

zone-assets-server

```
zone-assets-server
```

2025.06

Yes

## hashtag New service: Lickman

We're introducing a new service designed to manage lifecycle of licenses and provides the system with the ability to respond to changes in organization licenses and license parameters.

What it does: Lickman manages the available license parameters recognized by the system.

What's coming: In an upcoming release, we'll deploy the Lickman service to your environments. Here are the key aspects:

- The Lickman service will be installed and ready for use.
- Changes to the licenses will continue operate normally.
- Service-to-service communication for Lickman will be activated in this release.
- There will not be any data migration other than automatic bootstrap.

The Lickman service will be installed and ready for use.

Changes to the licenses will continue operate normally.

Service-to-service communication for Lickman will be activated in this release.

There will not be any data migration other than automatic bootstrap.

Why this matters: This update is required . Deploying Lickman is requisite for keeping the licenses in healthy state.

#### hashtag Resource allocation

The Lickman has the following memory configuration:

- Requested memory: 128Mi This is the minimum amount of memory the service needs to start and run.
- Memory limit: 256Mi This is the maximum amount of memory the service is allowed to use.

Requested memory: 128Mi

```
128Mi
```

This is the minimum amount of memory the service needs to start and run.

Memory limit: 256Mi

```
256Mi
```

This is the maximum amount of memory the service is allowed to use.

## hashtag Public-facing changes

#### hashtag New apps

- Pictory arrow-up-right - This AI-powered platform enables you to create and edit engaging videos quickly and easily. You can manage transcriptions, summaries, and video generation in your Pictory account using this new app.
- Postiz arrow-up-right - This open-source social media tool lets you create, update, and delete posts, upload files, and retrieve post data from your Postiz account—directly within your scenarios.

Pictory arrow-up-right - This AI-powered platform enables you to create and edit engaging videos quickly and easily. You can manage transcriptions, summaries, and video generation in your Pictory account using this new app.

Postiz arrow-up-right - This open-source social media tool lets you create, update, and delete posts, upload files, and retrieve post data from your Postiz account—directly within your scenarios.

#### hashtag Updated apps

- OpenAI arrow-up-right - We’ve added new parameters to our Create a Model Response module and Create a Completion module.
- Shopify arrow-up-right – We’ve released an updated version of the Shopify app using the GraphQL API, offering better performance and improved data handling. To learn more, see Shopify tips and examples arrow-up-right .
- Webhooks arrow-up-right - You can now attach multiple API keys to your custom webhook. This feature provides an extra layer of security to control access management.
- Make arrow-up-right - Connections to the Make app can now be established using OAuth2 or an API key.
- Salesforce Pardot arrow-up-right - It’s now possible to connect using OAuth client credentials, streamlining the authentication process.
- Calendly arrow-up-right - We've added a new module: Cancel an Event .
- LiveChat arrow-up-right - A new connection procedure has been imlpemented for LiveChat, requiring your client credentials.
- Printful arrow-up-right - The API key connection type has been deprecated. You can now create a connection using client credentials.

OpenAI arrow-up-right - We’ve added new parameters to our Create a Model Response module and Create a Completion module.

Shopify arrow-up-right – We’ve released an updated version of the Shopify app using the GraphQL API, offering better performance and improved data handling. To learn more, see Shopify tips and examples arrow-up-right .

Webhooks arrow-up-right - You can now attach multiple API keys to your custom webhook. This feature provides an extra layer of security to control access management.

Make arrow-up-right - Connections to the Make app can now be established using OAuth2 or an API key.

Salesforce Pardot arrow-up-right - It’s now possible to connect using OAuth client credentials, streamlining the authentication process.

Calendly arrow-up-right - We've added a new module: Cancel an Event .

LiveChat arrow-up-right - A new connection procedure has been imlpemented for LiveChat, requiring your client credentials.

Printful arrow-up-right - The API key connection type has been deprecated. You can now create a connection using client credentials.

Last updated 1 month ago

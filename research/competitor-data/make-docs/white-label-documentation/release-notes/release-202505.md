---
title: "Release 2025.05 | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/release-notes/release-2025.05
scraped_at: 2026-04-21T12:42:19.495686Z
---

1. Release notes

# Release 2025.05

## hashtag Current software version numbers

The following is a list of current software versions running in Make's release environment. You can also find announcements of planned updates and upcoming end-of-life support for specific versions here.

### hashtag Containerization

Kubernetes

1.30

-

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

3.13.7

-

Erlang

26.2.5.3

-

### hashtag Filesystem

NFS

4.1

-

The following are the current version numbers for services. You can verify them in your instance by going to Administration > Monitoring .

accman

```
accman
```

2.21.0

-

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

v1.1.0

-

broker

```
broker
```

0b2a6125277ff25e5d11675cf14cc6993083f207

Yes

broker-gw-logger

```
broker-gw-logger
```

0b2a6125277ff25e5d11675cf14cc6993083f207

Yes

cron

```
cron
```

v1.0.17

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

1052b9568afa6f7e877fd05b26b7ab879efd1fea

Yes

emails-processor

```
emails-processor
```

4605b5792979582d4de8b159da769bd5e3c57d7a

Yes

engine

```
engine
```

d192e67-20250529

Yes

gateway

```
gateway
```

92d64e31446482686dceb6711f0b9192c9a30217

Yes

imt-auditman

```
imt-auditman
```

1.6.0

Yes

ipm-server

```
ipm-server
```

3.43.0

Yes

ipm-service

```
ipm-service
```

1.8.5

-

kibana

```
kibana
```

7.17.15

-

make-apps-processor

```
make-apps-processor
```

1.3.3

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

v1.27.4

Yes

notifications-processor

```
notifications-processor
```

v2.6.1

-

overseer

```
overseer
```

0255226f99c3262eedcf537fadf397159e10bde9

Yes

renderer-processor

```
renderer-processor
```

3.3.1

Yes

roleman

```
roleman
```

81f5f7b33f957d5b28ab85d627c0f97de41eba5a

Yes

scheduler

```
scheduler
```

d192e67-20250529

Yes

trackman

```
trackman
```

2.17.1

Yes

trigger

```
trigger
```

2.24.2

Yes

web-api

```
web-api
```

2e3c98995e680bb6efba30ba76930becf4ab155f

Yes

web-streamer

```
web-streamer
```

6.3.1

Yes

web-zone

```
web-zone
```

69f3a56462ffb4fd38c193cc1d9ed673e811938e

Yes

zone-assets-server

```
zone-assets-server
```

4.66.2

-

## hashtag New service: Roleman

We're introducing a new, dedicated service: Roleman . This service is designed to improve how we manage user permissions and roles across our platform.

What it does: Roleman serves as the central source for all authorization data within our platform. Release of this service allows us to deliver more powerful, adaptable, and advanced permission-based functionalities.

What's coming: In an upcoming release, we'll deploy the Roleman service to your environments. Here are the key aspects:

- The Roleman service will be installed and ready for use
- Existing permissions and roles will continue to function exactly as they do.
- Service-to-service communication for Roleman will not be activated in this release.
- There will not be any data migration (e.g., of existing roles and permissions) to Roleman in this release.

The Roleman service will be installed and ready for use

Existing permissions and roles will continue to function exactly as they do.

Service-to-service communication for Roleman will not be activated in this release.

There will not be any data migration (e.g., of existing roles and permissions) to Roleman in this release.

Why this matters: This update is required . Deploying Roleman is a mandatory prerequisite for an upcoming release, which will automatically migrate existing roles and permissions to Roleman. Skipping this update is not an option.

A future release will automatically migrate all existing roles and permissions to the new Roleman service. This upcoming deployment is required to enable that process. Setting up Roleman now ensures a smooth transition later.

Resource allocation

The Roleman has the following memory configuration:

- Requested memory: 128Mi This is the minimum amount of memory the service needs to start and run.
- Memory limit: 512Mi This is the maximum amount of memory the service is allowed to use.

Requested memory: 128Mi

```
128Mi
```

This is the minimum amount of memory the service needs to start and run.

Memory limit: 512Mi

```
512Mi
```

This is the maximum amount of memory the service is allowed to use.

## hashtag Public-facing changes

#### hashtag Make AI Tools now available in Open Beta

We're excited to launch Make AI Tools for all paid plan customers. This pre-built app includes 9 AI modules that handle common tasks like sentiment analysis, text categorization, and language translation — all without needing to write prompts or set up third-party AI accounts.

For more details, refer to the Make Help Center arrow-up-right .

#### hashtag UI updates to module rename panel

We've enhanced the module renaming experience with an updated panel design that's more intuitive and user-friendly.

### hashtag Apps updates

- OpenAI arrow-up-right - You now have access to OpenAI's most advanced models: GPT-4.1 - Enhanced reasoning and problem-solving capabilities o4 - Optimized for complex tasks with improved accuracy
- Google Vertex AI (Gemini) arrow-up-right - New Gemini models are now available in the app: Gemini 2.5 Flash - Faster responses for everyday tasks Gemini 2.5 Pro - Advanced capabilities for complex scenarios
- YouTube arrow-up-right - We have two new modules available in the app: Delete a Video - Remove videos directly from your channel Make an API Call - Access any YouTube endpoint for custom integrations

OpenAI arrow-up-right - You now have access to OpenAI's most advanced models:

- GPT-4.1 - Enhanced reasoning and problem-solving capabilities
- o4 - Optimized for complex tasks with improved accuracy

GPT-4.1 - Enhanced reasoning and problem-solving capabilities

o4 - Optimized for complex tasks with improved accuracy

Google Vertex AI (Gemini) arrow-up-right - New Gemini models are now available in the app:

- Gemini 2.5 Flash - Faster responses for everyday tasks
- Gemini 2.5 Pro - Advanced capabilities for complex scenarios

Gemini 2.5 Flash - Faster responses for everyday tasks

Gemini 2.5 Pro - Advanced capabilities for complex scenarios

YouTube arrow-up-right - We have two new modules available in the app:

- Delete a Video - Remove videos directly from your channel
- Make an API Call - Access any YouTube endpoint for custom integrations

Delete a Video - Remove videos directly from your channel

Make an API Call - Access any YouTube endpoint for custom integrations

Last updated 8 months ago

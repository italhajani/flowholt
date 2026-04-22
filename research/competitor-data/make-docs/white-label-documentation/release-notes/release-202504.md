---
title: "Release 2025.04 | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/release-notes/release-2025.04
scraped_at: 2026-04-21T12:42:21.000943Z
---

1. Release notes

# Release 2025.04

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

2dad9efdfaf93442aad26119cb3439b8e0241017

Yes

broker-gw-logger

```
broker-gw-logger
```

2dad9efdfaf93442aad26119cb3439b8e0241017

Yes

cron

```
cron
```

v1.0.16

-

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

f5d05cb282bb99d3fe37949cdb2a33bd778ccf0f

Yes

emails-processor

```
emails-processor
```

ef03ad0cf2b1a133549548a7f1ce4dcd7b76a091

Yes

engine

```
engine
```

9afad03-20250509

Yes

gateway

```
gateway
```

3f5049cdd7c4330ab3df456cfb13ec12afde0abd

Yes

imt-auditman

```
imt-auditman
```

1.5.0

-

ipm-server

```
ipm-server
```

3.39.0

Yes

ipm-service

```
ipm-service
```

1.8.5

Yes

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

v1.22.1

-

notifications-processor

```
notifications-processor
```

v2.6.1

Yes

overseer

```
overseer
```

7722bbaad8d1494897c3bf4365b41be81dddb7d0

-

renderer-processor

```
renderer-processor
```

3.2.6

-

scheduler

```
scheduler
```

9afad03-20250509

Yes

trackman

```
trackman
```

2.14.0

Yes

trigger

```
trigger
```

2.24.1

Yes

web-api

```
web-api
```

7d840057e77a6e3cb210def44a6dffeeea7a234f

Yes

web-streamer

```
web-streamer
```

6.2.2

Yes

web-zone

```
web-zone
```

v4.67.0

Yes

zone-assets-server

```
zone-assets-server
```

4.66.2

-

## hashtag New On-premise Services

We're introducing two new services to improve how applications are managed in your On-premise environment: Zone Assets Server and Make Apps Processor . These services streamline operations and enhance reliability for self-hosted deployments. To deploy these new services, follow the steps outlined in Set up Helm charts guide.

### hashtag Zone Assets Server

What it does: The Zone Assets Server is a dedicated service that delivers essential files and resources (assets) directly within your On-premise infrastructure. Think of it as a local content delivery system that ensures your applications can quickly access everything they need to run smoothly.

Why this matters: Previously, each application had to manage its own assets internally, which added complexity. By centralizing asset delivery through a dedicated service, we're simplifying our core applications and making the overall system more maintainable.

Technical details: This NestJS-based file server contains all the assets that would normally be stored in cloud-based content delivery networks (CDNs). Since CDNs aren't practical for self-hosted environments, this service provides a local alternative that packages all necessary assets in a separate, containerized service.

#### hashtag Zone Assets Server Deployment

Current status: The Zone Assets Server is already running in your environment but isn't active yet. Your web-zone container still uses its internal asset packages as before.

What's coming: In an upcoming release, we'll activate the new system. When this happens:

- The web-zone container will stop bundling its own assets
- Instead, it will retrieve assets from the Zone Assets Server
- This transition will be automatic and require no action from you

The web-zone container will stop bundling its own assets

Instead, it will retrieve assets from the Zone Assets Server

This transition will be automatic and require no action from you

Resource allocation

The Zone Assets Server has the following memory configuration:

- Requested memory: 128Mi This is the minimum amount of memory the service needs to start and run.
- Memory limit: 512Mi This is the maximum amount of memory the service is allowed to use.

Requested memory: 128Mi

```
128Mi
```

This is the minimum amount of memory the service needs to start and run.

Memory limit: 512Mi This is the maximum amount of memory the service is allowed to use.

```
512Mi
```

### hashtag Make Apps Processor

What it does : The Make Apps Processor automatically handles application updates by compiling your app changes into native formats and deploying them to your IPM server. This streamlines the entire application deployment process.

Service transition : This new service will replace the current Apps Processor (apps-processor) in an upcoming release, providing enhanced functionality and improved reliability.

Resource allocation

The Make Apps Processor is optimized for low resource usage and stable performance. Here’s the recommended configuration:

- Recommended memory: 1024 MB This gives the service enough memory to compile and deploy your applications efficiently.
- Recommended CPU: 1/3 vCPU The service runs smoothly with low CPU usage. This setting is enough for stable performance.

Recommended memory: 1024 MB

```
1024 MB
```

This gives the service enough memory to compile and deploy your applications efficiently.

Recommended CPU: 1/3 vCPU

```
1/3 vCPU
```

The service runs smoothly with low CPU usage. This setting is enough for stable performance.

No immediate action is required for either service. Both are being deployed as part of your regular update cycle and will be activated automatically when ready.

## hashtag Public-facing changes

### hashtag Improvements and changes

#### hashtag Make﻿ TypeScript SDK now available

We've added a new client library to our API documentation – the Make TypeScript SDK arrow-up-right . This library provides developers with:

- Comprehensive type definitions
- Support for most Make API endpoints
- Built-in error handling
- Response typing

Comprehensive type definitions

Support for most Make API endpoints

Built-in error handling

Response typing

The SDK is fully compatible with pure JavaScript projects, allowing seamless integration regardless of your preferred development approach.

#### hashtag Improved collection handling

We've simplified your workflow with automatic collection conversion. When mapping a collection to a text field, Make now automatically converts it to a JSON string for you. This eliminates the manual conversion step previously required, saving you time and reducing potential errors in your scenarios.

### hashtag Apps updates

#### hashtag New apps

- SAP SuccessFactors arrow-up-right - A cloud-based human capital management software that helps companies manage employee information. You can now retrieve and search for the records in your SAP SuccessFactors account.
- XLSX arrow-up-right - The XLSX app is our built-in app available on all plans. It allows you to aggregate data in an XLSX file without the need to connect to the Microsoft 365 Excel app.
- Amazon Bedrock arrow-up-right - We've released the new Amazon app. You can now build AI-powered automations that create text, images, or chat responses using your Bedrock setup.
- Clay arrow-up-right - The new Clay app lets you create new webhook records in your Clay tables.

SAP SuccessFactors arrow-up-right - A cloud-based human capital management software that helps companies manage employee information. You can now retrieve and search for the records in your SAP SuccessFactors account.

XLSX arrow-up-right - The XLSX app is our built-in app available on all plans. It allows you to aggregate data in an XLSX file without the need to connect to the Microsoft 365 Excel app.

Amazon Bedrock arrow-up-right - We've released the new Amazon app. You can now build AI-powered automations that create text, images, or chat responses using your Bedrock setup.

Clay arrow-up-right - The new Clay app lets you create new webhook records in your Clay tables.

#### hashtag Updated apps

- OpenAI arrow-up-right - The OpenAI app now includes four new modules that help you manage model responses more effectively: List Input Items Get a Model Response Create a Model Response Delete a Model Response
- xAI arrow-up-right - A new module called Generate an image is now available. It lets you create images based on a prompt.
- Monday.com arrow-up-right - We have two new modules that will let you monitor the events and search items in the board by column values: Watch Events Watch Events
Search Item sin the Board by Column Values (advanced)
- Facebook Pages arrow-up-right - A new module is now available that lets you publish Reels directly to your Facebook Page: Publish a Reel
- Crowdin arrow-up-right - The app now supports both OAuth and API key authentication, giving you two different ways to create a connection.

OpenAI arrow-up-right - The OpenAI app now includes four new modules that help you manage model responses more effectively:

- List Input Items
- Get a Model Response
- Create a Model Response
- Delete a Model Response

List Input Items

Get a Model Response

Create a Model Response

Delete a Model Response

xAI arrow-up-right - A new module called Generate an image is now available. It lets you create images based on a prompt.

Monday.com arrow-up-right - We have two new modules that will let you monitor the events and search items in the board by column values:

- Watch Events
- Watch Events
Search Item sin the Board by Column Values (advanced)

Watch Events

Watch Events
Search Item sin the Board by Column Values (advanced)

Facebook Pages arrow-up-right - A new module is now available that lets you publish Reels directly to your Facebook Page:

- Publish a Reel

Publish a Reel

Crowdin arrow-up-right - The app now supports both OAuth and API key authentication, giving you two different ways to create a connection.

Last updated 9 months ago

---
title: "Release 2025.07 | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/release-notes/release-2025.07
scraped_at: 2026-04-21T12:42:16.858375Z
---

1. Release notes

# Release 2025.07

## hashtag Current software version numbers

The following is a list of current software versions running in Make's release environment. You can also find announcements of planned updates and upcoming end-of-life support for specific versions here.

### hashtag Containerization

Kubernetes

1.33

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

3.13.7.1

-

Erlang

26.2.5.11

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

8b35353b81375e3d846e5adf568004d8408f942f

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

-

broker

```
broker
```

856514b68772203933f937e6aeab92262281a9d5

Yes

broker-gw-logger

```
broker-gw-logger
```

856514b68772203933f937e6aeab92262281a9d5

Yes

cron

```
cron
```

v1.1.1

Yes

datadog-agent

```
datadog-agent
```

7.67.0

Yes

datadog-cluster-agent

```
datadog-cluster-agent
```

7.67.0

Yes

db-updater

```
db-updater
```

41885cd3171a96db31834089d3f21be054da7108

Yes

emails-processor

```
emails-processor
```

7b0d096673ab2fccd6c066d89272630bbbfb0f7d

Yes

engine

```
engine
```

989dd81-20250828

Yes

gateway

```
gateway
```

pi-gateway-patch-1

Yes

imt-auditman

```
imt-auditman
```

1.9.1

Yes

ipm-server

```
ipm-server
```

3.51.0

Yes

ipm-service

```
ipm-service
```

1.11.0

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

190e70701155d6ed8aeb367c55c84e81ef70e289

Yes

make-apps-processor

```
make-apps-processor
```

1.5.0

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

c9dc63d306e074ed7a13a127bfa8d4c51ea27de9

Yes

overseer

```
overseer
```

pi-overseer-patch-1

Yes

renderer-processor

```
renderer-processor
```

5c217f801370cb2a1025a47f1e8656f025c58b19

Yes

roleman

```
roleman
```

6f2527b8e824538aa17e90790845f4fc3507e199

Yes

scheduler

```
scheduler
```

989dd81-20250828

Yes

trackman

```
trackman
```

2.18.1

Yes

trigger

```
trigger
```

245fc6c5c1b199ac060b00c047004c2fd83a4206

Yes

web-api

```
web-api
```

3e5c0cbee674a2cab93c64433993a8cf1d6ef127

Yes

web-streamer

```
web-streamer
```

035161fbc722691c7561757076386f221cd66f6e

Yes

web-zone

```
web-zone
```

2025.07-3

Yes

zone-assets-server

```
zone-assets-server
```

2025.07

Yes

## hashtag Public-facing changes

#### hashtag Coming soon: credits as new billing unit in Make

We're replacing operations with credits as our billing unit , allowing for more flexible pricing that better reflects your actual usage of Make.

The change : You will be billed in credits instead of operations. Operations will refer to individual module runs that process or check for data, and credits will be what you buy and consume for those operations and other usage-based factors.

Why it's happening : The transition to credits enables a more flexible pricing model based on your actual usage of the platform, taking into account factors such as processing complexity or if Make's AI provider is used.

To find out more about credits and what to expect, head to our Credits arrow-up-right documentation.

#### hashtag Scheduling update for required scenario inputs

Previously, it was unclear in the product that scenarios with required scenario inputs arrow-up-right must have on-demand scheduling. Now, when you try to save a scenario with required scenario inputs, you will be prompted to update the scenario scheduling to on demand and save the scenario again.

#### hashtag Updated apps

- OpenAI arrow-up-right — We now support GPT-5 for more accurate responses, richer context understanding, and improved reliability in the OpenAI modules. This new model also handles longer inputs and produces higher-quality results for your scenarios.
- Whatsapp Business Cloud arrow-up-right — We’ve renewed the connection process for the WhatsApp Business Cloud app. Creating a connection is now simpler, as it does not require a Facebook Developer account. Additionally, Watch Events webhooks are now set up automatically.
- Slack arrow-up-right — Following Slack’s update to conversation rate limits, we’ve added a new optional field Enable pagination to the following modules: Watch Public Channel Messages Watch Private Channel Messages Watch Direct Messages Watch Multiparty Direct Messages List Replies For more details, see the Conversation rate limits in Slack arrow-up-right section.
- Runway arrow-up-right — The Runway app has a new Generate an image module. Use it to create images directly in your Runway account from Make. Additionally, this module now supports Gen-4 Image model.
- Zoho CRM arrow-up-right — The Zoho CRM app in Make now supports all zones, so you can connect your account regardless of region.
- Zoho Invoice arrow-up-right — We’ve added full zone support to the Zoho Invoice app in Make. You can now connect your account from any region without restrictions.

OpenAI arrow-up-right — We now support GPT-5 for more accurate responses, richer context understanding, and improved reliability in the OpenAI modules. This new model also handles longer inputs and produces higher-quality results for your scenarios.

Whatsapp Business Cloud arrow-up-right — We’ve renewed the connection process for the WhatsApp Business Cloud app. Creating a connection is now simpler, as it does not require a Facebook Developer account. Additionally, Watch Events webhooks are now set up automatically.

Slack arrow-up-right — Following Slack’s update to conversation rate limits, we’ve added a new optional field Enable pagination to the following modules:

- Watch Public Channel Messages
- Watch Private Channel Messages
- Watch Direct Messages
- Watch Multiparty Direct Messages
- List Replies

Watch Public Channel Messages

Watch Private Channel Messages

Watch Direct Messages

Watch Multiparty Direct Messages

List Replies

For more details, see the Conversation rate limits in Slack arrow-up-right section.

Runway arrow-up-right — The Runway app has a new Generate an image module. Use it to create images directly in your Runway account from Make. Additionally, this module now supports Gen-4 Image model.

Zoho CRM arrow-up-right — The Zoho CRM app in Make now supports all zones, so you can connect your account regardless of region.

Zoho Invoice arrow-up-right — We’ve added full zone support to the Zoho Invoice app in Make. You can now connect your account from any region without restrictions.

Last updated 1 month ago

---
title: "Release 2025.03 | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/release-notes/release-2025.03
scraped_at: 2026-04-21T12:42:21.140977Z
---

1. Release notes

# Release 2025.03

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

v1.1.0

-

broker

```
broker
```

7d091a0a7f47fd49a4dcf4ec225776f352c7cf28

Yes

broker-gw-logger

```
broker-gw-logger
```

7d091a0a7f47fd49a4dcf4ec225776f352c7cf28

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

350f0e6992863691c9579e18f0b9903c8c8186b0

Yes

emails-processor

```
emails-processor
```

v2.12.1

-

engine

```
engine
```

7f437f3-20250319

Yes

gateway

```
gateway
```

aed888cb1f1275c97a1a682502582e444cb3b30c

Yes

imt-auditman

```
imt-auditman
```

1.5.0

Yes

ipm-server

```
ipm-server
```

3.34.0

-

ipm-service

```
ipm-service
```

1.8.2

Yes

kibana

```
kibana
```

7.17.15

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

v2.6.0

-

overseer

```
overseer
```

7722bbaad8d1494897c3bf4365b41be81dddb7d0

Yes

renderer-processor

```
renderer-processor
```

3.2.6

Yes

scheduler

```
scheduler
```

7f437f3-20250319

Yes

trackman

```
trackman
```

v2.12.3

-

trigger

```
trigger
```

2.20.0

Yes

web-api

```
web-api
```

fc8041262fc5fd6a953c06c7275be7f99f35ed31

Yes

web-streamer

```
web-streamer
```

6.1.3

Yes

web-zone

```
web-zone
```

v4.65.1

Yes

## hashtag Public-facing changes

#### hashtag X (formerly Twitter) app integration discontinued

We are removing the X (formerly Twitter) app integration from our offering due to X's API policy requirements and pricing that prevent us from providing a reasonable integration to our customers. Starting April 3, 2025, you will not be able to create any new scenarios using the X (formerly Twitter) integration. For more details, refer to the Make Help Center arrow-up-right .

### hashtag Improvements and changes

- To ensure faster and more seamless payments, Wise has replaced PayPal as our exclusive payment provider for affiliates. When you register for the affiliate program arrow-up-right , you’ll be asked to provide your Wise email address, account type, and preferred payout currency. If you're already part of the program, you can update your account information arrow-up-right at any time.
- We've improved the way incomplete executions are retried. When retrying a large number of incomplete executions, we now limit how many are processed at the same time. This helps prevent retries from failing due to RateLimitError caused by too many simultaneous requests.
- You can now write / in mapping fields to get completion suggestions based on what you write next.
- You can now map the entire output bundle from one module to another.

To ensure faster and more seamless payments, Wise has replaced PayPal as our exclusive payment provider for affiliates. When you register for the affiliate program arrow-up-right , you’ll be asked to provide your Wise email address, account type, and preferred payout currency. If you're already part of the program, you can update your account information arrow-up-right at any time.

We've improved the way incomplete executions are retried. When retrying a large number of incomplete executions, we now limit how many are processed at the same time. This helps prevent retries from failing due to RateLimitError caused by too many simultaneous requests.

```
RateLimitError
```

You can now write / in mapping fields to get completion suggestions based on what you write next.

```
/
```

You can now map the entire output bundle from one module to another.

### hashtag Fixed issues

- Sometimes, a confirmation prompt to discard changes to scenario notes appeared even when you didn’t make any. This is fixed now.
- The app search wasn’t visible in rare cases when adding the first module to a new scenario. We fixed the issue so this doesn't happen anymore.

Sometimes, a confirmation prompt to discard changes to scenario notes appeared even when you didn’t make any. This is fixed now.

The app search wasn’t visible in rare cases when adding the first module to a new scenario. We fixed the issue so this doesn't happen anymore.

### hashtag Apps updates

New apps:

- Adobe Workfront arrow-up-right - A work management platform designed to help teams plan, execute, and deliver projects efficiently. This new app lets you connect with Adobe Workfront to manage tasks, projects, issues, and users directly from Make
- Amazon Rekognition arrow-up-right - This new app lets you connect with Amazon Rekognition to detect objects, scenes, and faces; moderate content; and extract text from images and videos.
- Kimi arrow-up-right - AI language model developed by Moonshot AI that allows you to create chat completions and list the available models.

Adobe Workfront arrow-up-right - A work management platform designed to help teams plan, execute, and deliver projects efficiently. This new app lets you connect with Adobe Workfront to manage tasks, projects, issues, and users directly from Make

Amazon Rekognition arrow-up-right - This new app lets you connect with Amazon Rekognition to detect objects, scenes, and faces; moderate content; and extract text from images and videos.

Kimi arrow-up-right - AI language model developed by Moonshot AI that allows you to create chat completions and list the available models.

Updated apps:

- OpenAI - Now we support GPT-4.5 models. You can see the new GPT-4.5 group in the model selection dropdown.
- Hugging Face arrow-up-right - Two new modules are now available: Create a Chat Completion (Prompt) Generate an Image
- Twilio arrow-up-right - A new module, Make an API Call for Lookup, is now available. This module lets you send custom API requests to Twilio's Lookup API, helping you retrieve information about phone numbers - such as line type, carrier, or caller name.
- ServiceTitan arrow-up-right - We've added a new connection type to reflect recent changes in the ServiceTitan app. You can now connect using either your own ServiceTitan application or the default Make ServiceTitan application.
- Azure DevOps arrow-up-right – From now you can choose between Azure DevOps and Azure DevOps (Azure App OAuth) when setting up a connection, giving you more flexibility in how you authenticate.

OpenAI - Now we support GPT-4.5 models. You can see the new GPT-4.5 group in the model selection dropdown.

Hugging Face arrow-up-right - Two new modules are now available:

- Create a Chat Completion (Prompt)
- Generate an Image

Create a Chat Completion (Prompt)

Generate an Image

Twilio arrow-up-right - A new module, Make an API Call for Lookup, is now available. This module lets you send custom API requests to Twilio's Lookup API, helping you retrieve information about phone numbers - such as line type, carrier, or caller name.

ServiceTitan arrow-up-right - We've added a new connection type to reflect recent changes in the ServiceTitan app. You can now connect using either your own ServiceTitan application or the default Make

ServiceTitan application.

Azure DevOps arrow-up-right – From now you can choose between Azure DevOps and Azure DevOps (Azure App OAuth) when setting up a connection, giving you more flexibility in how you authenticate.

Last updated 12 months ago

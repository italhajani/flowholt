---
title: "Release 2025.08 | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/release-notes/release-2025.08
scraped_at: 2026-04-21T12:42:15.103067Z
---

1. Release notes

# Release 2025.08

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

v6.2.20

Yes

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

4c4596ceba0b9ef2ede0217fb26b7cbe636f4405

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

ef0e7cd6f1ae875f795a8cec312b64ed0fc89bde

Yes

broker-gw-logger

```
broker-gw-logger
```

ef0e7cd6f1ae875f795a8cec312b64ed0fc89bde

Yes

cron

```
cron
```

v1.1.1

-

datadog-agent

```
datadog-agent
```

7.71.1

Yes

datadog-cluster-agent

```
datadog-cluster-agent
```

7.71.1

Yes

db-updater

```
db-updater
```

637f6064168fc71054bc587f3672e3abd17fa940

Yes

emails-processor

```
emails-processor
```

6fca0ee4b468fdcf699dd636f924232e08bf33cf

Yes

engine

```
engine
```

9905603-20251010

Yes

gateway

```
gateway
```

3f49994b75c2917a4586352210eae5f8774a252a

Yes

imt-auditman

```
imt-auditman
```

1.10.2

Yes

ipm-server

```
ipm-server
```

3.52.0

Yes

ipm-service

```
ipm-service
```

2.1.2

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

e53496a083cae031e743c54748f00d0753e88f31

Yes

make-apps-processor

```
make-apps-processor
```

1.5.1

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

v1.28.0

Yes

notifications-processor

```
notifications-processor
```

7574100ce48c7d2b87d18e11e55a6103fe6c6cc0

Yes

overseer

```
overseer
```

a688ee99fe3469bfb8a586a1f189c635f47eb620

Yes

renderer-processor

```
renderer-processor
```

dce8eac4cac38070abad7393d7c7797e4dc465b5

Yes

roleman

```
roleman
```

7f9f433c3b51f20ec871b50e8823fbf8e527d9b8

Yes

scheduler

```
scheduler
```

989dd81-20250828

-

trackman

```
trackman
```

2.22.0

Yes

trigger

```
trigger
```

a76cb02797f203309ef2eba6d581c10849f4dd6f

Yes

web-api

```
web-api
```

a0f099d41f1cb2983ae6513901327287f6730a84

Yes

web-streamer

```
web-streamer
```

6b72216bb9e05f2f08a4a61cfef18023572927f1

Yes

web-zone

```
web-zone
```

b9ced895578f42eb0a09d6f28b8483b63cddeb23

Yes

zone-assets-server

```
zone-assets-server
```

627f4bbe181f957a65c2e1bab938401bbf40cea5

Yes

## hashtag Public-facing changes

#### hashtag Make AI Toolkit

Make AI Toolkit is an app that streamlines common AI tasks using either Make's built-in AI Provider or your own external AI models. The toolkit offers essential capabilities including sentiment analysis, text categorization, language identification, information extraction, text standardization, summarization, translation, and text chunking.

For more information, refer to the Make AI Toolkit documentation arrow-up-right .

#### hashtag Make AI Content Extractor

We've released a built-in app that extracts structured text and metadata from files like PDFs, Word documents, images, and audio recordings—directly within your Make scenarios.

For more information, refer to the Make AI Content Extractor documentation arrow-up-right .

#### hashtag Fix for Team Restricted Member role permission

We've fixed an issue with the permissions assigned to the Team Restricted Member role. The role now does not have any unexpected modification capabilities.

What we fixed

We've removed the permission that allowed the Team Restricted Member role to modify team settings.

What this means for you

If you have the Team Restricted Member role, you will no longer be able to modify any team settings for the team you are a part of.

The Team Restricted Member role remains supported for existing teams, even though it is considered deprecated. This fix allows the role to function securely and in the way it was originally intended.

Last updated 5 months ago

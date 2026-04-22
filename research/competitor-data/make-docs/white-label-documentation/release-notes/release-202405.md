---
title: "Release 2024.05 | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/release-notes/release-2024.05
scraped_at: 2026-04-21T12:42:32.564789Z
---

1. Release notes

# Release 2024.05

## hashtag Current software version numbers

The following is a list of current software versions running in Make's release environment. You can also find announcements of planned updates and upcoming end-of-life support for specific versions here.

### hashtag Containerization

Docker CE

24.0.6

-

Kubernetes

1.28

Yes

### hashtag Databases

PostgreSQL

15.5

Yes

Redis

v6.2.10

-

MongoDB Cloud

5.0.24

-

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

v2.15.2

Yes

apps-processor

```
apps-processor
```

v2.4.0

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

6.3.1

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

v1.5.73

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

v2.7.0

Yes

engine

```
engine
```

v4.4.2

Yes

gateway

```
gateway
```

3.8.0

Yes

ipm-server

```
ipm-server
```

v3.22.0

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

mongo-auto-indexer

```
mongo-auto-indexer
```

v1.0.0

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

v2.3.0

Yes

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

v4.4.2

Yes

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

v4.4.2

Yes

trackman

```
trackman
```

v2.8.0

Yes

trigger

```
trigger
```

2.2.1

Yes

web-api

```
web-api
```

v5.0.0

Yes

web-streamer

```
web-streamer
```

5.5.0

Yes

web-zone

```
web-zone
```

v4.49.1

Yes

## hashtag Public-facing changes

### hashtag Improved app search

- We're excited to introduce our improved in-product app search designed to help you discover apps and build scenarios faster! What's new: Improved search speed and reliability. Apps related to your search query show up in the app search window with added insight into available modules. Your recently used apps move to the top for a speedy build. The new right-hand bar gives you quick access to common tools and functions. While creating or editing the scenario you see a new section in the list of apps called Apps in scenario . It helps you get quicker access to already used apps.

We're excited to introduce our improved in-product app search designed to help you discover apps and build scenarios faster! What's new:

- Improved search speed and reliability.
- Apps related to your search query show up in the app search window with added insight into available modules.
- Your recently used apps move to the top for a speedy build.
- The new right-hand bar gives you quick access to common tools and functions.
- While creating or editing the scenario you see a new section in the list of apps called Apps in scenario . It helps you get quicker access to already used apps.

Improved search speed and reliability.

Apps related to your search query show up in the app search window with added insight into available modules.

Your recently used apps move to the top for a speedy build.

The new right-hand bar gives you quick access to common tools and functions.

While creating or editing the scenario you see a new section in the list of apps called Apps in scenario . It helps you get quicker access to already used apps.

If you want to learn more or leave feedback for this feature go to this Community post arrow-up-right .

### hashtag Improvements and changes

- We’ve added a small but important improvement to the Users tab. Now you can filter users by their role at both organization and team levels. Simply click on the filter icon and select the role that you would like to see in the list.

We’ve added a small but important improvement to the Users tab. Now you can filter users by their role at both organization and team levels. Simply click on the filter icon and select the role that you would like to see in the list.

### hashtag Fixed issues

- When rerunning an incomplete execution caused by an error in a route in a router, only the route where the error occurred would be executed while resolving the incomplete executions. Any subsequent routes would be ignored. Now, all subsequent routes are also processed when resolving incomplete executions.
- Previously, custom functions couldn't handle parameters with binary data types, such as email attachments or pictures. This caused failures when trying to process files with custom functions. We fixed it and now you can successfully use custom functions to process raw binary data.
- Recently, when searching for modules in the scenario editor, the Instant tag was missing from instant triggers and they were mistakenly labeled as ACID (polling) triggers. This issue has been resolved, and it now works as expected.

When rerunning an incomplete execution caused by an error in a route in a router, only the route where the error occurred would be executed while resolving the incomplete executions. Any subsequent routes would be ignored. Now, all subsequent routes are also processed when resolving incomplete executions.

Previously, custom functions couldn't handle parameters with binary data types, such as email attachments or pictures. This caused failures when trying to process files with custom functions. We fixed it and now you can successfully use custom functions to process raw binary data.

Recently, when searching for modules in the scenario editor, the Instant tag was missing from instant triggers and they were mistakenly labeled as ACID (polling) triggers. This issue has been resolved, and it now works as expected.

### hashtag Apps updates

#### hashtag New apps:

- TikTok Conversions arrow-up-right - Introducing an app that allows you to track conversion events that occur outside of TikTok and optimize your ads accordingly.
- TikTok Reports arrow-up-right - With this app you can create detailed reports on the performance of your TikTok advertising campaigns.
- BigCommerce arrow-up-right - Using this app you can manage your BigCommerce orders, carts, customers, products, and blog posts.
- Azure OpenAI arrow-up-right - This AI app lets you generate images and create transcriptions, translations, and chat completions.
- Google Search Console arrow-up-right - This app provides additional online marketing support to monitor and troubleshoot your website’s Google Search results.
- Flodesk arrow-up-right - This app allows users to create visually engaging emails for designing and managing email marketing campaigns.

TikTok Conversions arrow-up-right - Introducing an app that allows you to track conversion events that occur outside of TikTok and optimize your ads accordingly.

TikTok Reports arrow-up-right - With this app you can create detailed reports on the performance of your TikTok advertising campaigns.

BigCommerce arrow-up-right - Using this app you can manage your BigCommerce orders, carts, customers, products, and blog posts.

Azure OpenAI arrow-up-right - This AI app lets you generate images and create transcriptions, translations, and chat completions.

Google Search Console arrow-up-right - This app provides additional online marketing support to monitor and troubleshoot your website’s Google Search results.

Flodesk arrow-up-right - This app allows users to create visually engaging emails for designing and managing email marketing campaigns.

#### hashtag Updated apps:

- LinkedIn arrow-up-right - A new module, Search Organizations , has been added to help you easily locate organizations by vanity name or email domain.
- LinkedIn Matched Audiences arrow-up-right - Four modules have been deprecated due to a LinkedIn API change: Attach a Seed Audience , Create a Lookalike Audience , List Lookalike Audience’s Seeds , and Update a Campaign Target .

LinkedIn arrow-up-right - A new module, Search Organizations , has been added to help you easily locate organizations by vanity name or email domain.

LinkedIn Matched Audiences arrow-up-right - Four modules have been deprecated due to a LinkedIn API change: Attach a Seed Audience , Create a Lookalike Audience , List Lookalike Audience’s Seeds , and Update a Campaign Target .

For more details, go to our public release notes arrow-up-right .

Last updated 1 year ago

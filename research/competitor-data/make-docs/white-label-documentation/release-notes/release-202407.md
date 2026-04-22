---
title: "Release 2024.07 | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/release-notes/release-2024.07
scraped_at: 2026-04-21T12:42:30.017481Z
---

1. Release notes

# Release 2024.07

## hashtag Current software version numbers

The following is a list of current software versions running in Make's release environment. You can also find announcements of planned updates and upcoming end-of-life support for specific versions here.

### hashtag Containerization

Docker CE

24.0.6

-

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

5.0.26

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

2.15.2

-

apps-processor

```
apps-processor
```

v2.4.0

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

6.3.1

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

v1.5.76

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

v2.8.2

-

engine

```
engine
```

v4.6.0

Yes

gateway

```
gateway
```

3.8.2

Yes

ipm-server

```
ipm-server
```

v3.23.0

-

ipm-service

```
ipm-service
```

v1.2.1

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

5.0

Yes

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

v2.4.0

-

overseer

```
overseer
```

4.4.0

-

recycler

```
recycler
```

v4.6.0

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

v4.6.0

Yes

trackman

```
trackman
```

v2.9.0-hotfix-1

Yes

trigger

```
trigger
```

2.3.0

Yes

web-api

```
web-api
```

v5.5.0-hotfix-3

Yes

web-streamer

```
web-streamer
```

5.6.0

Yes

web-zone

```
web-zone
```

v4.53.3

Yes

## hashtag Public-facing changes

### hashtag Improvements and changes

- We added a new read-only Audience URI field to the SSO settings, where you can find the path to the metadata.xml . This can be useful for setting up SSO on the provider’s side. Also, we included a link to the documentation in the SSO settings so that users can access the information more easily.
- We created new Make API endpoints to help you monitor the usage of operations in your scenarios. Get scenario usage : Returns the daily operation usage for a specific scenario over the past 30 days. Get team usage : Returns the daily operation usage for all scenarios within a team over the past 30 days. Get organization usage : Returns the daily operation usage for all scenarios across all teams within the organization over the past 30 days.

We added a new read-only Audience URI field to the SSO settings, where you can find the path to the metadata.xml . This can be useful for setting up SSO on the provider’s side. Also, we included a link to the documentation in the SSO settings so that users can access the information more easily.

```
metadata.xml
```

We created new Make API endpoints to help you monitor the usage of operations in your scenarios.

- Get scenario usage : Returns the daily operation usage for a specific scenario over the past 30 days.
- Get team usage : Returns the daily operation usage for all scenarios within a team over the past 30 days.
- Get organization usage : Returns the daily operation usage for all scenarios across all teams within the organization over the past 30 days.

Get scenario usage : Returns the daily operation usage for a specific scenario over the past 30 days.

Get team usage : Returns the daily operation usage for all scenarios within a team over the past 30 days.

Get organization usage : Returns the daily operation usage for all scenarios across all teams within the organization over the past 30 days.

Learn more about them in the Make API documentation arrow-up-right .

- We updated the timezones for operations and data transfer in your organization and team dashboards. Instead of showing usage in GMT+0, the dashboards will now display data based on each user’s account timezone.
- The organization and team dashboards now include data from incomplete executions, covering both operations and data transfer usage.

We updated the timezones for operations and data transfer in your organization and team dashboards. Instead of showing usage in GMT+0, the dashboards will now display data based on each user’s account timezone.

The organization and team dashboards now include data from incomplete executions, covering both operations and data transfer usage.

If your Make scenarios frequently have incomplete executions, you may notice an increase in usage metrics on the dashboards.

- Previously, it was not possible to open a scenario in a new tab from the Table view of the Scenarios tab. Now, you can right-click on a scenario from the list and select the option to open it in a new tab. Note that the Table view is only available for the Enterprise accounts.

Previously, it was not possible to open a scenario in a new tab from the Table view of the Scenarios tab. Now, you can right-click on a scenario from the list and select the option to open it in a new tab. Note that the Table view is only available for the Enterprise accounts.

### hashtag Fixed issues

- We resolved an issue where, in rare cases, scenarios were running indefinitely and blocking the processing of webhook queue items. With this fix, scenarios will no longer get stuck, allowing the webhook queue items to be processed smoothly.

We resolved an issue where, in rare cases, scenarios were running indefinitely and blocking the processing of webhook queue items. With this fix, scenarios will no longer get stuck, allowing the webhook queue items to be processed smoothly.

### hashtag Apps updates

#### hashtag New apps:

- Crossbeam arrow-up-right - This app helps you find potential partnerships among your customers and identify account overlap to uncover new leads and boost your sales.
- watsonx.ai arrow-up-right - This AI app lets you generate responses to a prompt using a variety of large language models (LLMs).
- Sage Intacct arrow-up-right - This app allows you to keep accounting, staff management tools, and reports in one place. Within Make, you can handle records in your Sage Intacct account.
- Google Ads Reports arrow-up-right - This app is an integral part of Google Ads that is responsible for marketing reports based on data in your Google Ads account.

Crossbeam arrow-up-right - This app helps you find potential partnerships among your customers and identify account overlap to uncover new leads and boost your sales.

watsonx.ai arrow-up-right - This AI app lets you generate responses to a prompt using a variety of large language models (LLMs).

Sage Intacct arrow-up-right - This app allows you to keep accounting, staff management tools, and reports in one place. Within Make, you can handle records in your Sage Intacct account.

Google Ads Reports arrow-up-right - This app is an integral part of Google Ads that is responsible for marketing reports based on data in your Google Ads account.

#### hashtag Updated apps:

- Firebase Cloud Messaging arrow-up-right - It was required to enter additional credentials to create a connection before. Now you can just sign in to your Google account to work with Firebase Cloud Messaging and enjoy!
- Stripe arrow-up-right - In the beginning of June, Stripe will deprecate all API keys that you used to create a connection in Make. To prepare for this, we created a new connection type: Restricted API key. Don’t forget to switch to the new connection type to continue working with Stripe!
- Google Chrome (v2) arrow-up-right - We’ve released version 2 of our Chrome app to align with the new API, so you can continue to send notifications through your browser.
- Celoxis arrow-up-right - The API URL for Celoxis has been updated, ensuring all app parts and documentation reflect this mandatory change.
- Custify arrow-up-right - The app documentation has been updated with revised module names and improved structure.

Firebase Cloud Messaging arrow-up-right - It was required to enter additional credentials to create a connection before. Now you can just sign in to your Google account to work with Firebase Cloud Messaging and enjoy!

Stripe arrow-up-right - In the beginning of June, Stripe will deprecate all API keys that you used to create a connection in Make. To prepare for this, we created a new connection type: Restricted API key. Don’t forget to switch to the new connection type to continue working with Stripe!

Google Chrome (v2) arrow-up-right - We’ve released version 2 of our Chrome app to align with the new API, so you can continue to send notifications through your browser.

Celoxis arrow-up-right - The API URL for Celoxis has been updated, ensuring all app parts and documentation reflect this mandatory change.

Custify arrow-up-right - The app documentation has been updated with revised module names and improved structure.

Last updated 1 year ago

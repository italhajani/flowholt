---
title: "Release 2025.01 | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/release-notes/release-2025.01
scraped_at: 2026-04-21T12:42:23.543117Z
---

1. Release notes

# Release 2025.01

## hashtag Current software version numbers

The following is a list of current software versions running in Make's release environment. You can also find announcements of planned updates and upcoming end-of-life support for specific versions here.

### hashtag Containerization

Kubernetes

1.30

-

### hashtag Databases

PostgreSQL

15.5

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

## hashtag Current service version numbers

The following are the current version numbers for services. You can verify them in your instance by going to Administration > Monitoring .

accman

```
accman
```

2.16.13

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

Yes

broker

```
broker
```

6.6.0

Yes

broker-gw-logger

```
broker-gw-logger
```

6.6.0

Yes

cron

```
cron
```

v1.0.16

Yes

datadog-agent

```
datadog-agent
```

7.58.1

-

datadog-cluster-agent

```
datadog-cluster-agent
```

7.58.1

-

db-updater

```
db-updater
```

v1.5.83

Yes

emails-processor

```
emails-processor
```

v2.12.0

Yes

engine

```
engine
```

v5.1.0

Yes

gateway

```
gateway
```

3.15.0

Yes

imt-auditman

```
imt-auditman
```

1.2.3

Yes

ipm-server

```
ipm-server
```

v3.30.0

Yes

ipm-service

```
ipm-service
```

v1.5.5

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

v2.5.1

-

overseer

```
overseer
```

4.5.0

-

renderer-processor

```
renderer-processor
```

3.2.4

Yes

scheduler

```
scheduler
```

v5.1.0

Yes

trackman

```
trackman
```

v2.11.3

Yes

trigger

```
trigger
```

2.6.0

Yes

web-api

```
web-api
```

v5.19.0

Yes

web-streamer

```
web-streamer
```

5.10.0

Yes

web-zone

```
web-zone
```

v4.64.1

Yes

## hashtag Public-facing changes

### hashtag Improvements and changes

- Our new Analytics dashboard arrow-up-right , available to Enterprise users, gives you a clear view of your account’s key metrics. You can easily see what’s happening across all of your scenario, so you can stay on top of things and make informed decisions to optimize performance.
- We've updated our downgrading and cancelation process. Now, if you downgrade to a plan that only offers one team, or if you cancel and revert to the Free plan, you will be asked to choose the team you want to keep. You will also see a table, comparing the features of your old and new plan, before you commit to the change. For more information, refer to our Changing your subscription arrow-up-right article.

Our new Analytics dashboard arrow-up-right , available to Enterprise users, gives you a clear view of your account’s key metrics. You can easily see what’s happening across all of your scenario, so you can stay on top of things and make informed decisions to optimize performance.

We've updated our downgrading and cancelation process. Now, if you downgrade to a plan that only offers one team, or if you cancel and revert to the Free plan, you will be asked to choose the team you want to keep. You will also see a table, comparing the features of your old and new plan, before you commit to the change. For more information, refer to our Changing your subscription arrow-up-right article.

- Users can now retry multiple incomplete executions at once. You can either select specific incomplete executions or attempt to retry all of them. You can see approximately when an incomplete execution will be rerun in the scenario incomplete executions tab.
- We’ve updated your options in the profile settings. Before, you were unable to change the country you first chose when registering. Now, you can change your country if necessary.
- You can now schedule resolving multiple incomplete executions at once with the Make API. This feature is best for resolving incomplete executions caused by temporary errors like rate limit or connection errors, or for incomplete executions where you fixed the error already.
- We've improved the way that custom app logos are processed for more accurate representation. For more details on how single color, multicolor, and grayscale logos are processed, view the specifications and examples here arrow-up-right .

Users can now retry multiple incomplete executions at once. You can either select specific incomplete executions or attempt to retry all of them. You can see approximately when an incomplete execution will be rerun in the scenario incomplete executions tab.

We’ve updated your options in the profile settings. Before, you were unable to change the country you first chose when registering. Now, you can change your country if necessary.

You can now schedule resolving multiple incomplete executions at once with the Make API. This feature is best for resolving incomplete executions caused by temporary errors like rate limit or connection errors, or for incomplete executions where you fixed the error already.

We've improved the way that custom app logos are processed for more accurate representation. For more details on how single color, multicolor, and grayscale logos are processed, view the specifications and examples here arrow-up-right .

### hashtag Documentation updates

- We've updated our documentation on creating connections with Google family apps . The new version aligns with the updated Google Cloud Platform user experience and includes new tips to guide you through setting up a connection in Make.
- Canva arrow-up-right - The app's logo has been updated in both the documentation and the product for a refreshed look.
- SpreadsheetWeb Hub arrow-up-right - New documentation for the SpreadsheetWeb Hub app is now available, offering detailed guidance on its modules in Make.
- SystemPrompt.io arrow-up-right - New documentation is available! Use it to manage and customize AI system prompts directly within your workflows.
- Placetel arrow-up-right - We have new documentation for Placetel in Make! Use it to manage calls, faxes, contacts, and search for SIP users in your Placetel account.
- Taggun Receipt OCR arrow-up-right - Our latest documentation gives info about how to integrate Taggun in Make and use it to extract receipt details like amounts, taxes, and dates from images or URLs.
- Operations arrow-up-right - The section If you are running out of operations has been updated to clarify the notification thresholds.
- Microsoft Teams arrow-up-right - The documentation now features the updated Redirect URI for the integration process.
- Wix arrow-up-right - Improved documentation with more visuals, including details on required permissions, is now available to guide you in using Wix in Make.
- Google Cloud Speech arrow-up-right - The Redirect URI in the documentation has been updated under the section that explains how to set up client credentials for integration with Make.
- Knack arrow-up-right - Updated documentation with new visuals reflecting the updated UI in Knack is now available.
- Bitrix24 arrow-up-right - The documentation has been updated to clarify that Bitrix24 modules in Make are accessible only with a paid Bitrix24 account.

We've updated our documentation on creating connections with Google family apps . The new version aligns with the updated Google Cloud Platform user experience and includes new tips to guide you through setting up a connection in Make.

Canva arrow-up-right - The app's logo has been updated in both the documentation and the product for a refreshed look.

SpreadsheetWeb Hub arrow-up-right - New documentation for the SpreadsheetWeb Hub app is now available, offering detailed guidance on its modules in Make.

SystemPrompt.io arrow-up-right - New documentation is available! Use it to manage and customize AI system prompts directly within your workflows.

Placetel arrow-up-right - We have new documentation for Placetel in Make! Use it to manage calls, faxes, contacts, and search for SIP users in your Placetel account.

Taggun Receipt OCR arrow-up-right - Our latest documentation gives info about how to integrate Taggun in Make and use it to extract receipt details like amounts, taxes, and dates from images or URLs.

Operations arrow-up-right - The section If you are running out of operations has been updated to clarify the notification thresholds.

Microsoft Teams arrow-up-right - The documentation now features the updated Redirect URI for the integration process.

Wix arrow-up-right - Improved documentation with more visuals, including details on required permissions, is now available to guide you in using Wix in Make.

Google Cloud Speech arrow-up-right - The Redirect URI in the documentation has been updated under the section that explains how to set up client credentials for integration with Make.

Knack arrow-up-right - Updated documentation with new visuals reflecting the updated UI in Knack is now available.

Bitrix24 arrow-up-right - The documentation has been updated to clarify that Bitrix24 modules in Make are accessible only with a paid Bitrix24 account.

### hashtag Apps updates

New apps:

- Braze arrow-up-right - Braze is a platform that helps businesses deliver personalized messaging and experiences to their users across various channels. It enables brands to build stronger relationships with customers through targeted campaigns, real-time data analytics, and user insights. In Make, you can manage user profiles, catalogs, and catalog items, as well as send messages and make API calls.
- Snapchat Campaign Management arrow-up-right - We now have a new Snapchat app that enables you to manage your ad accounts, ad squads, and organization members within your Snapchat Ads Manager account.

Braze arrow-up-right - Braze is a platform that helps businesses deliver personalized messaging and experiences to their users across various channels. It enables brands to build stronger relationships with customers through targeted campaigns, real-time data analytics, and user insights. In Make, you can manage user profiles, catalogs, and catalog items, as well as send messages and make API calls.

Snapchat Campaign Management arrow-up-right - We now have a new Snapchat app that enables you to manage your ad accounts, ad squads, and organization members within your Snapchat Ads Manager account.

Updated apps:

- OpenAI arrow-up-right - We have renamed the module Create a Completion (Prompt) (GPT-3, GPT-3.5, GPT-4) to Create a Completion (Prompt) (GPT and o1 Models) .
- Instagram for Business (Facebook login) arrow-up-right - We have renamed our Instagram for Business app to Instagram for Business (Facebook login) allowing you to configure Facebook authentication and access features such as managing media, posts, stories and more for Instagram Business accounts.
- Google Ads Campaign Management arrow-up-right - There is a new module named Search Objects (SearchStream Query) . Additionally, the Search Objects module was renamed to Search Objects (Search Query)
- UiPath arrow-up-right - We’ve added a new connection type for UiPath. You can choose to use the original OAuth connection or the new version with client credentials.
- OneSignal arrow-up-right - The process for creating a connection with OneSignal in Make has changed. You now need to create a custom application in your OneSignal account and obtain an API key to use when setting up the connection.

OpenAI arrow-up-right - We have renamed the module Create a Completion (Prompt) (GPT-3, GPT-3.5, GPT-4) to Create a Completion (Prompt) (GPT and o1 Models) .

Instagram for Business (Facebook login) arrow-up-right - We have renamed our Instagram for Business app to Instagram for Business (Facebook login) allowing you to configure Facebook authentication and access features such as managing media, posts, stories and more for Instagram Business accounts.

Google Ads Campaign Management arrow-up-right - There is a new module named Search Objects (SearchStream Query) . Additionally, the Search Objects module was renamed to Search Objects (Search Query)

UiPath arrow-up-right - We’ve added a new connection type for UiPath. You can choose to use the original OAuth connection or the new version with client credentials.

OneSignal arrow-up-right - The process for creating a connection with OneSignal in Make has changed. You now need to create a custom application in your OneSignal account and obtain an API key to use when setting up the connection.

Last updated 11 months ago

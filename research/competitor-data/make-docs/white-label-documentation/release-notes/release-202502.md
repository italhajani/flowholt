---
title: "Release 2025.02 | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/release-notes/release-2025.02
scraped_at: 2026-04-21T12:42:23.420505Z
---

1. Release notes

# Release 2025.02

## hashtag Current software version numbers

The following is a list of current software versions running in Make's release environment. You can also find announcements of planned updates and upcoming end-of-life support for specific versions here.

### hashtag Containerization

Kubernetes

1.30

-

### hashtag Databases

PostgreSQL

15.12

Yes

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

2.19.1

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

cfe10e920b852308ed74b566e76d98a2f6e411e6

Yes

broker-gw-logger

```
broker-gw-logger
```

cfe10e920b852308ed74b566e76d98a2f6e411e6

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

Yes

datadog-cluster-agent

```
datadog-cluster-agent
```

7.63.3

Yes

db-updater

```
db-updater
```

07d5ca7c165bdf50b48c20b4981c28c82774dd7b

Yes

emails-processor

```
emails-processor
```

v2.12.1

Yes

engine

```
engine
```

v5.2.0

Yes

gateway

```
gateway
```

37b91ec5580fe188afc9d0faf4a7810bec4b1f3c

Yes

imt-auditman

```
imt-auditman
```

1.3.0

Yes

ipm-server

```
ipm-server
```

3.34.0

Yes

ipm-service

```
ipm-service
```

v1.5.5

-

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

Yes

overseer

```
overseer
```

ff79675e8e309e6f9265753d6cf684789ac45b04

Yes

renderer-processor

```
renderer-processor
```

3.2.5

Yes

scheduler

```
scheduler
```

v5.2.0

Yes

trackman

```
trackman
```

v2.12.3

Yes

trigger

```
trigger
```

2.11.1

Yes

web-api

```
web-api
```

efb07c61d2da29ac934da2daf00a0d5426754cf1

Yes

web-streamer

```
web-streamer
```

5.11.1

Yes

web-zone

```
web-zone
```

0f8edfe1c849ed1c58c1019db27445e6a9869f99

Yes

## hashtag Public-facing changes

### hashtag Improvements and changes

- We have improved the notes experience, making it easier and more enjoyable to create and manage notes. In addition to a fresh new look, notes now support rich text formatting. For more information, refer to our new Scenario notes arrow-up-right documentation.

We have improved the notes experience, making it easier and more enjoyable to create and manage notes. In addition to a fresh new look, notes now support rich text formatting. For more information, refer to our new Scenario notes arrow-up-right documentation.

- Managing operations at the team level is now easier with the new Enterprise feature, Operations per Team Management arrow-up-right . Benefits include improved control over team consumption, operational continuity, real-time monitoring of operations usage, flexibility in operations allocation, and proactive usage notifications.
- You can now connect third-party apps or clients with Make using the OAuth 2.0 protocol. Check out the latest updates in our Make API documentation update arrow-up-right .
- We’ve added more filter options to our Analytics dashboard arrow-up-right , available to Enterprise users. Additional filters include Status , Team , and Folder for overall stats, with Executions Change and Folder now available in the scenario breakdown.
- Scenario execution history can now be exported into a CSV file. This is a useful option for users who want to analyze their scenario execution history in an external system. Before exporting, you can choose to hide check runs or the change log, depending on what data you want to include in the file.
- You can now rename keys without specifying their values. Previously, when renaming keys, you had to provide the current values. If you did not, the values would be replaced with blank entries.

Managing operations at the team level is now easier with the new Enterprise feature, Operations per Team Management arrow-up-right . Benefits include improved control over team consumption, operational continuity, real-time monitoring of operations usage, flexibility in operations allocation, and proactive usage notifications.

You can now connect third-party apps or clients with Make using the OAuth 2.0 protocol. Check out the latest updates in our Make API documentation update arrow-up-right .

We’ve added more filter options to our Analytics dashboard arrow-up-right , available to Enterprise users. Additional filters include Status , Team , and Folder for overall stats, with Executions Change and Folder now available in the scenario breakdown.

Scenario execution history can now be exported into a CSV file. This is a useful option for users who want to analyze their scenario execution history in an external system. Before exporting, you can choose to hide check runs or the change log, depending on what data you want to include in the file.

You can now rename keys without specifying their values. Previously, when renaming keys, you had to provide the current values. If you did not, the values would be replaced with blank entries.

### hashtag Apps updates

New apps:

- Bluesky arrow-up-right - A social media platform designed for open and independent networking. This new app lets you connect with Bluesky to manage users, posts, messages, media, likes, and lists in your account.
- ClickFunnels 2.0 arrow-up-right - We have a new version of ClickFunnels. This version allows you to monitor contacts, orders, and form submissions, as well as manage contacts and orders in your ClickFunnels account.

Bluesky arrow-up-right - A social media platform designed for open and independent networking. This new app lets you connect with Bluesky to manage users, posts, messages, media, likes, and lists in your account.

ClickFunnels 2.0 arrow-up-right - We have a new version of ClickFunnels. This version allows you to monitor contacts, orders, and form submissions, as well as manage contacts and orders in your ClickFunnels account.

Updated apps:

- OpenAI arrow-up-right - The GPT-4o and GPT-4o-mini series of models now include a new Predicted Outputs arrow-up-right parameter in the Create a Completion module. Additionally, o3 models are now supported in this module, and this update has also been reflected in the documentation.
- Workday Human Capital Management arrow-up-right - A new Make a REST API Call module has been released to enable interaction with Workday's API for greater flexibility.
- Make arrow-up-right - We have released the following Incomplete Scenario Executions modules that allow you to manage and monitor incomplete executions effectively: List scenario incomplete executions Get incomplete execution detail Retry incomplete executions in a scenario Delete incomplete executions in a scenario
- Workday Financial Management arrow-up-right - The Make a REST API Call module has been added, allowing users to interact with Workday's API for enhanced flexibility.
- Salesforce arrow-up-right - A new module, Make an API Call (Advanced) , has been added, allowing for advanced API interactions with Salesforce.
- Ablefy arrow-up-right - Elopage has been rebranded as Ablefy. This change has been reflected in our documentation to ensure consistency and clarity.
- Google Vertex AI (Gemini) arrow-up-right - We have added new modules that allow you to create and process images: Generate an Image Generate an Image Caption Generate an Answer for an Image
- Runway arrow-up-right - In the Generate a Video from Image(s) module, we have added two new fields: First URL and Last URL , which require an HTTPS URL pointing to an image used to generate the video. The Ratio field has also updated values to select. Additionally, we have added a new field API version into the Make an API Call module.
- Front arrow-up-right – We have updated the Front app logo to match the latest branding.
- ClickFunnels Classic arrow-up-right - The previous version of ClickFunnels has been renamed due to the API deprecation. The new version, ClickFunnels 2.0 arrow-up-right , is now available.
- Base.com arrow-up-right – The BaseLinker app has been updated and renamed to Base.com, along with a new logo.

OpenAI arrow-up-right - The GPT-4o and GPT-4o-mini series of models now include a new Predicted Outputs arrow-up-right parameter in the Create a Completion module. Additionally, o3 models are now supported in this module, and this update has also been reflected in the documentation.

Workday Human Capital Management arrow-up-right - A new Make a REST API Call module has been released to enable interaction with Workday's API for greater flexibility.

Make arrow-up-right - We have released the following Incomplete Scenario Executions modules that allow you to manage and monitor incomplete executions effectively:

- List scenario incomplete executions
- Get incomplete execution detail
- Retry incomplete executions in a scenario
- Delete incomplete executions in a scenario

List scenario incomplete executions

Get incomplete execution detail

Retry incomplete executions in a scenario

Delete incomplete executions in a scenario

Workday Financial Management arrow-up-right - The Make a REST API Call module has been added, allowing users to interact with Workday's API for enhanced flexibility.

Salesforce arrow-up-right - A new module, Make an API Call (Advanced) , has been added, allowing for advanced API interactions with Salesforce.

Ablefy arrow-up-right - Elopage has been rebranded as Ablefy. This change has been reflected in our documentation to ensure consistency and clarity.

Google Vertex AI (Gemini) arrow-up-right - We have added new modules that allow you to create and process images:

- Generate an Image
- Generate an Image Caption
- Generate an Answer for an Image

Generate an Image

Generate an Image Caption

Generate an Answer for an Image

Runway arrow-up-right - In the Generate a Video from Image(s) module, we have added two new fields: First URL and Last URL , which require an HTTPS URL pointing to an image used to generate the video. The Ratio field has also updated values to select.

Additionally, we have added a new field API version into the Make an API Call module.

Front arrow-up-right – We have updated the Front app logo to match the latest branding.

ClickFunnels Classic arrow-up-right - The previous version of ClickFunnels has been renamed due to the API deprecation. The new version, ClickFunnels 2.0 arrow-up-right , is now available.

Base.com arrow-up-right – The BaseLinker app has been updated and renamed to Base.com, along with a new logo.

Last updated 11 months ago

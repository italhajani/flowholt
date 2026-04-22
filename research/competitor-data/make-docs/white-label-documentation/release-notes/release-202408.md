---
title: "Release 2024.08 | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/release-notes/release-2024.08
scraped_at: 2026-04-21T12:42:28.902464Z
---

1. Release notes

# Release 2024.08

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

5.0

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

2.16.3

Yes

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

v4.7.0

Yes

gateway

```
gateway
```

3.8.2

-

ipm-server

```
ipm-server
```

v3.25.1-hotfix-1

Yes

ipm-service

```
ipm-service
```

v1.2.2

Yes

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

v2.4.1

Yes

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

v4.7.0

Yes

redis

```
redis
```

v6.2.10

Yes

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

v4.7.0

Yes

trackman

```
trackman
```

v2.9.1

Yes

trigger

```
trigger
```

2.5.0

Yes

web-api

```
web-api
```

v5.7.0-hotfix-3

Yes

web-streamer

```
web-streamer
```

5.6.1

Yes

web-zone

```
web-zone
```

v4.55.1

Yes

## hashtag Public-facing changes

### hashtag Improvements and changes

- We made an improvement to the scenario property creation process. Now, you can add new scenario properties directly from the table view without needing to go back to the Organization → Scenario properties tab. Newly created properties are immediately visible in the table. Note that the Table view is only available for the Enterprise accounts.
- Previously, if a folder had a long name, it was not possible to see the full name in the left sidebar. Now, hovering over a folder with a long name displays a tooltip showing the full name.
- The scenario editor has been updated for better usability. Previously, to add a new module, you had to hover over the last module to see the +Add another module button . Now, the button is always visible and shows a hint upon hover.
- We have released a new major version of our Visual Studio Code extension. The new version brings in the local development for apps, which enables you to use git versioning for custom app development.
- Local development for apps is currently in beta. Feel free to share your feedback!

We made an improvement to the scenario property creation process. Now, you can add new scenario properties directly from the table view without needing to go back to the Organization → Scenario properties tab. Newly created properties are immediately visible in the table. Note that the Table view is only available for the Enterprise accounts.

Previously, if a folder had a long name, it was not possible to see the full name in the left sidebar. Now, hovering over a folder with a long name displays a tooltip showing the full name.

The scenario editor has been updated for better usability. Previously, to add a new module, you had to hover over the last module to see the +Add another module button . Now, the button is always visible and shows a hint upon hover.

We have released a new major version of our Visual Studio Code extension. The new version brings in the local development for apps, which enables you to use git versioning for custom app development.

```
git
```

Local development for apps is currently in beta. Feel free to share your feedback!

### hashtag Fixed issues

- We've updated how we track scenario operations. Now, the list includes operations used to resolve incomplete executions. Plus, the Make API endpoint for listing scenario operations usage arrow-up-right also covers these operations.
- An issue was resolved where scenarios rarely ended with an error when processing items from the webhook queue with sequential processing enabled. The processing of webhook queue items with sequential processing enabled now works as expected.

We've updated how we track scenario operations. Now, the list includes operations used to resolve incomplete executions. Plus, the Make API endpoint for listing scenario operations usage arrow-up-right also covers these operations.

An issue was resolved where scenarios rarely ended with an error when processing items from the webhook queue with sequential processing enabled. The processing of webhook queue items with sequential processing enabled now works as expected.

### hashtag Apps updates

#### hashtag New apps:

- SuiteDash arrow-up-right - We're excited to announce a new powerful CRM tool integration with Make! This highly requested app allows you to manage contacts and companies directly within your SuiteDash account. Now, you can automatically create tasks, projects, and update client information in SuiteDash based on triggers from other apps. Additionally, this integration ensures that data for contacts, invoices, and project statuses are synced and up-to-date across all platforms.
- Chatdata arrow-up-right - This new app is a platform that allows you to create AI chatbots using your chosen data or data provided by the service.
- Iterable arrow-up-right - This app allows you to manage user data and engagement efficiently. With Iterable, you can manage user information, track events, and lists, improving your communication with users

SuiteDash arrow-up-right - We're excited to announce a new powerful CRM tool integration with Make! This highly requested app allows you to manage contacts and companies directly within your SuiteDash account. Now, you can automatically create tasks, projects, and update client information in SuiteDash based on triggers from other apps. Additionally, this integration ensures that data for contacts, invoices, and project statuses are synced and up-to-date across all platforms.

Chatdata arrow-up-right - This new app is a platform that allows you to create AI chatbots using your chosen data or data provided by the service.

Iterable arrow-up-right - This app allows you to manage user data and engagement efficiently. With Iterable, you can manage user information, track events, and lists, improving your communication with users

#### hashtag Updated apps:

- Youtube arrow-up-right - We’ve added new modules that will let you manage your videos, channels, and playlists.
- SugarCRM arrow-up-right - In the advanced settings section, we’ve added a new field API Version that will allow you to enter the version you want to work with.
- OpenAI arrow-up-right - Introducing Batch Modules! Now you can work in bulk with our app’s functionality. We've added five new Batch modules and an Upload a File module.
- Smartsheet arrow-up-right - We’ve added a new Search Rows module.
- BigQuery arrow-up-right - We’ve added a new Get Query Results by Job ID module.
- Hubspot CRM arrow-up-right - There is a new module named Create or Update a Contact . It creates a new contact if the specified email address in the properties does not exist; otherwise, updates the existing contact.
- Google Sheets arrow-up-right - We’ve added two new modules: Bulk Add Rows (advanced) and Bulk Update Rows (advanced) that works with multiple rows.
- Anthropic Claude arrow-up-right - The Create a Message module has been renamed to Create a Prompt.
- Facebook Conversions API for CRM arrow-up-right - Previously named Facebook Conversion Leads, this app has a new video to walk you through the setup process.
- Airtable arrow-up-right - Four new advanced modules for bulk operations have been added to help you manage multiple records.
- NetSuite arrow-up-right - There are two new modules added: Search Records (Saved Search) and Watch Records (Saved Search) .
- Slack arrow-up-right - We’ve updated the terminology within the app for better clarity. The following changes have been made: IM channel → Direct message Multiple IM channel → Direct message to multiple people
- Mem arrow-up-right - The Create a Mem module has been renamed to Create a Mem (Prompt) .
- Azure OpenAI arrow-up-right - The Create a Completion module has been renamed to Create a Completion (Prompt) .

Youtube arrow-up-right - We’ve added new modules that will let you manage your videos, channels, and playlists.

SugarCRM arrow-up-right - In the advanced settings section, we’ve added a new field API Version that will allow you to enter the version you want to work with.

OpenAI arrow-up-right - Introducing Batch Modules! Now you can work in bulk with our app’s functionality. We've added five new Batch modules and an Upload a File module.

Smartsheet arrow-up-right - We’ve added a new Search Rows module.

BigQuery arrow-up-right - We’ve added a new Get Query Results by Job ID module.

Hubspot CRM arrow-up-right - There is a new module named Create or Update a Contact . It creates a new contact if the specified email address in the properties does not exist; otherwise, updates the existing contact.

Google Sheets arrow-up-right - We’ve added two new modules: Bulk Add Rows (advanced) and Bulk Update Rows (advanced) that works with multiple rows.

Anthropic Claude arrow-up-right - The Create a Message module has been renamed to Create a Prompt.

Facebook Conversions API for CRM arrow-up-right - Previously named Facebook Conversion Leads, this app has a new video to walk you through the setup process.

Airtable arrow-up-right - Four new advanced modules for bulk operations have been added to help you manage multiple records.

NetSuite arrow-up-right - There are two new modules added: Search Records (Saved Search) and Watch Records (Saved Search) .

Slack arrow-up-right - We’ve updated the terminology within the app for better clarity. The following changes have been made:

- IM channel → Direct message
- Multiple IM channel → Direct message to multiple people

IM channel → Direct message

Multiple IM channel → Direct message to multiple people

Mem arrow-up-right - The Create a Mem module has been renamed to Create a Mem (Prompt) .

Azure OpenAI arrow-up-right - The Create a Completion module has been renamed to Create a Completion (Prompt) .

Last updated 1 year ago

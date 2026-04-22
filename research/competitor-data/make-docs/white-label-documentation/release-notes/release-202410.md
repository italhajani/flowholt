---
title: "Release 2024.10 | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/release-notes/release-2024.10
scraped_at: 2026-04-21T12:42:27.953434Z
---

1. Release notes

# Release 2024.10

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

2.16.6

Yes

apps-processor

```
apps-processor
```

v2.4.2

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

6.3.4

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

v1.5.77

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

v2.8.4

-

engine

```
engine
```

v4.9.0

Yes

gateway

```
gateway
```

3.8.6

Yes

ipm-server

```
ipm-server
```

v3.27.0

Yes

ipm-service

```
ipm-service
```

v1.2.2

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

-

mongo-auto-indexer

```
mongo-auto-indexer
```

master

Yes

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

v2.4.4

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

v4.9.0

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

v4.9.0

Yes

trackman

```
trackman
```

v2.11.0

Yes

trigger

```
trigger
```

2.5.2

Yes

web-api

```
web-api
```

v5.12.0-hotfix-1

Yes

web-streamer

```
web-streamer
```

v5.7.0

Yes

web-zone

```
web-zone
```

v4.59.4

Yes

## hashtag Public-facing changes

### hashtag Audit Logs release

We're excited to introduce Audit Logs arrow-up-right , a powerful new feature designed to help you monitor activities within your Make account! With Audit Logs, you can:

- Track Key Events : Stay informed about significant events in your Organization or Team, such as scenario creation or deletion, connection updates, user removals, and more.
- Identify User Actions : Easily see who did what and when, as Audit Logs provide the user’s name and a timestamp for each event.
- Filter and Sort Easily : Focus on the information that matters most by selecting a specific timeframe, filtering by event type, or tracking the actions of a particular user.
- View Detailed Event Information : Access comprehensive details for each event logged.

Track Key Events : Stay informed about significant events in your Organization or Team, such as scenario creation or deletion, connection updates, user removals, and more.

Identify User Actions : Easily see who did what and when, as Audit Logs provide the user’s name and a timestamp for each event.

Filter and Sort Easily : Focus on the information that matters most by selecting a specific timeframe, filtering by event type, or tracking the actions of a particular user.

View Detailed Event Information : Access comprehensive details for each event logged.

Audit Logs are available with the Enterprise plan, giving you enhanced visibility and control over your environment.

- Our DevTool, which helps users debug their scenarios, has been rebranded and is now called Make DevTool in the Chrome Web Store. If you’ve been using it before the name change, there’s no need to worry - it will continue to work as usual, just under a new name.
- Users with API access can now create up to 100 API tokens. The former limit was 5.
- We've added new sorting options to the Scenarios list, allowing you to sort scenarios alphabetically from A to Z or by creation date, either from newest to oldest or oldest to newest. Previously, sorting was only available in the Table view, and scenarios in the List view were sorted by status (active/inactive) and then alphabetically from A to Z.
- We're excited to announce that we've added new functions! Math functions arrow-up-right : abs(number) - returns the absolute value of an integer. median([array of values]) - returns the median values in a specified array. trunc(number) - truncates a number to an integer. stdevS([array of values]) - returns the standard deviation of a specified array of sample values. stdevP([array of values]) - returns the standard deviation of a specified array of population values. String function arrow-up-right : replaceEmojiCharacters(text) - replaces emoji characters with the new string.
- When creating a new module in your custom app, you now have three options to choose from: Add example code to the new module (default). Create a blank module with no additional code. Copy code from an existing module to clone it.

Our DevTool, which helps users debug their scenarios, has been rebranded and is now called Make DevTool in the Chrome Web Store. If you’ve been using it before the name change, there’s no need to worry - it will continue to work as usual, just under a new name.

Users with API access can now create up to 100 API tokens. The former limit was 5.

We've added new sorting options to the Scenarios list, allowing you to sort scenarios alphabetically from A to Z or by creation date, either from newest to oldest or oldest to newest. Previously, sorting was only available in the Table view, and scenarios in the List view were sorted by status (active/inactive) and then alphabetically from A to Z.

We're excited to announce that we've added new functions!

- Math functions arrow-up-right : abs(number) - returns the absolute value of an integer. median([array of values]) - returns the median values in a specified array. trunc(number) - truncates a number to an integer. stdevS([array of values]) - returns the standard deviation of a specified array of sample values. stdevP([array of values]) - returns the standard deviation of a specified array of population values.
- String function arrow-up-right : replaceEmojiCharacters(text) - replaces emoji characters with the new string.

Math functions arrow-up-right :

- abs(number) - returns the absolute value of an integer.
- median([array of values]) - returns the median values in a specified array.
- trunc(number) - truncates a number to an integer.
- stdevS([array of values]) - returns the standard deviation of a specified array of sample values.
- stdevP([array of values]) - returns the standard deviation of a specified array of population values.

abs(number) - returns the absolute value of an integer.

```
abs(number)
```

median([array of values]) - returns the median values in a specified array.

```
median([array of values])
```

trunc(number) - truncates a number to an integer.

```
trunc(number)
```

stdevS([array of values]) - returns the standard deviation of a specified array of sample values.

```
stdevS([array of values])
```

stdevP([array of values]) - returns the standard deviation of a specified array of population values.

```
stdevP([array of values])
```

String function arrow-up-right :

- replaceEmojiCharacters(text) - replaces emoji characters with the new string.

replaceEmojiCharacters(text) - replaces emoji characters with the new string.

```
replaceEmojiCharacters(text)
```

When creating a new module in your custom app, you now have three options to choose from:

- Add example code to the new module (default).
- Create a blank module with no additional code.
- Copy code from an existing module to clone it.

Add example code to the new module (default).

Create a blank module with no additional code.

Copy code from an existing module to clone it.

These options help you speed up the process of writing boilerplate code.

- User search no longer requires accents to find a match. Now, searching for a name like "Tomas" will return results for "Tomáš", "Tomás", and "Tomas", making it easier to find users with different accent marks.

User search no longer requires accents to find a match. Now, searching for a name like "Tomas" will return results for "Tomáš", "Tomás", and "Tomas", making it easier to find users with different accent marks.

### hashtag Fixed issues

- Previously, some scenarios would reach their run time limit earlier than expected. This issue has now been resolved, ensuring all scenarios run within their specified time limits.
- When a scenario was cloned in the Table view, the Created By column was left empty. Now, it shows the name of the user who created the original scenario. Please note that the Table view is available only for Enterprise customers.
- The links to incomplete executions in the notification emails sometimes didn't work. This issue has been fixed, and the links now function correctly.
- When manually resolving an incomplete execution, Make didn’t create a new incomplete execution if another module returned an error. This issue has been fixed, so a new incomplete execution is created if an error occurs during the resolution process.
- Before, when a scenario was cloned, the Created By column was empty. Now the name of the user who created the original scenario is shown.

Previously, some scenarios would reach their run time limit earlier than expected. This issue has now been resolved, ensuring all scenarios run within their specified time limits.

When a scenario was cloned in the Table view, the Created By column was left empty. Now, it shows the name of the user who created the original scenario. Please note that the Table view is available only for Enterprise customers.

The links to incomplete executions in the notification emails sometimes didn't work. This issue has been fixed, and the links now function correctly.

When manually resolving an incomplete execution, Make didn’t create a new incomplete execution if another module returned an error. This issue has been fixed, so a new incomplete execution is created if an error occurs during the resolution process.

Before, when a scenario was cloned, the Created By column was empty. Now the name of the user who created the original scenario is shown.

### hashtag Documentation Updates

- We're excited to announce that we've updated our Help Center page on operations arrow-up-right ! It now offers more detailed information, including how operations are used, how to count them, and what steps to take if you're approaching the operation limit of your Make plan.

We're excited to announce that we've updated our Help Center page on operations arrow-up-right ! It now offers more detailed information, including how operations are used, how to count them, and what steps to take if you're approaching the operation limit of your Make plan.

### hashtag Apps updates

New apps:

- Microsoft Advertising Conversions arrow-up-right - A new app allows managing offline and online conversions in your Microsoft Adversiting account.

Microsoft Advertising Conversions arrow-up-right - A new app allows managing offline and online conversions in your Microsoft Adversiting account.

Updated apps:

- LinkedIn arrow-up-right - We have a new, secure connection method using OpenID that enhances privacy and security for your LinkedIn integrations. This feature is also available in certain LinkedIn apps.
- Pipedrive CRM arrow-up-right - We added a couple of new modules that allows you to list deals according to different criteria as well as watch emails.
- Adobe Acrobat Sign arrow-up-right - Now you can define scopes for your connection if you have a custom application in your Adobe Acrobat Sign account.
- UiPath arrow-up-right - The On-prem connection type is no longer available to use.
- Cin7 Core arrow-up-right - Dear Inventory has rebranded to Cin7 Core. We have updated our documentation to ensure it accurately reflects this change.
- Active Campaign arrow-up-right - We added new modules for working with custom objects in your Active Campaign account: Create or Update Custom Object Records and List Custom Object Records .
- LinkedIn Lead Forms arrow-up-right - Previously we had two LinkedIn Lead Forms apps for working with forms and responses. Now you don’t have to split work - just use a new LinkedIn Lead Forms app

LinkedIn arrow-up-right - We have a new, secure connection method using OpenID that enhances privacy and security for your LinkedIn integrations. This feature is also available in certain LinkedIn apps.

Pipedrive CRM arrow-up-right - We added a couple of new modules that allows you to list deals according to different criteria as well as watch emails.

Adobe Acrobat Sign arrow-up-right - Now you can define scopes for your connection if you have a custom application in your Adobe Acrobat Sign account.

UiPath arrow-up-right - The On-prem connection type is no longer available to use.

Cin7 Core arrow-up-right - Dear Inventory has rebranded to Cin7 Core. We have updated our documentation to ensure it accurately reflects this change.

Active Campaign arrow-up-right - We added new modules for working with custom objects in your Active Campaign account: Create or Update Custom Object Records and List Custom Object Records .

LinkedIn Lead Forms arrow-up-right - Previously we had two LinkedIn Lead Forms apps for working with forms and responses. Now you don’t have to split work - just use a new LinkedIn Lead Forms app

Last updated 1 year ago

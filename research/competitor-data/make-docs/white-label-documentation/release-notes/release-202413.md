---
title: "Release 2024.13 | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/release-notes/release-2024.13
scraped_at: 2026-04-21T12:42:24.811567Z
---

1. Release notes

# Release 2024.13

## hashtag Current software version numbers

The following is a list of current software versions running in Make's release environment. You can also find announcements of planned updates and upcoming end-of-life support for specific versions here.

### hashtag Containerization

Kubernetes

1.30

Yes

### hashtag Databases

PostgreSQL

15.5

-

Redis

v6.2.16

Yes

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

Yes

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

2.16.11

Yes

apps-processor

```
apps-processor
```

v2.4.3

Yes

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

v1.0.2

-

broker

```
broker
```

6.3.11

Yes

broker-gw-logger

```
broker-gw-logger
```

6.3.11

-

cron

```
cron
```

v1.0.15

-

datadog-agent

```
datadog-agent
```

7.58.1

Yes

datadog-cluster-agent

```
datadog-cluster-agent
```

7.58.1

Yes

db-updater

```
db-updater
```

v1.5.81

Yes

emails-processor

```
emails-processor
```

v2.10.0

Yes

engine

```
engine
```

v4.11.2

Yes

gateway

```
gateway
```

3.13.5

Yes

imt-auditman

```
imt-auditman
```

1.0.3

-

ipm-server

```
ipm-server
```

v3.29.0

Yes

ipm-service

```
ipm-service
```

v1.4.0

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

Yes

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

v3.2.2

-

scheduler

```
scheduler
```

v4.11.2

Yes

trackman

```
trackman
```

v2.11.2

Yes

trigger

```
trigger
```

2.5.5

-

web-api

```
web-api
```

v5.18.1-hotfix.3

Yes

web-streamer

```
web-streamer
```

5.9.0

Yes

web-zone

```
web-zone
```

v4.63.0

Yes

## hashtag Public-facing changes

### hashtag Improvements and changes

- Users can now update their existing connections when their credentials change, instead of creating and reconfiguring new connections.

Users can now update their existing connections when their credentials change, instead of creating and reconfiguring new connections.

- The scenario inputs arrow-up-right are now available to all Make users. Previously, scenario inputs were available only to users in organizations with the Pro plan or higher.
- The scenario entity in the Make API now has the isActive parameter. This parameter shows whether a scenario is active arrow-up-right . The islinked parameter is now deprecated. Make API still returns the islinked parameter for backward compatibility.
- Custom app developers now have the ability to utilize data structures directly within custom apps. Users can create a data structure and integrate it into their app, similar to how data structures function in data stores.
- Previously, when a Team Admin only had an organization member role, they were unable to add new users to the team. Now, a Team Admin with a member role can see all the organization users and add users to the team.
- Custom app developers can now add a banner to the module settings. You can use banners in module settings to highlight new features or announce changes.

The scenario inputs arrow-up-right are now available to all Make users. Previously, scenario inputs were available only to users in organizations with the Pro plan or higher.

The scenario entity in the Make API now has the isActive parameter. This parameter shows whether a scenario is active arrow-up-right . The islinked parameter is now deprecated. Make API still returns the islinked parameter for backward compatibility.

```
isActive
```

```
islinked
```

```
islinked
```

Custom app developers now have the ability to utilize data structures directly within custom apps. Users can create a data structure and integrate it into their app, similar to how data structures function in data stores.

Previously, when a Team Admin only had an organization member role, they were unable to add new users to the team. Now, a Team Admin with a member role can see all the organization users and add users to the team.

Custom app developers can now add a banner to the module settings. You can use banners in module settings to highlight new features or announce changes.

### hashtag Fixed issues

- When parsing a date with the parseDate function in the timestamp format in milliseconds, users had to convert the timestamp to a number first. This is no longer required. The parseDate function converts timestamps in seconds or in milliseconds directly.
- Previously, attempting to add a custom property would result in an error stating that the property data already exists if there was an empty value for that property. Now, the function recognizes an empty object as a condition and allows the user to add the new property without receiving an error.

When parsing a date with the parseDate function in the timestamp format in milliseconds, users had to convert the timestamp to a number first. This is no longer required. The parseDate function converts timestamps in seconds or in milliseconds directly.

```
parseDate
```

```
parseDate
```

Previously, attempting to add a custom property would result in an error stating that the property data already exists if there was an empty value for that property. Now, the function recognizes an empty object as a condition and allows the user to add the new property without receiving an error.

### hashtag Documentation updates

- LinkedIn Conversions API arrow-up-right - We improved our documentation, so now you have new tips and examples for using fields in the app modules.
- Zenler arrow-up-right - We've updated the Zenler app documentation to ensure all information is clear and accurate for an improved user experience.
- NocoDB arrow-up-right - New documentation for the NocoDB app is now available, detailing how to create the integration in Make.
- Projectworks arrow-up-right - Updated documentation for Projectworks covers how to create connection and detailed module descriptions in Make.
- Schogini AI Wizard arrow-up-right - This app enables users to analyze sentiments, detect languages, extract contact details, and create YouTube metadata.

LinkedIn Conversions API arrow-up-right - We improved our documentation, so now you have new tips and examples for using fields in the app modules.

Zenler arrow-up-right - We've updated the Zenler app documentation to ensure all information is clear and accurate for an improved user experience.

NocoDB arrow-up-right - New documentation for the NocoDB app is now available, detailing how to create the integration in Make.

Projectworks arrow-up-right - Updated documentation for Projectworks covers how to create connection and detailed module descriptions in Make.

Schogini AI Wizard arrow-up-right - This app enables users to analyze sentiments, detect languages, extract contact details, and create YouTube metadata.

### hashtag Apps updates

New apps:

- TikTok Audiences arrow-up-right - A new app that enables you to manage custom audiences, customer audience contacts, customer file audiences, and saved audiences directly from your TikTok Business account.
- Lusha arrow-up-right - This new app helps businesses find accurate and verified contact and company information for easy prospecting and research.
- xAI arrow-up-right - An app enabling users to create text completions from prompts or chats, supporting streamlined automation and enhanced workflows.
- Snapchat Conversions arrow-up-right - This new app allows you to directly send conversions event data to Snapchat's servers, improving conversion tracking accuracy and enhancing campaign performance through better measurement.

TikTok Audiences arrow-up-right - A new app that enables you to manage custom audiences, customer audience contacts, customer file audiences, and saved audiences directly from your TikTok Business account.

Lusha arrow-up-right - This new app helps businesses find accurate and verified contact and company information for easy prospecting and research.

xAI arrow-up-right - An app enabling users to create text completions from prompts or chats, supporting streamlined automation and enhanced workflows.

Snapchat Conversions arrow-up-right - This new app allows you to directly send conversions event data to Snapchat's servers, improving conversion tracking accuracy and enhancing campaign performance through better measurement.

Updated apps:

- LinkedIn Conversions API arrow-up-right - The documentation has been updated with additional details, including Salesforce configuration guidance, required LinkedIn account permissions, and steps for setting up conversion events.
- Snack Prompt arrow-up-right - We've updated the documentation to include more detailed information about the modules in the app.
- ServiceNow arrow-up-right - We have a new connection type that uses custom app client credentials. Our documentation has been updated to explain both connection types.
- LinkedIn Conversion API arrow-up-right - Now you can associate multiple campaigns with a conversion rule: just add as many campaigns as you want by their IDs.
- Klaviyo arrow-up-right - We removed the following modules due to API deprecation: Watch Events Profiles Watch Event Metrics Watch Profiles on a List Watch Profiles on a Segment

LinkedIn Conversions API arrow-up-right - The documentation has been updated with additional details, including Salesforce configuration guidance, required LinkedIn account permissions, and steps for setting up conversion events.

Snack Prompt arrow-up-right - We've updated the documentation to include more detailed information about the modules in the app.

ServiceNow arrow-up-right - We have a new connection type that uses custom app client credentials. Our documentation has been updated to explain both connection types.

LinkedIn Conversion API arrow-up-right - Now you can associate multiple campaigns with a conversion rule: just add as many campaigns as you want by their IDs.

Klaviyo arrow-up-right - We removed the following modules due to API deprecation:

- Watch Events Profiles
- Watch Event Metrics
- Watch Profiles on a List
- Watch Profiles on a Segment

Watch Events Profiles

Watch Event Metrics

Watch Profiles on a List

Watch Profiles on a Segment

Last updated 2 months ago

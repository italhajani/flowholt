---
title: "Release 2026.01 | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/release-notes/release-2026.01
scraped_at: 2026-04-21T12:42:17.441094Z
---

1. Release notes

# Release 2026.01

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

-

MongoDB Cloud

7.0

-

ElasticSearch

7.17.28

Yes

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

79eefccc53375dab9c12b3c4d03b491fc4e9a643

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

v1.1.1

-

broker

```
broker
```

a8737391322e8fcc84ba7c661db7ec8f4f0b0615

Yes

broker-gw-logger

```
broker-gw-logger
```

a8737391322e8fcc84ba7c661db7ec8f4f0b0615

Yes

cron

```
cron
```

v1.1.2

Yes

datadog-agent

```
datadog-agent
```

7.75.0

Yes

datadog-cluster-agent

```
datadog-cluster-agent
```

7.75.0

Yes

db-updater

```
db-updater
```

18332ee6f51bef41dc7d866eb7c924270f6da71d

Yes

emails-processor

```
emails-processor
```

8c25058300e6eaba3291ff92f656bc72ee5f8280

Yes

engine

```
engine
```

21bae5b-20260206

Yes

gateway

```
gateway
```

0220eed7f5178457e51ddea45d38e2cd66171c40

Yes

imt-auditman

```
imt-auditman
```

1.18.0

Yes

ipm-server

```
ipm-server
```

3.56.0

Yes

ipm-service

```
ipm-service
```

2.2.0

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

085e06276ca2f17651af840870ac92d3a9323e4b

Yes

make-apps-processor

```
make-apps-processor
```

1.6.1

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

-

notifications-processor

```
notifications-processor
```

ca37f9e1f7604a90ccefce99c97e9301ef9ec262

-

overseer

```
overseer
```

2f1113b6fe7c44e72b8c8e05a473173e89c3ab9e

-

renderer-processor

```
renderer-processor
```

254d9fcfdf64ca2d94ad87a7b87c1bef2a2d6193

-

roleman

```
roleman
```

ada6622432c9d44eebffe5650e404240e9ab2fa4

Yes

scheduler

```
scheduler
```

21bae5b-20260206

Yes

trackman

```
trackman
```

2.24.2

-

trigger

```
trigger
```

ff7484240fe29328e918df4c3edaf7110c052743

Yes

web-api

```
web-api
```

d56b74bfe88c0d22b33ce6fa6ab89f8ba708753b

Yes

web-streamer

```
web-streamer
```

a070d1f2824b58c8d660700db4f83bea1b35144b

Yes

web-zone

```
web-zone
```

4.75.0

Yes

zone-assets-server

```
zone-assets-server
```

4.75.0

Yes

## hashtag Public-facing changes

### hashtag Pipedrive API v1 to v2 transition

Due to changes in the Pipedrive API, we’ve released updated versions of all Pipedrive modules in Make.

#### hashtag What's changing?

Some of the Pipedrive API v1 modules are now deprecated. Existing scenarios using these modules will continue to run until July 31, 2026 . After this date, Pipedrive API v1 endpoints will no longer be available, and the scenarios using them will stop working. You can no longer create new scenarios using the deprecated modules.

#### hashtag What do you need to do

To keep your scenarios running, replace your Pipedrive API v1 modules with their API v2 equivalents before July 31, 2026.

For a detailed migration guide, see the Pipedrive Developer Documentation arrow-up-right .

#### hashtag Connection type deprecation

The Pipedrive API token connections are deprecated. When creating a new Pipedrive connection, select Pipedrive OAuth in the Connection type field. This is the supported connection method for Pipedrive modules. If you’re using an existing connection created with an API token, update it to use Pipedrive OAuth to ensure compatibility with the current Pipedrive API.

#### hashtag Modules deprecated without replacement

The following Pipedrive modules have been deprecated and do not have a replacement or supported alternative in API v2:

- Add a Recurring Subscription
- Add an Installment Subscription
- Cancel a Recurring Subscription
- Delete a Subscription
- Find Subscription By Deal
- Get a Subscription
- List Payments of a Subscription
- Update a Recurring Subscription
- Update an Installment Subscription

Add a Recurring Subscription

Add an Installment Subscription

Cancel a Recurring Subscription

Delete a Subscription

Find Subscription By Deal

Get a Subscription

List Payments of a Subscription

Update a Recurring Subscription

Update an Installment Subscription

Some deprecated modules don't have direct replacements, but you can replicate the same functionality using other Pipedrive modules with the required filters.

List Activities in a Deal

List Activities

ID filter

List Deals for a Person

List Deals

Person ID filter

List Deals in a Pipeline

List Deals

Pipeline ID filter

List Deals in a Stage

List Deals

Stage ID filter

List Deals in an Organization

List Deals

Organization ID filter

List Persons in a Deal

List Persons

Deal ID filter

Use the modules and filters in the module configuration to achieve the same behavior as the deprecated modules.

#### hashtag Webhook changes

Some webhook endpoints are no longer available in the Pipedrive API v2.

The following webhook modules are replaced by a single generic module:

- New Activity Event → Watch New Events
- New Deal Event → Watch New Events
- New Note Event → Watch New Events
- New Organization Event → Watch New Events
- New Person Event → Watch New Events
- New Product Event → Watch New Events

New Activity Event → Watch New Events

New Deal Event → Watch New Events

New Note Event → Watch New Events

New Organization Event → Watch New Events

New Person Event → Watch New Events

New Product Event → Watch New Events

### hashtag monday.com app v1 to v2 transition

We've released a new version of the monday.com app in Make. Here's what's changing and what you need to know.

#### hashtag What's changing?

Monday.com is updating their API version, and we've released a new version of the monday.com app in Make to support it. While we explored all options to maintain backward compatibility, this change requires an update to how the Make monday.com app works.

Support timeline:

- Now through May 1, 2026: Both v1 and v2 are available and fully supported.
- After May 1, 2026: v1 will no longer be supported. Scenarios still using v1 modules may stop working or return errors.

Now through May 1, 2026: Both v1 and v2 are available and fully supported.

After May 1, 2026: v1 will no longer be supported. Scenarios still using v1 modules may stop working or return errors.

#### hashtag Who is affected?

- Everyone using monday.com: You'll need to upgrade all your modules from v1 to v2 by May 1, 2026. If your scenarios use specific modules with mapping changes, you'll need to update your mappings before or during the upgrade. See below to check if this applies to you.
- Not using monday.com? No action needed.

Everyone using monday.com: You'll need to upgrade all your modules from v1 to v2 by May 1, 2026. If your scenarios use specific modules with mapping changes, you'll need to update your mappings before or during the upgrade. See below to check if this applies to you.

Not using monday.com? No action needed.

#### hashtag Do your modules have mapping changes?

Before you upgrade, check if you're using any of these affected modules. If not, skip to the upgrade steps.

Affected Module Type 1: Discontinued fields

- Modules: List Boards, Get a Board
- What changed: These fields no longer exist: border , var_name , done_colors , color_mapping , labels_position_v2 , hide_footer
- What you do: Remove mappings that reference these fields.

Modules: List Boards, Get a Board

What changed: These fields no longer exist: border , var_name , done_colors , color_mapping , labels_position_v2 , hide_footer

```
border
```

```
var_name
```

```
done_colors
```

```
color_mapping
```

```
labels_position_v2
```

```
hide_footer
```

What you do: Remove mappings that reference these fields.

Affected Module Type 2: Timestamp renamed

- Modules: Get & List: Get an Item, Get an Item's Column Value, List Board's Items, List Group's Items Search: Search Items in the Board by Column Values, Search Items in the Board by Column Values (advanced) Watch: Watch Board's Items (poling trigger), Watch Board's Items by Column Values, Watch Group's Items, Watch Board’s Column Values, Watch Item's Column Value
- What changed: changed_at timestamp is now updated_at
- What you do: Remap any mappings using changed_at to use updated_at instead.

Modules:

- Get & List: Get an Item, Get an Item's Column Value, List Board's Items, List Group's Items
- Search: Search Items in the Board by Column Values, Search Items in the Board by Column Values (advanced)
- Watch: Watch Board's Items (poling trigger), Watch Board's Items by Column Values, Watch Group's Items, Watch Board’s Column Values, Watch Item's Column Value

Get & List: Get an Item, Get an Item's Column Value, List Board's Items, List Group's Items

Search: Search Items in the Board by Column Values, Search Items in the Board by Column Values (advanced)

Watch: Watch Board's Items (poling trigger), Watch Board's Items by Column Values, Watch Group's Items, Watch Board’s Column Values, Watch Item's Column Value

What changed: changed_at timestamp is now updated_at

```
changed_at
```

```
updated_at
```

What you do: Remap any mappings using changed_at to use updated_at instead.

```
changed_at
```

```
updated_at
```

#### hashtag How to upgrade

1. Replace your v1 modules. In the Scenario Builder, look for the green upgrade arrow on your monday.com modules. Click it, then select "Show me new modules" to upgrade to v2.
2. Update affected mappings (if applicable).
For any modules listed above, find and remove or remap the discontinued or changed fields.
3. Test your scenarios. Run your scenarios to ensure they work correctly.

Replace your v1 modules. In the Scenario Builder, look for the green upgrade arrow on your monday.com modules. Click it, then select "Show me new modules" to upgrade to v2.

Update affected mappings (if applicable).
For any modules listed above, find and remove or remap the discontinued or changed fields.

Test your scenarios. Run your scenarios to ensure they work correctly.

Tip: Speed up your migration

You can use the Make DevTool arrow-up-right to speed up your migration. Use the Swap Variable function to update mappings more efficiently across multiple modules instead of editing each one individually.

Where to learn more

- Technical documentation: monday.com arrow-up-right

Technical documentation: monday.com arrow-up-right

### hashtag Updated scenario filtering and sorting

Managing dozens of scenarios gets messy. We have added the ability to sort scenarios by Last edited and redesigned the filtering interface to help you find relevant scenarios faster.

#### hashtag What's new

- Last edited sorting: Scenarios now sort by most recent edits
- Enhanced interface: Cleaner dropdown menu with more sorting options (Name A-Z, Created newest/oldest, Credit usage)

Last edited sorting: Scenarios now sort by most recent edits

Enhanced interface: Cleaner dropdown menu with more sorting options (Name A-Z, Created newest/oldest, Credit usage)

#### hashtag Who it's for

- Teams managing shared scenarios: See which scenarios have been recently updated
- Anyone with multiple scenarios: Sort by last edited to find what you were working on

Teams managing shared scenarios: See which scenarios have been recently updated

Anyone with multiple scenarios: Sort by last edited to find what you were working on

Available on all plans. Start using these features in the Scenario Builder today.

### hashtag Scenario history columns

The Scenario history now supports showing and hiding columns arrow-up-right . This gives you more control over what you see in the Scenario history.

### hashtag Claude Opus 4.6 now available in Make

Anthropic's newest model, Claude Opus 4.6, is now available in Make for AI-powered automations.

#### hashtag What's new

Claude Opus 4.6 is Anthropic's most advanced model, built for:

- Large-scale data processing: 1M token context window lets you process entire codebases or document archives in a single prompt
- Complex reasoning: Enhanced capabilities for multi-step workflows and autonomous decision-making
- Agentic workflows: Built for tool use and course-correction in automated processes

Large-scale data processing: 1M token context window lets you process entire codebases or document archives in a single prompt

Complex reasoning: Enhanced capabilities for multi-step workflows and autonomous decision-making

Agentic workflows: Built for tool use and course-correction in automated processes

Last updated 7 days ago

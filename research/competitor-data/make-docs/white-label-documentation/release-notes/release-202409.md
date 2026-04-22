---
title: "Release 2024.09 | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/release-notes/release-2024.09
scraped_at: 2026-04-21T12:42:28.772488Z
---

1. Release notes

# Release 2024.09

This release includes a crucial security fix for the sandbox across the entire platform. Please ensure that all your software and services are updated to the latest version as soon as possible.

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

2.16.5

Yes

apps-processor

```
apps-processor
```

v2.4.2

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

6.3.2

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

v2.8.4

Yes

engine

```
engine
```

v4.8.1

Yes

gateway

```
gateway
```

3.8.3

Yes

ipm-server

```
ipm-server
```

v3.25.0

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

v2.4.3

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

v4.8.1

Yes

redis

```
redis
```

v6.2.10.1

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

v4.8.1

Yes

trackman

```
trackman
```

v2.10.0

Yes

trigger

```
trigger
```

2.5.1

Yes

web-api

```
web-api
```

v5.9.0-hotfix-1

Yes

web-streamer

```
web-streamer
```

5.6.3

Yes

web-zone

```
web-zone
```

v4.57.1

Yes

## hashtag Public-facing changes

### hashtag Improvements and changes

- Previously, the route order numbers were hidden by default when using a router in your Make scenario. We have now enabled the Show route order option as the default setting, making it easier to view and manage route orders.
- To help avoid accidental deletion of organizations or teams, we've added an additional step. Users now need to type the name of the organization or team to confirm the deletion.
- You can now update your keys in the Keys tab. To do so, navigate to the Keys tab, locate the key you want to update, and click the Edit button. Note that you can only overwrite the existing value with a new one. Both the previous and updated key values will not be visible when editing.
- We've added a Remember this device option for two-factor authentication (2FA). When enabled, this feature allows users to skip 2FA on the same device for 30 days. This option makes accessing your account faster and easier on trusted devices.
- Previously, the cloned Make scenarios were saved in the Uncategorized folder. Now, they stay in the same folder as the original scenario.
- Non-admin users can now decide to leave an organization, with the option to either keep or delete their connections. A confirmation window will appear to help them decide how to manage their connections.
- We’ve added helpful tooltips to the app search. Now, when you hover over the app type badge (Verified, Built-in, Community, etc.), a tooltip will appear, providing a clear explanation of what each badge represents.

Previously, the route order numbers were hidden by default when using a router in your Make scenario. We have now enabled the Show route order option as the default setting, making it easier to view and manage route orders.

To help avoid accidental deletion of organizations or teams, we've added an additional step. Users now need to type the name of the organization or team to confirm the deletion.

You can now update your keys in the Keys tab. To do so, navigate to the Keys tab, locate the key you want to update, and click the Edit button. Note that you can only overwrite the existing value with a new one. Both the previous and updated key values will not be visible when editing.

We've added a Remember this device option for two-factor authentication (2FA). When enabled, this feature allows users to skip 2FA on the same device for 30 days. This option makes accessing your account faster and easier on trusted devices.

Previously, the cloned Make scenarios were saved in the Uncategorized folder. Now, they stay in the same folder as the original scenario.

Non-admin users can now decide to leave an organization, with the option to either keep or delete their connections. A confirmation window will appear to help them decide how to manage their connections.

We’ve added helpful tooltips to the app search. Now, when you hover over the app type badge (Verified, Built-in, Community, etc.), a tooltip will appear, providing a clear explanation of what each badge represents.

### hashtag Fixed issues

- When using the Search or Get modules, if the processed data exceeded 3.5 MB and there were many output bundles, only the last set of bundles would be shown in the module's output. This issue has been resolved. Now, regardless of the amount of processed data or the number of output bundles, all bundles are displayed correctly in the module output.
- Sometimes, module outputs failed to load properly. We've fixed this bug and now you can see module outputs without any issues.

When using the Search or Get modules, if the processed data exceeded 3.5 MB and there were many output bundles, only the last set of bundles would be shown in the module's output. This issue has been resolved. Now, regardless of the amount of processed data or the number of output bundles, all bundles are displayed correctly in the module output.

Sometimes, module outputs failed to load properly. We've fixed this bug and now you can see module outputs without any issues.

### hashtag Apps updates

#### hashtag New apps:

- Canva arrow-up-right - This app provides an intuitive design platform that allows users to create professional-quality graphics and documents with ease, regardless of their design experience. Within Make, you can manage your design assets, folders, and other items to automate working with your projects.
- Zoom arrow-up-right - Experience seamless virtual communication with high-quality video conferencing and easy screen sharing. Before Make had only Zoom for administrators, but now you can enjoy Zoom as a user: handle your webinars, meetings, chats, and cloud recordings from the user prospective.
- Motion arrow-up-right - Motion is a powerful productivity app designed to streamline task and project management with automated scheduling and time-blocking features. With Make modules, you can manage your tasks, projects, and comments.

Canva arrow-up-right - This app provides an intuitive design platform that allows users to create professional-quality graphics and documents with ease, regardless of their design experience. Within Make, you can manage your design assets, folders, and other items to automate working with your projects.

Zoom arrow-up-right - Experience seamless virtual communication with high-quality video conferencing and easy screen sharing. Before Make had only Zoom for administrators, but now you can enjoy Zoom as a user: handle your webinars, meetings, chats, and cloud recordings from the user prospective.

Motion arrow-up-right - Motion is a powerful productivity app designed to streamline task and project management with automated scheduling and time-blocking features. With Make modules, you can manage your tasks, projects, and comments.

#### hashtag Updated apps:

- Zoom Administration arrow-up-right - The already existing Zoom app is now called Zoom Administration. You can use it if you have the administrator role in the Zoom account.
- Active Campaign arrow-up-right - We added several new modules such as Watch Tasks , Watch Deals , Create a Deal and others to let you leverage your data in a more flexible way.
- Bird arrow-up-right - This app, formerly known as MessageBird, has been rebranded. We’ve updated our documentation to reflect this change.
- TikTok Campaign Management arrow-up-right - The existing TikTok app has been renamed to TikTok Campaign Management. This app allows you to manage your campaigns and ads in your TikTok Business account efficiently.
- BambooHR arrow-up-right - The API key connection method has been deprecated. Now, only the OAuth connection is available for connecting the app.
- OpenAI arrow-up-right - In the Message an Assistant module, you can now select a tool that a model will call.
- Shortcut arrow-up-right - Previously called Clubhouse, this app is now named Shortcut. Our documentation has been updated to align with the new name.
- Ortto arrow-up-right - The app formerly known as Autopilot has been rebranded to Ortto. We’ve made updates to our documentation to reflect this rebranding

Zoom Administration arrow-up-right - The already existing Zoom app is now called Zoom Administration. You can use it if you have the administrator role in the Zoom account.

Active Campaign arrow-up-right - We added several new modules such as Watch Tasks , Watch Deals , Create a Deal and others to let you leverage your data in a more flexible way.

Bird arrow-up-right - This app, formerly known as MessageBird, has been rebranded. We’ve updated our documentation to reflect this change.

TikTok Campaign Management arrow-up-right - The existing TikTok app has been renamed to TikTok Campaign Management. This app allows you to manage your campaigns and ads in your TikTok Business account efficiently.

BambooHR arrow-up-right - The API key connection method has been deprecated. Now, only the OAuth connection is available for connecting the app.

OpenAI arrow-up-right - In the Message an Assistant module, you can now select a tool that a model will call.

Shortcut arrow-up-right - Previously called Clubhouse, this app is now named Shortcut. Our documentation has been updated to align with the new name.

Ortto arrow-up-right - The app formerly known as Autopilot has been rebranded to Ortto. We’ve made updates to our documentation to reflect this rebranding

Last updated 1 year ago

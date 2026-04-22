---
title: "Release 2026.02 | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/release-notes/release-2026.02
scraped_at: 2026-04-21T12:42:12.918020Z
---

1. Release notes

# Release 2026.02

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

8.19.13

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

c7574116b1803a674727a1776e91643f9d95b057

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

9eab1f10bdaa4ab9701aac9bb6c145eff4c7a5b7

Yes

broker-gw-logger

```
broker-gw-logger
```

6e9a6541951b7627a96327b878322e25ae534e6a

Yes

cron

```
cron
```

v1.1.3

Yes

datadog-agent

```
datadog-agent
```

7.75.0

-

datadog-cluster-agent

```
datadog-cluster-agent
```

7.75.0

-

db-updater

```
db-updater
```

3282397c268be01f38ec62362173729bec121f05

Yes

emails-processor

```
emails-processor
```

b1e8a78dca74de7cf43ba83fdc2ccef3d23ea5d3

Yes

engine

```
engine
```

dc1ffec-20260331

Yes

gateway

```
gateway
```

31cc4859c735ba5ca9c900965ad4e0da52adc115

Yes

imt-auditman

```
imt-auditman
```

1.21.0

Yes

ipm-server

```
ipm-server
```

3.58.0

Yes

ipm-service

```
ipm-service
```

2.3.3

Yes

kibana

```
kibana
```

7.17.28

Yes

lickman

```
lickman
```

789319483fc65a675b8cc4300a8302949b0a9c46

Yes

make-apps-processor

```
make-apps-processor
```

1.6.1

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

e000e5b913abdfc7ee6551a3db9166d33642ffdb

Yes

roleman

```
roleman
```

a597fe9ff5d9c66d2c4f89bd64c8f79d2531bba2

Yes

scheduler

```
scheduler
```

dc1ffec-20260331

Yes

trackman

```
trackman
```

2.26.1

Yes

trigger

```
trigger
```

4a2f1db7a4761f08d56b873cad08aa58b559fec7

Yes

web-api

```
web-api
```

5d0b268f3784c62b19b26593d06c3ece21d47348

Yes

web-streamer

```
web-streamer
```

2fb26adf4a142aa77b163f93837f862943796ec4

Yes

web-zone

```
web-zone
```

17152b192ccd539f4184735b816d1b6e61e70ab4

Yes

zone-assets-server

```
zone-assets-server
```

17152b192ccd539f4184735b816d1b6e61e70ab4

Yes

## hashtag Public-facing changes

### hashtag Gemini 3.1 Pro Preview model now available in Make

Gemini 3.1 Pro Preview is Google's latest model, built for complex reasoning and high-volume tasks. It's now available in Make across both keyless and bring-your-own-key options.

- Efficient : Optimized to process instructions more efficiently, leading to quicker responses and better overall reliability.
- Cost-effective : the Gemini 3.1 Pro Preview model will process your instructions more concisely, generate faster responses, and lower credit usage for the same results.
- Agent-ready : It is designed for agentic workflows that require tool usage and follow multi-step instructions with precision.

Efficient : Optimized to process instructions more efficiently, leading to quicker responses and better overall reliability.

Cost-effective : the Gemini 3.1 Pro Preview model will process your instructions more concisely, generate faster responses, and lower credit usage for the same results.

Agent-ready : It is designed for agentic workflows that require tool usage and follow multi-step instructions with precision.

### hashtag OpenAI GPT-5.4 and GPT-5.3 models now available in Make

OpenAI's GPT-5.4 and GPT-5.3 models are now available in Make, bringing faster, more cost-efficient AI with expanded context and smarter tool handling to your automations.

### hashtag New encryption and data security guide

All encryption and data security documentation has been consolidated into a new, comprehensive guide arrow-up-right . It includes updated Encryptor app documentation arrow-up-right , a breakdown of data-securing methods, and step-by-step examples for using AES, PGP, digital signatures, and hash functions in your scenarios.

### hashtag OpenAI GPT-5.4 nano and mini now available in Make

OpenAI's GPT-5.4 nanoi and mini are now available in Make. These models are built for speed and efficiency, giving you more options when choosing models for multi-step and agentic workflows.

What's new

- GPT-5.4 mini offers a good balance of strong reasoning, speed, and affordability, and is ideal for coding and multimodal tasks.
- GPT-5.4 nano is a cost-efficient choice for simpler, repetitive tasks, such as data extraction, classification, and routing.

GPT-5.4 mini offers a good balance of strong reasoning, speed, and affordability, and is ideal for coding and multimodal tasks.

```
GPT-5.4
```

GPT-5.4 nano is a cost-efficient choice for simpler, repetitive tasks, such as data extraction, classification, and routing.

```
GPT-5.4
```

Key benefits

- Shorter run times: Mini and nano handle high-volume work that needs to move fast.
- More model variety: Use larger models for orchestration, and mini or nano for subtasks at any scale.
- Cheaper multi-step workflows: Build complex scenarios for classification, intent detection, ranking, triage, and heavy text processing at a lower cost.

Shorter run times: Mini and nano handle high-volume work that needs to move fast.

More model variety: Use larger models for orchestration, and mini or nano for subtasks at any scale.

Cheaper multi-step workflows: Build complex scenarios for classification, intent detection, ranking, triage, and heavy text processing at a lower cost.

### hashtag Deprecated OpenAI model automatically replaced

We've removed the deprecated chatgpt-4o-latest model from the OpenAI app and automatically migrated existing scenarios to gpt-4o-2024-08-06 . No action is required on your part.

```
chatgpt-4o-latest
```

```
gpt-4o-2024-08-06
```

What changed

The chatgpt-4o-latest model is no longer available for selection. Any scenarios that previously used this model now automatically send requests to gpt-4o-2024-08-06 . We made this change to ensure your scenarios continue to run without interruption after OpenAI discontinued the original model.

```
chatgpt-4o-latest
```

```
gpt-4o-2024-08-06
```

What this mean for you

Your scenarios are unaffected and will continue to run as expected. The OpenAI modules in those scenarios will now display gpt-4o-2024-08-06 as the selected model. Keep in mind that outputs may vary slightly due to differences in model behavior.

```
gpt-4o-2024-08-06
```

### hashtag App updates

- Google Sheets arrow-up-right — We've added the option to use column headers as column IDs in the Add a Row and Update a Row modules. In this case, column header names are used as stable IDs, and as long as you don't rename your columns in the sheet, existing mappings will continue to work even if other columns are added, removed, or reordered in the table.
- OpenAI arrow-up-right — Chunking Strategy options are now available in the Generate a Transcription module when using the gpt-4o-transcribe-diarize model. For more information, refer to the OpenAI app documentation arrow-up-right .
- HTTP arrow-up-right — We've released a new Resolve URL module that allows you to follow all automatic redirects to identify the final destination address of a link.
- Google Gemini AI arrow-up-right — Gemini 3 Pro Preview model has been deprecated arrow-up-right since March 9, 2026. Any scenarios using this model in the Simple text prompt or Generate a response modules have been automatically migrated to Gemini 3.1 Pro Preview to avoid interruptions. No action required.

Google Sheets arrow-up-right — We've added the option to use column headers as column IDs in the Add a Row and Update a Row modules. In this case, column header names are used as stable IDs, and as long as you don't rename your columns in the sheet, existing mappings will continue to work even if other columns are added, removed, or reordered in the table.

OpenAI arrow-up-right — Chunking Strategy options are now available in the Generate a Transcription module when using the gpt-4o-transcribe-diarize model. For more information, refer to the OpenAI app documentation arrow-up-right .

```
gpt-4o-transcribe-diarize
```

HTTP arrow-up-right — We've released a new Resolve URL module that allows you to follow all automatic redirects to identify the final destination address of a link.

Google Gemini AI arrow-up-right — Gemini 3 Pro Preview model has been deprecated arrow-up-right since March 9, 2026. Any scenarios using this model in the Simple text prompt or Generate a response modules have been automatically migrated to Gemini 3.1 Pro Preview to avoid interruptions. No action required.

Last updated 5 days ago

---
title: "Responder | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/app-components/modules/responder
scraped_at: 2026-04-21T12:44:41.662648Z
description: "The responder module is used to send a response to the sender of a webhook."
---

1. App components chevron-right
2. Modules

# Responder

The responder module is used to send a response to the sender of a webhook.

The responder should be used when you need to send processed data back to the service. The scenario is initiated by an instant trigger, processes the data received, and then sends the results back to the sender. The responder module has no interface; you just pass parameters in.

## hashtag Components

### hashtag Communication

Only a response directive is available inside the communication . Unlike with most modules, where response handles the data that comes from the API, in this case response defines what the webhook (instant trigger) should send back to the external platform that called it.

```
response
```

```
response
```

```
response
```

### hashtag Static Parameters

You can use static parameters inside the responder module without any restrictions.

### hashtag Mappable Parameters

You can use mappable parameters inside the responder module without any restrictions.

## hashtag Responder example

Last updated 5 months ago

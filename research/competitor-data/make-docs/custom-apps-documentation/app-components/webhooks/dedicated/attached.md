---
title: "Attached | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/app-components/webhooks/dedicated/attached
scraped_at: 2026-04-21T12:44:45.099263Z
---

1. App components chevron-right
2. Webhooks chevron-right
3. Dedicated

# Attached

The new URL address for the webhook, created when a user opens the instant trigger and creates a new webhook, is automatically registered to the service using the attach procedure, and can be unregistered using the detach procedure.

## hashtag Attach

The attach remote procedure is used to automatically attach a webhook to a remote service. You will need to detach this RPC later, and for that you will need the remote procedure’s Id.

```
{"url":"https://www.example.com/api/webhook","method":"POST","body":{"url":"{{webhook.url}}"},"response":{"data":{"externalHookId":"{{body.id}}","token":"{{body.token}}"}}}
```

If the API returns a parameter that should be used in the detach remote procedure, you need to make sure the parameter is mapped in the response.data collection, otherwise the parameter will not be available via webhook.parameter mapping (see the token in the example above).

```
response.data
```

```
webhook.parameter
```

```
token
```

To save the remote webhook id (in order for detach to work), you must use the response.data collection. This collection is available in the detach webhook remote procedure as the webhook IML variable.

```
response.data
```

```
webhook
```

The webhook collection with the webhook’s data is also accessible in regular remote procedure calls if the call is processed in the context of an instant trigger. For example, if you create a dynamic interface for an instant trigger based on parameters entered when the webhook was created.

```
webhook
```

## hashtag Detach

The detach remote procedure is used to automatically detach (delete) a webhook from a remote service when it is no longer needed. The only thing you need to do is to correctly specify the URL to detach a webhook. No response processing is needed.

Last updated 5 months ago

---
title: "Dedicated | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/app-components/webhooks/dedicated
scraped_at: 2026-04-21T12:44:36.617294Z
description: "Unlike a shared webhook, dedicated webhooks are directly linked to the user account. Only notifications for the specific user are received."
---

1. App components chevron-right
2. Webhooks

# Dedicated

Unlike a shared webhook, dedicated webhooks are directly linked to the user account. Only notifications for the specific user are received.

Even when a service sends all data to only one URL registered for the user, it's a dedicated webhook. It's up to you to determine how the app will handle incoming data. Over 90% of services use dedicated webhooks so be cautious when using a shared webhook.

## hashtag Types of dedicated webhooks

### hashtag Attached

For an attached dedicated webhook , the new URL address that is created is automatically registered to the service using an attach procedure and can be unregistered using detach procedure.

If there is an endpoint available in the API for registration of the webhook, the attach directive should be implemented.

### hashtag Not attached

For a dedicated webhook that is not attached , the new URL address that is created has to be registered manually by the user. The user copies the URL address and pastes it to the webhook's settings of the web service.

If there is no attach directive available in the API but the web service allows setting up a webhook manually, implement the dedicated webhook without the attach directive.

Last updated 5 months ago

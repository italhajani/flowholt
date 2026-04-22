---
title: "Instant triggers (scheduled) | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/best-practices/instant-triggers-scheduled
scraped_at: 2026-04-21T12:41:46.076170Z
---

1. Best practices

# Instant triggers (scheduled)

An instant trigger is a webhook that starts a scenario whenever new data arrives.

Your app should implement a fully functional instant trigger as a Watch module , even if an API might have endpoints like Get a webhook, List webhooks, or Update a webhook.

## hashtag Connect metadata

Always save the metadata in the connection if

- the endpoint that can obtain authenticated user’s information is available, and
- the information provided is able to distinguish the connection.

the endpoint that can obtain authenticated user’s information is available, and

the information provided is able to distinguish the connection.

When naming your connection, provide as much information as possible. This provides better identification on the connection page. The following information is suggested:

- Name
- Email
- User ID
- Organization / Company / Location / Tenant

Name

Email

User ID

Organization / Company / Location / Tenant

### hashtag Example - Constant Contact

## hashtag UID

Always save the UID in the connection if the service supports a single webhook URL per app (a shared webhook). The saved UID must match the ID that is included in the incoming webhook payload.

### hashtag Example - Highlevel OAuth 2.0

Last updated 5 months ago

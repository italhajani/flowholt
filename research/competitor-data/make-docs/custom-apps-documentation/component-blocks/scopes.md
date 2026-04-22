---
title: "Scope List | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/component-blocks/scopes
scraped_at: 2026-04-21T12:41:55.136911Z
description: "Scope lists contain all scopes described in a human-readable format."
---

1. Component blocks

# Scope List

Scope lists contain all scopes described in a human-readable format.

## hashtag Specification

The scopes object contains all available scopes used within Make with their human-readable description.

```
{"identify":"Allow application to confirm your identity.","groups:read":"Access information about user's private channels.","channels:read":"Access information about user's public channels.","users:read":"Access the team member's profile information.","im:read":"Access information about user's direct messages.","files:write:user":"Upload and modify files as user.","chat:write:bot":"Send messages as user.","channels:history":"Access user's public channels.","im:history":"Access user's direct messages.","groups:history":"Access user's private channels.","team:read":"Access basic information about the team."}
```

## hashtag View granted scopes in a connection

You can view the scopes granted in a connection:

Click Connections in the left menu.

Find the connection you want to review. If you have many connections, you can use the Search feature in the upper-right corner to find the connection.

Every row with a connection has a lock icon with a number. If there are scopes available in the connection, the number is larger than 0.

Click on the lock icon to view the list of granted scopes in the connection.

Last updated 5 months ago

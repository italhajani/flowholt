---
title: "Dynamic sample RPC | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/app-components/rpcs/dynamic-sample-rpc
scraped_at: 2026-04-21T12:44:44.128238Z
---

1. App components chevron-right
2. Remote Procedure Calls

# Dynamic sample RPC

Dynamic sample RPCs replace hard-coded samples that might become outdated quickly.

Sample is an object representing one item from the response. If you iterate, don’t forget to set "limit": 1 , so only one item is processed for sample data.

```
"limit": 1
```

```
{"url":"/list","method":"GET","response":{"limit":1,"iterate":"{{body}}","output":"{{item}}"}}
```

```
pc://NameOfMyRemoteProcedure"
```

Last updated 5 months ago

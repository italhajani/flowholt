---
title: "Scope | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/component-blocks/scope
scraped_at: 2026-04-21T12:41:54.184994Z
description: "Use Scope to define required scopes when using OAuth."
---

1. Component blocks

# Scope

Use Scope to define required scopes when using OAuth.

## hashtag Specification

Different modules require different scopes. This helps you control the permissions of every account. If the service supports OAuth scopes, you should set corresponding scopes for each module you write.

Scope is an array value that is required to complete the request with a list of scopes successfully.

```
["identify","users:read"]
```

If a module uses RPCs that require particular scopes, the scopes should be listed in the module too.

## hashtag Extend scopes

When a module requires a scope that wasn't required elsewhere previously, a dialog for extending permissions will appear.

Last updated 5 months ago

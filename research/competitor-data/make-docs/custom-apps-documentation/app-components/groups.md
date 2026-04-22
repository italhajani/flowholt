---
title: "Groups | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/app-components/groups
scraped_at: 2026-04-21T12:41:51.452973Z
description: "Use groups to divide app modules into logical blocks and to change the order of modules in the GUI."
---

1. App components

# Groups

Use groups to divide app modules into logical blocks and to change the order of modules in the GUI.

## hashtag Default groups

When creating a new app, new modules are automatically added to the Other group. If you've never used this feature in your app before, all of your modules will be placed in this group by default and displayed in categories based on their function.

```
Other
```

```
[{"label":"Other","modules":["createTask","updateTask","getTask","listTasks","listNotes","watchTasks","watchNotes"]}]
```

When there's only a single Other group, the modules are grouped according to their type.

```
Other
```

## hashtag Change the groups and order

By changing the Groups file, you can set up as many groups as you want and group the modules into logical blocks. Once you create a new group and put a single module there, your app will no longer use the default grouping.

The modules are displayed in the same order as they are specified in the Groups section.

One module can belong to one or more groups, but it has to belong to at least one. You won't be allowed to save the group's configuration otherwise.

This code produces the error: Not categorized module(s): getTask

```
Not categorized module(s): getTask
```

Last updated 5 months ago

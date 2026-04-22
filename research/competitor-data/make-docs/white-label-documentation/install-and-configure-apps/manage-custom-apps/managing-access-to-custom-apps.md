---
title: "Managing access to custom apps | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/install-and-configure-apps/manage-custom-apps/managing-access-to-custom-apps
scraped_at: 2026-04-21T12:45:34.531895Z
---

1. Install and configure apps chevron-right
2. Manage custom apps

# Managing access to custom apps

The method for restricting access to a custom app depends on its development stage:

- Private - Once a user has created a custom app, they can use it in scenarios. The only way to restrict access is to disable the apps platform from Administration > System settings before users create custom apps. It is possible to delete an app but only when it is private. Once published, it is no longer possible to delete an app.
- Public - Once published, a custom app is visible and accessible to all users in the creator's organization. You can prevent users outside of the organization from installing the app by setting the license object parameter arrow-up-right installPublicApps to false .
- Approved - After approving and compiling a custom app, the only way to restrict access and visibility is the same as for native apps. You can turn visibility off and on at a global level or assign an app tier.

Private - Once a user has created a custom app, they can use it in scenarios. The only way to restrict access is to disable the apps platform from Administration > System settings before users create custom apps. It is possible to delete an app but only when it is private. Once published, it is no longer possible to delete an app.

Public - Once published, a custom app is visible and accessible to all users in the creator's organization. You can prevent users outside of the organization from installing the app by setting the license object parameter arrow-up-right installPublicApps to false .

```
installPublicApps
```

```
false
```

Approved - After approving and compiling a custom app, the only way to restrict access and visibility is the same as for native apps. You can turn visibility off and on at a global level or assign an app tier.

Last updated 1 year ago

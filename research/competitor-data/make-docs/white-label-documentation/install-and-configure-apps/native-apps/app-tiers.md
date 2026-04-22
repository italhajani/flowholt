---
title: "App tiers | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/install-and-configure-apps/native-apps/app-tiers
scraped_at: 2026-04-21T12:45:30.379048Z
---

1. Install and configure apps chevron-right
2. Native apps

# App tiers

Make White Label lets you designate tier levels for apps. Tiers limit access to apps so that only specific end-users can use those apps in their scenarios. For example, Make uses tiers to offer a premium level of apps reserved for Enterprise customers.

You can assign app tier levels by entering an integer between 0 and 3 in an app's configuration page. 0 means that the app is available to all organizations. 3 indicates the highest premium tier. Each tier level includes all apps from lower tiers. For example, tier 2 includes tier levels 0, 1, and 2.

You can then define an organization's access to premium tiers via the organization's license object arrow-up-right .

1. Go to Administration > Native Apps > {app} .
2. Under Premium app , use the arrows to assign an integer from 0 to 3 inclusive.
3. A confirmation message briefly appears. You can now use the premiumApps parameter of the license object to control access.

Go to Administration > Native Apps > {app} .

Under Premium app , use the arrows to assign an integer from 0 to 3 inclusive.

A confirmation message briefly appears. You can now use the premiumApps parameter of the license object to control access.

```
premiumApps
```

Last updated 1 year ago

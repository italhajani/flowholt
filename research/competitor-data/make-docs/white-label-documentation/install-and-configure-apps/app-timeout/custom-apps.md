---
title: "Custom Apps | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/install-and-configure-apps/app-timeout/custom-apps
scraped_at: 2026-04-21T12:45:33.898441Z
description: "For custom apps, you can add a timeout parameter in the app's configuration."
---

1. Install and configure apps chevron-right
2. App timeout

# Custom Apps

For custom apps, you can add a timeout parameter in the app's configuration.

To change the timeout of a custom app:

1. Go to the Apps page and click Detail for the app you want to edit.
2. Go to the Base tab.
3. Add or change the timeout in the app's Common data field by entering the following parameter with time in milliseconds: {"timeout":300000}
4. Click the save icon.

Go to the Apps page and click Detail for the app you want to edit.

Go to the Base tab.

Add or change the timeout in the app's Common data field by entering the following parameter with time in milliseconds: {"timeout":300000}

```
{"timeout":300000}
```

Click the save icon.

The maximum timeout value is 300,000 milliseconds.

The page validates and saves your updated timeout. You can view this information in the Common data field.

Last updated 1 year ago

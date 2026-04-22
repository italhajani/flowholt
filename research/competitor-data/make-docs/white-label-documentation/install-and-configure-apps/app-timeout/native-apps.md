---
title: "Native apps | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/install-and-configure-apps/app-timeout/native-apps
scraped_at: 2026-04-21T12:45:32.976146Z
---

1. Install and configure apps chevron-right
2. App timeout

# Native apps

To change the timeout of a native app:

1. Open the app on the Native apps page.
2. Go to the relevant app version.
3. Change the timeout in the app's Common data by entering the following parameter with time in milliseconds: {"timeout":300000}
4. Click the save icon.

Open the app on the Native apps page.

Go to the relevant app version.

Change the timeout in the app's Common data by entering the following parameter with time in milliseconds: {"timeout":300000}

```
{"timeout":300000}
```

Click the save icon.

The maximum timeout value is 300,000 milliseconds.

The page validates and saves your updated timeout. You can view this information in the Common data field.

Last updated 1 year ago

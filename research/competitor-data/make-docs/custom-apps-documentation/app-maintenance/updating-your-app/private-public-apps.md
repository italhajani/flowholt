---
title: "Private/Public apps | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/app-maintenance/updating-your-app/private-public-apps
scraped_at: 2026-04-21T12:44:29.446380Z
---

1. App Maintenance chevron-right
2. Update your app

# Private/Public apps

## hashtag Changes

In custom apps that haven't been approved by Make, it's not possible to keep track of changes as there is no Diff tool available.

If you need to keep track of your changes and you are not planning to have your app approved by Make, you can export the current version of your app every time you make a change using the VS Code extension and store the files on GitHub or any similar tool.

All changes take effect immediately. Before saving a change, make sure it will not negatively affect existing scenarios.

You must ensure that you do not have JavaScript syntax warnings or errors in your custom IML functions in your app.

Otherwise, all scenarios that are using the app will throw the error message about JavaScript syntax and will be stopped immediately.

This affects all scenarios even if they run app modules that do not contain the faulty custom IML functions.

## hashtag Versioning

If you find out that there has been a new API version implemented, or there have been major changes in the current API made, you should create a new app.

This will ensure that everything is consistent and that there are no breaking changes made in the current app.

Last updated 5 months ago

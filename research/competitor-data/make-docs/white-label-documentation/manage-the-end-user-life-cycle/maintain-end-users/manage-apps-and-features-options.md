---
title: "Manage apps and features options | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/manage-the-end-user-life-cycle/maintain-end-users/manage-apps-and-features-options
scraped_at: 2026-04-21T12:45:58.022279Z
---

1. Manage the end-user life cycle chevron-right
2. Maintain end users

# Manage apps and features options

The Apps and Features tab of the user detail page offers options useful for users developing custom apps on your platform.

## hashtag Can create Apps without ID suffix

When a user creates a custom app, there is an automatically generated internal name for the app. By default, that automatically assigned name includes a random string suffix. Native apps developed by Make do not have this suffix. The ID suffix allows the Make apps team and end users to create apps for the same third-party app. Allowing your end users to create apps without the ID suffix might create conflicts that prevent you from installing native apps. For example, if you create your own custom app for Google Sheets with a suffix ID, you cannot install Make's native app for Google Sheets because of conflicting names.

### hashtag Can use custom IML functions in Apps

IML is Make's function notation for javascript . Enabling this option lets the user create custom functions using IML.

This custom IML function applies only to using IML within custom apps. Custom functions for scenarios are a separate feature you can enable via the organization's license.

### hashtag Can commit changes to approved Apps

Once you publish and compile an app on your instance, changes to that custom app risk breaking scenarios. This option lets a user commit changes to an app previously approved and compiled. See our documentation on breaking changes for more details on the risks involved.

### hashtag Can see hidden modules

After you approve and compile an app, that app receives a private tag. This means that users cannot see or access the app until you publish the app. Enabling this option lets the user see and access the private app and its modules.

### hashtag Allow access to internal IP addresses from scenarios

Only applicable for on-premises instances. Enabling allows the enabled user to create scenarios that access your local network via your internal IP addresses. Enabling this option might compromise your network security.

Last updated 1 year ago

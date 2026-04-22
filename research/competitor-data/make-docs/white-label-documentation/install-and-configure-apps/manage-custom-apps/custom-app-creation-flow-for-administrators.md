---
title: "Custom app creation flow for administrators | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/install-and-configure-apps/manage-custom-apps/custom-app-creation-flow-for-administrators
scraped_at: 2026-04-21T12:45:33.357668Z
---

1. Install and configure apps chevron-right
2. Manage custom apps

# Custom app creation flow for administrators

The following sections describe the main stages of app visibility and the related administrative procedures.

## hashtag Private app

All custom apps begin as a private app. Only instance-level admins and the user who creates the app can access it in the apps platform and develop the app.

Private apps can be shared within an organization by installing them . An instance-level admin can install the app to an organization by logging in as a user:

1. Go to Administration > Users .
2. Find the user who created the app and click Detail .
3. In the upper right, click Login as user .
4. Once logged in as the user, create a scenario using any module from the private app.
5. Save the scenario.
6. In the popup, confirm the installation of the private app in the organization.

Go to Administration > Users .

Find the user who created the app and click Detail .

In the upper right, click Login as user .

Once logged in as the user, create a scenario using any module from the private app.

Save the scenario.

In the popup, confirm the installation of the private app in the organization.

If you don't know which user created the app, you can find this in the Author column of Administration > Apps .

Once installed, all organization members can use the custom app's modules in their scenarios.

## hashtag Public app

A public app is a custom app that the creating user has published. Like an installed private app, it appears for all organization users when they build scenarios. The difference is that the creating user has a link to share the app with any user on your instance. They share this link by copy-pasting it into an email or messenger app. The link recipient then installs the app on their organization.

Instance administrators can publish a custom app by the following procedure:

1. Go to Administration > Apps .
2. Find the custom app you want to publish and click Detail .
3. In the upper-right corner, click Publish .

Go to Administration > Apps .

Find the custom app you want to publish and click Detail .

In the upper-right corner, click Publish .

The Share public link and Request approval buttons replace Publish .

You can use the license parameter installPublicApps to control whether an organization can install an app developed in an external organization:

- true to permit installation
- false to deny installation Default value

true to permit installation

false to deny installation Default value

```
false
```

## hashtag Approved app

Approving an app releases the app to all users and organizations on your instance. The custom app becomes one of your native apps and breaking changes are possible. Because of the accessibility and risks involved, be sure to test an app before approving it. Make tests all fields of all modules in scenarios before releasing an app.

### hashtag Approval flow

Once published, a user can submit their app for review and approval by clicking Request approval . The custom app then appears with a ✓ in the In review column of Administration > Apps .

To approve a custom app:

1. Go to Administration > Apps .
2. Find the custom app with a ✓ in the In review column and click Details .
3. In the upper-right corner, click Approve .
4. A popup appears prompting you to name the app. The name entered here is an internal identifier and does not appear in the user UI. Best practice is to delete any suffix. For example: example-app but not example-app-abc123
5. Click Save .

Go to Administration > Apps .

Find the custom app with a ✓ in the In review column and click Details .

In the upper-right corner, click Approve .

A popup appears prompting you to name the app. The name entered here is an internal identifier and does not appear in the user UI. Best practice is to delete any suffix. For example: example-app but not example-app-abc123

```
example-app
```

```
example-app-abc123
```

Click Save .

A small popup appears to confirm that the custom app was successfully compiled.

## hashtag Beta

You can mark custom apps as beta to indicate this status to all users. A beta label appears behind the app's name in all contexts: scenario builder, apps platform, and admin UI.

```
beta
```

1. Go to Administration > Apps .
2. Find the custom app you want to publish and click Detail .
3. In the upper-right corner, click Options .
4. Click Add beta label .

Go to Administration > Apps .

Find the custom app you want to publish and click Detail .

In the upper-right corner, click Options .

Click Add beta label .

The label now appears after the app's name on the same page and all other contexts.

You can remove the beta label by following the above procedure and clicking Remove beta label in step 4.

```
beta
```

Last updated 5 months ago

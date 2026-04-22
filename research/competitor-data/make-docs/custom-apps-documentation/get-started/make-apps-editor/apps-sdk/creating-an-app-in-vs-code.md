---
title: "Create an app in VS Code | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/get-started/make-apps-editor/apps-sdk/creating-an-app-in-vs-code
scraped_at: 2026-04-21T12:45:23.243369Z
---

1. Get started chevron-right
2. Select your editor chevron-right
3. Visual Studio Code

# Create an app in VS Code

Now that you have generated your API key and configured VS Code , you can now create your app.

To create an app in VS Code:

Click the + icon in the header of the My apps section or call the >New app command directly from the command palette.

```
+
```

```
My apps
```

```
>New app
```

Enter a label. This is the app name that users will see in the Scenario builder.

A placeholder app ID is generated for you. It will be used in the URL paths and in the scenario blueprint. It should be clear to which app it leads and it has to match (^[a-z][0-9a-z-]+[0-9a-z]$) regular expression.

```
(^[a-z][0-9a-z-]+[0-9a-z]$)
```

This value can't be changed.

Enter the app version. Currently, you can only create apps in version 1.

Enter a description of your app.

Enter a color theme for your app. This is the color of the app's modules as seen in scenarios. The theme is in hexadecimal format. For example, the Make app's color is #6e21cc .

```
#6e21cc
```

Enter the language of the app's interface. Most aps in Make are in English.

Enter countries where the app will be available. If you do not select any countries, Make will consider the app to be global.

Confirm the last dialog.

Your app is in the My Apps view and you can start coding.

Last updated 3 months ago

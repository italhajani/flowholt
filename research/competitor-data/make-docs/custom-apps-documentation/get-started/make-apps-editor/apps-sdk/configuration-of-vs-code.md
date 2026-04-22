---
title: "Configure VS Code | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/get-started/make-apps-editor/apps-sdk/configuration-of-vs-code
scraped_at: 2026-04-21T12:45:23.113131Z
---

1. Get started chevron-right
2. Select your editor chevron-right
3. Visual Studio Code

# Configure VS Code

To configure VS Code, first generate an API key in Make .

Then install the Make Apps Editor. You can get the Make Apps Editor from the VS Code Marketplace arrow-up-right or install it in the Extensions tab in VS Code.

Click the Make icon on the VS code sidebar. This activates the Map Apps Editor.

If you haven't set up a development environment, you will see a message in a pop-up window.

Click the Add environment button to launch the environment setup or execute the command: >Make Apps: Add SDK Environment from the command palette.

```
>Make Apps: Add SDK Environment
```

Fill in the API URL in the next pop-up window. The API URL depends on your Make zone.

For example, the US1 Make zone has the API URL: us1.make.com/api .

```
us1.make.com/api
```

If the app you want to access originates from a different zone than your account, enter the app's zone.

Fill in the label for the environment in the next pop-up window. Press Enter to confirm the environment label.

Enter your Make API key that you previously created in Make.

The Make Apps Editor extension restarts with the environment configuration.

A new sidebar appears in VS code with a list of your custom apps and Make open-source apps. If you previously created any, your custom apps are listed in the block My apps . The Make open-source apps are listed in the Open source apps field at the bottom of the VS code sidebar.

The open-source apps code is only available in the EU1 zone.

If your zone is different and you want to access their code, create a new environment with the eu1.make.com/api environment URL.

```
eu1.make.com/api
```

## hashtag Switch between environments

In the Make Apps Editor, you can work across multiple environments.

To identify the active environment, check the indicator in the bottom status bar. Click the environment indicator to switch between environments.

Add another environment by executing the >Add SDK environment command again, as described in Step 2 above.

```
>Add SDK environment
```

### hashtag Useful settings

Navigate to Extensions > Make Apps Editor > Extension Settings > Edit in settings.json to add more settings.

Here are some settings for better performance and experience:

- Set editor.formatOnSave to true in VS Code settings. Source codes will be formatted automatically when you save them.
- Set editor.quickSuggetions.strings to true in VS Code settings. Keyword recommendations will automatically show up while you're typing in IML strings too.

Set editor.formatOnSave to true in VS Code settings. Source codes will be formatted automatically when you save them.

```
editor.formatOnSave
```

```
true
```

Set editor.quickSuggetions.strings to true in VS Code settings. Keyword recommendations will automatically show up while you're typing in IML strings too.

```
editor.quickSuggetions.strings
```

```
true
```

## hashtag Log out and log in of an environment

You can log out using the >Logout command and log back in with the >Login command.

```
>Logout
```

```
>Login
```

When you log out, the API key is removed from the settings.json file.

```
settings.json
```

To log in again, you will need to enter your API key.

You can use this flow to change your API key in an environment.

Last updated 3 months ago

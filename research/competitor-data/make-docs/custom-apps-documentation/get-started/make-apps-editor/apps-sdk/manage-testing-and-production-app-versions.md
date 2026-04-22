---
title: "Manage testing and production app versions | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/get-started/make-apps-editor/apps-sdk/manage-testing-and-production-app-versions
scraped_at: 2026-04-21T12:45:24.759621Z
---

1. Get started chevron-right
2. Select your editor chevron-right
3. Visual Studio Code

# Manage testing and production app versions

When developing an application, to manage the production and test versions:

- the developer writes and tests the code with the test application in Make.
- the developer tracks changes in the local git repository, pulling changes from the test application.
- the developer pushes the changes to the production application from the local testing app when they finish the development and testing.

the developer writes and tests the code with the test application in Make.

the developer tracks changes in the local git repository, pulling changes from the test application.

```
git
```

the developer pushes the changes to the production application from the local testing app when they finish the development and testing.

This process improves the maintenance and stability of the application because the development does not influence the production version of the application. In addition, all changes can be tracked in a git repository, providing a clear and organized development workflow.

```
git
```

## hashtag Prerequisites

To start the development of testing and production app versions, the following is needed:

- The production version of an app in Make. If you already have an app that is in use, use it as the production app.
- The cloned production version in a local workspace. Clone the app to the local workspace , if you haven't done so already.
- The testing version of an app in Make. Create a new app in Make, with no content, that will function as the testing version of the app.
- Optional: use version control with Git. To properly track all changes in the local app, it is recommended to use a Git repository, for example, GitHub.

The production version of an app in Make. If you already have an app that is in use, use it as the production app.

The cloned production version in a local workspace. Clone the app to the local workspace , if you haven't done so already.

The testing version of an app in Make. Create a new app in Make, with no content, that will function as the testing version of the app.

Optional: use version control with Git. To properly track all changes in the local app, it is recommended to use a Git repository, for example, GitHub.

## hashtag Development flow

Below is a diagram explaining how a developer can develop testing and production app versions.

## hashtag Create a testing version of an app

First, create a testing version of the Make app .

Once the origin for the testing app is successfully created, you need to deploy the current code from the app that already exists, which we can call "Production".

Right-click on the makecomapp.json file and select Deploy to Make (beta) .

Select the app origin that represents the testing app.

Press Enter to confirm the creation of the component.

If you don't want to create the component, click Ignore permanently/do not map with remote option.

The app is deployed to Make.

## hashtag Develop the components in the testing app

Now, you can start developing new components or editing the current components in the Testing app in Make, and thoroughly test the app in the Scenario Builder.

## hashtag Pull changes from the testing app to the local app

Once you finish the development of new changes and components in the testing app, you can push the changes to the local app .

## hashtag Deploy the changes from the local app to the production app

To synchronize the changes made to the testing app with the production app, follow these steps

Last updated 3 months ago

---
title: "Prerequisites | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/app-review/prerequisites
scraped_at: 2026-04-21T12:41:40.061695Z
---

1. App Review

# Prerequisites

When you want to make your custom app public and share it with all Make users, your app has to conform to Make standards. Following Make app development standards is a prerequisite to get an app review. Make app standards encompass:

- Custom app functionality
- Custom app code best practices
- Testing your custom app with test scenarios

Custom app functionality

Custom app code best practices

Testing your custom app with test scenarios

Review the following sections to learn more about each prerequisite.

## hashtag Custom app functionality

In Make, we develop apps to provide value to our users. Your custom app should use a service that Make doesn't integrate yet. All apps in Make require from the user only credentials that are necessary to create a connection to the service API. If you want to make your custom app public, your app functionality has to follow the same principles:

- Your custom app uses a web service that is not already available in Make.
- Your custom app and its modules have to connect to a web service API. Avoid duplicating the same functionality as iterators, aggregators, or other tools in Make.
- Avoid using APIs that have strong dependencies on other APIs, or APIs that function as redirects to other APIs.
- Avoid using APIs that don't have their own domain, or have their domain associated with service platforms like Heroku or AWS.
- Your custom app has to use only credentials that the service requires to create a connection. Don't request any additional credentials from the user.
- If your custom app is a scraper app, it can't include the name of a third-party service in your app or module names.

Your custom app uses a web service that is not already available in Make.

Your custom app and its modules have to connect to a web service API. Avoid duplicating the same functionality as iterators, aggregators, or other tools in Make.

Avoid using APIs that have strong dependencies on other APIs, or APIs that function as redirects to other APIs.

Avoid using APIs that don't have their own domain, or have their domain associated with service platforms like Heroku or AWS.

Your custom app has to use only credentials that the service requires to create a connection. Don't request any additional credentials from the user.

If your custom app is a scraper app, it can't include the name of a third-party service in your app or module names.

## hashtag Custom app code

When developing a custom app in Make, you should first go through our Best Practices guide and apply them to your code. By following our best practices, you will ensure that the review and publication process of your app is as smooth as possible.

Before sending an app for review, check that:

- The base and connection have sanitization of sensitive data, e. g. API key or token.
- The base and connection have error handling .
- The base and connection use an endpoint in the app's API.
- The connection is using a correct URL . If the user uses incorrect credentials, they get an error.
- Modules have correct labels and descriptions .
- The app has a universal module .
- All modules have the correct interface depending on the output from the module.
- All dates are formatted or parsed in the mappable parameters and interface .
- Search modules, trigger modules, and RPCs have a limit parameter .
- Search modules, trigger modules, and RPCs have pagination if it's supported in the service API.

The base and connection have sanitization of sensitive data, e. g. API key or token.

The base and connection have error handling .

The base and connection use an endpoint in the app's API.

The connection is using a correct URL . If the user uses incorrect credentials, they get an error.

Modules have correct labels and descriptions .

The app has a universal module .

All modules have the correct interface depending on the output from the module.

All dates are formatted or parsed in the mappable parameters and interface .

Search modules, trigger modules, and RPCs have a limit parameter .

```
limit
```

Search modules, trigger modules, and RPCs have pagination if it's supported in the service API.

The items above are mandatory for each app.

## hashtag Testing your custom app

After you check the code of your custom app, you must create test scenarios to show that the custom app works. Use each module of the custom app in at least one test scenario.

Make sure that the testing scenarios and their execution logs don't contain personal or sensitive data.

### hashtag Best practices for test scenarios

- Do not use scenarios with another app's webhook.
- Try to put all of the app's modules in one scenario and run the scenario without errors. Connect the app modules based on the object the modules work with or the action the modules perform.
For example, Create a Task > Create a Subtask (in order to create a subtask, the task has to be created first).

Do not use scenarios with another app's webhook.

Try to put all of the app's modules in one scenario and run the scenario without errors. Connect the app modules based on the object the modules work with or the action the modules perform.
For example, Create a Task > Create a Subtask (in order to create a subtask, the task has to be created first).

- Put the search and list modules at the end of separate scenario routes to avoid multiple runs of the subsequent modules.
- Run your search and list modules to have logs with pagination. If you don't know how to test pagination, follow the steps here .
- Create a separate scenario that produces an error message. Run the scenario to get an error:

Put the search and list modules at the end of separate scenario routes to avoid multiple runs of the subsequent modules.

Run your search and list modules to have logs with pagination. If you don't know how to test pagination, follow the steps here .

Create a separate scenario that produces an error message. Run the scenario to get an error:

Run the test scenarios right before you request the custom app review and every time you fix issues. The scenario execution logs have a data retention limit and the reviewer won't be able to access old logs.

Last updated 5 months ago

---
title: "Initial setup in Make | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/create-your-first-app/create-your-app
scraped_at: 2026-04-21T12:41:36.172470Z
---

1. Create your first app

# Initial setup in Make

In our step-by-step examples, we use the Geocodify API. You can follow along with our example or you can select a different API to build your first custom app.

To set up your custom app for Geocodify:

Log in to Make and go to the Custom Apps section.

In the upper-right corner, click + Create app .

In the pop-up window, fill in the app details. The chart below contains the values to use for your Geocodify app.

Name

geocodify-app

A unique identifier for your custom app. This is an internal name and is not visible in the scenario builder. Must match the following Regex: /^[a-z][0-9a-z-]+[0-9a-z]$/

```
/^[a-z][0-9a-z-]+[0-9a-z]$/
```

Label

Geocodify

Name of the custom app in the scenario editor.

Description

Provides geocoding and access to a spatial database.

Optional: Description of the custom app.

Theme

#46367f

Color of the app in the scenario editor. Specified with a hex code.

Language

English

The language of your app.

Audience

Global

Where the app is available. At the moment, this parameter doesn't have any effect.

App logo

Optional: Logo of the app used in the scenario editor.

For more information on logo specs, see the App logo article .

Click Save .

You can now see your custom app listed on the Custom Apps page where you can view the Make app environment to continue with the setup of the connection , Base , and module for your app.

Last updated 5 months ago

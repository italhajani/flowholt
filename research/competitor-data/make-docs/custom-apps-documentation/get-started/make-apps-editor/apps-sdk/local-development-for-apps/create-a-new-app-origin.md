---
title: "Create a new app origin | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/get-started/make-apps-editor/apps-sdk/local-development-for-apps/create-a-new-app-origin
scraped_at: 2026-04-21T12:46:13.772605Z
---

1. Get started chevron-right
2. Select your editor chevron-right
3. Visual Studio Code chevron-right
4. Local development for Apps

# Create a new app origin

In the app development process, there are situations where it can be highly beneficial to push changes to multiple app origins. This is especially useful when managing different versions of an app, such as maintaining both a testing and a production app.

To create a new app origin:

Clone the production app to a local workspace.

Create a testing app in Make and name it <App Label> Testing.

Go to the makecomapp.json file in the local app repository. Locate the origins array of the collection and enter a new item by copying the code below and editing the values as instructed under the code.

```
origins
```

```
"origins":[{/*--- Existing origin ---*/},{"label":"Testing","baseUrl":"https://eu1.make.com/api","appId":"my-first-app-test","appVersion":1,"apikeyFile":"../.secrets/apikey"}]
```

- label - the label of the local origin
- baseUrl - the URL to the origin's zone
- appId - the name of the app

label - the label of the local origin

```
label
```

baseUrl - the URL to the origin's zone

```
baseUrl
```

appId - the name of the app

```
appId
```

If the local app is shared among multiple developers, the origins array will contain records for each connection between their local and Make (remote) app. Do not edit the current records to prevent breaking the connections.

```
origins
```

Save the changes in the makecomapp.json file.

You have created a new app origin.

Last updated 3 months ago

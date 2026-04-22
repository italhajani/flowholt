---
title: "Base | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/create-your-first-app/apps-environment/base
scraped_at: 2026-04-21T12:43:55.823116Z
---

1. Create your first app chevron-right
2. Make app environment

# Base

The Base component contains the common settings of the app that are inherited by all modules.

The common settings include:

- Base URL : The API base URL used as the main address for all requests to the API.
- Authorization : Authentication information and credentials.
- Error Handling and Sanitization : Same as the Connections component.

Base URL : The API base URL used as the main address for all requests to the API.

Authorization : Authentication information and credentials.

Error Handling and Sanitization : Same as the Connections component.

If a module doesn’t define a setting, it follows what’s in the Base . However, if a module specifies a different value for the same setting, for example a different error handling directive, this overrides what's present in the Base.

The Base component is the code where you specify the common directives and the common data if needed. When you create a new app, the Base is filled in with default code.

## hashtag Set up Base for your Geocodify custom app

To set up the Base for your custom app:

Remove the default code that is present.

Copy and paste the following code:

"baseUrl": "https://api.geocodify.com/v2",

```
"baseUrl": "https://api.geocodify.com/v2",
```

Contains the base URL of the API. Note that it contains the API version.

"api_key": "{{connection.apiKey}}"

```
"api_key": "{{connection.apiKey}}"
```

Contains the query parameter for authentication.

Note that the apiKey parameter is taken from the Connections component and accessed using connecotin.apiKey.

"response": { "error": { // Error handling "message": "[{{body.meta.code}}] {{body.meta.error_detail}}" } },

```
"response": {
```

```
"error": { // Error handling
```

```
"message": "[{{body.meta.code}}] {{body.meta.error_detail}}"
```

```
}
```

```
},
```

Instructions on how to handle errors.

Note that in this case the code is the same as in the Connections component.

"log": { "sanitize": [ "request.qs.api_key" ] }

```
"log": {
```

```
"sanitize": [
```

```
"request.qs.api_key"
```

```
]
```

```
}
```

Instructions on the information that is saved in the logs.

sanitize specifies what needs to be omitted.

Note that in this case the code is the same as in the Connections component.

Click Save changes .

Continue to set up the module .

Last updated 5 months ago

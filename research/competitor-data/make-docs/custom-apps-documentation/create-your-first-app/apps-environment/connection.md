---
title: "Connections | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/create-your-first-app/apps-environment/connection
scraped_at: 2026-04-21T12:43:54.592002Z
---

1. Create your first app chevron-right
2. Make app environment

# Connections

When building the Connections component, you will set up the form that appears when the user clicks Create a connection in a module.

You will define the parameters the user has to input and how these are handled by the apps engine to verify the authentication parameters.

The Connections component defines the details needed to authenticate with the API and ensures everything works when the user enters their credentials in the scenario editor.

It has three main jobs:

1. to get any relevant information from the user that adds the connection (credentials, API key, etc.)
2. to process the authentication
3. to check if the authentication works by making a test API call

to get any relevant information from the user that adds the connection (credentials, API key, etc.)

to process the authentication

to check if the authentication works by making a test API call

You set this up in the Communication tab, while the Parameters tab holds the information the user needs to provide.

The code in the Communication tab is divided into three sections:

The first part defines the HTTP request the app uses to validate the user's credentials.

This call happens when the user enters their credentials and clicks Create a Connection .

The usual way to validate credentials is to call an API endpoint that returns user details. If the API doesn't provide this, you can use a generic endpoint to validate the credentials by making a GET request to ensure that the authentication is correct. The default HTTP method is GET , so you don’t need to specify it.

Adding this validation call is a good practice to make sure the credentials are correct.

The second part contains directives on how to handle the response :

- metadata : Stores the user details that are returned by the API call and displays them next to the connection in the Connections page, for ease of identification.
- error : Contains instructions on the information that is displayed when an error occurs to help the user understand the issue. Lets you set the type of error and the message that will appear if the API request fails.

metadata : Stores the user details that are returned by the API call and displays them next to the connection in the Connections page, for ease of identification.

error : Contains instructions on the information that is displayed when an error occurs to help the user understand the issue. Lets you set the type of error and the message that will appear if the API request fails.

The third part contains instructions regarding the log and the information recorded in it:

- sanitize : specifies which information shouldn't be recorded in the logs for security reasons.

sanitize : specifies which information shouldn't be recorded in the logs for security reasons.

The code in the Parameters tab contains only one parameter: apiKey . This is the information the user has to provide in the scenario. Note that the parameter is used in the Communication tab using the notation {{parameters.name}} .

```
apiKey
```

```
{{parameters.name}}
```

## hashtag Set up connections for your Geocodify custom app

To set up the connections for your custom app:

In the Connections component, click Create Connection .

Fill in the details of your connection.

- Label: Geocodify API key
- Type: API Key

Label: Geocodify API key

Type: API Key

Click Save .

Select the Parameters tab and remove the default parameter that is present.

Copy and paste the following code:

name

Required. Internal name of the parameter. Use it when you want to retrieve the parameter

label

Parameter name as displayed in the module.

type

Required. Data type of the parameter.

help

Instructions for the user displayed in the module setup. Supports Markdown for text formatting.

required

Specifies if the parameter is required.

editable

(Only for the connection) Specifies if the user can edit and modify the connection from the Connections page in Make.

Click Save changes .

In the Communication tab, remove the code present.

Copy and paste the following code:

"url": "https://api.geocodify.com/v2/geocode", "qs": { "api_key": "{{parameters.apiKey}}" },

```
"url": "https://api.geocodify.com/v2/geocode",
```

```
"qs": {
```

```
"api_key": "{{parameters.apiKey}}"
```

```
},
```

Request that the apps engine makes to validate the credentials.

- url : Absolute URL of the endpoint that is used for validation.
- qs : Query string.
- api_key : Key of the qs parameter as specified by the API docs. This means that it will use the apiKey that the user provides.

url : Absolute URL of the endpoint that is used for validation.

qs : Query string.

api_key : Key of the qs parameter as specified by the API docs. This means that it will use the apiKey that the user provides.

"response": { "error": { "message": "[{body.meta.code}}] {body.meta.error_detail}}" } },

```
"response": {
```

```
"error": {
```

```
"message": "[{body.meta.code}}] {body.meta.error_detail}}"
```

```
}
```

```
},
```

Instructions on how to display any error: [error code] error message .

This information is typically present in the API docs. Since it isn’t available in this case, you need to retrieve it manually.

Send a request with incorrect credentials in Postman, then check the response body to identify where the error code and message appear.

If available, it's good practice to include the status code in the error response.

"log": { "sanitize": [ "request.qs.api_key" ] }

```
"log": {
```

```
"sanitize": [
```

```
"request.qs.api_key" ]
```

```
}
```

Indicates to omit the api_key parameter present in the query string of the request from the log.

Click Save changes .

Continue to set up the Base .

Last updated 5 months ago

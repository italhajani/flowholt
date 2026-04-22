---
title: "Access control using basic connection | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/community-apps/tips-and-tricks/control-of-access-in-apps-using-basic-connection
scraped_at: 2026-04-21T12:45:22.007184Z
---

1. Community Apps chevron-right
2. Tips and tricks

# Access control using basic connection

If your app uses a basic connection, you can control access to your app by implementing access control and transforming the connection from a basic to an OAuth connection. The transformation offers several advantages, including:

- restricting app usage to only those users with granted access
- revoking access when necessary, such as in cases of expired subscriptions to your app
- maintaining the authorization flow that establishes a new connection with provided credentials to the API service
- ensuring that the access control flow is secure and not exposed in the browser console or DevTool
- centralizing access control code within a single location, preventing redundancy across modules or RPCs
- managing a reasonable volume of requests to the backend responsible for access control within your app

restricting app usage to only those users with granted access

revoking access when necessary, such as in cases of expired subscriptions to your app

maintaining the authorization flow that establishes a new connection with provided credentials to the API service

ensuring that the access control flow is secure and not exposed in the browser console or DevTool

centralizing access control code within a single location, preventing redundancy across modules or RPCs

managing a reasonable volume of requests to the backend responsible for access control within your app

The solution described below is just one of many possible approaches. Feel free to explore alternative methods as well.

## hashtag Database of users with granted access to your app

First, you need a database with the list of users with granted access, their credentials, time zone, and the date of access expiration.

In our guide, we store the list of users and their credentials in a Google Sheets spreadsheet. The spreadsheet contains the following columns:

- EMAIL (text): Email of the user for better recognition.
- TOKEN (text): Token that was provided to the user to access the app.
- VALID UNTIL (date-time): The date until which the user can access the app.

EMAIL (text): Email of the user for better recognition.

TOKEN (text): Token that was provided to the user to access the app.

VALID UNTIL (date-time): The date until which the user can access the app.

You can automate the subscription flow with a scenario in Make, for example:

- the generation of a token for a new user
- updating the date of expiration upon the user's payment for the month/year subscription

the generation of a token for a new user

updating the date of expiration upon the user's payment for the month/year subscription

## hashtag Backend for the access control flow

To access the database of users you need to implement an endpoint that, whenever called, will return information on whether the user has been granted access to your API. In our guide, we use a scenario in Make that handles the backend of the access control.

Create the scenario from this template arrow-up-right .

### hashtag Scenario used as the backend for the access control

1. Webhooks > Custom webhook : Listens to a request that contains data with user's credentials that you have provided to the user. In this case, we used the parameter token .
2. Google Sheets > Search Rows : Searches for the record belonging to the user. Here, we look up via the token parameter.

Webhooks > Custom webhook : Listens to a request that contains data with user's credentials that you have provided to the user. In this case, we used the parameter token .

```
token
```

Google Sheets > Search Rows : Searches for the record belonging to the user. Here, we look up via the token parameter.

```
token
```

1. Router : Handles two available results - the user does/doesn't have access to the app.

Router : Handles two available results - the user does/doesn't have access to the app.

Note that the function works with the timezone parameter. The timezone of the developer is used.

```
timezone
```

```
timezone
```

The timezone parameter is used because the mapped date-time is not a timestamp and does not include information about the time zone.

```
timezone
```

Do not forget to edit the timezone value according to the time zone your system is working in.

```
timezone
```

Note the checked checkbox for the fallback route. When the first route is not executed, the route for returning error will be triggered.

1. Webhooks > Webhook Response (1) : If the user does have access to the app, status code 200 is returned to the webhook together with the date of expiration.

Webhooks > Webhook Response (1) : If the user does have access to the app, status code 200 is returned to the webhook together with the date of expiration.

```
200
```

Note that the function works with the timezone parameter. The time zone of the developer is used.

```
timezone
```

The time zone parameter is used because the mapped date-time is not a timestamp and does not include information about the time zone.

This ensures that the date of expiration is correctly parsed and the connection will expire in the user's time zone, for example 22.9.2023 23:59:59 in America/Chicago.

```
22.9.2023 23:59:59
```

```
America/Chicago.
```

Do not forget to edit the timezone value according to the time zone your system is working in.

```
timezone
```

1. Webhooks > Webhook Response (2) : If the user doesn't have access to the app, status code 400 is returned to the webhook. Additionally, the error message is returned.

Webhooks > Webhook Response (2) : If the user doesn't have access to the app, status code 400 is returned to the webhook. Additionally, the error message is returned.

```
400
```

Notice, that we differentiate 2 situations:

- the user doesn't have the correct credentials
- the user does have the correct credentials but their subscription has expired

the user doesn't have the correct credentials

the user does have the correct credentials but their subscription has expired

## hashtag Connection implementation in the app

Now, since we have the backend for access control ready, we can use it in our app.

It is recommended to first implement the basic connection and make sure it works correctly.

### hashtag 1. The current implementation of basic connection

In our guide, the API we connect our app to uses basic access authentication. Therefore, this code in the communication tab in basic connection was originally implemented:

Go to your basic connection, that you have implemented and tested, and have it open in your web browser.

### hashtag 2. Creation of a new OAuth connection

In your web browser, open a new tab with your app, go to the Connections tab, and click Create a new Connection. In the pop-up window, select the type Oauth 2 (authorization code) . Click Save .

```
Oauth 2 (authorization code)
```

### hashtag 3. Set up connection parameters

Go to the tab with the basic connection and copy the connection parameters to your clipboard. Then, go to the second tab with your new OAuth connection and paste the connection parameters from your clipboard. Next, enter the parameters you use for your access control. Save the changes.

```
basic
```

In our guide, we used our token parameter.

```
token
```

Note the token parameter that doesn't belong to the integrated API.

```
token
```

The token parameter is used by us to control the app access.

```
token
```

Note the token parameter that doesn't belong to the integrated API.

```
token
```

The token parameter is used by us to control the app access.

```
token
```

### hashtag 4. Set up the access control flow in connection

#### hashtag Implementation of authentication to the API

Go to the tab with the basic connection and copy the code in the communication tab. Then go to the second tab with your new OAuth connection and paste the code into the info directive. Nothing needs to be changed in the code.

```
basic
```

```
info
```

#### hashtag Implementation of access control to our app

Now, you need to implement the token directive that will call the backend for access control. The token directive should contain:

```
token
```

```
token
```

- URL : The URL of the endpoint that handles the access control. In our guide we used our webhook .
- User's credentials parameters : The parameters that you share with the user are passed to the endpoint handling access control. In our guide, we used the token parameter.
- Error handling : The directive that handles the error returned from the endpoint. Also, it returns the error message from the response.
- Access control flow : The flow that ensures the connection is created only if the user has been granted access to the app, or re-verified when the user's connection expires. The flow works with these parameters: condition - A condition that makes sure the token directive is also executed whenever the existing connection expires. When a module with an expired connection is triggered in a scenario, the token directive is executed. response.data.expires - A date-time parameter that says when the connection will expire. This ensures that once the connection expires, the token directive with the endpoint for checking whether the user still has a valid subscription to your app will be called, and the date of expiration extended.

URL : The URL of the endpoint that handles the access control. In our guide we used our webhook .

User's credentials parameters : The parameters that you share with the user are passed to the endpoint handling access control. In our guide, we used the token parameter.

```
token
```

Error handling : The directive that handles the error returned from the endpoint. Also, it returns the error message from the response.

Access control flow : The flow that ensures the connection is created only if the user has been granted access to the app, or re-verified when the user's connection expires. The flow works with these parameters:

- condition - A condition that makes sure the token directive is also executed whenever the existing connection expires. When a module with an expired connection is triggered in a scenario, the token directive is executed.
- response.data.expires - A date-time parameter that says when the connection will expire. This ensures that once the connection expires, the token directive with the endpoint for checking whether the user still has a valid subscription to your app will be called, and the date of expiration extended.

condition - A condition that makes sure the token directive is also executed whenever the existing connection expires. When a module with an expired connection is triggered in a scenario, the token directive is executed.

```
condition
```

response.data.expires - A date-time parameter that says when the connection will expire. This ensures that once the connection expires, the token directive with the endpoint for checking whether the user still has a valid subscription to your app will be called, and the date of expiration extended.

```
response.data.expires
```

After you implement the code in the communication tab, save the changes.

Connection's communication code with comments explaining the functionality of each parameter:

Note that we don't use sanitization so the connection logs will not be available. The webhook's URL will not be exposed.

```
sanitization
```

### hashtag 5. Connect the new OAuth connection to a module

To test the right functionality of the OAuth connection, you need to connect it to an existing module. Go to a module and remove the current basic connection, then connect the new oauth connection.

If you need to test or compare the functionality of the basic connection, you can map it as the alternative connection.

### hashtag 6. Test the correct functionality of access control in the app

Since the new OAuth connection is created and connected to a module, you can test its correct functionality and adjust it if needed. The test cases in our example are described below.

To ensure the proper evaluation of access control functionality within your application, you will need to periodically modify the value in the VALID UNTIL column in the table of users multiple times.

```
VALID UNTIL
```

For example, now is 22.9.2023 15:43:00 and you need to verify, that the verification process will work correctly, therefore, you can set the date 22.9.2023 15:45:59 so that you have enough time to create a connection and then run the module after the expiration.

```
22.9.2023 15:43:00
```

```
22.9.2023 15:45:59
```

#### hashtag Testing the creation of a connection

- Test case : An invalid token has been provided.
- Expected result : A connection is not created due to an error from the access control endpoint.

Test case : An invalid token has been provided.

Expected result : A connection is not created due to an error from the access control endpoint.

Note the error message that was returned from the access control endpoint.

- Test case : A valid token has been provided but the access has expired.
- Expected result : A connection is not created due to an error from access control endpoint.

Test case : A valid token has been provided but the access has expired.

Expected result : A connection is not created due to an error from access control endpoint.

Note the error message that was returned from the access control endpoint.

- Test case : A valid token has been provided but credentials to the API service are incorrect.
- Expected result : A connection is not created due to an error from the API service.

Test case : A valid token has been provided but credentials to the API service are incorrect.

Expected result : A connection is not created due to an error from the API service.

Note the error message that was returned from the API service.

#### hashtag Testing the expiration of the connection during the app's use

The goal of access control is to be able to manage the expiration of the access to the app.

Below, you can see how it behaves when the connection expires and the access to the app hasn't been prolonged. The user is not able to use the module until they pay for their subscription.

### hashtag 7. Switch the connection from basic to OAuth in all modules, webhooks, RPCs

If you already have created modules, webhooks, and/or RPCs, once you confirm that your OAuth connection with access control works as expected, you need to switch the connection from the original one (basic) to the new one (OAuth) in all modules, webhooks and RPCs.

If you just created the app and made the connection work, just connect the new (OAuth) connection to the new module/webhook/RPC whenever you create it.

If your app is still private , you can delete the old (basic) connection.

If your app is already public , it is recommended to rename the old connection (basic) so it is obvious it should not be used anymore.

Example of a new connection label: [DO NOT USE] Make

```
[DO NOT USE] Make
```

Last updated 5 months ago

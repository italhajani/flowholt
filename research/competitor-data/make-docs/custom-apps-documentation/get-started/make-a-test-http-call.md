---
title: "Make a test HTTP call | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/get-started/make-a-test-http-call
scraped_at: 2026-04-21T12:41:34.122010Z
---

1. Get started

# Make a test HTTP call

In our step-by-step examples, we use the Geocodify API. You can follow along with our example or you can select a different API to build your first custom app.

Now that you have selected the editor you want to use , we recommend completing these first steps before building your first app :

1. Get an API token from Geocodify
2. Review the Geocodify API documentation
3. Do a Postman test
4. Make an HTTP call

Get an API token from Geocodify

Review the Geocodify API documentation

Do a Postman test

Make an HTTP call

## hashtag Get an API token

To get your API token from Geocodify: arrow-up-right

Got to the Geocodify website arrow-up-right and click Sign Up to create an account.

Enter your details and click Register (or log in Google or GitHub).

At the bottom of the Overview page in your dashboard, copy your API Key and store it in a safe place.

You will use the Geocodify API key later, when you create your app.

## hashtag Review the API documentation

To plan the HTTP call, study the Geocodify API documentation arrow-up-right , paying particular attention to the information regarding authentication, the API Base URL, the API endpoints, and the query parameters for the Search API.

Authentication

This section provides authentication details.

For this API you need to use an API key , which should be included in your request query string using the api_key parameter, along with the value that you obtained from the Geocodify website.

```
api_key
```

API Base URL

This section provides the base URL that you will use to access all the API endpoints.

The base URL is https://api.geocodify.com/v2

```
https://api.geocodify.com/v2
```

API Endpoints

This section lists all the available endpoints.

For this use case, you will use the /geocode endpoint to get the coordinates of a specific address.

```
/geocode
```

Query parameters for the Search API

api_key: The API key used for authentication.

q: The address for which you want to retrieve the coordinates.

The documentation doesn't specify the HTTP method, but since you are retrieving coordinates, you should use the GET method .

## hashtag Do a Postman test

It is good practice to test the HTTP call using Postman before building it in Make. This ensures that everything is working properly and helps you plan the HTTP call setup in Make.

In Postman arrow-up-right , create a new request and add the necessary elements to make the HTTP call:

- Method: GET
- URL (base + endpoint): https://api.geocodify.com/v2/geocode
- Query parameters: api_key: your API key q: address to search, for example Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France

Method: GET

URL (base + endpoint): https://api.geocodify.com/v2/geocode

```
https://api.geocodify.com/v2/geocode
```

Query parameters:

- api_key: your API key
- q: address to search, for example Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France

api_key: your API key

q: address to search, for example Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France

Click Send .

The API responds ( HTTP 200 OK successful response status code) with a JSON file containing the address information and the API key.

```
HTTP 200 OK successful response
```

If something is not working properly, use the error that the API returns to troubleshoot any issues.

## hashtag Make an HTTP call

After a successful Postman test, build your call using the HTTP module in Make.

According to the Geocodify API documentation arrow-up-right , you need to provide an API key as a query parameter.

In the Scenario Builder, add the HTTP > Make a request module.

For Authentication type , select API key.

For Credentials , click Create a keychain .

Change the name of the new keychain if you wish, then fill in the following:

- Key: your Geocodify API key
- API Key placement: In the query parameters
- API Key parameter name: api_key

Key: your Geocodify API key

API Key placement: In the query parameters

API Key parameter name: api_key

Click Create .

Add the necessary information for the API call, including the address for which you want to retrieve the coordinates:

- URL (base + endpoint): https://api.geocodify.com/v2/geocode
- Method: GET
- Query parameters : 
Parameter 1 Name: q
Parameter 1 Value: Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France
- Parse response - Yes (this allows you to map the response items if needed)

URL (base + endpoint): https://api.geocodify.com/v2/geocode

```
https://api.geocodify.com/v2/geocode
```

Method: GET

Query parameters : 
Parameter 1 Name: q
Parameter 1 Value: Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France

Parse response - Yes (this allows you to map the response items if needed)

Click Save .

Save your scenario and click Run once .

After a successful run, your module output can be found under Output> Data > Response > Features> 1> Geometry> Coordinates .

You are now ready to create your custom app .

Last updated 4 months ago

---
title: "Modules | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/create-your-first-app/apps-environment/module
scraped_at: 2026-04-21T12:43:55.956615Z
---

1. Create your first app chevron-right
2. Make app environment

# Modules

In Make, you can set up six different types of modules , each with a specific function.

In this tutorial, you will set up a Search module to retrieve the coordinates of an address.

The Search module sends a request and returns multiple results . Use this module when you want to let users search for records.

Inside the Search module component there are five tabs:

Information on what the engine needs to do to manage the API call (call the endpoint, process the response, pagination, etc). Remember that the following elements are inherited from the Base : base URL , error handling , log sanitize . If something needs to be changed, you can write it here, and it will override the settings of the Base component.

Input parameters that the user cannot map from other modules. They are only used for polling triggers, which don't have mappable parameters.

Input parameters in the interface that the user can either enter manually or map from the output of other modules.

Labels of the module's output added to make the output more straightforward and easy to interpret. By specifying it, there’s no need to first run the module in your scenario to get the output structure for mapping the elements.

Examples of data to help the users set up the module.

## hashtag Create a Search module

To create a new module for your Geocodify app:

In the Modules tab, click Create Module .

In the pop-up window, fill in the module details. The chart below contains the values to use for your Geocodify app.

Template

Blank module (you will set it up from scratch)

Type

Search (to retrieve geolocation details)

Connection

Geocodify API Key (the connection you have created earlier)

Name

geocode

Label

Search geolocation

Description

Provides longitude, latitude, and place details of a location (address, name of a place, or location).

Click Save .

Click the Mappable Parameters tab for your new search module.

Copy and paste the following code:

name

Required. Internal name of the parameter. Use it when you want to access the parameter using {{parameters.name}} .

```
{{parameters.name}}
```

label

Parameter name displayed in the module setup.

type

Required. Type of the parameter.

help

Instructions for the user displayed in the module setup. It supports Markdown for text formatting.

required

Specifies if the parameter is required.

Click Save changes .

Click the Communications tab for your new search module.

Copy and paste the following code:

url

The API endpoint. Since it starts with / , it is joined to the base URL. Note that if the URL starts with https:// , it will override the base URL.

```
/
```

```
https://
```

method

The default method is GET, so it could have been omitted in this case.

qs

Query parameter containing the location to geolocate. Note that you access it by using parameters.location_info .

```
parameters.location_info
```

response

Defines the output returned, which in this case is the whole body of the response.

Click Save changes .

Leave all the other tabs as they are, including the Interface . This means that you won't apply any filtering or customization to the output, but all the information from the API will be returned as is.

Now you are ready to test your app .

Last updated 5 months ago

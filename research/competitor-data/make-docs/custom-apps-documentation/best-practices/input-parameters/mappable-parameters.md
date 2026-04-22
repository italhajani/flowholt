---
title: "Mappable parameters | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/best-practices/input-parameters/mappable-parameters
scraped_at: 2026-04-21T12:44:19.244241Z
description: "A mappable parameter is a variable or setting that you can change or link (map) to another value."
---

1. Best practices chevron-right
2. Input parameters

# Mappable parameters

A mappable parameter is a variable or setting that you can change or link (map) to another value.

## hashtag Types of fields

You can use mappable parameters in many types of fields:

- Visible by default
- Frequently used
- Typically easy to understand
- Visible on the third-party’s Web UI by default
- Consider copying the UX from the third-party’s Web UI, for clarity
- Limit should be the last variable

Visible by default

Frequently used

Typically easy to understand

Visible on the third-party’s Web UI by default

Consider copying the UX from the third-party’s Web UI, for clarity

Limit should be the last variable

```
Limit
```

- Hidden by the Advanced settings toggle
- Not needed by the majority of users
- Generally more difficult to understand
- Might require technical knowledge. A hint or link to documentation is necessary
- Includes custom fields, if supported by the app
- Hidden on the third-party’s Web UI
- Placed at the bottom of all fields. This ensures that when users toggle to the advanced settings, they can easily view them without being mixed in with regular fields
- Consider copying the UX from the third-party’s Web UI, for clarity
- Limit should be the last variable

Hidden by the Advanced settings toggle

Not needed by the majority of users

Generally more difficult to understand

Might require technical knowledge. A hint or link to documentation is necessary

Includes custom fields, if supported by the app

Hidden on the third-party’s Web UI

Placed at the bottom of all fields. This ensures that when users toggle to the advanced settings, they can easily view them without being mixed in with regular fields

Consider copying the UX from the third-party’s Web UI, for clarity

Limit should be the last variable

```
Limit
```

- Require minimal effort to make the module work
- Validate if the user has filled in all necessary fields required by the API call
- Guard against getting an API error from the third party due to missing fields
- Ideally contain a default value
- If an advanced field, must contain a default value

Require minimal effort to make the module work

Validate if the user has filled in all necessary fields required by the API call

Guard against getting an API error from the third party due to missing fields

Ideally contain a default value

If an advanced field, must contain a default value

- Required based on a condition. For example: Either field A or field B is required The field is only required to create but not update in an upsert module
- A clear hint is mandatory to explain the condition
- Should follow required fields and be located before optional fields This could be an exception if the fields have to be arranged in logical blocks

Required based on a condition. For example:

- Either field A or field B is required
- The field is only required to create but not update in an upsert module

Either field A or field B is required

The field is only required to create but not update in an upsert module

A clear hint is mandatory to explain the condition

Should follow required fields and be located before optional fields

- This could be an exception if the fields have to be arranged in logical blocks

This could be an exception if the fields have to be arranged in logical blocks

- Not necessary for the API to work, but good to have
- Enrich the UX by providing flexibility to the user to send all fields the API supports

Not necessary for the API to work, but good to have

Enrich the UX by providing flexibility to the user to send all fields the API supports

When mapping parameters, there are different types of fields to choose from.

Static fields

With static fields, all parameters are manually specified in the module, so every users sees the same options. Though not ideal, some APIs require the use of static fields.

Dynamic fields

With dynamic fields, all parameters are loaded dynamically from the API, using dynamic fields RPCs . The options shown to a user are based on the user's account specifications. For example, a user who is a manager may have access to more files and folders in an account than another employee. Every user will have a different experience interacting with the module based on their account login. Whenever possible, using dynamic fields is the ideal approach.

Sometimes field types in third-party applications do not match types supported in Make. In this case, when defining mappable parameters using an RPC, you also need to implement a custom IML function to convert the type.

Semi-dynamic fields

It's also possible to use a combination of static and dynamic fields to customize the user experience, based on user settings and availability in the API.

Custom fields are user-defined fields in the third-party application. You can use custom fields with RPCs as well, for further customization.

However, if an API supports implementation of custom fields where the field name and field value may be specified by the user (the user is creating new custom fields), both of the fields should not be mandatory. There may be reasons for a value to be empty, and requiring both could cause an error. Instead, require only field value . Additionally, if the API doesn't allow empty values, the validation of an empty value should be set so the pair will not be sent.

## hashtag Date parameters

Use the date and time type parameters instead of asking users to format the date and time themselves. These values should be formatted in the backend to support Make's format.

Exception: If the endpoint accepts date only or time only, use the text parameter with a clear hint and example.

```
text
```

Even though this will be sent correctly, it is not user-friendly.

### hashtag Processing of date parameters

When a field is a type "date", it should be possible to use our keyword "now" as a value. The field should accept ISO-8601 date format and if the service requires only the date (no time) or a different format like timestamp, this formatting should happen inside the module.

Users of the app should never be prompted to format the date inputs the way API requires. Apps that require this will not be approved by Make.

Communication :

Parameter birthday is required to have format YYYY-MM-DD and parameter due_date is required to be a time stamp by the service, so the formatting happens inside the Communication part of the module.

```
birthday
```

```
due_date
```

Parameters :

The parameters birthday and due_date are correctly date typed and don't need to be formatted by the user who can use the now keyword.

```
birthday
```

```
due_date
```

```
now
```

Communication :

Parameter birthday is required to have format YYYY-MM-DD and parameter due_date is required to be a time stamp but nothing is done with the value.

```
birthday
```

```
due_date
```

Parameters :

The parameter due_date is an incorrect type and birthday is required to be formatted by the user.

```
due_date
```

```
birthday
```

## hashtag Support of array aggregators

If the API doesn't support arrays or arrays of collection, you need to implement an IML function that enables the use of array aggregators.

## hashtag Remote procedure calls (RPCs)

For every parameter where options are listed dynamically (values pulled from the API), you should implement an RPC, especially when you need to provide an ID (or raw value) instead of a label.

For example, if you have a lot of customers and you don’t remember their IDs, the RPC will display a list of names / emails and fill in the ID for you. Also, RPCs help the user to understand the behavior and outputs of the module before building the logic of their scenario.

If there are many RPCs nested to each other, you need to implement an additional select which allows users to choose whether they will map the deepest parameter from previous modules or whether they will follow every RPC to select every parameter in order to get into the deepest parameter.

### hashtag Edit mode

The edit mode ( "mode": "edit" ) is used in modules where the RPCs should be switched off by default. Those modules are - UPDATE, GET, DELETE etc.

```
"mode": "edit"
```

There are two main reasons why this is used:

1. To reduce module load time: If you click on the module to open it, all options for all RPCs need to be loaded before it opens. By using mode:edit , the module opens right away and RPC options are loaded when you open the select field.

Imagine a module to create a donut: RPC for the type of dough RPC for the icing color or flavor RPC for the type of sprinkles RPC for filling options

With this setup, the module will take a long time to load, especially if the API server is busy.
2. If we expect the user will want to map the value, not select from the list. For example, in a Watch for new orders > Mark order as received module, map the Order ID from the previous module.

To reduce module load time: If you click on the module to open it, all options for all RPCs need to be loaded before it opens. By using mode:edit , the module opens right away and RPC options are loaded when you open the select field.

Imagine a module to create a donut:

```
mode:edit
```

- RPC for the type of dough
- RPC for the icing color or flavor
- RPC for the type of sprinkles
- RPC for filling options

With this setup, the module will take a long time to load, especially if the API server is busy.

RPC for the type of dough

RPC for the icing color or flavor

RPC for the type of sprinkles

RPC for filling options

With this setup, the module will take a long time to load, especially if the API server is busy.

If we expect the user will want to map the value, not select from the list. For example, in a Watch for new orders > Mark order as received module, map the Order ID from the previous module.

Edit mode is also recommended in modules that will always be working with the lowest entity, for example, an attachment for an e-mail in a module.

## hashtag Mappable: false

You may want to hide the mapping toggle to help the user enter correct information in a field.

For example, in a select field type a user should select from a list of options. Having a map toggle is unnecessary and may confuse the user.

```
select
```

To hide the mappable toggle, use the "mappable": false parameter.

```
"mappable": false
```

After switching on the mapping toggle, the text fields disappear.

"mappable": false hides the mapping toggle:

```
"mappable": false
```

## hashtag Messages (banners)

In some circumstances, you may want to give users additional information in a module.

There are three distinct message types available, each with a specific icon and guidelines for appropriate use. The recommended length of the message is 50 to 300 characters.

### hashtag Information (blue)

### hashtag Warning (yellow)

### hashtag Danger (red)

## hashtag ID finder

The ID finder allows users to identify items within a module by entering search criteria. The ID finder can either be the only search method for a field or it can be included in a list of multiple search methods.

The ID finder window can either include a single search criterion (keyword or exact match) or multiple search criteria. There are specific guidelines to follow when implementing the ID finder, both within the module and the ID finder itself.

When implementing the ID finder within a module, it is important to consider whether it is the only available search method to identify the item, or if there are multiple search methods. Regardless of the number of search methods, the ID finder button should always be labeled ID finder .

If you are implementing the ID finder for a field that is not searching for an ID, for example the Dropbox > Watch files module with the File Path field, the button should read Finder instead of ID finder .

Single search method

If a module contains only the ID finder as a search method, the name of the field should be the [Item] ID that is being searched for.

- [Item] ID field names include: Campaign ID - campaign to be updated Employee ID - employee record to delete Etc.

[Item] ID field names include:

- Campaign ID - campaign to be updated
- Employee ID - employee record to delete
- Etc.

Campaign ID - campaign to be updated

Employee ID - employee record to delete

Etc.

Multiple search methods

If a module contains multiple search methods, they should be listed in an [Item] search method dropdown. Replace [Item] with the name of item that is being searched for.

- [Item] search method field names include: Spreadsheet search method - spreadsheet to add a row to Channel search method - channel to send a message to Record search method - record to update Etc.
- [Item] search method dropdown options include: Search by keyword (ID finder with keyword search) Search by [item] (ID finder with exact match search) Select by file path Select from list Enter manually Etc.

[Item] search method field names include:

- Spreadsheet search method - spreadsheet to add a row to
- Channel search method - channel to send a message to
- Record search method - record to update
- Etc.

Spreadsheet search method - spreadsheet to add a row to

Channel search method - channel to send a message to

Record search method - record to update

Etc.

[Item] search method dropdown options include:

- Search by keyword (ID finder with keyword search)
- Search by [item] (ID finder with exact match search)
- Select by file path
- Select from list
- Enter manually
- Etc.

Search by keyword (ID finder with keyword search)

Search by [item] (ID finder with exact match search)

Select by file path

Select from list

Enter manually

Etc.

The ID finder can include either one single search criterion (keyword or exact match) or multiple search criteria. It is important to note that the number of results the ID finder will return is limited both on the Make platform side and the app side. Because of this, we do not advise users to leave the search field empty to return all results, as this information can be misleading.

The standard blue info box message should be used for all ID finders, except for in cases of Single search criterion: exact match.

Only a limited number of results can be shown. If you don’t see the item you’re looking for, try more specific search criteria.

Single search criteria

Keyword search

- The name of the search field should always be [Search item] Keywords . [Search Item] keywords examples include: Channel name keywords Address keywords
- Include the blue info box that instructs users to use more specific search criteria. In this case, that is a more specific keyword.

The name of the search field should always be [Search item] Keywords .

- [Search Item] keywords examples include: Channel name keywords Address keywords

[Search Item] keywords examples include:

- Channel name keywords
- Address keywords

Channel name keywords

Address keywords

Include the blue info box that instructs users to use more specific search criteria. In this case, that is a more specific keyword.

Exact match required

- The name of the search field should be identical to the name of the item that the user must match. For example, if a user must enter an item’s name, the field should be Name .
- Do not include the blue info box that tells users to use more specific search criteria, as there are no other criteria or way to make an exact match more specific.
- In the search field hint, add the following: Must be the exact [Search item] . For example: Field: Channel name . Hint: Must be the exact Channel name .

The name of the search field should be identical to the name of the item that the user must match.

- For example, if a user must enter an item’s name, the field should be Name .

For example, if a user must enter an item’s name, the field should be Name .

Do not include the blue info box that tells users to use more specific search criteria, as there are no other criteria or way to make an exact match more specific.

In the search field hint, add the following: Must be the exact [Search item] .

- For example: Field: Channel name . Hint: Must be the exact Channel name .

For example:

- Field: Channel name .
- Hint: Must be the exact Channel name .

Field: Channel name .

Hint: Must be the exact Channel name .

Multiple search criteria

Keyword search

- The name of the search field should always be [Search Item] keywords [Search Item] keywords examples include: Spreadsheet keywords Employee Title keywords
- Include the blue info box that instructs users to use more specific search criteria. In this case, that is either a more specific keyword or utilizing the other criteria in the ID finder to refine their search.

The name of the search field should always be [Search Item] keywords

- [Search Item] keywords examples include: Spreadsheet keywords Employee Title keywords

[Search Item] keywords examples include:

- Spreadsheet keywords
- Employee Title keywords

Spreadsheet keywords

Employee Title keywords

Include the blue info box that instructs users to use more specific search criteria. In this case, that is either a more specific keyword or utilizing the other criteria in the ID finder to refine their search.

If the API allows, the ID finder’s results should be listed in alphabetical order.

## hashtag Support for custom query and filter options

Certain APIs provide support for custom queries or filters when searching records, such as invoices. In Make, our goal is to offer query and filter capabilities to both regular and advanced users.

Therefore we have implemented two methods of achieving this functionality, and ideally users should be able to choose between the two options.

### hashtag Predefined query

We have utilized the familiar filter setup format found in Scenario Builder. With this approach, users are not required to learn the query format. Instead, they can simply set up the query in a manner similar to configuring filters.

When the module is executed, a custom IML function constructs the query, adhering to the specified format.

### hashtag Custom query

Users have the option to manually compose their own queries. This feature is particularly valuable when the API supports new operators that are not yet available within the module.

To assist users in leveraging the query field effectively, the following helpful information should be provided:

- Query format: The guidelines for structuring the query.
- Example of a functional query: An illustrative sample query as reference.
- API documentation URL: Direct access to the API documentation with query specification.

Query format: The guidelines for structuring the query.

Example of a functional query: An illustrative sample query as reference.

API documentation URL: Direct access to the API documentation with query specification.

### hashtag Search filters

Provide a list of fields and a list of operators.

Group operators by their data types

Do not ask users to construct the query string.

Do not share operator among all data types.

## hashtag Labels

Labels are available for:

- Array(s)
- Array item(s) Default to Item This should be consistent and related to the label of the array. For example, if the label of an array is Recipients , the label of an array item should be Recipient .
- Button(s) to add an array item Default to Add item . The button label should be consistent and related to the label of array items. For example, if the label of an array item is Recipient , the label of the button should be Add recipient .

Array(s)

Array item(s)

- Default to Item
- This should be consistent and related to the label of the array. For example, if the label of an array is Recipients , the label of an array item should be Recipient .

Default to Item

```
Item
```

This should be consistent and related to the label of the array. For example, if the label of an array is Recipients , the label of an array item should be Recipient .

```
Recipients
```

```
Recipient
```

Button(s) to add an array item

- Default to Add item .
- The button label should be consistent and related to the label of array items. For example, if the label of an array item is Recipient , the label of the button should be Add recipient .

Default to Add item .

```
Add item
```

The button label should be consistent and related to the label of array items. For example, if the label of an array item is Recipient , the label of the button should be Add recipient .

```
Recipient
```

```
Add recipient
```

## hashtag Universal module

- If possible, provide a universal module.
- The prefix path of the URL should not contain the version of the API, to ensure that users can use any version of the API. Even if there is no other version, it is good practice in case there is one in the future.
- The hint under the URL should contain the correct prefix path of the URL, together with an example of a postfix path of the URL.
- The example should be “ready-to-use”. We recommend using methods for retrieving a record in the example (GET).

If possible, provide a universal module.

The prefix path of the URL should not contain the version of the API, to ensure that users can use any version of the API. Even if there is no other version, it is good practice in case there is one in the future.

The hint under the URL should contain the correct prefix path of the URL, together with an example of a postfix path of the URL.

The example should be “ready-to-use”. We recommend using methods for retrieving a record in the example (GET).

Last updated 5 months ago

---
title: "Remote Procedure Calls | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/best-practices/remote-procedure-calls
scraped_at: 2026-04-21T12:41:46.562395Z
---

1. Best practices

# Remote Procedure Calls

Remote procedure calls (RPCs) are used to retrieve live data from a service for an input field.

You can use RPCs to retrieve dynamic options in a field to clarify the expected input for a user. For example, selecting a country in a dropdown could trigger an RPC to retrieve corresponding states or cities.

In this example, the Priority field provides the expected values (Low, Medium, High, Urgent). In mapping mode, the user has to enter or map the option's ID instead of selecting a value.

In mapping mode, the user has to enter or map the option's ID instead of the label.

RPCs are also helpful when a user only needs to understand the functionality of the module, primarily the list of available parameters in the interface. In this case, the aim is not to offer a complete list of all items, but a sample of the last 100 or so items the user could select from when testing the module or setting up the scenario for the first time, before replacing it with mapped data used in automation.

## hashtag Mode edit

### hashtag Mode edit for Get, Update, and Delete modules

When adding an RPC to a Get, Update, or Delete module, it is required to add:

to the code so when a user first opens the module, they will be able to immediately map the value. However, if needed, they can also switch to get the value from an RPC.

### hashtag Mode edit for Search and List modules

For Search and List modules, the use of mode edit depends on the hierarchy level of the entity. If the entity is higher in the hierarchy, for example a "customer" or a "deal" and there are not many RPCs in the input, the mode should not be set to "edit".

However, if the entity is low in the hierarchy, for example "email attachment", it should have the mode set to "edit" since the user will probably not want to list attachments of a single email repeatedly.

### hashtag Mode edit for Create modules

Create modules should not have the mode set to "edit" unless it contains a very large number of RPCs in its input . This is because preloading a large number of RPCs would significantly increase the wait time for the user.

## hashtag Pagination and limits

Just like modules, RPCs can use pagination to show more records than just the ones on the first page. However, limits should be also set how many objects the RPC shows to limit the load time.

The limit should be between 300-500 if the API returns 100 or more objects per page. If the API returns less than 100 per page, then the limit should be 3 times the amount of objects per page.

For example, if the API returns 25 records per page, the limit should be 75. You can also set a condition for the pagination to stop further requests when no more data is needed.

Last updated 5 months ago

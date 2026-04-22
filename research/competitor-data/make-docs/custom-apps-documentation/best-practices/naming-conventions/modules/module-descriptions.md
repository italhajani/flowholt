---
title: "Module descriptions | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/best-practices/naming-conventions/modules/module-descriptions
scraped_at: 2026-04-21T12:44:02.164677Z
---

1. Best practices chevron-right
2. Naming conventions chevron-right
3. Modules

# Module descriptions

Module descriptions should emphasize what a user can achieve with the module, not necessarily the process it takes to perform the task. Write the description in the third person and capitalize only the first letter of the word in the description.

There are 3 categories of information that the descriptions can include:

1. End result (mandatory): Clearly describes what the module achieves.
2. Restrictions/Requirements (when necessary): Include additional information if there is any other additional information that provides clarity for the user regarding what the end result will be, or specifics of the module.
3. Additional information (when necessary): Include additional information if the module has any requirements, such as a specific plan on the third-party or in Make, or requires a specific setting on the third-party side.

End result (mandatory): Clearly describes what the module achieves.

Restrictions/Requirements (when necessary): Include additional information if there is any other additional information that provides clarity for the user regarding what the end result will be, or specifics of the module.

Additional information (when necessary): Include additional information if the module has any requirements, such as a specific plan on the third-party or in Make, or requires a specific setting on the third-party side.

## hashtag Watch modules

Watch modules watch for new data in a service and return it. They are trigger and instant trigger (webhook) modules.

The general format for trigger module descriptions: Watch [items] Triggers when a/an [item] is ...

Watch new [items]

Triggers when a new [item] is created.

Watch new contacts

Triggers when a new contact is created.

Watch updated [items]

Triggers when a/an [item] is updated.

Watch updated contacts

Triggers when a contact is updated.

Watch deleted [items]

Triggers when a/an [item] is deleted.

Watch deleted contacts

Triggers when a contact is deleted.

Watch [items]

Triggers when a/an [item] is created or updated.

Watch contacts

Triggers when a contact is created or updated.

Watch [items]

(for events)

Triggers when an event occurs related to a/an [item].

Watch records

Triggers when an event occurs related to a record.

Watch events

Triggers when an event occurs [optional - location or time].

Watch events

Triggers when a new event occurs on Monday.

### hashtag Action modules

Action modules write data into a service, modify data in a service, or retrieve a single result.

The general format for action module descriptions:

&#xNAN; [Action] a/an [item] [Actions] a/an [item] + details …

Create a/an [item]

Creates a new [item]….

Create a supplier invoice

Creates a new supplier invoice.

Create or update a/an [item]

Creates a new [item] or updates an existing one if a matching [x] is found.

Create or update a contact

Creates a new contact or updates an existing one if a matching contact name or email is found.

Delete a/an [item]

Deletes a/an [item]…

Add if specified in API documentation:

…This action cannot be undone.

Delete a message

Deletes a message from a thread. This action cannot be undone.

Download a/an [item]

Downloads a/an [item]…

Download an document

Downloads a document in PDF format.

Get a/an [item]

Returns information about a specific [item] by its [x].

Get a user

Returns information about a specific user by their user ID.

Move a/an [item] to trash

Moves a [item] to the trash.

Move a file or folder to trash

Moves a file or folder to the trash.

Redact a/an [item]

Redacts [information] for a/an [item]…

Redact a contact

Redacts all personally identifiable information for a contact, but does not delete the contact record itself.

Update a/an [item]

Updates a/an [item]…

Update a message

Updates a message.

Add [items] to a/an [item]

*Adding multiple items to a single item

Add [items] to a/an [item]…

Add members to a list

Adds members to a specified list.

Bulk [verb] [items]

[Verbs] multiple [items]…

Bulk add rows

Adds multiple rows to the bottom of a table.

### hashtag Search modules

Search modules retrieve data from a service and allow for one or more results.

The general format for search module descriptions:

&#xNAN; [Action] [items]

Returns a list of [items] + details ...

List [items]

Returns a list of [items]…

List users

Returns a list of users in a specific organization.

Search [items]

Returns a list of [items] filtered by [?]…

Search users

Returns a list of users filtered by [?].

### hashtag Universal modules

Universal modules are modules used to make an API call or query when a pre-built module does not exist.

The general format for Make an API call module descriptions:

Sends a custom API call to {app name}. You can use this to call endpoints that aren’t covered by existing modules.

Make an API call

Sends a custom API call to {app name}. You can use this to call endpoints that aren’t covered by existing modules.

Make an API call

Sends a custom API call to Shopify. You can use this to call endpoints that aren’t covered by existing modules.

Make a SOAP API call

Make a SOAP API call

Execute a GraphQL query

Execute a GraphQL query

Last updated 5 months ago

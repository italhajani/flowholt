---
title: "Module labels | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/best-practices/naming-conventions/modules/module-labels
scraped_at: 2026-04-21T12:44:06.300138Z
---

1. Best practices chevron-right
2. Naming conventions chevron-right
3. Modules

# Module labels

Every module should have a label that precisely describes the module's use. The label should be composed of the verb expressing the intended action (create, update, watch, etc.) and the name of the entity being processed (customer, invoice, table, etc.).

Module labels follow sentence case arrow-up-right . Only the first word is capitalized.

There may be times when the third-party UI does not match these suggested naming conventions. In such cases, use the third-party terminology that is familiar to your users.

## hashtag Watch modules

Watch modules watch for new data in a service and return it. They are trigger and instant trigger (webhook) modules.

Watch [item]s

Watch contacts

Watch a contact

Watch new [item]s

Watch new contacts

Watch contacts created

Watch updated [item]s

Watch updated contacts

Watch contacts updated

Watch deleted [item]s

Watch deleted contacts

Watch contacts deleted

## hashtag Action modules

Action modules write data into a service, modify data in a service, or retrieve a single result.

Add

Add a/an [item]

Add a reaction

Add a user to a list

Create

Create a/an [item]

Create a message

Create a completion

Create or Update

Create or update a/an [item]

Create or update a record

Create or update a vector

Upsert a record

Delete

Delete a/an [item]

Delete a message

Delete a user from a list

Download

Download a/an [item]

Download a message

Download an image

Generate

Generate a/an [item]

Generate an image

Generate an audio file

Get

Get a/an [item]

Get a message

Get a user

Invite

Invite a/an [item]

Invite a user

Invite a user to a channel

Remove

Remove a/an [item]

Remove a reaction

Remove a user from a list

Send

Send a/an [item]

Send a message

Send an email to a team member

Update

Update a/an [item]

Update a message

Update a product variant

Upload

Upload a/an [item]

Upload an image

Upload a product image

## hashtag Search modules

Search modules retrieve data from a service and allow for one or more results.

List

List [item]s

List users

List entity types

List modules are those that have no filtering options.

Search

Search [item]s

Search users

Search contacts

Search modules are those that have one or more filtering options.

## hashtag Bulk modules

Bulk modules can perform an action on multiple records in a single call.

Bulk [action] [parameter] (advanced)

Bulk upload call conversions (advanced)
Bulk create folders (advanced)

## hashtag Additional information

Some modules will require additional information in the name, such as (advanced) for bulk modules, or (beta). In these cases, the singular adjective should be lowercase and placed between ( ).

Advanced

Module name (advanced)

Search rows (advanced)

Search rows (Advanced module)

Beta

Module name (beta)

List folder items (beta)

List folder items (BETA)

Advanced, beta (both tags)

Module name (advanced) (beta)

Update a campaign (advanced) (beta)

Update a campaign (advanced, beta)

Deprecated

Module name (deprecated)

Send a message (deprecated)

Send a message (Deprecated)

Rebrand

Module name (formerlyl [name])

X (formerly Twitter)

X (Formerly Twitter)

Last updated 5 months ago

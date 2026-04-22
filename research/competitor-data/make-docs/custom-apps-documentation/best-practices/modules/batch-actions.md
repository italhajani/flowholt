---
title: "Batch actions | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/best-practices/modules/batch-actions
scraped_at: 2026-04-21T12:44:27.697021Z
---

1. Best practices chevron-right
2. Modules

# Batch actions

A batch action is an operation that lets a user complete more than one action in a module.

We advise that you do not use batch actions as the Make platform does not support the partial success of a call.

If your module involves two API calls, it's possible that one will succeed and the other will fail. The module will show an error message for this partial success.

Instead, we suggest using a separate module for each API call:

- to avoid receiving misleading or incorrect error messages and,
- to allow users to set up error handling for individual modules.

to avoid receiving misleading or incorrect error messages and,

to allow users to set up error handling for individual modules.

## hashtag Exceptions

The following are exceptions when you may want to use a batch action:

- PUT vs PATCH behavior in update modules
- Get a record after update
- Upload a file
- Download a file
- Asynchronous process \

PUT vs PATCH behavior in update modules

Get a record after update

Upload a file

Download a file

Asynchronous process \

### hashtag PUT vs PATCH behavior in update modules

Generally, PUT does not support partial updates, meaning you need to provide a full request to avoid losing the rest of the record. PATCH supports partial updates.

However, in practice, many APIs with PUT methods support partial updates.

Make expects empty fields to be ignored, not erased.

Chain of actions: Read > Write

1. Get record by ID
2. PUT the record patched by user’s input

Get record by ID

PUT the record patched by user’s input

#### hashtag Example

- GoHighLevel > Update a Contact

GoHighLevel > Update a Contact

If a partial update is not supported, you must execute an extra call to retrieve the current data and combine the data using an IML function.

If a value needs to be deleted, use the erase pill (available only in update modules).

```
erase
```

### hashtag Get a record after update

Some services only return an ID after a record update.

Chain of actions: Write > Read

1. Update the record
2. Get the record by ID

Update the record

Get the record by ID

#### hashtag Example

- Workday Financial Management > Update a Supplier Invoice

Workday Financial Management > Update a Supplier Invoice

### hashtag Upload a file

#### hashtag Upload in chunks

Chain of actions: Write > Write > … > Write

This is an exception to the rule that combines multiple Write actions. These requests are designed to be used in sequence.

1. Create an upload session
2. Keep sending chunks
3. Finalize the upload

Create an upload session

Keep sending chunks

Finalize the upload

#### hashtag Example

- Dropbox > Upload a File

Dropbox > Upload a File

### hashtag Download a file

#### hashtag Download by media ID

Chain of actions: Read > Read

1. Get the media ID
2. Download file by media ID

Get the media ID

Download file by media ID

#### hashtag Example

- WhatsApp Business Cloud > Download a Media
- Telegram Bot > Download a File

WhatsApp Business Cloud > Download a Media

Telegram Bot > Download a File

### hashtag Asynchronous process

Requests involving processes running asynchronously on 3rd party service.

Chain of actions: Write > Read > Read > … > Read

1. Start the task
2. Keep polling for task status
3. Get the result when done

Start the task

Keep polling for task status

Get the result when done

#### hashtag Example

- Microsoft Power Automate: Trigger a Desktop Flow

Microsoft Power Automate: Trigger a Desktop Flow

#### hashtag Responsiveness approaches

Keep in mind that there are two approaches to responsiveness in a service:

- Synchronous - Upon an action request, the service returns a result that can then be processed in the following modules in a scenario.
- Asynchronous - The service doesn't return anything at all, or doesn't return useful output, e.g. a processed file.

Synchronous - Upon an action request, the service returns a result that can then be processed in the following modules in a scenario.

Asynchronous - The service doesn't return anything at all, or doesn't return useful output, e.g. a processed file.

#### hashtag Comparison of synchronous and asynchronous approaches

Advantage

The result is returned right away. The result can be processed in the following modules.

Helpful when you need to process a large amount of data, like a file conversion.

Disadvantage

The job may take too long. This might cause a timeout (default 40 sec). For example, in a file conversion. The default timeout can be prolonged depending on the valid cases.

You need to create at least two scenarios - one for triggering the job, and another one for processing the result from the first scenario. The second scenario, if possible, should start with an instant trigger that triggers once the job finishes.

Module example

CloudConvert > Convert a File arrow-up-right

CloudConvert > Create a Job (advanced) arrow-up-right

Example scenario s

Convert files from Google Drive in CloudConvert arrow-up-right

The scenario contains Convert a File arrow-up-right module, which has the synchronous logic implemented on app's side.

Create an archive job in CloudConvert arrow-up-right

Download files from the job in CloudConvert arrow-up-right

The first scenario contains Create a Job (advanced) arrow-up-right module which has asynchronous approach by default. The only result is the job's ID.

#### hashtag Handling of asynchronous approach

When a web service doesn't support a synchronous approach and the common use case of the module requires support, it should be added on the app's side. There should be two (or more calls) executed instead of only one:

1. Create a call
2. Check the status of the call
3. Request the result of the call

Create a call

Check the status of the call

Request the result of the call

#### hashtag Example

After importing a JSON file to a web service, it requires a certain period of time to process the file. In this case, continue to check if the status of the entity changed from processing to completed . When the status is completed , the result is already part of the response.

```
processing
```

```
completed
```

```
completed
```

When the repeat directive is used, the condition and limit should always be provided to prevent infinite loops.

Last updated 5 months ago

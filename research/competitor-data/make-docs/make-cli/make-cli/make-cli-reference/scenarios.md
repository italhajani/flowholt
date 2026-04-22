---
title: "Scenarios | Make CLI | Make Developer Hub"
url: https://developers.make.com/make-cli/make-cli/make-cli-reference/scenarios
scraped_at: 2026-04-21T12:43:09.409243Z
---

1. Make CLI chevron-right
2. Make CLI reference

# Scenarios

Use these commands to manage Make scenarios, folders, webhooks, and custom functions with the Make CLI.

### hashtag Scenarios

Manage your scenarios.

#### hashtag make-cli scenarios list

```
make-cli scenarios list
```

List all scenarios for a team.

Options

--team-id

```
--team-id
```

The team ID to filter scenarios by

Yes

Example

List all scenarios for a team:

```
make-cliscenarioslist--team-id=5
```

#### hashtag make-cli scenarios get

```
make-cli scenarios get
```

Get a scenario and its blueprint by ID.

Options

--scenario-id

```
--scenario-id
```

The scenario ID to retrieve

Yes

Example

Get a scenario and its blueprint by ID:

#### hashtag make-cli scenarios create

```
make-cli scenarios create
```

Create a new scenario.

Options

--team-id

```
--team-id
```

ID of the team where the scenario will be created

Yes

--folder-id

```
--folder-id
```

ID of the folder where the scenario will be placed

No

--scheduling

```
--scheduling
```

Scheduling configuration for the scenario

Yes

--blueprint

```
--blueprint
```

Blueprint containing the scenario configuration

Yes

--basedon

```
--basedon
```

ID of an existing template to base this one on

No

--confirmed

```
--confirmed
```

Confirmation in case the scenario uses apps that are not yet installed

No

Example

Create a new scenario:

#### hashtag make-cli scenarios update

```
make-cli scenarios update
```

Update a scenario.

Options

--scenario-id

```
--scenario-id
```

The scenario ID to update

Yes

--name

```
--name
```

New name for the scenario

No

--description

```
--description
```

New description for the scenario

No

--folder-id

```
--folder-id
```

New folder ID for the scenario

No

--scheduling

```
--scheduling
```

Updated scheduling configuration

No

--blueprint

```
--blueprint
```

Updated blueprint configuration

No

--confirmed

```
--confirmed
```

Confirmation in case the scenario uses apps that are not yet installed

No

Example

Update a scenario:

#### hashtag make-cli scenarios delete

```
make-cli scenarios delete
```

Delete a scenario.

Options

--scenario-id

```
--scenario-id
```

The scenario ID to delete

Yes

Example

Delete a scenario:

#### hashtag make-cli scenarios activate

```
make-cli scenarios activate
```

Activate a scenario.

Options

--scenario-id

```
--scenario-id
```

The scenario ID to activate

Yes

Example

Activate a scenario:

#### hashtag make-cli scenarios deactivate

```
make-cli scenarios deactivate
```

Deactivate a scenario.

Options

--scenario-id

```
--scenario-id
```

The scenario ID to deactivate

Yes

Example

Deactivate a scenario:

#### hashtag make-cli scenarios run

```
make-cli scenarios run
```

Execute a scenario with optional input data.

Options

--scenario-id

```
--scenario-id
```

The scenario ID to run

Yes

--data

```
--data
```

Optional input data for the scenario

No

--responsive

```
--responsive
```

Whether to run responsively

No

--callback-url

```
--callback-url
```

URL to call once the scenario execution finishes

No

Example

Execute a scenario with optional input data:

#### hashtag make-cli scenarios interface

```
make-cli scenarios interface
```

Get the interface for a scenario.

Options

--scenario-id

```
--scenario-id
```

The scenario ID to get the interface for

Yes

Example

Get the interface for a scenario:

#### hashtag make-cli scenarios set-interface

```
make-cli scenarios set-interface
```

Update the interface for a scenario.

Options

--scenario-id

```
--scenario-id
```

The scenario ID to update the interface for

Yes

--interface

```
--interface
```

The interface definition with input and output specifications

Yes

Example

Update the interface for a scenario:

### hashtag Scenario executions

Manage your scenario executions.

#### hashtag make-cli executions list

```
make-cli executions list
```

List executions for a scenario.

Options

--scenario-id

```
--scenario-id
```

The scenario ID to list executions for

Yes

--status

```
--status
```

Filter by execution status

No

--from

```
--from
```

Start timestamp for filtering

No

--to

```
--to
```

End timestamp for filtering

No

Example

List executions for a scenario:

#### hashtag make-cli executions get-detail

```
make-cli executions get-detail
```

Get detailed result of a specific execution.

Options

--scenario-id

```
--scenario-id
```

The scenario ID the execution belongs to

Yes

--execution-id

```
--execution-id
```

The execution ID to retrieve

Yes

Example

Get detailed result of a specific execution:

#### hashtag make-cli executions get

```
make-cli executions get
```

Get details of a specific execution.

Options

--scenario-id

```
--scenario-id
```

The scenario ID the execution belongs to

Yes

--execution-id

```
--execution-id
```

The execution ID to retrieve

Yes

Example

Get details of a specific execution:

#### hashtag make-cli executions list-for-incomp-exec

```
make-cli executions list-for-incomp-exec
```

List executions for an incomplete execution.

Options

--incomplete-execution-id

```
--incomplete-execution-id
```

The incomplete execution ID to list executions for

Yes

--limit

```
--limit
```

Maximum number of executions to return

No

Example

List executions for an incomplete execution:

#### hashtag make-cli executions get-for-incomp-exec

```
make-cli executions get-for-incomp-exec
```

Get execution details for an incomplete execution.

Options

--incomplete-execution-id

```
--incomplete-execution-id
```

The incomplete execution ID

Yes

--execution-id

```
--execution-id
```

The execution ID to retrieve

Yes

Example

Get execution details for an incomplete execution:

### hashtag Incomplete executions

Manage your incomplete executions.

#### hashtag make-cli incomplete-executions list

```
make-cli incomplete-executions list
```

List all incomplete executions.

Options

--scenario-id

```
--scenario-id
```

The scenario ID to list incomplete executions for

Yes

Example

List all incomplete executions:

#### hashtag make-cli incomplete-executions get

```
make-cli incomplete-executions get
```

Get details of a specific incomplete execution.

Options

--incomplete-execution-id

```
--incomplete-execution-id
```

The incomplete execution ID to retrieve

Yes

Example

Get details of a specific incomplete execution:

### hashtag Scenario folders

Manage your scenario folders.

#### hashtag make-cli folders list

```
make-cli folders list
```

List folders for a team.

Options

--team-id

```
--team-id
```

The team ID to list folders for

Yes

Example

List folders for a team:

#### hashtag make-cli folders create

```
make-cli folders create
```

Create a new folder.

Options

--team-id

```
--team-id
```

The team ID where the folder will be created

Yes

--name

```
--name
```

Name of the folder

Yes

Example

Create a new folder:

#### hashtag make-cli folders update

```
make-cli folders update
```

Update an existing folder.

Options

--folder-id

```
--folder-id
```

The folder ID to update

Yes

--name

```
--name
```

New name for the folder

No

Example

Update an existing folder:

#### hashtag make-cli folders delete

```
make-cli folders delete
```

Delete a folder.

Options

--folder-id

```
--folder-id
```

The folder ID to delete

Yes

Example

Delete a folder:

### hashtag Custom functions

Manage your custom functions.

#### hashtag make-cli functions list

```
make-cli functions list
```

List custom functions for a team.

Options

--team-id

```
--team-id
```

The team ID to list functions for

Yes

Example

List custom functions for a team:

#### hashtag make-cli functions get

```
make-cli functions get
```

Get details of a specific custom function.

Option

--function-id

```
--function-id
```

The function ID to retrieve

Yes

Example

Get details of a specific custom function:

#### hashtag make-cli functions create

```
make-cli functions create
```

Create a new custom function.

Options

--team-id

```
--team-id
```

The team ID where the function will be created

Yes

--name

```
--name
```

The name of the function

Yes

--code

```
--code
```

The function code

Yes

--description

```
--description
```

Description of the function

No

Example

Create a new custom function:

#### hashtag make-cli functions update

```
make-cli functions update
```

Update an existing custom function.

Options

--function-id

```
--function-id
```

The function ID to update

Yes

--name

```
--name
```

New name for the function

No

--code

```
--code
```

Updated function code

No

--description

```
--description
```

Updated function description

No

Example

Update an existing custom function:

#### hashtag make-cli functions delete

```
make-cli functions delete
```

Delete a custom function.

Options

--function-id

```
--function-id
```

The function ID to delete

Yes

Example

Delete a custom function:

#### hashtag make-cli functions check

```
make-cli functions check
```

Check the syntax of a function without saving it.

Options

--team-id

```
--team-id
```

The team ID

Yes

--code

```
--code
```

The function code to check

Yes

Example

Check the syntax of a function without saving it:

### hashtag Webhooks

Manage your webhooks.

#### hashtag make-cli hooks list

```
make-cli hooks list
```

List webhooks/mailhooks for a specific team.

Options

--team-id

```
--team-id
```

The team ID to list hooks for

Yes

Example

List webhooks/mailhooks for a specific team:

#### hashtag make-cli hooks get

```
make-cli hooks get
```

Get details of a specific webhook/mailhook.

Options

--hook-id

```
--hook-id
```

The hook ID to retrieve

Yes

Example

Get details of a specific webhook/mailhook:

#### hashtag make-cli hooks create

```
make-cli hooks create
```

Create a new webhook/mailhook.

Options

--team-id

```
--team-id
```

The team ID where the hook will be created

Yes

--name

```
--name
```

The name of the webhook

Yes

--type-name

```
--type-name
```

The hook type related to the app for which it will be created

Yes

--data

```
--data
```

Additional data specific to the hook type

No

Example

Create a new webhook/mailhook:

#### hashtag make-cli hooks update

```
make-cli hooks update
```

Update an existing webhook/mailhook.

Options

--hook-id

```
--hook-id
```

The hook ID to update

Yes

--data

```
--data
```

New data configuration for the hook

Yes

Example

Update an existing webhook/mailhook:

#### hashtag make-cli hooks delete

```
make-cli hooks delete
```

Delete a webhook/mailhook.

Options

--hook-id

```
--hook-id
```

The hook ID to delete

Yes

Example

Delete a webhook/mailhook:

### hashtag Devices

Manage your devices.

#### hashtag make-cli devices list

```
make-cli devices list
```

List devices registered in a team.

Options

--team-id

```
--team-id
```

The team ID to list devices for

Yes

Example

List devices registered in a team:

Last updated 5 days ago

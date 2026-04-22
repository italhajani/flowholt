---
title: "Custom app development | Make CLI | Make Developer Hub"
url: https://developers.make.com/make-cli/make-cli/make-cli-reference/custom-app-development
scraped_at: 2026-04-21T12:43:12.011173Z
---

1. Make CLI chevron-right
2. Make CLI reference

# Custom app development

Use these commands to create and manage custom Make apps arrow-up-right and their components with the Make CLI.

### hashtag App definitions

Manage your app definitions.

#### hashtag make-cli sdk-apps list

```
make-cli sdk-apps list
```

List SDK apps with optional filtering.

Example

List SDK apps with optional filtering:

```
make-clisdk-appslist
```

#### hashtag make-cli sdk-apps get

```
make-cli sdk-apps get
```

Get a SDK app by name and version.

Options

--name

```
--name
```

The name of the app

Yes

--version

```
--version
```

The version of the app

Yes

Example

Get a SDK app by name and version:

#### hashtag make-cli sdk-apps create

```
make-cli sdk-apps create
```

Create a new SDK app.

Options

--name

```
--name
```

The name of the app visible in the URL

Yes

--label

```
--label
```

The label of the app visible in the scenario builder

Yes

--description

```
--description
```

The description of the app

No

--theme

```
--theme
```

The color of the app logo

Yes

--language

```
--language
```

The language of the app

Yes

--countries

```
--countries
```

Countries where the app is available

No

--private

```
--private
```

Whether the app is private

No

--audience

```
--audience
```

Audience setting for the app

Yes

Example

Create a new SDK app:

#### hashtag make-cli sdk-apps update

```
make-cli sdk-apps update
```

Update an existing SDK app.

Options

--name

```
--name
```

The name of the app

Yes

--version

```
--version
```

The version of the app

Yes

--label

```
--label
```

The label of the app visible in the scenario builder

No

--description

```
--description
```

The description of the app

No

--theme

```
--theme
```

The color of the app logo

No

--language

```
--language
```

The language of the app

No

--countries

```
--countries
```

Countries where the app is available

No

--audience

```
--audience
```

Audience setting

No

Example

Update an existing SDK app:

#### hashtag make-cli sdk-apps delete

```
make-cli sdk-apps delete
```

Delete a SDK app by name and version.

Options

--name

```
--name
```

The name of the app

Yes

--version

```
--version
```

The version of the app

Yes

Example

Delete a SDK app by name and version:

#### hashtag make-cli sdk-apps get-section

```
make-cli sdk-apps get-section
```

Get a specific section of a SDK app.

Options

--name

```
--name
```

The name of the app

Yes

--version

```
--version
```

The version of the app

Yes

--section

```
--section
```

The section to get

Yes

Example

Get a specific section of a SDK app:

#### hashtag make-cli sdk-apps set-section

```
make-cli sdk-apps set-section
```

Set/update a specific section of a SDK app.

Options

--name

```
--name
```

The name of the app

Yes

--version

```
--version
```

The version of the app

Yes

--section

```
--section
```

The section to set

Yes

--body

```
--body
```

The section data to set in JSONC format

Yes

Example

Set/update a specific section of a SDK app:

#### hashtag make-cli sdk-apps get-docs

```
make-cli sdk-apps get-docs
```

Get app documentation (readme).

Options

--name

```
--name
```

The name of the app

Yes

--version

```
--version
```

The version of the app

Yes

Example

Get app documentation (readme):

#### hashtag make-cli sdk-apps set-docs

```
make-cli sdk-apps set-docs
```

Set app documentation (readme).

Options

--name

```
--name
```

The name of the app

Yes

--version

```
--version
```

The version of the app

Yes

--docs

```
--docs
```

The documentation content in markdown format

Yes

Example

Set app documentation (readme):

#### hashtag make-cli sdk-apps get-common

```
make-cli sdk-apps get-common
```

Get app common data (client credentials and shared configuration).

Options

--name

```
--name
```

The name of the app

Yes

--version

```
--version
```

The version of the app

Yes

Example

Get app common data (client credentials and shared configuration):

#### hashtag make-cli sdk-apps set-common

```
make-cli sdk-apps set-common
```

Set app common data (client credentials and shared configuration).

Options

--name

```
--name
```

The name of the app

Yes

--version

```
--version
```

The version of the app

Yes

--common

```
--common
```

The common data to set

Yes

Example

Set app common data (client credentials and shared configuration):

### hashtag App connections

Manage your app connections.

#### hashtag make-cli sdk-connections list

```
make-cli sdk-connections list
```

List connections for a specific app.

Options

--app-name

```
--app-name
```

The name of the app

Yes

Example

List connections for a specific app:

#### hashtag make-cli sdk-connections get

```
make-cli sdk-connections get
```

Get a single connection by name.

Options

--connection-name

```
--connection-name
```

The name of the connection

Yes

Example

Get a single connection by name:

#### hashtag make-cli sdk-connections create

```
make-cli sdk-connections create
```

Create a new connection for a specific app.

Options

--app-name

```
--app-name
```

The name of the app

Yes

--type

```
--type
```

The type of the connection

Yes

--label

```
--label
```

The label of the connection visible in the scenario builder

Yes

Example

Create a new connection for a specific app:

#### hashtag make-cli sdk-connections update

```
make-cli sdk-connections update
```

Update an existing connection.

Options

--connection-name

```
--connection-name
```

The name of the connection

Yes

--label

```
--label
```

The label of the connection visible in the scenario builder

No

Example

Update an existing connection:

#### hashtag make-cli sdk-connections delete

```
make-cli sdk-connections delete
```

Delete a connection.

Options

--connection-name

```
--connection-name
```

The name of the connection

Yes

Example

Delete a connection:

#### hashtag make-cli sdk-connections get-section

```
make-cli sdk-connections get-section
```

Get a specific section of a connection.

Options

--connection-name

```
--connection-name
```

The name of the connection

Yes

--section

```
--section
```

The section to get

Yes

Example

Get a specific section of a connection:

#### hashtag make-cli sdk-connections set-section

```
make-cli sdk-connections set-section
```

Set a specific section of a connection.

Options

--connection-name

```
--connection-name
```

The name of the connection

Yes

--section

```
--section
```

The section to set

Yes

--body

```
--body
```

The section data to set in JSONC format

Yes

Example

Set a specific section of a connection:

#### hashtag make-cli sdk-connections get-common

```
make-cli sdk-connections get-common
```

Get common configuration for a connection.

Options

--connection-name

```
--connection-name
```

The name of the connection

Yes

Example

Get common configuration for a connection:

#### hashtag make-cli sdk-connections set-common

```
make-cli sdk-connections set-common
```

Set common configuration for a connection.

Options

--connection-name

```
--connection-name
```

The name of the connection

Yes

--common

```
--common
```

The common data to set

Yes

Example

Set common configuration for a connection:

### hashtag App functions

Manage your app functions.

#### hashtag make-cli sdk-functions list

```
make-cli sdk-functions list
```

List functions for the app.

Options

--app-name

```
--app-name
```

The name of the app

Yes

--app-version

```
--app-version
```

The version of the app

Yes

Example

List functions for the app:

#### hashtag make-cli sdk-functions get

```
make-cli sdk-functions get
```

Get a single function by name.

Options

--app-name

```
--app-name
```

The name of the app

Yes

--app-version

```
--app-version
```

The version of the app

Yes

--function-name

```
--function-name
```

The name of the function

Yes

Example

Get a single function by name:

#### hashtag make-cli sdk-functions create

```
make-cli sdk-functions create
```

Create a new function.

Options

--app-name

```
--app-name
```

The name of the app

Yes

--app-version

```
--app-version
```

The version of the app

Yes

--name

```
--name
```

The name of the function

Yes

Example

Create a new function:

#### hashtag make-cli sdk-functions delete

```
make-cli sdk-functions delete
```

Delete a function.

Options

--app-name

```
--app-name
```

The name of the app

Yes

--app-version

```
--app-version
```

The version of the app

Yes

--function-name

```
--function-name
```

The name of the function

Yes

Example

Delete a function:

#### hashtag make-cli sdk-functions get-code

```
make-cli sdk-functions get-code
```

Get function code.

Options

--app-name

```
--app-name
```

The name of the app

Yes

--app-version

```
--app-version
```

The version of the app

Yes

--function-name

```
--function-name
```

The name of the function

Yes

Example

Get function code:

#### hashtag make-cli sdk-functions set-code

```
make-cli sdk-functions set-code
```

Set/update function code.

Options

--app-name

```
--app-name
```

The name of the app

Yes

--app-version

```
--app-version
```

The version of the app

Yes

--function-name

```
--function-name
```

The name of the function

Yes

--code

```
--code
```

The function code

Yes

Example

Set/update function code:

#### hashtag make-cli sdk-functions get-test

```
make-cli sdk-functions get-test
```

Get function test code.

Options

--app-name

```
--app-name
```

The name of the app

Yes

--app-version

```
--app-version
```

The version of the app

Yes

--function-name

```
--function-name
```

The name of the function

Yes

Example

Get function test code:

#### hashtag make-cli sdk-functions set-test

```
make-cli sdk-functions set-test
```

Set/update function test code.

Options

--app-name

```
--app-name
```

The name of the app

Yes

--app-version

```
--app-version
```

The version of the app

Yes

--function-name

```
--function-name
```

The name of the function

Yes

--test

```
--test
```

The test code

Yes

Example

Set/update function test code:

### hashtag App modules

Manage your app modules.

#### hashtag make-cli sdk-modules list

```
make-cli sdk-modules list
```

List modules for the app with optional filtering.

Options

--app-name

```
--app-name
```

The name of the app

Yes

--app-version

```
--app-version
```

The version of the app

Yes

Example

List modules for the app with optional filtering:

#### hashtag make-cli sdk-modules get

```
make-cli sdk-modules get
```

Get a single module by name.

Options

--app-name

```
--app-name
```

The name of the app

Yes

--app-version

```
--app-version
```

The version of the app

Yes

--module-name

```
--module-name
```

The name of the module

Yes

Example

Get a single module by name:

#### hashtag make-cli sdk-modules create

```
make-cli sdk-modules create
```

Create a new module.

Options

--app-name

```
--app-name
```

The name of the app

Yes

--app-version

```
--app-version
```

The version of the app

Yes

--name

```
--name
```

The name of the module

Yes

--type-id

```
--type-id
```

The type ID of the module

Yes

--label

```
--label
```

The label of the module visible in the scenario builder

Yes

--description

```
--description
```

The description of the module

Yes

--module-init-mode

```
--module-init-mode
```

Module initialization mode

No

Example

Create a new module:

#### hashtag make-cli sdk-modules update

```
make-cli sdk-modules update
```

Update an existing module.

Options

--app-name

```
--app-name
```

The name of the app

Yes

--app-version

```
--app-version
```

The version of the app

Yes

--module-name

```
--module-name
```

The name of the module

Yes

--label

```
--label
```

The label of the module visible in the scenario builder

No

--description

```
--description
```

The description of the module

No

--connection

```
--connection
```

Connection name

No

Example

Update an existing module:

#### hashtag make-cli sdk-modules delete

```
make-cli sdk-modules delete
```

Delete a module.

Options

--app-name

```
--app-name
```

The name of the app

Yes

--app-version

```
--app-version
```

The version of the app

Yes

--module-name

```
--module-name
```

The name of the module

Yes

Example

Delete a module:

#### hashtag make-cli sdk-modules get-section

```
make-cli sdk-modules get-section
```

Get a specific section of a module.

Options

--app-name

```
--app-name
```

The name of the app

Yes

--app-version

```
--app-version
```

The version of the app

Yes

--module-name

```
--module-name
```

The name of the module

Yes

--section

```
--section
```

The section to get

Yes

Example

Get a specific section of a module:

#### hashtag make-cli sdk-modules set-section

```
make-cli sdk-modules set-section
```

Set/update a specific section of a module.

Options

--app-name

```
--app-name
```

The name of the app

Yes

--app-version

```
--app-version
```

The version of the app

Yes

--module-name

```
--module-name
```

The name of the module

Yes

--section

```
--section
```

The section to set

Yes

--body

```
--body
```

The section data to set in JSONC format

Yes

Example

Set/update a specific section of a module:

### hashtag App remote procedures

Manage your app remote procedures.

#### hashtag make-cli sdk-rpcs list

```
make-cli sdk-rpcs list
```

List all RPCs for the app.

Options

--app-name

```
--app-name
```

The name of the app

Yes

--app-version

```
--app-version
```

The version of the app

Yes

Example

List all RPCs for the app:

#### hashtag make-cli sdk-rpcs get

```
make-cli sdk-rpcs get
```

Get a single RPC by name.

Options

--app-name

```
--app-name
```

The name of the app

Yes

--app-version

```
--app-version
```

The version of the app

Yes

--rpc-name

```
--rpc-name
```

The name of the RPC

Yes

Example

Get a single RPC by name:

#### hashtag make-cli sdk-rpcs create

```
make-cli sdk-rpcs create
```

Create a new RPC.

Options

--app-name

```
--app-name
```

The name of the app

Yes

--app-version

```
--app-version
```

The version of the app

Yes

--name

```
--name
```

The name of the RPC

Yes

--label

```
--label
```

The label of the RPC visible in the scenario builder

Yes

Example

Create a new RPC:

#### hashtag make-cli sdk-rpcs update

```
make-cli sdk-rpcs update
```

Update an existing RPC.

Options

--app-name

```
--app-name
```

The name of the app

Yes

--app-version

```
--app-version
```

The version of the app

Yes

--rpc-name

```
--rpc-name
```

The name of the RPC

Yes

--label

```
--label
```

The label of the RPC visible in the scenario builder

No

--connection

```
--connection
```

Connection name

No

--alt-connection

```
--alt-connection
```

Alternative connection name

No

Example

Update an existing RPC:

#### hashtag make-cli sdk-rpcs delete

```
make-cli sdk-rpcs delete
```

Delete an RPC.

Options

--app-name

```
--app-name
```

The name of the app

Yes

--app-version

```
--app-version
```

The version of the app

Yes

--rpc-name

```
--rpc-name
```

The name of the RPC

Yes

Example

Delete an RPC:

#### hashtag make-cli sdk-rpcs test

```
make-cli sdk-rpcs test
```

Test an RPC with provided data and schema.

Options

--app-name

```
--app-name
```

The name of the app

Yes

--app-version

```
--app-version
```

The version of the app

Yes

--rpc-name

```
--rpc-name
```

The name of the RPC

Yes

--data

```
--data
```

Test data object

Yes

--schema

```
--schema
```

Schema definition array

Yes

Example

Test an RPC with provided data and schema:

#### hashtag make-cli sdk-rpcs get-section

```
make-cli sdk-rpcs get-section
```

Get RPC section data.

Options

--app-name

```
--app-name
```

The name of the app

Yes

--app-version

```
--app-version
```

The version of the app

Yes

--rpc-name

```
--rpc-name
```

The name of the RPC

Yes

--section

```
--section
```

The section to get

Yes

Example

Get RPC section data:

#### hashtag make-cli sdk-rpcs set-section

```
make-cli sdk-rpcs set-section
```

Set RPC section data.

Options

--app-name

```
--app-name
```

The name of the app

Yes

--app-version

```
--app-version
```

The version of the app

Yes

--rpc-name

```
--rpc-name
```

The name of the RPC

Yes

--section

```
--section
```

The section to set

Yes

--body

```
--body
```

The section data to set in JSONC format

Yes

Example

Set RPC section data:

### hashtag App webhooks

Manage your app webhooks.

#### hashtag make-cli sdk-webhooks list

```
make-cli sdk-webhooks list
```

List webhooks for a specific app.

Options

--app-name

```
--app-name
```

The name of the app

Yes

Example

List webhooks for a specific app:

#### hashtag make-cli sdk-webhooks get

```
make-cli sdk-webhooks get
```

Get a single webhook by name.

Options

--webhook-name

```
--webhook-name
```

The name of the webhook

Yes

Example

Get a single webhook by name:

#### hashtag make-cli sdk-webhooks create

```
make-cli sdk-webhooks create
```

Create a new webhook for an app.

Options

--app-name

```
--app-name
```

The name of the app

Yes

--type

```
--type
```

The type of the webhook

Yes

--label

```
--label
```

The label of the webhook visible in the scenario builder

Yes

Example

Create a new webhook for an app:

#### hashtag make-cli sdk-webhooks update

```
make-cli sdk-webhooks update
```

Update an existing webhook.

Options

--webhook-name

```
--webhook-name
```

The name of the webhook

Yes

--label

```
--label
```

The label of the webhook visible in the scenario builder

No

Example

Update an existing webhook:

#### hashtag make-cli sdk-webhooks delete

```
make-cli sdk-webhooks delete
```

Delete a webhook.

Options

--webhook-name

```
--webhook-name
```

The name of the webhook

Yes

Example

Delete a webhook:

#### hashtag make-cli sdk-webhooks get-section

```
make-cli sdk-webhooks get-section
```

Get a specific section of a webhook.

Options

--webhook-name

```
--webhook-name
```

The name of the webhook

Yes

--section

```
--section
```

The section to get

Yes

Example

Get a specific section of a webhook:

#### hashtag make-cli sdk-webhooks set-section

```
make-cli sdk-webhooks set-section
```

Set a specific section of a webhook.

Options

--webhook-name

```
--webhook-name
```

The name of the webhook

Yes

--section

```
--section
```

The section to set

Yes

--body

```
--body
```

The section data to set in JSONC format

Yes

Example

Set a specific section of a webhook:

Last updated 5 days ago

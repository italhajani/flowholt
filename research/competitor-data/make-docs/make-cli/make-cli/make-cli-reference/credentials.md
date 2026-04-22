---
title: "Credentials | Make CLI | Make Developer Hub"
url: https://developers.make.com/make-cli/make-cli/make-cli-reference/credentials
scraped_at: 2026-04-21T12:43:09.846630Z
---

1. Make CLI chevron-right
2. Make CLI reference

# Credentials

Use these commands to manage credentials, including connections, keys, and credential requests, with the Make CLI.

### hashtag Connections

Manage your connections.

#### hashtag make-cli connections list

```
make-cli connections list
```

List connections for a team.

Options

--team-id

```
--team-id
```

The team ID to list connections for

Yes

--type

```
--type
```

Filter by connection type

No

--scopes

```
--scopes
```

Scopes that are required on the requested connection types. Each connection type is a key in this object with an array of scopes as the value

No

Example

List connections for a team:

```
make-cliconnectionslist--team-id=5
```

#### hashtag make-cli connections get

```
make-cli connections get
```

Get details of a specific connection.

Options

--connection-id

```
--connection-id
```

The connection ID to get

Yes

Example

Get details of a specific connection:

#### hashtag make-cli connections create

```
make-cli connections create
```

Create a new connection.

Options

--name

```
--name
```

Human-readable name for the connection

Yes

--account-name

```
--account-name
```

Connection type name (internal identifier)

Yes

--team-id

```
--team-id
```

ID of the team to create the connection in

Yes

--data

```
--data
```

Connection configuration data

No

--scope

```
--scope
```

OAuth scopes

No

Example

Create a new connection:

#### hashtag make-cli connections update

```
make-cli connections update
```

Update a connection's configuration data.

Options

--connection-id

```
--connection-id
```

The connection ID to update

Yes

--name

```
--name
```

The new name for the connection

No

--data

```
--data
```

Connection configuration data to update

No

Example

Update a connection's configuration data:

#### hashtag make-cli connections verify

```
make-cli connections verify
```

Verify if a connection is working correctly.

Options

--connection-id

```
--connection-id
```

The connection ID to verify

Yes

Example

Verify if a connection is working correctly:

#### hashtag make-cli connections delete

```
make-cli connections delete
```

Delete a connection.

Options

--connection-id

```
--connection-id
```

The connection ID to delete

Yes

Example

Delete a connection:

### hashtag Keys

Manage your keys.

#### hashtag make-cli keys list

```
make-cli keys list
```

List all keys for a team.

Options

--team-id

```
--team-id
```

The team ID to list keys for

Yes

Example

List all keys for a team:

#### hashtag make-cli keys get

```
make-cli keys get
```

Get details of a specific key.

Options

--key-id

```
--key-id
```

The key ID to retrieve

Yes

Example

Get details of a specific key:

#### hashtag make-cli keys create

```
make-cli keys create
```

Create a new key.

Options

--team-id

```
--team-id
```

The team ID where the key will be created

Yes

--name

```
--name
```

Name of the key

Yes

--type-name

```
--type-name
```

Type of the key

Yes

--parameters

```
--parameters
```

Key-specific configuration parameters

Yes

Example

Create a new key:

#### hashtag make-cli keys update

```
make-cli keys update
```

Update an existing key.

Options

--key-id

```
--key-id
```

The key ID to update

Yes

--name

```
--name
```

New name for the key

No

--parameters

```
--parameters
```

Updated key-specific configuration parameters

No

Example

Update an existing key:

#### hashtag make-cli keys delete

```
make-cli keys delete
```

Delete a key.

Options

--key-id

```
--key-id
```

The key ID to delete

Yes

Example

Delete a key:

### hashtag Credential requests

Manage your credential requests.

#### hashtag make-cli credential-requests list

```
make-cli credential-requests list
```

Retrieve a list of credential requests. Each request can contain multiple credentials (connections and API keys). Filter by team, user, provider, status, or name to find specific requests.

Options

--team-id

```
--team-id
```

Filter by team ID

Yes

--user-id

```
--user-id
```

Filter by user ID

No

--make-provider-id

```
--make-provider-id
```

Filter by Make provider ID

No

--status

```
--status
```

Filter by status

No

--name

```
--name
```

Filter by name

No

Example

Retrieve a list of credential requests:

#### hashtag make-cli credential-requests get

```
make-cli credential-requests get
```

Retrieve detailed information about a specific credential request by its ID. Returns all associated credentials with their authorization status, provider configuration, user details, and authorization URLs for pending credentials. Use this to check the state of credentials within a request.

Options

--request-id

```
--request-id
```

The credential request ID to get details for

Yes

Example

Retrieve detailed information about a specific credential request by its ID:

#### hashtag make-cli credential-requests delete

```
make-cli credential-requests delete
```

Permanently delete a credential request and all associated credentials (connections and API keys) by ID. Any scenarios using connections from this request will lose access to the corresponding services. This action cannot be undone.

Options

--request-id

```
--request-id
```

The credential request ID to delete

Yes

Example

Permanently delete a credential request and all associated credentials (connections and API keys) by ID:

#### hashtag make-cli credential-requests credential-decline

```
make-cli credential-requests credential-decline
```

Decline a credential authorization request by ID, setting its status to "declined" and preventing it from being authorized. An optional reason can be provided to explain the decision. This operation is idempotent - declining an already-declined credential has no additional effect.

Options

--credential-id

```
--credential-id
```

The credential ID to decline

Yes

--reason

```
--reason
```

Optional reason for declining

No

Example

Decline a credential authorization request by ID:

#### hashtag make-cli credential-requests credential-delete

```
make-cli credential-requests credential-delete
```

Delete a credential (e.g., revoke OAuth tokens or remove stored API keys) and reset its state to pending. Use this when a credential needs re-authorization with updated permissions, tokens have become stale, or you want to force re-authentication. After deletion, the credential can be authorized again through the normal flow.

Options

--credential-id

```
--credential-id
```

The credential ID to delete

Yes

Example

Delete a credential (e.g., revoke OAuth tokens or remove stored API keys) and reset its state to pending:

#### hashtag make-cli credential-requests create

```
make-cli credential-requests create
```

Create a credential request for the currently authenticated user to set up connections and keys. This will return a URL where the user can authorize the credentials, so that they can be used in scenarios.

Options

--name

```
--name
```

Name of the Request which will be displayed to the End Users who open it

No

--description

```
--description
```

Description of the Request which will be displayed to the End Users who open it

No

--team-id

```
--team-id
```

Team ID

Yes

--credentials

```
--credentials
```

Array of app/module selections to derive credentials from

Yes

Example

Create a credential request for the currently authenticated user to set up connections and keys:

#### hashtag make-cli credential-requests create-by-credentials

```
make-cli credential-requests create-by-credentials
```

Create a credential request for one or more connections (OAuth) and/or keys (API keys) by their type identifiers (e.g. "google", "slack", "apikeyauth"). Use this when you know the exact connection or key types needed. The response includes the created request, an array of credentials associated with the request, and a publicUri where the end-user must go to authorize the requested credentials. At least one connection or one key must be provided.

Options

--name

```
--name
```

Human-readable name for the credential request, displayed to the end-user who will authorize it

No

--description

```
--description
```

Instructions or context for the end-user, displayed on the authorization page

No

--team-id

```
--team-id
```

The numeric ID of the Make team where the connections/keys will be created once authorized

Yes

--connections

```
--connections
```

Array of OAuth or basic-auth connections to request. Each item needs at least a "type" (e.g. "google", "slack", "github")

No

--keys

```
--keys
```

Array of API keys to request. Each item needs at least a "type" (e.g. "apikeyauth", "basicauth")

No

Example

Create a credential request for one or more connections (OAuth) and/or keys (API keys) by their type identifiers (e.g. "google", "slack", "apikeyauth"):

#### hashtag make-cli credential-requests extend-connection

```
make-cli credential-requests extend-connection
```

Add new OAuth scopes to an existing connection. Use this when a connection exists but lacks the permissions (scopes) needed for a specific operation. Creates a credential request that the end-user must authorize via the returned publicUri to grant the additional scopes. Fails if all requested scopes are already present on the connection.

Options

--connection-id

```
--connection-id
```

The numeric ID of an existing Make connection whose OAuth scopes need to be expanded

Yes

--scopes

```
--scopes
```

One or more new OAuth scope strings to add to the connection. At least one scope must be new (not already granted)

Yes

Example

Add new OAuth scopes to an existing connection:

Last updated 5 days ago

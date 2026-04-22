---
title: "Credential Requests | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/credential-requests
scraped_at: 2026-04-21T12:41:19.868031Z
---

1. API Reference

# Credential Requests

The following endpoints allow you to manage credential requests for connections and keys. You can create requests, list them, view details, and manage individual credentials within requests.

### hashtag List Credential Requests

Retrieves a list of Credential Requests.

- credential-requests:read

```
credential-requests:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

Team ID to filter credential requests.

Not all properties of the Entity may be returned by default, for example because of their size. Using the Column Filter parameter, you can ask the Server to provide additional properties when needed.

User ID to filter credential requests.

Make Provider ID to filter credential requests.

Status to filter credential requests.

```
authorized
```

```
declined
```

```
incomplete
```

```
invalid
```

```
partially_authorized
```

```
pending
```

Name to filter credential requests.

List of Credential Requests.

A credential request object.

List of Credential Requests.

### hashtag Create new Credential Request - deprecated

Creates a new request for Credentials. Supports two flows: 1) Flow for new Make users, 2) Flow for existing Make users.

- credential-requests:write

```
credential-requests:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

Request body for creating a new Credential Request. Supports two provider flows - inviting a new user or referencing an existing Make user.

Name of the Request which will be displayed to the End Users who open it.

ID of the Team the Credential Request should be bound to.

Description of the Request which will be displayed to the End Users who open it.

Array of connections to include in the request.

Array of keys to include in the request.

Provider information. Either an existing Make user ID or a new user to invite (name & email).

Existing Make user as provider. The user will be added to the team if not already a member.

New user to invite to the organization and add to the team.

Credential Request has been created successfully.

A credential request object.

Public URI where the provider can access the credential request.

Credential Request has been created successfully.

### hashtag Create new Credential Request (V2)

Creates a new request for Credentials using app and module selections. Credentials (connections/keys) are automatically derived from the selected modules using the modules-with-credentials API.

Supports two provider flows:

1. Existing Make user - Reference an existing Make user by their ID. The user will be added to the team if not already a member.
2. New user invitation - Invite a new user by providing their name and email.

Existing Make user - Reference an existing Make user by their ID. The user will be added to the team if not already a member.

New user invitation - Invite a new user by providing their name and email.

- credential-requests:write

```
credential-requests:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

V2 Request body for creating a Credential Request. Credentials are derived from app and module selections.

Name of the Request which will be displayed to the End Users who open it.

ID of the Team the Credential Request should be bound to.

Description of the Request which will be displayed to the End Users who open it.

Array of app/module selections to derive credentials from.

Provider information. Either an existing Make user ID or a new user to invite (name & email).

Existing Make user as provider. The user will be added to the team if not already a member.

New user to invite to the organization and add to the team.

Credential Request has been created successfully.

Response for V2 Credential Request creation.

A credential request object.

Public URI for accessing the credential request.

Credential Request has been created successfully.

### hashtag Get Credential Request

Retrieves a single Credential Request.

- credential-requests:read

```
credential-requests:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

ID of the Credential Request.

Not all properties of the Entity may be returned by default, for example because of their size. Using the Column Filter parameter, you can ask the Server to provide additional properties when needed.

Credential Request.

A credential request object.

Credential Request.

### hashtag Delete Credential Request

Deletes the given Credential Request.

- credential-requests:write

```
credential-requests:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

ID of the Credential Request.

When true, also deletes credentials (connections and keys) associated with the credential request. When false or omitted the API will return an error if there are any associated credentials, preventing accidental deletion of credentials.

Credential Request has been deleted successfully.

Indicates if the request was deleted.

Credential Request has been deleted successfully.

### hashtag Get Credential Request Detail

Retrieves detail of a single Credential Request with associated credentials. This endpoint has been enhanced to include all credentials associated with the request in a single response, eliminating the need for additional API calls.

- credential-requests:read

```
credential-requests:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

ID of the Credential Request.

Detail of the Credential Request with associated credentials.

A credential request object.

Detail of the Credential Request with associated credentials.

### hashtag Decline Credential

Declines a credential by setting its state to declined and recording the reason. This endpoint is idempotent and can be used to update the decline reason of an already declined credential.

- credential-requests:write

```
credential-requests:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

ID of the Credential.

Not all properties of the Entity may be returned by default, for example because of their size. Using the Column Filter parameter, you can ask the Server to provide additional properties when needed.

The reason why the credential was declined. This will be visible to support teams and helps with troubleshooting.

Credential has been declined successfully.

A credential object (connection or key).

Credential has been declined successfully.

### hashtag Delete Remote Credential

Deletes a credential from the remote platform (Make Web API) and resets its state to pending. The credential can then be re-created through the normal creation flow.

- credential-requests:write

```
credential-requests:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

ID of the Credential.

Not all properties of the Entity may be returned by default, for example because of their size. Using the Column Filter parameter, you can ask the Server to provide additional properties when needed.

Credential has been deleted from remote and reset to pending.

A credential object (connection or key).

Credential has been deleted from remote and reset to pending.

### hashtag Request Credential Reauthorization

Tests the OAuth connection and transitions to reauthorizing state if invalid. Returns an error if the connection is still valid.

- credential-requests:write

```
credential-requests:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

ID of the Credential.

Not all properties of the Entity may be returned by default, for example because of their size. Using the Column Filter parameter, you can ask the Server to provide additional properties when needed.

Credential transitioned to reauthorizing state.

A credential object (connection or key).

Credential transitioned to reauthorizing state.

Last updated 1 day ago

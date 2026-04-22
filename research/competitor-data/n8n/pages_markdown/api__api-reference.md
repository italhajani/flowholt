# API reference | n8n Docs

Source: https://docs.n8n.io/api/api-reference
Lastmod: 2026-04-14
Description: API reference for n8n's public REST API.
@layer scalar-theme {
/\* basic theme \*/
:root {
--scalar-text-decoration: underline;
--scalar-text-decoration-hover: underline;
}
.light-mode {
--scalar-background-1: #fff;
--scalar-background-2: #f6f6f6;
--scalar-background-3: #e7e7e7;
--scalar-background-accent: #8ab4f81f;
--scalar-color-1: #1b1b1b;
--scalar-color-2: #757575;
--scalar-color-3: #8e8e8e;
--scalar-color-accent: #0099ff;
--scalar-border-color: #dfdfdf;
}
.dark-mode {
--scalar-background-1: #0f0f0f;
--scalar-background-2: #1a1a1a;
--scalar-background-3: #272727;
--scalar-color-1: #e7e7e7;
--scalar-color-2: #a4a4a4;
--scalar-color-3: #797979;
--scalar-color-accent: #00aeff;
--scalar-background-accent: #3ea6ff1f;
--scalar-border-color: #2d2d2d;
}
/\* Document Sidebar \*/
.light-mode,
.dark-mode {
--scalar-sidebar-background-1: var(--scalar-background-1);
--scalar-sidebar-color-1: var(--scalar-color-1);
--scalar-sidebar-color-2: var(--scalar-color-2);
--scalar-sidebar-border-color: var(--scalar-border-color);
--scalar-sidebar-item-hover-background: var(--scalar-background-2);
--scalar-sidebar-item-hover-color: var(--scalar-sidebar-color-2);
--scalar-sidebar-item-active-background: var(--scalar-background-2);
--scalar-sidebar-color-active: var(--scalar-sidebar-color-1);
--scalar-sidebar-indent-border: var(--scalar-sidebar-border-color);
--scalar-sidebar-indent-border-hover: var(--scalar-sidebar-border-color);
--scalar-sidebar-indent-border-active: var(--scalar-sidebar-border-color);
--scalar-sidebar-search-background: color-mix(in srgb, var(--scalar-background-2), var(--scalar-background-1));
--scalar-sidebar-search-color: var(--scalar-color-3);
--scalar-sidebar-search-border-color: var(--scalar-border-color);
}
/\* advanced \*/
.light-mode {
--scalar-color-green: #069061;
--scalar-color-red: #ef0006;
--scalar-color-yellow: #edbe20;
--scalar-color-blue: #0082d0;
--scalar-color-orange: #ff5800;
--scalar-color-purple: #5203d1;
--scalar-link-color: var(--scalar-color-1);
--scalar-link-color-hover: var(--scalar-link-color);
--scalar-button-1: rgba(0, 0, 0, 1);
--scalar-button-1-hover: rgba(0, 0, 0, 0.8);
--scalar-button-1-color: rgba(255, 255, 255, 0.9);
--scalar-tooltip-background: color-mix(in srgb, #1a1a1a, transparent 10%);
--scalar-tooltip-color: color-mix(in srgb, #fff, transparent 15%);
--scalar-color-alert: color-mix(in srgb, var(--scalar-color-orange), var(--scalar-color-1) 20%);
--scalar-color-danger: color-mix(in srgb, var(--scalar-color-red), var(--scalar-color-1) 20%);
--scalar-background-alert: color-mix(in srgb, var(--scalar-color-orange), var(--scalar-background-1) 95%);
--scalar-background-danger: color-mix(in srgb, var(--scalar-color-red), var(--scalar-background-1) 95%);
}
.dark-mode {
--scalar-color-green: #00b648;
--scalar-color-red: #dc1b19;
--scalar-color-yellow: #ffc90d;
--scalar-color-blue: #4eb3ec;
--scalar-color-orange: #ff8d4d;
--scalar-color-purple: #b191f9;
--scalar-link-color: var(--scalar-color-1);
--scalar-link-color-hover: var(--scalar-link-color);
--scalar-button-1: rgba(255, 255, 255, 1);
--scalar-button-1-hover: rgba(255, 255, 255, 0.9);
--scalar-button-1-color: black;
--scalar-tooltip-background: color-mix(in srgb, var(--scalar-background-1), #fff 10%);
--scalar-tooltip-color: color-mix(in srgb, #fff, transparent 5%);
--scalar-color-danger: color-mix(in srgb, var(--scalar-color-red), var(--scalar-background-1) 20%);
--scalar-background-alert: color-mix(in srgb, var(--scalar-color-orange), var(--scalar-background-1) 95%);
--scalar-background-danger: color-mix(in srgb, var(--scalar-color-red), var(--scalar-background-1) 95%);
}
@supports (color: color(display-p3 1 1 1)) {
.light-mode {
--scalar-color-accent: color(display-p3 0 0.6 1 / 1);
--scalar-color-green: color(display-p3 0.023529 0.564706 0.380392 / 1);
--scalar-color-red: color(display-p3 0.937255 0 0.023529 / 1);
--scalar-color-yellow: color(display-p3 0.929412 0.745098 0.12549 / 1);
--scalar-color-blue: color(display-p3 0 0.509804 0.815686 / 1);
--scalar-color-orange: color(display-p3 1 0.4 0.02);
--scalar-color-purple: color(display-p3 0.321569 0.011765 0.819608 / 1);
}
.dark-mode {
--scalar-color-accent: color(display-p3 0.07 0.67 1);
--scalar-color-green: color(display-p3 0 0.713725 0.282353 / 1);
--scalar-color-red: color(display-p3 0.862745 0.105882 0.098039 / 1);
--scalar-color-yellow: color(display-p3 1 0.788235 0.05098 / 1);
--scalar-color-blue: color(display-p3 0.305882 0.701961 0.92549 / 1);
--scalar-color-orange: color(display-p3 1 0.552941 0.301961 / 1);
--scalar-color-purple: color(display-p3 0.694118 0.568627 0.976471 / 1);
}
}
/\* Inter (--scalar-font) \*/
/\* cyrillic-ext \*/
@font-face {
font-family: "Inter";
font-style: normal;
font-weight: 100 900;
font-display: swap;
src: url(https://fonts.scalar.com/inter-cyrillic-ext.woff2) format("woff2");
unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
}
/\* cyrillic \*/
@font-face {
font-family: "Inter";
font-style: normal;
font-weight: 100 900;
font-display: swap;
src: url(https://fonts.scalar.com/inter-cyrillic.woff2) format("woff2");
unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
}
/\* greek-ext \*/
@font-face {
font-family: "Inter";
font-style: normal;
font-weight: 100 900;
font-display: swap;
src: url(https://fonts.scalar.com/inter-greek-ext.woff2) format("woff2");
unicode-range: U+1F00-1FFF;
}
/\* greek \*/
@font-face {
font-family: "Inter";
font-style: normal;
font-weight: 100 900;
font-display: swap;
src: url(https://fonts.scalar.com/inter-greek.woff2) format("woff2");
unicode-range: U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF;
}
/\* vietnamese \*/
@font-face {
font-family: "Inter";
font-style: normal;
font-weight: 100 900;
font-display: swap;
src: url(https://fonts.scalar.com/inter-vietnamese.woff2) format("woff2");
unicode-range:
U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169,
U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323,
U+0329, U+1EA0-1EF9, U+20AB;
}
/\* latin-ext \*/
@font-face {
font-family: "Inter";
font-style: normal;
font-weight: 100 900;
font-display: swap;
src: url(https://fonts.scalar.com/inter-latin-ext.woff2) format("woff2");
unicode-range:
U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F,
U+A720-A7FF;
}
/\* latin \*/
@font-face {
font-family: "Inter";
font-style: normal;
font-weight: 100 900;
font-display: swap;
src: url(https://fonts.scalar.com/inter-latin.woff2) format("woff2");
unicode-range:
U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191,
U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
/\* keyboard symbols (←↑→↓↵⇧⇪⌘⌥) \*/
@font-face {
font-family: "Inter";
font-style: normal;
font-weight: 100 900;
font-display: swap;
src: url(https://fonts.scalar.com/inter-symbols.woff2) format("woff2");
unicode-range: U+2190-2193, U+21B5, U+21E7, U+21EA, U+2318, U+2325;
}
/\* JetBrains Mono (--scalar-font-code) \*/
/\* cyrillic-ext \*/
@font-face {
font-family: "JetBrains Mono";
font-style: normal;
font-weight: 400;
src: url(https://fonts.scalar.com/mono-cyrillic-ext.woff2) format("woff2");
unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
}
/\* cyrillic \*/
@font-face {
font-family: "JetBrains Mono";
font-style: normal;
font-weight: 400;
src: url(https://fonts.scalar.com/mono-cyrillic.woff2) format("woff2");
unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
}
/\* greek \*/
@font-face {
font-family: "JetBrains Mono";
font-style: normal;
font-weight: 400;
src: url(https://fonts.scalar.com/mono-greek.woff2) format("woff2");
unicode-range: U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF;
}
/\* vietnamese \*/
@font-face {
font-family: "JetBrains Mono";
font-style: normal;
font-weight: 400;
src: url(https://fonts.scalar.com/mono-vietnamese.woff2) format("woff2");
unicode-range:
U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169,
U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323,
U+0329, U+1EA0-1EF9, U+20AB;
}
/\* latin-ext \*/
@font-face {
font-family: "JetBrains Mono";
font-style: normal;
font-weight: 400;
src: url(https://fonts.scalar.com/mono-latin-ext.woff2) format("woff2");
unicode-range:
U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F,
U+A720-A7FF;
}
/\* latin \*/
@font-face {
font-family: "JetBrains Mono";
font-style: normal;
font-weight: 400;
src: url(https://fonts.scalar.com/mono-latin.woff2) format("woff2");
unicode-range:
U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191,
U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
}

Open Search Search Keyboard Shortcut:`CTRL⌃ k`

* Introduction
* User

  Close Group

  + Retrieve all users

    HTTP Method:  GET
  + Create multiple users

    HTTP Method:  POST
  + Get user by ID/Email

    HTTP Method:  GET
  + Delete a user

    HTTP Method:  DEL
  + Change a user's global role

    HTTP Method:  PATCH
* Audit

  Open Group
* Execution

  Open Group
* Workflow

  Open Group
* Credential

  Open Group
* Tags

  Open Group
* SourceControl

  Open Group
* Variables

  Open Group
* DataTable

  Open Group
* Projects

  Open Group
* Discover

  Open Group
* Models

  Open Group

[Powered by Scalar](https://www.scalar.com)

Open MenuUser

v1.1.1

OAS 3.0.0

# n8n Public API

[n8n API documentation](https://docs.n8n.io/api/)

[Sustainable Use License](https://github.com/n8n-io/n8n/blob/master/LICENSE.md)

[Terms of Service](https://n8n.io/legal/#terms)

Download OpenAPI Document

json

 Download OpenAPI Document

yaml

n8n Public API

Server

Server:https://{instance}.app.n8n.cloud/api/v1

* https://{instance}.app.n8n.cloud/api/v1
* {url}/api/v1

instance

n8n cloud instance

## AuthenticationRequired

Selected Auth Type: ApiKeyAuth

|  |
| --- |
| Name :  X-N8N-API-KEY Clear Value |
| Value :   Show Password |

Client Libraries

ShellRubyNode.jsPHPPython

More Select from all clients

Shell Curl

## User

​Copy link

Operations about users

User Operations

* get/users
* post/users
* get/users/{id}
* delete/users/{id}
* patch/users/{id}/role

### Retrieve all users

​Copy link

Retrieve all users from your instance. Only available for the instance owner.

Query Parameters

* limitCopy link to limit

  Type: number

  max:

   250

  Default

  100

  Example

  100

  The maximum number of items to return.
* cursorCopy link to cursor

  Type: string

  Paginate by setting the cursor parameter to the nextCursor attribute returned by the previous request's response. Default value fetches the first "page" of the collection. See pagination for more detail.
* includeRoleCopy link to includeRole

  Type: boolean

  Default

  false

  Example

  true

  Whether to include the user's role or not.
* projectIdCopy link to projectId

  Type: string

  Example

  VmwOO9HeTEj20kxM

Responses

* 200

  application/json

  Operation successful.

  Type: object · userList

  + data

    Type: array object[] · user[]

    Show Child Attributesfor data
  + nextCursor

    Type: string | null

    Example

    MTIzZTQ1NjctZTg5Yi0xMmQzLWE0NTYtNDI2NjE0MTc0MDA

    Paginate through users by setting the cursor parameter to a nextCursor attribute returned by a previous request. Default value fetches the first "page" of the collection.
* 401

  Unauthorized

Request Example for get/users

Shell Curl

```
curl 'https://your-instance-name.app.n8n.cloud/api/v1/users?limit=100&cursor=&includeRole=false&projectId=VmwOO9HeTEj20kxM' \
  --header 'X-N8N-API-KEY: YOUR_SECRET_TOKEN'
```

cURLCopy

cURLCopy

Test Request(get /users)

Status: 200Status: 401

Show Schema

```
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "john.doe@company.com",
      "firstName": "john",
      "lastName": "Doe",
      "isPending": true,
      "createdAt": "2026-04-16T08:24:00.623Z",
      "updatedAt": "2026-04-16T08:24:00.623Z",
      "role": "global:owner"
    }
  ],
  "nextCursor": "MTIzZTQ1NjctZTg5Yi0xMmQzLWE0NTYtNDI2NjE0MTc0MDA"
}
```

JSONCopy

JSONCopy

Operation successful.

### Create multiple users

​Copy link

Create one or more users.

Body

required

application/json

Array of users to be created.

* Type: array object[]

  Hide Child Attributes
  + email

    Type: stringFormat: email

    required
  + role

    Type: string

    Example

    global:member

Responses

* 200

  application/json

  Operation successful.

  Type: object

  + error

    Type: string
  + user

    Type: object

    Show Child Attributesfor user
* 401

  Unauthorized
* 403

  Forbidden

Request Example for post/users

Shell Curl

```
curl https://your-instance-name.app.n8n.cloud/api/v1/users \
  --request POST \
  --header 'Content-Type: application/json' \
  --header 'X-N8N-API-KEY: YOUR_SECRET_TOKEN' \
  --data '[
  {
    "email": "",
    "role": "global:member"
  }
]'
```

cURLCopy

cURLCopy

Test Request(post /users)

Status: 200Status: 401Status: 403

Show Schema

```
{
  "user": {
    "id": "string",
    "email": "string",
    "inviteAcceptUrl": "string",
    "emailSent": true
  },
  "error": "string"
}
```

JSONCopy

JSONCopy

Operation successful.

### Get user by ID/Email

​Copy link

Retrieve a user from your instance. Only available for the instance owner.

Path Parameters

* idCopy link to id

  Type: stringFormat: identifier

  required

  The ID or email of the user.

Query Parameters

* includeRoleCopy link to includeRole

  Type: boolean

  Default

  false

  Example

  true

  Whether to include the user's role or not.

Responses

* 200

  application/json

  Operation successful.

  Type: object · user

  + email

    Type: stringFormat: email

    required

    Example

    john.doe@company.com
  + createdAt

    Type: stringFormat: date-time

    read-only

    Time the user was created.
  + firstName

    Type: string

    max length:

     32

    read-only

    Example

    john

    User's first name
  + id

    Type: string

    read-only

    Example

    123e4567-e89b-12d3-a456-426614174000
  + isPending

    Type: boolean

    read-only

    Whether the user finished setting up their account in response to the invitation (true) or not (false).
  + lastName

    Type: string

    max length:

     32

    read-only

    Example

    Doe

    User's last name
  + role

    Type: string

    read-only

    Example

    global:owner
  + updatedAt

    Type: stringFormat: date-time

    read-only

    Last time the user was updated.
* 401

  Unauthorized

Request Example for get/users/*{id}*

Shell Curl

```
curl 'https://your-instance-name.app.n8n.cloud/api/v1/users/{id}?includeRole=false' \
  --header 'X-N8N-API-KEY: YOUR_SECRET_TOKEN'
```

cURLCopy

cURLCopy

Test Request(get /users/{id})

Status: 200Status: 401

Show Schema

```
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "john.doe@company.com",
  "firstName": "john",
  "lastName": "Doe",
  "isPending": true,
  "createdAt": "2026-04-16T08:24:00.623Z",
  "updatedAt": "2026-04-16T08:24:00.623Z",
  "role": "global:owner"
}
```

JSONCopy

JSONCopy

Operation successful.

### Delete a user

​Copy link

Delete a user from your instance.

Path Parameters

* idCopy link to id

  Type: stringFormat: identifier

  required

  The ID or email of the user.

Responses

* 204

  Operation successful.
* 401

  Unauthorized
* 403

  Forbidden
* 404

  The specified resource was not found.

Request Example for delete/users/*{id}*

Shell Curl

```
curl 'https://your-instance-name.app.n8n.cloud/api/v1/users/{id}' \
  --request DELETE \
  --header 'X-N8N-API-KEY: YOUR_SECRET_TOKEN'
```

cURLCopy

cURLCopy

Test Request(delete /users/{id})

Status: 204Status: 401Status: 403Status: 404

No Body

Operation successful.

### Change a user's global role

​Copy link

Change a user's global role

Path Parameters

* idCopy link to id

  Type: stringFormat: identifier

  required

  The ID or email of the user.

Body

required

application/json

New role for the user

* newRoleNameCopy link to newRoleName

  Type: string

  required

  Example

  global:member

Responses

* 200

  Operation successful.
* 401

  Unauthorized
* 403

  Forbidden
* 404

  The specified resource was not found.

Request Example for patch/users/*{id}*/role

Shell Curl

```
curl 'https://your-instance-name.app.n8n.cloud/api/v1/users/{id}/role' \
  --request PATCH \
  --header 'Content-Type: application/json' \
  --header 'X-N8N-API-KEY: YOUR_SECRET_TOKEN' \
  --data '{
  "newRoleName": "global:member"
}'
```

cURLCopy

cURLCopy

Test Request(patch /users/{id}/role)

Status: 200Status: 401Status: 403Status: 404

No Body

Operation successful.

## Audit (Collapsed)

​Copy link

Operations about security audit

Audit Operations

* post/audit

 Show More

## Execution (Collapsed)

​Copy link

Operations about executions

Execution Operations

* get/executions
* get/executions/{id}
* delete/executions/{id}
* post/executions/{id}/retry
* post/executions/{id}/stop
* post/executions/stop
* get/executions/{id}/tags
* put/executions/{id}/tags

 Show More

## Workflow (Collapsed)

​Copy link

Operations about workflows

Workflow Operations

* post/workflows
* get/workflows
* get/workflows/{id}
* delete/workflows/{id}
* put/workflows/{id}
* get/workflows/{id}/{versionId}
* post/workflows/{id}/activate
* post/workflows/{id}/deactivate
* put/workflows/{id}/transfer
* get/workflows/{id}/tags
* put/workflows/{id}/tags

 Show More

## Credential (Collapsed)

​Copy link

Operations about credentials

Credential Operations

* get/credentials
* post/credentials
* patch/credentials/{id}
* delete/credentials/{id}
* get/credentials/schema/{credentialTypeName}
* put/credentials/{id}/transfer

 Show More

## Tags (Collapsed)

​Copy link

Operations about tags

Tags Operations

* post/tags
* get/tags
* get/tags/{id}
* delete/tags/{id}
* put/tags/{id}

 Show More

## SourceControl (Collapsed)

​Copy link

Operations about source control

SourceControl Operations

* post/source-control/pull

 Show More

## Variables (Collapsed)

​Copy link

Operations about variables

Variables Operations

* post/variables
* get/variables
* delete/variables/{id}
* put/variables/{id}

 Show More

## DataTable (Collapsed)

​Copy link

Operations about data tables and their rows

DataTable Operations

* get/data-tables
* post/data-tables
* get/data-tables/{dataTableId}
* patch/data-tables/{dataTableId}
* delete/data-tables/{dataTableId}
* get/data-tables/{dataTableId}/rows
* post/data-tables/{dataTableId}/rows
* patch/data-tables/{dataTableId}/rows/update
* post/data-tables/{dataTableId}/rows/upsert
* delete/data-tables/{dataTableId}/rows/delete

 Show More

## Projects (Collapsed)

​Copy link

Operations about projects

Projects Operations

* post/projects
* get/projects
* delete/projects/{projectId}
* put/projects/{projectId}
* get/projects/{projectId}/users
* post/projects/{projectId}/users
* delete/projects/{projectId}/users/{userId}
* patch/projects/{projectId}/users/{userId}

 Show More

## Discover (Collapsed)

​Copy link

API capability discovery

Discover Operations

* get/discover

 Show More

## Models

 Show More

Show sidebar

Search

* User

  Open Group
* Audit

  Close Group

  + Generate an audit

    HTTP Method:  POST
* Execution

  Open Group
* Workflow

  Open Group
* Credential

  Open Group
* Tags

  Open Group
* SourceControl

  Open Group
* Variables

  Open Group
* DataTable

  Open Group
* Projects

  Open Group
* Discover

  Open Group

POST

Server: https://{instance}.app.n8n.cloud/api/v1

/audit

Copy URLSend Send post request to https://{instance}.app.n8n.cloud/api/v1/audit

Close Client

Generate an audit

AllAuthCookiesHeadersQueryBody

All

## AuthenticationRequired

Selected Auth Type: ApiKeyAuth

|  |
| --- |
| Name :  X-N8N-API-KEY Clear Value |
| Value :   Show Password |

## Variables

| Enabled | Key | Value |
| --- | --- | --- |

## Cookies

| Enabled | Key | Value |
| --- | --- | --- |
|  | Key | Value |

## Headers

Clear All Headers

| Enabled | Key | Value |
| --- | --- | --- |
|  | accept | application/json |
|  | content-type | application/json |
|  | Key | Value |

## Query Parameters

| Enabled | Key | Value |
| --- | --- | --- |
|  | Key | Value |

## Request Body

JSON ||

Press `Esc` then `Tab` to exit

9

1

2

3

4

5

6

7

8

{

"additionalOptions": {

"daysAbandonedWorkflow": 1,

"categories": [

"credentials"

]

}

}

## Code Snippet

Shell Curl

|

```
curl https://your-instance-name.app.n8n.cloud/api/v1/audit \
  --request POST \
  --header 'Content-Type: application/json' \
  --header 'Accept: application/json' \
  --header 'X-N8N-API-KEY: YOUR_SECRET_TOKEN' \
  --data '{
  "additionalOptions": {
    "daysAbandonedWorkflow": 1,
    "categories": [
      "credentials"
    ]
  }
}'
```

cURLCopy

cURLCopy

|  |

Response

AllCookiesHeadersBody

All

[Powered By Scalar.com](https://www.scalar.com)

.,,uod8B8bou,,. ..,uod8BBBBBBBBBBBBBBBBRPFT?l!i:. ||||||||||||||!?TFPRBBBBBBBBBBBBBBB8m=, |||| '""^^!!||||||||||TFPRBBBVT!:...! |||| '""^^!!|||||?!:.......! |||| ||||.........! |||| ||||.........! |||| ||||.........! |||| ||||.........! |||| ||||.........! |||| ||||.........! ||||, ||||.........` |||||!!-.\_ ||||.......;. ':!|||||||||!!-.\_ ||||.....bBBBBWdou,. bBBBBB86foi!|||||||!!-..:|||!..bBBBBBBBBBBBBBBY! ::!?TFPRBBBBBB86foi!||||||||!!bBBBBBBBBBBBBBBY..! :::::::::!?TFPRBBBBBB86ftiaabBBBBBBBBBBBBBBY....! :::;`"^!:;::::::!?TFPRBBBBBBBBBBBBBBBBBBBY......! ;::::::...''^::::::::::!?TFPRBBBBBBBBBBY........! .ob86foi;::::::::::::::::::::::::!?TFPRBY..........` .b888888888886foi;:::::::::::::::::::::::..........` .b888888888888888888886foi;::::::::::::::::...........b888888888888888888888888888886foi;:::::::::......`!Tf998888888888888888888888888888888886foi;:::....` '"^!|Tf9988888888888888888888888888888888!::..` '"^!|Tf998888888888888888888888889!! '` '"^!|Tf9988888888888888888!!` iBBbo. '"^!|Tf998888888889!` WBBBBbo. '"^!|Tf9989!` YBBBP^' '"^!` `

Send Request

ctrlControl

↵Enter

* Multipart Form
* Form URL Encoded
* Binary File
* JSON
* XML
* YAML
* EDN
* Other
* None

Scalar.createApiReference('#app', {
url: '/api/v1/openapi.yml',
// Avoid CORS issues
proxyUrl: 'https://proxy.scalar.com',
servers: [
{
url: 'https://{instance}.app.n8n.cloud/api/v1',
description: 'n8n cloud instance',
variables: {
instance: {
default: 'your-instance-name',
}
}
},
{
url: '{url}/api/v1',
description: 'self-hosted n8n instance',
variables: {
url: {
default: 'https://example.com',
}
}
},
],
forceDarkModeState: 'light',
hideDarkModeToggle: true,
hideClientButton: true,
})

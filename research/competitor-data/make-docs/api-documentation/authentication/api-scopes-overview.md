---
title: "Make roles and API scopes | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/authentication/api-scopes-overview
scraped_at: 2026-04-21T12:41:02.693588Z
---

1. Authentication

# Make roles and API scopes

Accessibility of Make API endpoints differs depending on the Make platform you use. On Make and our hosted cloud version, regular users cannot access the administration interface. Administration API resources are meant only for internal Make administrators.

In the on-premise version, any user with a platform administration role assigned can access the administration interface. These users can also access API endpoints that are meant for administrators.

Access to the Make API resources depends also on the scopes assigned to the authentication token. Some resources require more than one scope. There are two types of scopes - read and write .

Read scope :read

```
:read
```

Allows you to use the GET method with endpoints, usually to get a list of resources or a resource detail. No modification is allowed.

```
GET
```

Write scope :write

```
:write
```

Allows you to use the POST , PUT , PATCH , or DELETE methods with endpoints to create, modify, or remove resources.

```
POST
```

```
PUT
```

```
PATCH
```

```
DELETE
```

Even if you are not the administrator, you can assign to your token the scopes meant for administrators. However, if you try to access the admin resources as a regular user, you will receive the 403 Access denied error in response.

```
403 Access denied
```

## hashtag Administration scopes (only for administrators of Make White Label platforms)

admin:read

```
admin:read
```

- Allows getting all resources and information available only to administrators -- all resources that are available in the administration interface, such as collections of all created users, templates, scenarios, and custom and native apps for the whole platform and all their details.

Allows getting all resources and information available only to administrators -- all resources that are available in the administration interface, such as collections of all created users, templates, scenarios, and custom and native apps for the whole platform and all their details.

admin:write

```
admin:write
```

- Allows performing all actions available only to administrators --- all actions that can be performed in the administration interface, such as creating organizations, deleting approved templates, reviewing custom apps, creating and deleting new users, overwriting scenarios and templates settings.

Allows performing all actions available only to administrators --- all actions that can be performed in the administration interface, such as creating organizations, deleting approved templates, reviewing custom apps, creating and deleting new users, overwriting scenarios and templates settings.

apps:read

```
apps:read
```

- Allows getting a collection of all native apps.
- Allows getting details of a native app.

Allows getting a collection of all native apps.

Allows getting details of a native app.

apps:write

```
apps:write
```

- Allows updating a native app.
- Allows deleting a native app.

Allows updating a native app.

Allows deleting a native app.

system:read

```
system:read
```

- Allows reading the Make platform settings.

Allows reading the Make platform settings.

system:write

```
system:write
```

- Allows modifying the Make platform settings.

Allows modifying the Make platform settings.

## hashtag Standard user scopes (for all users of Make platforms)

analytics:read

```
analytics:read
```

- Allows retrieving analytics data for the specified organization.

Allows retrieving analytics data for the specified organization.

connections:read

```
connections:read
```

- Allows retrieving connections for a given team.
- Allows getting details of a connection.

Allows retrieving connections for a given team.

Allows getting details of a connection.

connections:write

```
connections:write
```

- Allows creating new connections.
- Allows updating connections.
- Allows deleting connections.
- Allows setting data for connections.
- Allows verifying connections.
- Allows checking if a connection scope is limited.

Allows creating new connections.

Allows updating connections.

Allows deleting connections.

Allows setting data for connections.

Allows verifying connections.

Allows checking if a connection scope is limited.

custom-property-structures:read

```
custom-property-structures:read
```

- Allows retrieving the list of custom properties structures in the organization.
- Allows getting custom properties items.

Allows retrieving the list of custom properties structures in the organization.

Allows getting custom properties items.

custom-property-structures:write

```
custom-property-structures:write
```

- Allows creating custom properties structures.
- Allows creating custom property structure items.
- Allows updating custom property structure items.
- Allows deleting custom property structure items.

Allows creating custom properties structures.

Allows creating custom property structure items.

Allows updating custom property structure items.

Allows deleting custom property structure items.

datastores:read

```
datastores:read
```

- Allows getting all data stores for a given team.
- Allows getting records from a data store.

Allows getting all data stores for a given team.

Allows getting records from a data store.

datastores:write

```
datastores:write
```

- Allows creating new data store.
- Allows updating data stores.
- Allows deleting data store.
- Allows modifying the records of a data store.

Allows creating new data store.

Allows updating data stores.

Allows deleting data store.

Allows modifying the records of a data store.

devices:read

```
devices:read
```

- Allows retrieving all devices for a given team.
- Allows getting details of a device.

Allows retrieving all devices for a given team.

Allows getting details of a device.

devices:write

```
devices:write
```

- Allows creating new devices.
- Allows updating devices.
- Allows deleting devices.

Allows creating new devices.

Allows updating devices.

Allows deleting devices.

dlqs:read

```
dlqs:read
```

- Allows getting all incomplete executions of a given scenario.
- Allows getting details of an incomplete execution.
- Allows getting bundles, blueprints, and logs of an incomplete execution.

Allows getting all incomplete executions of a given scenario.

Allows getting details of an incomplete execution.

Allows getting bundles, blueprints, and logs of an incomplete execution.

dlqs:write

```
dlqs:write
```

- Allows updating incomplete executions.
- Allows deleting incomplete executions.

Allows updating incomplete executions.

Allows deleting incomplete executions.

functions:read

```
functions:read
```

- Allows getting data about the custom functions which belong to the team.
- Allows getting the history of updates to the custom functions.

Allows getting data about the custom functions which belong to the team.

Allows getting the history of updates to the custom functions.

functions:write

```
functions:write
```

- Allows creating custom functions.
- Allows updating custom functions.
- Allows deleting custom functions.

Allows creating custom functions.

Allows updating custom functions.

Allows deleting custom functions.

hooks:read

```
hooks:read
```

- Allows getting all hooks (mailhooks and webhooks) for a given team.
- Allows getting hook requests.
- Allows checking if a hook is active.

Allows getting all hooks (mailhooks and webhooks) for a given team.

Allows getting hook requests.

Allows checking if a hook is active.

hooks:write

```
hooks:write
```

- Allows creating new hooks.
- Allows updating hooks.
- Allows deleting hooks.
- Allows enabling or disabling hooks.
- Allows starting or stopping the automatic determination of a data structure for a hook.
- Allows setting data for hooks.

Allows creating new hooks.

Allows updating hooks.

Allows deleting hooks.

Allows enabling or disabling hooks.

Allows starting or stopping the automatic determination of a data structure for a hook.

Allows setting data for hooks.

keys:read

```
keys:read
```

- Allows getting all keys for a given team.
- Allows getting key types.

Allows getting all keys for a given team.

Allows getting key types.

keys:write

```
keys:write
```

- Allows creating new keys.
- Allows updating keys.
- Allows deleting keys.

Allows creating new keys.

Allows updating keys.

Allows deleting keys.

notifications:read

```
notifications:read
```

- Allows getting all notifications for a given user.
- Allows getting details of a notification.

Allows getting all notifications for a given user.

Allows getting details of a notification.

notifications:write

```
notifications:write
```

- Allows marking notifications as read.
- Allows deleting notifications.

Allows marking notifications as read.

Allows deleting notifications.

organizations:read

```
organizations:read
```

- Allows getting all organizations to which the authenticated user belongs.
- Allows getting installed apps, invitations, user roles, and basic details of organizations.

Allows getting all organizations to which the authenticated user belongs.

Allows getting installed apps, invitations, user roles, and basic details of organizations.

organizations:write

```
organizations:write
```

- Allows creating new organizations (only for admins).
- Allows updating organizations.
- Allows deleting organizations.
- Allows accepting invitations to organizations.
- Allows adding members to organizations.

Allows creating new organizations (only for admins).

Allows updating organizations.

Allows deleting organizations.

Allows accepting invitations to organizations.

Allows adding members to organizations.

organizations-variables:read

```
organizations-variables:read
```

- Allows getting data of organization variables to which the authenticated user belongs.
- Allows getting the history of updates of custom organization variables.

Allows getting data of organization variables to which the authenticated user belongs.

Allows getting the history of updates of custom organization variables.

organizations-variables:write

```
organizations-variables:write
```

- Allows creating custom organization variables.
- Allows updating custom organization variables.
- Allows deleting custom organization variables.

Allows creating custom organization variables.

Allows updating custom organization variables.

Allows deleting custom organization variables.

scenarios:read

```
scenarios:read
```

- Allows getting all scenarios for a given team or organization.
- Allows getting details of a scenario.
- Allows getting properties of triggers included in scenarios.
- Allows getting scenario blueprints.
- Allows getting blueprint versions.
- Allows getting scenario logs.
- Allows getting scenario folders.
- Allows inspecting scenario interface.
- Allows retrieving custom scenario properties data.

Allows getting all scenarios for a given team or organization.

Allows getting details of a scenario.

Allows getting properties of triggers included in scenarios.

Allows getting scenario blueprints.

Allows getting blueprint versions.

Allows getting scenario logs.

Allows getting scenario folders.

Allows inspecting scenario interface.

Allows retrieving custom scenario properties data.

scenarios:write

```
scenarios:write
```

- Allows creating new scenarios and scenario folders.
- Allows updating scenarios and scenario folder.
- Allows cloning scenarios.
- Allows verifying whether module settings are set or not.
- Allows activating and deactivating scenarios.
- Allows deleting scenarios and scenario folders.
- Allows updating scenario interface.
- Allows adding custom scenario properties data.
- Allows updating custom scenario properties data.
- Allows deleting custom scenario properties data.

Allows creating new scenarios and scenario folders.

Allows updating scenarios and scenario folder.

Allows cloning scenarios.

Allows verifying whether module settings are set or not.

Allows activating and deactivating scenarios.

Allows deleting scenarios and scenario folders.

Allows updating scenario interface.

Allows adding custom scenario properties data.

Allows updating custom scenario properties data.

Allows deleting custom scenario properties data.

scenarios:run

```
scenarios:run
```

- Allows running scenarios with the API.

Allows running scenarios with the API.

sdk-apps:read

```
sdk-apps:read
```

- Allows getting all custom apps for the authenticated user.
- Allows getting information from specific configuration sections of a custom app.
- Allows getting invitation details for an app.

Allows getting all custom apps for the authenticated user.

Allows getting information from specific configuration sections of a custom app.

Allows getting invitation details for an app.

sdk-apps:write

```
sdk-apps:write
```

- Allows creating custom apps.
- Allows managing configuration of custom apps.
- Allows cloning custom apps.
- Allows requesting review of custom apps.
- Allows rolling back changes made in custom apps.
- Allows uninstalling custom apps from organizations.
- Allows deleting custom apps.

Allows creating custom apps.

Allows managing configuration of custom apps.

Allows cloning custom apps.

Allows requesting review of custom apps.

Allows rolling back changes made in custom apps.

Allows uninstalling custom apps from organizations.

Allows deleting custom apps.

teams:read

```
teams:read
```

- Allows getting all teams that belong to a given organization.
- Allows getting details of a team.
- Allows getting all team roles.
- Allows getting details of a team role.

Allows getting all teams that belong to a given organization.

Allows getting details of a team.

Allows getting all team roles.

Allows getting details of a team role.

teams:write

```
teams:write
```

- Allows creating new teams.
- Allows updating teams.
- Allows deleting teams.

Allows creating new teams.

Allows updating teams.

Allows deleting teams.

teams-variables:read

```
teams-variables:read
```

- Allows getting data of team variables to which the authenticated user belongs.
- Allows getting the history of updates of custom team variables.

Allows getting data of team variables to which the authenticated user belongs.

Allows getting the history of updates of custom team variables.

team-variables:write

```
team-variables:write
```

- Allows creating custom team variables.
- Allows updating custom team variables.
- Allows deleting custom team variables.

Allows creating custom team variables.

Allows updating custom team variables.

Allows deleting custom team variables.

templates:read

```
templates:read
```

- Allows retrieving all private templates for a given team.
- Allows getting all public templates.
- Allows getting private or public template details.
- Allows getting private or public template blueprints.

Allows retrieving all private templates for a given team.

Allows getting all public templates.

Allows getting private or public template details.

Allows getting private or public template blueprints.

templates:write

```
templates:write
```

- Allows creating new templates.
- Allows updating templates.
- Allows deleting templates.
- Allows publishing private templates.
- Allows requesting approval of published templates.

Allows creating new templates.

Allows updating templates.

Allows deleting templates.

Allows publishing private templates.

Allows requesting approval of published templates.

udts:read

```
udts:read
```

- Allows retrieving all data structures for a given team.

Allows retrieving all data structures for a given team.

udts:write

```
udts:write
```

- Allows creating new data structures.
- Allows updating data structures.
- Allows deleting data structures.
- Allows cloning data structures.

Allows creating new data structures.

Allows updating data structures.

Allows deleting data structures.

Allows cloning data structures.

user:read

```
user:read
```

- Allows getting all users who belong to a given team or organization.
- Allows getting API authentication tokens assigned to the currently authenticated user.
- Allows getting organization invitations assigned to the currently authenticated user.
- Allows getting organization invitations assigned to a user.
- Allows getting organization and team roles that can be assigned to any user.
- Allows getting a number of unread notifications for the currently authenticated user.
- Allows getting organizations invitations for a user.
- Allows getting details of an invitation to an organization for a user.
- Allows getting details of a notification assigned to a user in a given team.
- Allows getting team roles of a user.

Allows getting all users who belong to a given team or organization.

Allows getting API authentication tokens assigned to the currently authenticated user.

Allows getting organization invitations assigned to the currently authenticated user.

Allows getting organization invitations assigned to a user.

Allows getting organization and team roles that can be assigned to any user.

Allows getting a number of unread notifications for the currently authenticated user.

Allows getting organizations invitations for a user.

Allows getting details of an invitation to an organization for a user.

Allows getting details of a notification assigned to a user in a given team.

Allows getting team roles of a user.

user:write

```
user:write
```

- Allows setting a user role for a given team.
- Allows setting a user role in a given organization.
- Allows transferring organization ownership to a user.
- Allows updating a notification for a user in a given team.
- Allows creating a new API authentication token for a currently authenticated user.
- Allows deleting an API authentication token identified by timestamp for a currently authenticated user.
- Allows deleting an account of a currently authenticated user.
- Allows updating details of a user.

Allows setting a user role for a given team.

Allows setting a user role in a given organization.

Allows transferring organization ownership to a user.

Allows updating a notification for a user in a given team.

Allows creating a new API authentication token for a currently authenticated user.

Allows deleting an API authentication token identified by timestamp for a currently authenticated user.

Allows deleting an account of a currently authenticated user.

Allows updating details of a user.

Last updated 1 year ago

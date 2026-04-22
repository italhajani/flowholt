# RBAC role types | n8n Docs

Source: https://docs.n8n.io/user-management/rbac/role-types
Lastmod: 2026-04-14
Description: Understand the RBAC roles available in n8n, and the access they have.
# RBAC role types[#](#rbac-role-types "Permanent link")

Feature availability

* The Project Editor role is available on Pro Cloud and Self-hosted Enterprise plans.
* The Project Viewer role is only available on Self-hosted Enterprise and Cloud Enterprise plans.

Within projects, there are three user roles: Admin, Editor, and Viewer. These roles control what the user can do in a project. A user can have different roles within different projects.

## Project Admin[#](#project-admin "Permanent link")

A Project Admin role has the highest level of permissions. Project admins can:

* Manage project settings: Change name, delete project.
* Manage project members: Invite members and remove members, change members' roles.
* View, create, update, and delete any workflows, credentials, or executions within a project.

## Project Editor[#](#project-editor "Permanent link")

A Project Editor can view, create, update, and delete any workflows, credentials, or executions within a project.

## Project Viewer[#](#project-viewer "Permanent link")

A Project Viewer is effectively a `read-only` role with access to all workflows, credentials, and executions within a project.

Viewers aren't able to manually execute any workflows that exist in a project.

Role types and account types

Role types and [account types](../../account-types/) are different things. Every account has one type. The account can have different role types for different [projects](../projects/).

| Permission | Admin | Editor | Viewer |
| --- | --- | --- | --- |
| View workflows in the project | ✅ | ✅ | ✅ |
| View credentials in the project | ✅ | ✅ | ✅ |
| View executions | ✅ | ✅ | ✅ |
| Edit credentials and workflows | ✅ | ✅ | ❌ |
| Add workflows and credentials | ✅ | ✅ | ❌ |
| Execute workflows | ✅ | ✅ | ❌ |
| Manage members | ✅ | ❌ | ❌ |
| Modify the project | ✅ | ❌ | ❌ |
| Use external secrets in credentials | ✅\* | ✅\* | ❌ |
| Manage project secret vaults | ✅\* | ❌ | ❌ |

\* Requires **Enable external secrets for project roles** to be enabled by an instance owner or admin. Refer to [Access for project roles](../../../external-secrets/#access-for-project-roles). This is available from n8n version `2.13.0`.

[Variables](../../../code/variables/) and [tags](../../../workflows/tags/) aren't affected by RBAC: they're global across the n8n instance.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

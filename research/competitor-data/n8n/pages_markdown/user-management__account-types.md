# Account types | n8n Docs

Source: https://docs.n8n.io/user-management/account-types
Lastmod: 2026-04-14
Description: n8n account types
# Account types[#](#account-types "Permanent link")

There are three account types: owner, admin, and member. The account type affects the user permissions and access.

Feature availability

To use admin accounts, you need a pro or enterprise plan.

Account types and role types

Account types and role types are different things. Role types are part of [RBAC](../rbac/).

Every account has one type. The account can have different [role types](../rbac/role-types/) for different [projects](../rbac/projects/).

Create a member-level account for the owner

n8n recommends that owners create a member-level account for themselves. Owners can see and edit all workflows, credentials, and projects. However, there is no way to see who created a particular workflow, so there is a risk of overriding other people's work if you build and edit workflows as an owner.

| Permission | Owner | Admin | Member |
| --- | --- | --- | --- |
| Manage own email and password | ✅ | ✅ | ✅ |
| Manage own workflows | ✅ | ✅ | ✅ |
| View, create, and use tags | ✅ | ✅ | ✅ |
| Delete tags | ✅ | ✅ | ❌ |
| View and share all workflows | ✅ | ✅ | ❌ |
| View, edit, and share all credentials | ✅ | ✅ | ❌ |
| Set up and use [Source control](../../source-control-environments/) | ✅ | ✅ | ❌ |
| Create [projects](../rbac/projects/) | ✅ | ✅ | ❌ |
| View all projects | ✅ | ✅ | ❌ |
| Add and remove users | ✅ | ✅ | ❌ |
| Access the Cloud dashboard | ✅ | ❌ | ❌ |

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

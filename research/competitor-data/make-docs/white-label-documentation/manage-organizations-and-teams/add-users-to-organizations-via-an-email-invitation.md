---
title: "Add users to organizations via an email invitation | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/manage-organizations-and-teams/add-users-to-organizations-via-an-email-invitation
scraped_at: 2026-04-21T12:42:39.267817Z
---

1. Manage organizations and teams

# Add users to organizations via an email invitation

Make White Label lets you add users to organizations via an invitation process:

1. You send an invitation to the user via the administrative UI.
2. The invited user receives an email with a link to join the organization.

You send an invitation to the user via the administrative UI.

The invited user receives an email with a link to join the organization.

Once the invited user accepts the invitation, they have access to the organization as defined by their organizational role.

If you use the following procedure to add new end users to your instance, your new end users need to create a new password during their first login. Adding a new user via an email invitation is best practice because you do not need to manually send user credentials via email.

Because the procedure requires access to any organization on your instance, you must have a system role such as SA or Admin that has user and organization permissions.

1. Go to Administration > Organizations .
2. Search for the organization you want to add a user to and click Detail .
3. Expand the Change details menu and select Invite a new user .
4. In the dialog that opens, fill in the details of the user: Email - the invited user's email address. Name - the name of the user. The user can change their name after they accept the invitation. Role - the invited user's role in the organization . Team Note - your custom message that appears in the invitation email.
5. Click Save .

Go to Administration > Organizations .

Search for the organization you want to add a user to and click Detail .

Expand the Change details menu and select Invite a new user .

In the dialog that opens, fill in the details of the user:

- Email - the invited user's email address.
- Name - the name of the user. The user can change their name after they accept the invitation.
- Role - the invited user's role in the organization .
- Team
- Note - your custom message that appears in the invitation email.

Email - the invited user's email address.

Name - the name of the user. The user can change their name after they accept the invitation.

Role - the invited user's role in the organization .

Team

Note - your custom message that appears in the invitation email.

Click Save .

The invited user receives an invitation email where they can accept the invitation by clicking Accept invitation . The invitation email features the branding you define at Administration > System settings .

When the user accepts the invitation, the system adds them to the organization. The system also adds the user to the selected team with the Team member role. More about Teams arrow-up-right .

Last updated 1 year ago

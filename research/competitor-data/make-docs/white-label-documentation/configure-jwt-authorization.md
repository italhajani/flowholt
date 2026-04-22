---
title: "Configure JWT authorization | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/configure-jwt-authorization
scraped_at: 2026-04-21T12:41:06.427889Z
---

# Configure JWT authorization

Your Make White Label instance can use JWT authorization to manage users, organizations, or teams. A benefit of JWT authorization is that it allows embedding with third-party systems. When you set up JWT authorization, your instance fully trusts the information received in the JWT. As a result, your system manages access. A user in your IdP who has access to your instance automatically receives an Admin role in their organization and team. All users accessing Make receive the Admin role for the organizations and teams you assign them to.

Configuring JWT authorization lets your instance extract information from the JWT payload to perform the following:

- Create a new user, organization, or team if that user, organization, or team does not currently exist in your instance.

Create a new user, organization, or team if that user, organization, or team does not currently exist in your instance.

Users added via JWT receive the Admin role for the organization or team they are added to. You need to manage permissions on your system external to Make.

- Update a user, organization, or team with data from the payload. Any payload data that does not match your instance's data initiates automatic updates.
- Links users, organizations, or teams currently not associated together. For example, add a user to an organization, or a team to an organization.

Update a user, organization, or team with data from the payload. Any payload data that does not match your instance's data initiates automatic updates.

Links users, organizations, or teams currently not associated together. For example, add a user to an organization, or a team to an organization.

Last updated 1 year ago

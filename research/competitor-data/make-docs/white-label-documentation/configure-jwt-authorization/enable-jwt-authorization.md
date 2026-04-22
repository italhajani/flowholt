---
title: "Enable JWT authorization | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/configure-jwt-authorization/enable-jwt-authorization
scraped_at: 2026-04-21T12:41:07.157264Z
---

1. Configure JWT authorization

# Enable JWT authorization

You can enable JWT authorization on the System settings page of the Administration interface. Configuration requires the following:

- Your JWT Authorization secret.
- The external parameters from your system that you want Make to map to its internal values.

Your JWT Authorization secret.

The external parameters from your system that you want Make to map to its internal values.

The following procedure configures your instance to implement JWTs to create, update, and link users, organizations, and teams.

1. Go to Administration > System Settings .
2. Scroll down to the JWT auth enabled field.
3. Use the drop menu to select Enabled .
4. In the JWT Auth secret field, enter your JWT authorization secret.
5. Under JWT Auth mapping , map the values that you instance extracts from JWT payloads. See the following section for more details on mapping
6. Add any custom contexts as required.
7. Click Save in the lower right corner.

Go to Administration > System Settings .

Scroll down to the JWT auth enabled field.

Use the drop menu to select Enabled .

In the JWT Auth secret field, enter your JWT authorization secret.

Under JWT Auth mapping , map the values that you instance extracts from JWT payloads. See the following section for more details on mapping

Add any custom contexts as required.

Click Save in the lower right corner.

Last updated 1 year ago

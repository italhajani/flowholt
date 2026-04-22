# Organizations - Help Center

Source: https://help.make.com/organizations
Lastmod: 2026-04-08T14:40:14.017Z
Description: Create and manage organizations to structure teams, control access, and manage credit and data consumption.
Your organization

Organizations & teams

# Organizations

11 min

Organizations are the basic containers into which all scenarios﻿, users, and data belong.

Organizations usually represent a company that is a Make﻿ customer or partner. Each organization has separate pricing plan and billing. This means that you can also monitor your credits and data consumption for each organization separately.

Each organization allows you to select the geographical location of the data center where the organization's data will be stored and processed. Currently, Make﻿ supports two data center locations:

* United States (US)

* European Union (EU)

The geographical location that you select for an organization does not represent where your company or your users are located, but where the data center that stores and processes your data is located.

We recommend that you select the location closest to you to ensure low latency.

You cannot change the location of the data center after you create the organization.

## Create an organization

Any user can create their own organization, even if they are already a member of another organization.

1

Click on your username in the top-right menu.

2

Select **Profile** from the dropdown.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/BUrGhtnGequlHoTsMRE2D-20251001-135911.png "Document image")

﻿

3

In the **Organizations** tab, click the **Create organization** button in the top-right corner.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/RwlysHXUm57D4duBZpuQk-20251001-150009.png?format=webp "Document image")

﻿

4

In the dialog, enter the details of the new organization.

* The **Organization name.** The name must be between 1 and 128 characters long. Use only letters, numbers, spaces, and allowed special characters. Names can't start or end with spaces.

* The **Region** field represents the location of the data center that will store and process your data.

* The **Timezone** field represents the time zone used for scheduling scenarios﻿ and parsing dates.

* The **Country** field represents your physical location, but is currently not used by Make﻿ in any way.

If you have multiple affiliate partners as team members of your organization, you can set the affiliate partner for shared scenarios.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/Ct5skiaIpPHHCp7U_DzoS-20260316-154337.png?format=webp "Document image")

﻿

5

Click the **Save** button.

By default, the organization is on a Free plan and has one team, called **My Team**.

## Add users to an organization

To add users to an organization, you must be the **owner** or an **admin** of the organization. For more details about roles, refer to [organization roles](/organizations#organization-roles)﻿.

1

In the left sidebar, click **Org**.

2

Click the **Org Users** tab.

3

Click the **Invite user** button in the top-right corner.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/khihAB9fC1_-vkogPBdNy-20251001-151129.png?format=webp "Document image")

﻿

4

In the dialog, enter the user's details.

* **Email**: The invited user's email address.

* **Name**: The name of the user, which the user can change after accepting the invitation.

* **Team**: The user's team (**My Team** by default).

* **Role**: The user's [role in the organization](/organizations#organization-roles)﻿.

* **Note**: An optional custom message to add to the invitation email.

5

Click the **Save** button.

The user will receive an invitation email with an **Accept invitation** button.

When the user accepts the invitation, Make﻿ adds them to the organization.

The invitation expires in 7 days. If the invited user does not accept the invitation:

1. Remove the invited user from your organization.

2. Send a new invitation.

## Remove a user

To remove users from an organization, you must be the **owner** or an **admin** of the organization.

1

In the left sidebar, click **Org.**

2

Click the **Org Users** tab.

3

Click the role in the **Role** column and select **Remove** from the dropdown.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/3KjTW6Bj7wJ69r42PLBuT-20251001-152800.png "Document image")

﻿

4

Click the **Remove user** button.

## Organization roles

﻿Make﻿ provides a two-level permission model. All users are members of at least one organization and one team. The permissions that users have are determined by the organization role and team role they are assigned to.

The following table describes actions that members of different organizational roles can perform.

For information about team roles, [read the article about teams](/teams)﻿.

| **Role** | **Permissions** |
| --- | --- |
| **Owner** | * View organization details  * Modify organization  * Delete organization  * Transfer organization ownership  * Add and modify users in the organization  * Manage all teams  * Install apps in the organization  * View payments  * Change payment methods |
| **Admin** | * View organization details  * Modify organization  * Add and modify users in the organization  * Manage all teams  * Install apps in the organization  * View payments  * Change payment methods |
| **Member** | * View organization details |
| **Accountant** | * View organization details  * View payments |
| **App Developer** | * View organization details  * Install apps in the organization |
| **Guest** | * Log in to the organization's account |

## Switch organizations

If you're a member of multiple organizations, you can change the active organization by clicking on your name in the top-right corner and selecting another organization.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/unez1bQ4rcGX07DK3s4BS-20251001-155222.png "Document image")

﻿

## Transfer ownership

When you create an organization, you automatically become the owner of the organization. Organization owners can manage and access all teams in an organization. An organization can have only one owner.

If you are the owner of an organization, you can transfer ownership to any member of your organization:

1

In the left sidebar, click **Org**.

2

Next to **Organization settings**, click the three dots to expand the menu.

3

Select **Transfer ownership**.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/xg1FTrUy4S5M2lfJkIyL3-20251002-151111.png "Document image")

﻿

4

In the **User** dropdown, select the organization member you want to be the owner of the organization.

All current organization members appear in the menu. Once a new member accepts the invitation, you can transfer ownership to them.

5

Click **Save**.

A purple pop-up appears confirming that ownership has been transferred successfully.

Ownership transfers can only be performed by existing organization owners. If you do not have owner access, reach out to our [Support](https://www.make.com/en/ticket "Support").

## Delete an organization

You can delete an organization only if you are the owner of the organization. You can't delete an organization owned by other users.

1

Click on your username in the top-right corner.

2

Select **Profile**.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/Wo_zB5QFKVps6pzbbyRG_-20251002-151724.png "Document image")

﻿

3

In the **Organizations** tab, you will see a list of all organizations you have access to.

4

Click the three dots next to the organization you want to delete, then **Delete**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/qR_Te4W9BQqR1KjtsvEoh-20251002-152136.png?format=webp "Document image")

﻿

5

In the dialog, type the name of the organization you want to delete, then click **Delete organization**.

You can't undo this action. Your organization will be permanently deleted and it can't be retrieved.

Your organization has been deleted.

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

Organizations & teams](/organizations-and-teams "Organizations & teams")[NEXT

Teams](/teams "Teams")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

# Make Managed Services (MMS) user guide - Help Center

Source: https://help.make.com/make-managed-services-mms-user-guide
Lastmod: 2026-01-16T11:26:17.649Z
Description: Help Center
Your organization

Make Managed Services (MMS)

# Make Managed Services (MMS) user guide

11 min

Make Managed Services (MMS) is a product offering that enables easy, scalable management of child organizations. You can manage child organizations in the Make﻿ platform or with the [Make API](https://developers.make.com/api-documentation/api-reference/mms-greater-than-child-organizations "Make API").

In this user guide for organizations enrolled in MMS, you will learn how to create and manage child organizations, allocate credits across child organizations, and manage roles.

* Suggested reading: [Make Managed Services (MMS)](https://help.make.com/make-managed-services-mms "Make Managed Services (MMS)")﻿

## Create child organizations

To link a client's organization to your distributor organization in Make﻿, you will create a child organization.

To create a child organization:

1

In the left sidebar, navigate to **Org management** for your selected organization.

2

Click **Child organizations.**

3

In the dialog box, enter the following information about the child organization:

* Organization name

* Region

* Country

* Owner name

* Owner email

The child organization owner can be from the distributor organization or child organization. Only the owner can open the child organization from MMS. Enter the email address of the person who can have this access. Learn more in **manage child organizations**.

4

In **Credits for child organization**, enter the number of credits the child can use. Credits must be in increments of 10,000.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/HtMGGDcFEg6X89lUmvwRd-20251128-073843.png "Document image")

﻿

5

Click **Create**.

You have now created a child organization.

You can also create a child organization [using the API](https://developers.make.com/api-documentation/api-reference/mms-greater-than-child-organizations#post-organizations-organizationid-managed-organizations "using the API").

## Manage credits

After creating a child organization, you can update its allocated number of credits anytime.

Allocated credits must be in increments of 10,000 (10,000, 20,000, 30,000, and so on).

Your distributor organization deducts credits allocated to child organizations from its total available credits. For example, if your organization has 500,000 total credits, after allocating 10,000 to a child organization, it will have 490,000 remaining credits.

To update allocated credits:

1

Identify the child organization to update.

2

Click on the drop-down arrow next to **Open**.

3

Click **Update credits**.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/OQPxvzQPE7tf0JssCbyYK-20251127-133559.png "Document image")

﻿

4

Enter the new amount.

5

Click **Save**.

You have now allocated the child organization's credits.

You can also update the child organization credit allocation [using the API](https://developers.make.com/api-documentation/api-reference/mms-greater-than-child-organizations#patch-organizations-organizationid-managed-organizations-childorganizationid "using the API").

### Overview of child organization consumption

For every child organization, you can see the number of consumed credits vs allocated credits and the data transfer.

To view the consumption of child organizations:

1

In the left sidebar, navigate to **Org management** for your selected organization.

2

Click **Child organizations.**

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/erMrzcZMzftk0sGSKGjuu-20260112-111038.png?format=webp "Document image")

﻿

You will see all the child organizations for your selected main organization.

3

Hover your mouse over the credit usage of a child organization to see more information.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/wl2eGV9r28ZwHF3VMYQhd-20260112-111230.png?format=webp "Document image")

﻿

4

Hover your mouse over the data transfer of a child organization to see more information.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/W04gqalujP0pibhFK2x3E-20260112-111331.png?format=webp "Document image")

﻿

You can view the consumption for all child organizations for the selected organization.

## Manage access to child organizations

When you create a child organization, the email address designates the organization's owner. Only owners can access child organizations through MMS. If you enter your own email, you can open the organization from MMS. If you enter the email of a member of the child organization, you are unable to open it.

To access a child organization's account through MMS as a non-owner, you will need an invitation from the child organization to join their organization.

To invite you, a child organization will:

1

Click **Organization**.

2

Click **Org Users**.

3

Click **Invite a new user**.

4

In the dialog box, fill in your details, including your role in their organization.

5

Click **Save**.

You will receive an invitation email with an Accept invitation button. Invitations expire in 7 days. When you accept the invitation, Make﻿ adds you to the organization.

**Access with Single Sign-On (SSO)**

If a child organization has enabled Single Sign-On (SSO), they need to create a user account for you via their SSO provider to access their organization.

SSO process and requirements are identical to the standard at Make﻿. Review [Single Sign-on](/single-sign-on)﻿ for details.

## Manage child organizations

Depending on the situation, you can transfer ownership to a member of the child organization or unlink the organization.

### Transfer ownership

Organization owners can manage and access the organization's scenarios﻿, data, and teams. If you were the owner when creating a child organization, you can transfer ownership to a member of the child organization upon request.

To transfer ownership:

1

In the left sidebar, click **Organization**.

2

Next to **Organization settings**, click the three dots to expand the menu.

3

Click **Transfer ownership**.

4

Select the organization member you want to be the owner of the organization.

5

Click **Save**.

Once the member accepts the invitation, ownership will be transferred. A purple pop-up confirms that ownership has been transferred.

### Unlink organizations

When you discontinue a partnership with a client, you can permanently unlink its child organization from your distributor organization.

When you unlink a child organization:

* You lose the ability to see and manage the unlinked organization.

* The unlinked organization's used and unused operations return to the distributor organization's total operations.

* The unlinked organization can continue to use Make﻿ but needs to buy operations independently.

To unlink a child organization:

1

Navigate to **Org management** in the left sidebar.

2

Click **Child Organizations.**

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/DDtyhNSpvRYpq4yk5c003-20251127-133021.png "Document image")

﻿

3

Identify the child organization to unlink.

4

Click the drop-down arrow next to **Open**.

5

Click **Update credits**.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/0yQYB74BAIUladhditQPo-20251127-132703.png "Document image")

﻿

6

Update the **Credits for child organization** to 0.

7

Click **Save**.

Before continuing, allow 1 hour for all ongoing scenarios to finish processing.

8

Click the drop-down arrow next to **Open**.

9

Click **Unlink**.

10

In **Enter the name to confirm**, enter the name of the child organization.

11

Click **Unlink organization**.

The child organization is now unlinked.

## Limitations

To sum up, the following are the limitations of Make Managed Services:

* Distributor organizations can only access child organizations as owners or when invited/via SSO.

* Only owners and admins of distributor organizations can unlink child organizations.

* Only owners and admins of distributor organizations can allocate operations.

Updated 16 Jan 2026

Did this page help you?

Yes

No

[PREVIOUS

Make Managed Services (MMS)](/make-managed-services-mms "Make Managed Services (MMS)")[NEXT

Release notes](/release-notes "Release notes")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

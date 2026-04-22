# Credential requests - Help Center

Source: https://help.make.com/credential-requests
Lastmod: 2026-04-08T14:40:15.284Z
Description: Securely collect connection credentials from third parties to build automations in Make
Explore more

Connections

# Credential requests

19 min

The **Credential requests** feature is available to official **Make** **Partners** and **Enterprise** customers.

Only users with the required permissions and with this feature enabled can create credential requests.

See below:

* ﻿[How to enable the feature](/credential-requests#how-to-enable-credentials-requests-feature)﻿﻿

* ﻿[Who can request credentials](/credential-requests#who-can-request-credentials)﻿﻿

Credential requests are a secure, scalable, and user-friendly way to collect connection credentials from third parties.

When building automations in Make (e.g., for teammates, other teams, clients, or external partners), builders (requesters) can specify which connections and credentials are required for a scenario and generate a secure request link.

Recipients can use this link to provide the requested connection credentials:

* If they are not part of the requester's Make organization or team, they are invited to join it with a **Guest** role before they provide the credentials.

* If they are already part of the requester's Make organization, they can provide the credentials directly.

In both cases, recipients can:

* See who requested their credentials and how they will be used.

* Retain the ongoing control to revoke, reauthorize, or edit credentials at any time.

Login credentials and other authentication data are never exposed through credential requests.

The person authorizing the request enters credentials directly in Make to create the connection. This connection can be used to build scenarios, but no one on the requester's side can view, access, or retrieve the user's authentication details (e.g., passwords, API keys, OAuth credentials).

## How to enable Credentials requests feature

To enable the feature, each user must submit this [form](https://f.make.com/r/credential-requests "form").

The Customer Care team then verifies the eligibility (Partner or Enterprise account user with a corporate email) and grant acceess to the feature upon approval.

The feature is enabled for a user, not the organization. Once a user has access to the **Credentials** **request** feature, they can use it in any Make organization they are part of, provided that organization is on the Enterprise plan or a Make Partner on any paid plan.

All owners of these organizations will receive an email notification that this member has been granted permission to use the feature in their organization. The same applies to any new organizations the user joins in the future.

All Team Members can check which users have the feature enabled by navigating to **Team > Team members** tab in the left sidebar.

## Who can request credentials

Credential requests are created and sent from the team you're currently working in within your Make organization. Who you can send a request to depends on your team and organization role:

* Team Members can request credentials from any user within their team.

* Team Admins can request credentials from any user within their organization.

* Organization Admins and Owners can request credentials from any user within their organization and from external people.

Once the recipient authorizes a request, everyone in the team can use the shared credentials to create connections in the scenarios.

﻿[Audit logs](https://help.make.com/audit-logs "Audit logs") show when and by whom a credential request was created, deleted, or authorized:

* Organization Admins can see this information for the entire organization.

* Team Admins can see this information for their teams.

## **Create credential request**

To create and send credential requests, you must have this feature enabled.

To create a credential request:

1

In the left sidebar, click **Credentials** and switch to the **Credential requests** tab.

2

Click the **+Create request** button.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/bi5VKyGntlFZ6gnAwG6zt-20251212-145428.png?format=webp "Document image")

﻿

3

In the **Request** **name** field, enter a descriptive name that will help identify the request (e.g., the project or automation name).

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/RPoICvhYGmSqdqkW4kGsm-20260202-095435.png?format=webp "Document image")

﻿

4

In the **Recipient** section**,** select **Recipient is part of** [Name of your organization] **organization**, if you want to request credentials from someone within your Make organization.

**Example**

You are building an internal weekly newsletter for all company employees. You want to automate email delivery and create newsletters tailored to each employee's role, location, or group or team they belong to, to provide the most accurate and targeted information.

To do that, you need access to employee data stored in the company's identity provider (Microsoft Entra ID). If you don't have access to it, you can send a credential request to get access to the following modules:

* **Microsoft Entra ID > Search Users, Get a User, Get a User's Memberships, Search Groups, Get a Group**

A colleague with access to these credentials can review your request, verify that it only includes read access, and create a connection for you. You then query Entra ID to retrieve email addresses and related information.

In this case, you will select a user from the drop-down list.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/M3FlyBcmCc1xOY53LVbzF-20260202-100507.png?format=webp "Document image")

﻿

5

If you want to request credentials from someone who is not part of your Make organization, select **Recipient is not part of** [Name of your organization] **organization.**

**Example**

You are an external contractor hired to help the marketing department automate lead generation. You need to create a scenario in Make that retrieves emails from the marketing team's email account and stores or updates contacts in their HubSpot CRM. You can request the marketing manager to create the connection to the following apps and modules:

* **Email > Get emails**

* **Hubspot > Search for Contacts, Get a Contact, Create or Update a Contact**

Once you get all the credentials, you can build a scenario for the entire marketing team or for a specific marketing manager.

This option is only available to those with permission to [add users to the organization](https://help.make.com/organizations#1iKQb "add users to the organization"). You need to have either an Admin or an Owner [organization role](https://help.make.com/organizations#em3xI "organization role").

In this case:

* Enter the recipient's **Name** and **Email address**.

* Optionally, add a **Description** (max. 256 characters) to explain the purpose of the request.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/-wPkekAhSK4TUV1N-YrdD-20260202-105157.png?format=webp "Document image")

﻿

6

Once finished, click **Next**.

7

In the **App** field, select the app for which you want to request credentials.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/V269ROYtQlHOMRiXuE_RS-20260202-102313.png?format=webp "Document image")

﻿

If the app has multiple versions, select the required one in the **Version** field.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/leUYdHzHwR7IT5gs71xoc-20260202-104005.png?format=webp "Document image")

﻿

8

In the **Module** field, select the modules for which you want to request credentials.

To include all the modules, click **Select all.**

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/N6ZBlqLc6bOpr_Osj73g7-20260202-105253.png?format=webp "Document image")

﻿

9

Optionally, add a note (max. 256 characters) explaining why you need the credentials and how you'll use them, or specify other details.

10

Configure a name to distinguish these credentials afterward in the list of available connections for the app, or leave the default.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/ddpECPNlEkuiJMWwmrzB4-20260202-105423.png?format=webp "Document image")

﻿

11

To add more apps to the request, click the **+Add app** button and repeat the steps explained above.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/lqYRzHCqxp34qhEls3BQc-20260202-113114.png?format=webp "Document image")

﻿

12

Review the terms and conditions, then check the box to confirm your agreement.

13

Click **Submit**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/bDHUSBJIW-n7Vtb6ic0lK-20260202-113313.png?format=webp "Document image")

﻿

You'll see a confirmation that the request has been successfully sent.

* A recipient who is not a part of your Make organization will be invited to join your organization and team with a **Guest** role.

* A recipient who is a part of your Make organization will receive a link to review the request.

## Authorize or decline a credential request as a recipient

Once a requester submits a request, the recipient gets an email notification.

To authorize the credential request as a recipient:

1

Open the email notification.

2

If you're a part of the requester's Make organization, click the **Review** **request** button.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/ey6d0tBPkSwmtF0YXqgon-20260202-152728.png?format=webp "Document image")

﻿

If you're not a part of the requester's Make organization, you'll get an invitation to join it. Click the **Accept invitation** button.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/SEtFFDqGv77J6rQ8oY1cy-20260202-120235.png?format=webp "Document image")

﻿

Follow the prompts to log in to Make or sign up if you don't have an account.

3

Once you log in to Make, you will be redirected to the request details page in the requester's organization. There, you can see:

* Request name

* Requester's name

* Request date

* Request description (if provided by the requester)

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/APIApShpfgtCCTNjjWwqV-20260202-145157.png?format=webp "Document image")

﻿

4

In the **Requested** **credentials** section, you can:

* See the apps for which credentials are requested.

* Hover over the modules and permissions under each app to see which ones are included in the request.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/WDsGuZzTKZhe3yri-8FW7-20260202-162237.png?format=webp "Document image")

﻿

5

Click **Authorize** to proceed.

6

A window prompting you to create a connection will appear.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/PSNY9t8U3k_fchTU56CSA-20251215-161410.png?format=webp "Document image")

﻿

7

Follow the prompts to grant Make access. Depending on the connection, you may need to select the connection type, enter an API key, OAuth credentials, or other authentication details.

8

Once finished, a green **Authorized** label should appear next to the app's name.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/2qF4sPrjj_2dFD0RYtdWZ-20260202-162718.png?format=webp "Document image")

﻿

To decline the credential request, as a recipient:

1

Log in to Make.

2

Switch to the requester's organization, if you have several.

3

In the left sidebar, click **Credentials**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/VrQyMWHhFJ7ghXw07jYar-20260128-141453.png?format=webp "Document image")

﻿

4

Click **Details** next to the relevant request.

5

Click **Decline** next to the app you don't want to provide credentials for.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/-1wxZ9a8kGohnNPzz0Ab_-20260202-162749.png?format=webp "Document image")

﻿

6

Add the reason for declining the request.

7

Click **Decline**.

The requester will see the red **Declined** label in the request and the reason for that.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/25DNg-y5u0j1mH01BJHGT-20260202-163151.png?format=webp "Document image")

﻿

## View credentials requests

To see all the sent and received credential requests, click **Credentials** on the left sidebar. In the **Credential** **requests** tab, you can switch between **Sent** and **Received** requests depending on whether you are a requester, a recipient, or both.

### Sent requests

In the **Sent** tab, you can view all the requests sent by you and your team members, including:

* Request name

* Which apps are included in the request

* Who requested the credentials

* Who the recipient is

* When the request was sent

* Request status

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/XN5xMXDt1ZS1DH18vQvM4-20260202-155249.png?format=webp "Document image")

﻿

Requests can have the following statuses:

* **Authorized** - All apps in the request have been authorized

* **Partially** **authorized** - Some apps have been authorized, and others declined

* **Incomplete** - The authorization process hasn't been completed

* **Invalid** - The authorization process has failed

* **Declined** - The request has been declined

### View request details as a requester

To see all available information for the request, click **Details** next to the credential request.

For sent requests, the details include:

* The recipient's name and email address

* The request submission date

* The request description (if provided by the requester)

In the **Requested** **credentials** section, you can also:

* See all the apps included in the request

* Hover over modules and permissions to see what access is authorized

* See whether the request for a particular app is still **Pending**, has been **Authorized,** or **Declined** (with the reason added by the recipient)

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/IeQNAobEqZA9Y8i_md8CA-20260202-163436.png?format=webp "Document image")

﻿

### Received requests

In the **Received** tab, you can view all the requests you've received, including:

* Request name

* Which apps are included in the request

* Who requested the credentials

* When the request was sent

* Request status

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/Z5ppObm4VsQvCzuvwjSJX-20260202-171040.png?format=webp "Document image")

﻿

### View request details as a recipient

To see all available information for the request, click **Details** next to the credential request.

For received requests, the details include:

* The requester's name and email address

* The request submission date

* The request description (if provided by the requester)

In the **Requested** **credentials** section, you can also:

* See all the apps included in the request

* Hover over modules and permissions to see what exactly is authorized

* See whether the request has been **Authorized** or **Declined** (with the reason you added)

* **Revoke,** **Authorize**, or **Decline** access to the credentials.

## Revoke access to credentials

A recipient can revoke access to the provided credentials at any time. To do that:

1

In the left sidebar, click **Credentials**.

2

Switch to **Sent** inthe **Credential** **requests** tab, and click **Details** next to the relevant request.

3

In the **Requested** **credentials** section, click **Revoke** for the app you want to remove the access from.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/3edMYVbnH92dYh_V7tTgJ-20260202-170201.png?format=webp "Document image")

﻿

The requester will no longer be able to use your credentials for that app.

4

To restore access, click **Authorize** and follow the prompts to establish the connection again (e.g., grant access, enter API key).

To permanently remove access, click **Decline** or delete the request (see below).

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/VQWbrzlXAHUeHP8vcjyuP-20260202-170240.png?format=webp "Document image")

﻿

The requester will no longer be able to use the credentials provided by the recipient for a particular app in the request. However, if there are multiple apps in the request, all the other authorized credentials will still be available.

## Reauthorize credential request

Apps that use the OAuth 2.0 protocol only grant access for a limited time and may require periodic reauthorization to maintain the connection.

### Request reauthorization

As a **requester**, you can ask a recipient to reauthorize an OAuth connection in an authorized credentials request. To do that:

1

In the left sidebar, click **Credentials**.

2

Switch to **Sent** inthe **Credential** **requests** tab, and click **Details** next to the relevant request.

3

In the **Requested credentials** section, click **Request reauthorization** for the corresponding app.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/Znulg2pdyeIEnLkPMRDdr-20260226-115525.png?format=webp "Document image")

﻿

If the connection is valid and doesn't require reauthorization, a notification will appear at the bottom of the screen. The request won't be sent.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/RFy0f7X5sN0yjbUV5GWol-20260226-120130.png?format=webp "Document image")

﻿

If the connection requires reauthorization, an orange **Reauthorizing** label will appear next to the app. The request will be sent, and the recipient will receive an email notification with a link for reauthorization.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/dwgBzMoXONGraxO8ILwYo-20260226-124211.png?format=webp "Document image")

﻿

### Reauthorize the request

As a recipient, you can reauthorize a credential request:

* Using the link from the email notification

* Directly from the requester's Make organization

To reauthorize a credential request using the link from the email notification:

1

Open the email notification.

2

Click **Review** **request**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/fv9L5MtQQfqeJhSQRleLl-20260226-125621.png?format=webp "Document image")

﻿

3

Log in to the requester's Make organization, and go to the credential request details page.

4

In the **Requested** **credentials** section, click **Reauthorize** for the corresponding app.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/Op7RtLZNb0qzhPFMFbPQn-20260226-130132.png?format=webp "Document image")

﻿

5

Follow the prompts to allow Make access.

To reauthorize a credential request directly from the requester's Make organization:

1

Log in to the requester's Make organization

2

In the left sidebar, click **Credentials >** **Credential** **requests**.

3

In the **Received** tab, click **Details** next to the relevant request.

4

In the **Requested** **credentials** section, click **Reauthorize** for the corresponding app.

5

Follow the prompts to allow Make access.

Once reauthorized, the status of the credential request will switch back to **Authorized** for both the requester and the recipient.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/Ms4DcjvDi_rAwXNLWl55s-20260227-131928.png?format=webp "Document image")

﻿

A recipient and a requester will get an email notification about that.

## Delete credential request

Both a recipient and a requester can delete the entire credential request. To do that:

1

In the left sidebar, click **Credentials**.

2

If you're a requester:

* Switch to **Sent** inthe **Credential** **requests** tab.

* Click the **three dots > Delete** next to the request.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/Ejk6qu44QpcH8oAwwRPuC-20260202-171511.png?format=webp "Document image")

﻿

* Review the list of connections where the credentials are used and click **Delete** to confirm.

3

If you're a recipient:

* Switch to **Received** inthe **Credential** **requests** tab.

* Click the **three dots > Delete** next to the request.

* Review the list of connections where the credentials are used and click **Delete** to confirm.

In both cases, the request will be deleted. The requester will no longer be able to use the credentials provided by the recipient for all the apps included in that request.

## FAQs

### How long is a credential request link valid?

Links don't expire, but recipients should act within a reasonable timeframe. If they don't respond, you can follow up or send a new request.

### Can I cancel a request in progress?

Yes, delete the request, and the recipient loses access to all apps in it.

### What if the recipient's email address changes?

If an external recipient can't access their email, send a new request with their updated email address. You can delete the old request.

### Can I request credentials from multiple people at once?

You need to send separate requests to each person. You can't bundle multiple recipients in one request.

### Can the recipient see what I do with their credentials?

Recipients can see which modules are included in the request and can revoke access anytime. They can't see the specific data you access with those credentials.

### What if the recipient's credentials expire?

Connections may stop working if authentication expires (e.g., token refresh fails). The requester will see an error and should contact the recipient to re-authorize.

### Can I change my mind and stop sharing credentials?

Yes, revoke access anytime. The requester loses immediate access, but the request stays open. If you want to permanently cut off access, delete the request.

### Is it safe to share credentials?

Yes, your login and other authentication data are never exposed through credential requests. When authorizing a request, you enter your credentials directly in Make to create the connection. This connection can be used to build scenarios, but no one on the requester's side can view, access or retrieve your authentication details (e.g., passwords, API keys, OAuth credentials).

﻿

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

Replace connections across multiple modules](/replace-connections-across-multiple-modules "Replace connections across multiple modules")[NEXT

Dynamic connections](/dynamic-connections "Dynamic connections")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

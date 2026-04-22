# Domain claim - Help Center

Source: https://help.make.com/domain-claim
Lastmod: 2026-04-08T14:40:16.070Z
Description: Claim your domain to prevent unauthorized accounts and ensure all new users are routed through Enterprise SSO.
Your organization

Access management

# Domain claim

8 min

This feature is available to Enterprise customers.

Claiming a domain prevents your members from accidentally creating their own self-service accounts. After you set up single sign-on (SSO), claim your email domain so Make﻿ can recognize your new users. Any new user who signs in with your claimed email domain gets a prompt to use SSO. You can provision your new members by:

* Creating a global provision that assigns all new members to a team you choose.

* ﻿[Using an API endpoint to create new users and assign them to a team.](/domain-claim#create-and-provision-users-for-enterprise-sso)﻿﻿

To claim a domain:

1. ﻿[Add your domain on Make's SSO setup page](/domain-claim#add-your-domain-on-make)﻿.

2. ﻿[Add your verification code to your domain's DNS](/domain-claim#add-your-verification-code-to-your-domains-dns-rec)﻿.

3. ﻿[Verify your domain on Make](/domain-claim#verify-your-domain-on-make)﻿.

Once verified, Make﻿ recognizes login and registration attempts using your email domain and redirects them to your SSO.

## Add your domain on Make

1

Click **Organization** in the left sidebar.

2

Click the **SSO** tab.

3

Click **Domain verification** to expand that section.

4

Click **+Add domain**.

5

In the dialog box, for **Domain**, enter your organization's domain. For example:acme.com, mybusiness.net

6

Click **Add**.

The dialog box displays the verification code you need to add as a TXT record to your domain's DNS.

Your verification code can be found at **Organization > SSO > Domain verification**.

## Add your verification code to your domain's DNS records

Once you have your verification, add it to your domain's DNS records as TXT. The details vary based on your domain host.

The following steps describe the general process. Contact your domain host for detailed help.

1

In a separate browser window or tab, go to your domain host and sign in.

2

Find the DNS records section of your domain host. Possible names are **DNS Management**, **Name Server Management**, **Control Panel**, **Advanced Settings** or similar.

3

Find and select the option to add a new record.

4

Use the following information to add a new record:

| **Possible field name** | **Information to enter** |
| --- | --- |
| **Record type** or **Type** | TXT |
| **Name**, **Host, Hostname, or Alias** | Leave blank or enter @ Check with your domain host's support documentation for more information. |
| **Value, Data, Answer, Destination, or Points to** | Paste your verification code from Make﻿. |

﻿

5

Save your new record.

## Verify your domain on Make

After you add your verification to your DNS, you can complete the process on Make﻿.

1

Click **Organization** in the left sidebar.

2

Click the **SSO** tab.

3

Click **Domain verification** to expand that section.

4

Find your domain on the list.

5

Under **Actions**, click **Verify**.

Your status changes to **Verified** and the domain claim is successfully configured.

## Verification status

| **Status** | **Explanation and steps required** |
| --- | --- |
| Unverified | You have not yet verified your domain. Complete the steps in this article to resolve this status. |
| Verifed | You have successfully claimed your domain. No further action required. |
| Suspended | You have disabled your SSO configuration. Enable SSO and try to verify again. |
| Failed | Possible reasons include:  * The DNS is unavailable: Check with your domain host.  * The DNS record does not exist: Wait and try again. If the problem continues, contact your domain host.  * The DNS record contains an incorrect value: Review the code you entered with your domain host and correct any errors.  * Another organization has verified the domain: Check that you do not have another organization with a domain claim. |

## Provisioning new users

Without a claimed domain, you can use the SSO settings to globally assign users to a team that you specify. This provisioning happens when a new user logs in using your identity provider. Make﻿ gets information such as the email address and user name from your identity provider during login.

After you claim a domain, you can use an API endpoint to create new users and assign them to specific teams.

### Create and provision users for Enterprise SSO

You can create a new user in your organization and assign their SSO external ID by calling the POST /users/user-sso-create endpoint. The addUserToDefaultSsoTeams parameter lets you define whether the new user is automatically added to the default team(s) designated in your SSO configuration. If the new user is not assigned to your default team(s), you can assign the new user to any team in your organization by using the API call POST/users/{userId}/user-team-roles/{teamId}.

POST /users/user-sso-create

Required permission: users sso edit

This endpoint creates a new user in your organization and assigns their SSO external ID in one API call. Use the addUserToDefaultSsoTeams parameter to define whether the new user is automatically added to the team(s) designated as default in your SSO configuration. If the new user is not assigned to your default team(s), you need to [assign new users to your teams](https://developers.make.com/api-documentation/api-reference/users/user-organization-roles/post--users--userid--user-organization-roles--organizationid "assign new users to your teams").

| **Parameter name** | **Data type** | **Required?** | **Description** |
| --- | --- | --- | --- |
| email | string | **Yes** | The user's email. Example: john@doe.com |
| name | string | **Yes** | The name of the user. Example: John Doe |
| countryId | integer | **Yes** | The ID of the user's country. Get the list of country IDs with the API call GET /enums/countries. Example: 1 |
| timezoneId | integer | No | The ID of the user's timezone. Get the list of the timezone IDs with the API call GET /enums/timezones. Example: 113 |
| localeId | integer | No | The ID of the user's locale. Get the list of locale IDs with the API call GET /enums/locales.  Example: 18 |
| ssoId | string | **Yes** | The external ID for SSO. You can associate any parameter in the SSO payload to identify users, such as email or an ID from your Identity provider. Examples: example.employee@example.com  12EXample3456id78string90 |
| organizationId | integer | **Yes** | The ID of your organization. Example: 22 |
| addUserToDefaultSsoTeams | boolean | No | This parameter is deprecated. The SSO configuration in the UI has an option to not assign new users to a team. |

﻿

Example request:

TypeScript

1{
2 "email": "a.example@example.com",
3 "name": "Anne Example",
4 "countryId": 1,
5 "timezoneId": 113,
6 "language": "cs",
7 "localeId": 11,
8 "ssoId": "a1e8af1bd9b4d2c602fb8c687182633c6854b0e7",
9 "organizationId": 54,
10 "addUserToDefaultSsoTeams: false
11}

{
"email": "a.example@example.com",
"name": "Anne Example",
"countryId": 1,
"timezoneId": 113,
"language": "cs",
"localeId": 11,
"ssoId": "a1e8af1bd9b4d2c602fb8c687182633c6854b0e7",
"organizationId": 54,
"addUserToDefaultSsoTeams: false
}
/\*\*
\* Reset the text fill color so that placeholder is visible
\*/
.npm\_\_react-simple-code-editor\_\_textarea:empty {
-webkit-text-fill-color: inherit !important;
}
/\*\*
\* Hack to apply on some CSS on IE10 and IE11
\*/
@media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
/\*\*
\* IE doesn't support '-webkit-text-fill-color'
\* So we use 'color: transparent' to make the text transparent on IE
\* Unlike other browsers, it doesn't affect caret color in IE
\*/
.npm\_\_react-simple-code-editor\_\_textarea {
color: transparent !important;
}
.npm\_\_react-simple-code-editor\_\_textarea::selection {
background-color: #accef7 !important;
color: transparent !important;
}
}

﻿

Example response:

TypeScript

1{
2 "user": {
3 "user\_id": 86,
4 "email": "a.example@example.com",
5 "name": "Anne Example",
6 "country\_id": 1,
7 "language": "cs",
8 "locale\_id": 11,
9 "timezone\_id": 113,
10 "sso\_id": "a1e8af1bd9b4d2c602fb8c687182633c6854b0e7",
11 "organization\_id": 54
12 }
13}

{
"user": {
"user\_id": 86,
"email": "a.example@example.com",
"name": "Anne Example",
"country\_id": 1,
"language": "cs",
"locale\_id": 11,
"timezone\_id": 113,
"sso\_id": "a1e8af1bd9b4d2c602fb8c687182633c6854b0e7",
"organization\_id": 54
}
}
/\*\*
\* Reset the text fill color so that placeholder is visible
\*/
.npm\_\_react-simple-code-editor\_\_textarea:empty {
-webkit-text-fill-color: inherit !important;
}
/\*\*
\* Hack to apply on some CSS on IE10 and IE11
\*/
@media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
/\*\*
\* IE doesn't support '-webkit-text-fill-color'
\* So we use 'color: transparent' to make the text transparent on IE
\* Unlike other browsers, it doesn't affect caret color in IE
\*/
.npm\_\_react-simple-code-editor\_\_textarea {
color: transparent !important;
}
.npm\_\_react-simple-code-editor\_\_textarea::selection {
background-color: #accef7 !important;
color: transparent !important;
}
}

﻿

The response includes user\_id and organization\_id which you can map in a scenario to provision your users.

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

SAML certificate management](/saml-certificate-management "SAML certificate management")[NEXT

Make Managed Services (MMS)](/make-managed-services-mms "Make Managed Services (MMS)")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

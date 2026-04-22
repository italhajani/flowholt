# Okta Workforce Identity SAML setup | n8n Docs

Source: https://docs.n8n.io/user-management/saml/okta
Lastmod: 2026-04-14
Description: Use Okta Workforce Identity with n8n.
# Okta Workforce Identity SAML setup[#](#okta-workforce-identity-saml-setup "Permanent link")

Set up SAML SSO in n8n with Okta.

Workforce Identity and Customer Identity

This guide covers setting up Workforce Identity. This is the original Okta product. Customer Identity is Okta's name for Auth0, which they've acquired.

## Prerequisites[#](#prerequisites "Permanent link")

You need an Okta Workforce Identity account, and the redirect URL and entity ID from n8n's SAML settings.

Okta Workforce may enforce two factor authentication for users, depending on your Okta configuration.

Read the [Set up SAML](../setup/) guide first.

## Setup[#](#setup "Permanent link")

In addition to the following instructions, [this PDF](../n8n-saml-with-okta.pdf) provides visual step-by-step guide on how to setup SAML in n8n with Okta.

1. In your Okta admin panel, select **Applications** > **Applications**.
2. Select **Create App Integration**. Okta opens the app creation modal.
3. Select **SAML 2.0**, then select **Next**.
4. On the **General Settings** tab, enter `n8n` as the **App name**.
5. Select **Next** .
6. On the **Configure SAML** tab, complete the following **General** fields:
   * **Single sign-on URL**: the **Redirect URL** from n8n.
   * **Audience URI (SP Entity ID)**: the **Entity ID** from n8n.
   * **Default RelayState**: leave this empty.
   * **Name ID format**: `EmailAddress`.
   * **Application username**: `Okta username`.
   * **Update application username on**: `Create and update`.
7. Create **Attribute Statements**:

   | **Name** | **Name format** | **Value** |
   | --- | --- | --- |
   | `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/firstname` | URI Reference | user.firstName |
   | `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/lastname` | URI Reference | user.lastName |
   | `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn` | URI Reference | user.login |
   | `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress` | URI Reference | user.email |
8. Select **Next**. Okta may prompt you to complete a marketing form, or may take you directly to your new n8n Okta app.
9. Assign the n8n app to people:
   1. On the n8n app dashboard in Okta, select **Assignments**.
   2. Select **Assign** > **Assign to People**. Okta displays a modal with a list of available people.
   3. Select **Assign** next to the person you want to add. Okta displays a prompt to confirm the username.
   4. Leave the username as email address. Select **Save and Go Back**.
   5. Select **Done**.
10. Get the metadata XML: on the **Sign On** tab, copy the Metadata URL. Navigate to it, and copy the XML. Paste this into **Identity Provider Settings** in n8n.
11. Select **Save settings**.
12. Select **Test settings**. n8n opens a new tab. If you're not currently logged in, Okta prompts you to sign in. n8n then displays a success message confirming the attributes returned by Okta.

### Instance and project access provisioning[#](#instance-and-project-access-provisioning "Permanent link")

See the [Set up SAML page](../setup/#instance-and-project-access-provisioning) for additional information of this feature.

**Adding the required attributes**

1. In your Okta admin panel, select **Applications** > **Applications**.
2. Go to the configuration of your n8n application
3. On the **General** tab, click **Edit** next to **SAML Settings**
4. In the page that opens, continue to step 2: **Configure SAML**
5. Add the following two **Attribute Statements**:

   | **Name** | **Name format** | **Value** |
   | --- | --- | --- |
   | n8n\_instance\_role | Basic | appuser.n8n\_instance\_role |
   | n8n\_projects | Basic | appuser.n8n\_projects |
6. Click **Next**
7. Click **Finish**

**Updating the app profile**

1. In your Okta admin panel, select **Directory** > **Profile Editor**.
2. Go to the profile of your n8n application
3. Click **Add Attribute**
4. Add the **n8n\_instance\_role** attribute
   * **Data type**: string
   * **Display name**: n8n\_instance\_role
   * **Variable name**: n8n\_instance\_role
   * **Attribute type**: Group
5. Add the **n8n\_projects** attribute
   * **Data type**: string array
   * **Display name**: n8n\_projects
   * **Variable name**: n8n\_projects
   * **Attribute type**: Group
   * **Group priority**: Combine values across groups

Now when you go to **Directory** > **Groups** and edit the assigned n8n application, you can configure the **n8n\_instance\_role** and **n8n\_projects** to be sent to n8n upon logging in via SAML.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

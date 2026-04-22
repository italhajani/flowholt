---
title: "Steps in Azure portal | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/install-and-configure-apps/microsoft/steps-in-azure-portal
scraped_at: 2026-04-21T12:45:38.355140Z
---

1. Install and configure apps chevron-right
2. Microsoft

# Steps in Azure portal

To create your OAuth connection for Microsoft, complete these steps in the Azure portal:

1. Register your web application.
2. Create a client secret.
3. Grant the required permissions.

Register your web application.

Create a client secret.

Grant the required permissions.

### hashtag Register your web application.

When you create and register a web application in the Azure portal, Azure automatically creates your Client ID. This procedure only creates the web application. You still need to create your client secret and grant any required permissions.

1. Log in to your Azure portal arrow-up-right account.
2. Under Manage Azure Active Directory , click View .
3. In the left sidebar, click App registrations , and then click New registration .
4. Enter a name for your application.
5. Under Redirect URI , click Web and enter the redirect URL from your Make instance.
6. Click Register .
7. Save your Application (client) ID in a safe place. You need to enter in the connection configuration on your Make instance.

Log in to your Azure portal arrow-up-right account.

Under Manage Azure Active Directory , click View .

In the left sidebar, click App registrations , and then click New registration .

Enter a name for your application.

Under Redirect URI , click Web and enter the redirect URL from your Make instance.

Click Register .

Save your Application (client) ID in a safe place. You need to enter in the connection configuration on your Make instance.

### hashtag Create a client secret

After registering your app, you can create a client secret in the Azure portal. Keep your client credentials in a safe place. If you lose your client secret, you can use this procedure to create a new one.

1. In the Azure AD B2C - App registrations page, click the application you created in the above procedure.
2. In the left sidebar, under Manage , click Certificates & secrets .
3. Click New client secret .
4. In the Description box, enter a description for the client secret.
5. Under Expires , select a duration for which the secret is valid, then click Add .
6. Your client secret appears in the Value field. Save your client secret in a safe place. You need to enter this client secret in the connection configuration on your Make instance. You cannot retrieve this client secret once you leave this page.

In the Azure AD B2C - App registrations page, click the application you created in the above procedure.

In the left sidebar, under Manage , click Certificates & secrets .

Click New client secret .

In the Description box, enter a description for the client secret.

Under Expires , select a duration for which the secret is valid, then click Add .

Your client secret appears in the Value field. Save your client secret in a safe place. You need to enter this client secret in the connection configuration on your Make instance. You cannot retrieve this client secret once you leave this page.

### hashtag Grant permissions

After registering a web application and getting your OAuth credentials, you need to grant the permissions required by Make apps. Refer to Connections and permission reference to find the required permissions .

1. Click App registrations .
2. Select the app you created in the above procedure and open its Overview page.
3. Under Manage , click API permissions .
4. Click + Add a permission .
5. Select a Microsoft API based on the information in the chart here .
6. Click Delegated permissions and use the search bar to find and select the permissions required by the app you are configuring.
7. Click Add permissions . The selected permissions now appear under Configured permissions .
8. Click Grant admin consent for {your Azure AD tenant name} .
9. A pop up prompts you to confirm. Click Yes .

Click App registrations .

Select the app you created in the above procedure and open its Overview page.

Under Manage , click API permissions .

Click + Add a permission .

Select a Microsoft API based on the information in the chart here .

Click Delegated permissions and use the search bar to find and select the permissions required by the app you are configuring.

Click Add permissions . The selected permissions now appear under Configured permissions .

Click Grant admin consent for {your Azure AD tenant name} .

A pop up prompts you to confirm. Click Yes .

You can verify success by checking the Status column. A green checkmark appears with the text Granted for {your Azure AD tenant name} .

Last updated 1 year ago

---
title: "Steps on the Meta for Developers portal | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/install-and-configure-apps/facebook-and-other-meta-apps/steps-on-the-meta-for-developers-portal
scraped_at: 2026-04-21T12:45:38.280684Z
---

1. Install and configure apps chevron-right
2. Facebook and other Meta apps

# Steps on the Meta for Developers portal

To create OAuth 2.0 credentials for Facebook and other Meta apps, follow these general steps:

1. Create an app on the Meta for Developers portal.
2. Add products to get the permissions required by Make's Facebook apps.
3. Find your OAuth credentials.
4. Test your OAuth connections and add required permissions.

Create an app on the Meta for Developers portal.

Add products to get the permissions required by Make's Facebook apps.

Find your OAuth credentials.

Test your OAuth connections and add required permissions.

### hashtag Creating an App on the Meta for Developers Portal

Follow the instructions provided by Meta for how to create an app arrow-up-right . Use the following information to complete the procedure as documented by Meta:

1. Choose an app type: Select Business .
2. Choose a use case: Select Other .

Choose an app type: Select Business .

Choose a use case: Select Other .

### hashtag Adding products

To access the required permissions, you add what Facebook calls products. Each product represents a unique set of API access. Facebook Login for Business enables access for most Make apps modules. Refer to the chart below for more details.

#### hashtag Facebook Login for Business

The default settings are compatible with your Make White Label instance and require no adjustments. However, you need to enter your OAuth redirect URI in the settings for Facebook login for business.

1. In the Meta for developers portal, go to the App dashboard arrow-up-right for your app.
2. In the left sidebar, click Add product .
3. Find Facebook login for business .
4. Under Client OAuth settings , enter your OAuth redirect URI in the field Valid OAuth Redirect URIs .
5. Click Save changes .

In the Meta for developers portal, go to the App dashboard arrow-up-right for your app.

In the left sidebar, click Add product .

Find Facebook login for business .

Under Client OAuth settings , enter your OAuth redirect URI in the field Valid OAuth Redirect URIs .

Click Save changes .

Refer to the table below and add any additional products required by Make's apps.

### hashtag Finding your Client ID and secret

Adding Facebook login for business lets you begin using Facebook's API. You can now find your OAuth credentials and enter them in your instance.

1. In the Meta for developers portal, go to the App dashboard .
2. Click Settings .
3. Click Basic .
4. Find the App ID and copy paste it into the Client ID field on your Make instance at Administration > Native apps > {Facebook app} > Connection: Facebook .
5. Find the App secret and click Show .
6. Copy paste the App secret into the Client secret field on your Make instance at Administration > Native apps > {Facebook app} > Connection: Facebook.
7. Click Save on your Make Native apps connection page.

In the Meta for developers portal, go to the App dashboard .

Click Settings .

Click Basic .

Find the App ID and copy paste it into the Client ID field on your Make instance at Administration > Native apps > {Facebook app} > Connection: Facebook .

Find the App secret and click Show .

Copy paste the App secret into the Client secret field on your Make instance at Administration > Native apps > {Facebook app} > Connection: Facebook.

Click Save on your Make Native apps connection page.

You can now test Facebook apps in scenarios. Without completing Meta's app review arrow-up-right and business verification arrow-up-right you have limited API access to Facebook. As a result, some modules may encounter errors. The Testing and adding permissions section has information on gaining further Facebook API access.

### hashtag Testing and adding permissions

You can request access to specific permissions by going to Meta for developers > App Dashboard > App Review > Permissions and Reviews . The Permissions and Reviews page lists permission and includes unsuccessful attempts from modules on your Make instance. Use this page to request access to specific permissions and find information about any further requirements.

Last updated 1 year ago

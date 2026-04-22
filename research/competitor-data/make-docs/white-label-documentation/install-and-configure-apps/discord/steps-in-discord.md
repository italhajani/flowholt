---
title: "Steps in Discord | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/install-and-configure-apps/discord/steps-in-discord
scraped_at: 2026-04-21T12:45:40.682269Z
---

1. Install and configure apps chevron-right
2. Discord

# Steps in Discord

To connect to Discord, you need to create a developer account to obtain the bot token, client ID, and client secret values by creating a custom application from your Discord developer account.

1. Log in to the Discord developer account arrow-up-right .
2. Click Create New Application , enter a name for the application, and click Create .
3. On the left menu, click OAuth2 , add the redirect URI for your instance, and click Save Changes .
4. In the Client Information section, copy the CLIENT ID value to a safe place. In the CLIENT SECRET field, click Reset secret , accept the warning, and copy the secret value to a safe place.
5. On the left menu, click Bot > Add bot .
6. Optional: Change the default name of the bot.
7. Optional: Enable the Privileged Gateway Intent settings if you want to receive full message content from all the modules.
8. Click Reset to generate the bot token, accept the alert, and copy the bot token to a safe place as you can see the token only once.

Log in to the Discord developer account arrow-up-right .

Click Create New Application , enter a name for the application, and click Create .

On the left menu, click OAuth2 , add the redirect URI for your instance, and click Save Changes .

In the Client Information section, copy the CLIENT ID value to a safe place. In the CLIENT SECRET field, click Reset secret , accept the warning, and copy the secret value to a safe place.

On the left menu, click Bot > Add bot .

Optional: Change the default name of the bot.

Optional: Enable the Privileged Gateway Intent settings if you want to receive full message content from all the modules.

Click Reset to generate the bot token, accept the alert, and copy the bot token to a safe place as you can see the token only once.

Every time you reset the token, the existing connections will stop working. You need to reauthenticate the connection with this new token.

You now have the OAuth credentials and can enter them in your instance.

Last updated 1 year ago

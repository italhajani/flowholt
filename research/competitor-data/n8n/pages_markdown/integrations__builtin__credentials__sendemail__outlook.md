# Outlook.com | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/credentials/sendemail/outlook
Lastmod: 2026-04-14
Description: Documentation for Outlook.com Send Email credentials. Use these credentials to authenticate Send Email with Outlook.com in n8n, a workflow automation platform.
# Outlook.com Send Email credentials[#](#outlookcom-send-email-credentials "Permanent link")

Microsoft has removed Basic Auth and App Passwords for Outlook.com SMTP

Microsoft deprecated Basic Authentication and app passwords for SMTP in Exchange Online and Outlook.com. As a result, the Send Email node **cannot connect to Outlook.com or Microsoft 365 accounts** using username/password or app password authentication.

**To send email from your Outlook.com or Microsoft 365 account, use the [Microsoft Outlook node](../../../app-nodes/n8n-nodes-base.microsoftoutlook/), which uses OAuth 2.0 as required by Microsoft.**

Refer to [Microsoft's deprecation notice](https://learn.microsoft.com/en-us/exchange/clients-and-mobile-in-exchange-online/deprecation-of-basic-authentication-exchange-online#what-we-are-changing) for more information.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

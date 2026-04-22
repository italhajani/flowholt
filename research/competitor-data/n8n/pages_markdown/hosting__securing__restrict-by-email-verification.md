# Restrict account registration to email-verified users | n8n Docs

Source: https://docs.n8n.io/hosting/securing/restrict-by-email-verification
Lastmod: 2026-04-14
Description: Require all new accounts to be verified by email.
# Restrict account registration to email-verified users[#](#restrict-account-registration-to-email-verified-users "Permanent link")

You can require all new accounts to be verified by email. This prevents malicious admins from registering accounts without email verification.

## Prerequisites[#](#prerequisites "Permanent link")

* SMTP must be set up and n8n must be able to send emails.

## How to restrict account registration[#](#how-to-restrict-account-registration "Permanent link")

Set the environment variable `N8N_INVITE_LINKS_EMAIL_ONLY` to `true`. This locks down your instance so that only users with verified email addresses can register.

For more details on configuring SMTP, see [Set up SMTP](../../configuration/user-management-self-hosted/#step-one-smtp).

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

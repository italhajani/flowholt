# Gmail | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/credentials/imap/gmail
Lastmod: 2026-04-14
Description: Documentation for Gmail IMAP credentials. Use these credentials to authenticate Gmail IMAP in n8n, a workflow automation platform.
# Gmail IMAP credentials[#](#gmail-imap-credentials "Permanent link")

Follow these steps to configure the IMAP credentials with a Gmail account.

## Prerequisites[#](#prerequisites "Permanent link")

To follow these instructions, you must first:

1. [Enable 2-step Verification](#enable-2-step-verification) on your Gmail account.
2. [Generate an app password](#generate-an-app-password).

### Enable 2-step Verification[#](#enable-2-step-verification "Permanent link")

To enable 2-step Verification:

1. Log in to your [Google Account](https://myaccount.google.com/).
2. Select **Security** from the left navigation.
3. Under **How you sign in to Google**, select **2-Step Verification**.
   * If 2-Step Verification is already enabled, skip to the next section.
4. Select **Get started**.
5. Follow the on-screen steps to configure 2-Step Verification.

Refer to [Turn on 2-step Verification](https://support.google.com/accounts/answer/185839) for more information.

If you can't turn on 2-step Verification, check with your email administrator.

### Generate an app password[#](#generate-an-app-password "Permanent link")

To generate an app password:

1. In your Google account, go to [App passwords](https://myaccount.google.com/apppasswords).
2. Enter an **App name** for your new app password, like `n8n credential`.
3. Select **Create**.
4. Copy the generated app password. You'll use this in your n8n credential.

Refer to Google's [Sign in with app passwords documentation](https://support.google.com/accounts/answer/185833?hl=en) for more information.

## Set up the credential[#](#set-up-the-credential "Permanent link")

To set up the IMAP credential with a Gmail account, use these settings:

1. Enter your Gmail email address as the **User**.
2. Enter the app password you generated above as the **Password**.
3. Enter `imap.gmail.com` as the **Host**.
4. For the **Port**, keep the default port number of `993`. Check with your email administrator if this port doesn't work.
5. Turn on the **SSL/TLS** toggle.
6. Check with your email administrator about whether to **Allow Self-Signed Certificates**.

Refer to [Add Gmail to another client](https://support.google.com/mail/answer/7126229?hl=en) for more information. You may need to **Enable IMAP** if you're using a personal Google account before June 2024.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

# Securing n8n | n8n Docs

Source: https://docs.n8n.io/hosting/securing/overview
Lastmod: 2026-04-14
Description: Documentation for n8n, a workflow automation platform.
# Securing n8n[#](#securing-n8n "Permanent link")

Securing your n8n instance can take several forms.

At a high level, you can:

* Conduct a [security audit](../security-audit/) to identify security risks.
* [Set up SSL](../set-up-ssl/) to enforce secure connections.
* [Set up Single Sign-On](../set-up-sso/) for user account management.
* Use [two-factor authentication (2FA)](../../../user-management/two-factor-auth/) for your users.

You can also protect sensitive data processed by your workflows:

* [Redact execution data](../../../workflows/executions/execution-data-redaction/) to hide input and output data from workflow executions.

More granularly, consider blocking or opting out of features or data collection you don't want:

* [Disable the public API](../disable-public-api/) if you aren't using it.
* [Opt out of data collection](../telemetry-opt-out/) of the anonymous data n8n collects automatically.
* [Block certain nodes](../blocking-nodes/) from being available to your users.
* [Protect against SSRF attacks](../ssrf-protection/) to control which hosts and IP ranges workflow nodes can connect to.
* [Restrict account registration](../restrict-by-email-verification/) to email-verified users.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

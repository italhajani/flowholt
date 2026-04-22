# Timezone and localization environment variables | n8n Docs

Source: https://docs.n8n.io/hosting/configuration/environment-variables/timezone-localization
Lastmod: 2026-04-14
Description: Set the timezone and default language locale for self-hosted n8n instance.
environment variables

# Timezone and localization environment variables[#](#timezone-and-localization-environment-variables "Permanent link")

File-based configuration

You can add `_FILE` to individual variables to provide their configuration in a separate file. Refer to [Keeping sensitive data in separate files](../../configuration-methods/#keeping-sensitive-data-in-separate-files) for more details.

| Variable | Type | Default | Description |
| --- | --- | --- | --- |
| `GENERIC_TIMEZONE` | \* | `America/New_York` | The n8n instance timezone. Important for schedule nodes (such as Cron). |
| `N8N_DEFAULT_LOCALE` | String | `en` | A locale identifier, compatible with the [Accept-Language header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Language). n8n doesn't support regional identifiers, such as `de-AT`. When running in a locale other than the default, n8n displays UI strings in the selected locale, and falls back to `en` for any untranslated strings. |

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

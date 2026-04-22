# External secrets environment variables | n8n Docs

Source: https://docs.n8n.io/hosting/configuration/environment-variables/external-secrets
Lastmod: 2026-04-14
Description: Configure the interval for checking updates to external secrets in self-hosted n8n instance.
environment variables

# External secrets environment variables[#](#external-secrets-environment-variables "Permanent link")

File-based configuration

You can add `_FILE` to individual variables to provide their configuration in a separate file. Refer to [Keeping sensitive data in separate files](../../configuration-methods/#keeping-sensitive-data-in-separate-files) for more details.

You can use an external secrets store to manage credentials for n8n. Refer to [External secrets](../../../../external-secrets/) for details.

| Variable | Type | Default | Description |
| --- | --- | --- | --- |
| `N8N_EXTERNAL_SECRETS_UPDATE_INTERVAL` | Number | `300` (5 minutes) | How often (in seconds) to check for secret updates. |

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

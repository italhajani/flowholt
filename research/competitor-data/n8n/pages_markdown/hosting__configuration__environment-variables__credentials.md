# Credentials environment variables | n8n Docs

Source: https://docs.n8n.io/hosting/configuration/environment-variables/credentials
Lastmod: 2026-04-14
Description: Manage default credentials and override them through environment variables your self-hosted n8n instance.
environment variables

# Credentials environment variables[#](#credentials-environment-variables "Permanent link")

File-based configuration

You can add `_FILE` to individual variables to provide their configuration in a separate file. Refer to [Keeping sensitive data in separate files](../../configuration-methods/#keeping-sensitive-data-in-separate-files) for more details.

Enable credential overwrites using the following environment variables. Refer to [Credential overwrites](../../credential-overwrites/) for details.

| Variable | Type | Default | Description |
| --- | --- | --- | --- |
| `CREDENTIALS_OVERWRITE_DATA` /`_FILE` | \* | - | Overwrites for credentials. |
| `CREDENTIALS_OVERWRITE_ENDPOINT` | String | - | The API endpoint to fetch credentials. |
| `CREDENTIALS_OVERWRITE_PERSISTENCE` | Boolean | `false` | Enable database persistence for credential overwrites. Required for multi-instance or queue mode to propagate overwrites to workers through a publish/subscribe approach. |
| `CREDENTIALS_DEFAULT_NAME` | String | `My credentials` | The default name for credentials. |

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

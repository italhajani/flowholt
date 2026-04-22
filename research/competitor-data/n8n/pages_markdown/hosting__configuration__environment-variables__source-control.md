# Source control environment variables | n8n Docs

Source: https://docs.n8n.io/hosting/configuration/environment-variables/source-control
Lastmod: 2026-04-14
Description: Environment variable to set the default SSH key type for source control setup.
environment variables

# Source control environment variables[#](#source-control-environment-variables "Permanent link")

File-based configuration

You can add `_FILE` to individual variables to provide their configuration in a separate file. Refer to [Keeping sensitive data in separate files](../../configuration-methods/#keeping-sensitive-data-in-separate-files) for more details.

n8n uses Git-based source control to support environments. Refer to [Source control and environments](../../../../source-control-environments/setup/) for more information on how to link a Git repository to an n8n instance and configure your source control.

| Variable | Type | Default | Description |
| --- | --- | --- | --- |
| `N8N_SOURCECONTROL_DEFAULT_SSH_KEY_TYPE` | String | `ed25519` | Set to `rsa` to make RSA the default SSH key type for [Source control setup](../../../../source-control-environments/setup/). |

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

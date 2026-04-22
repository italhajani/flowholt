# External hooks environment variables | n8n Docs

Source: https://docs.n8n.io/hosting/configuration/environment-variables/external-hooks
Lastmod: 2026-04-14
Description: Environment variables to integrate external hooks into your self-hosted n8n instance.
environment variables

# External hooks environment variables[#](#external-hooks-environment-variables "Permanent link")

File-based configuration

You can add `_FILE` to individual variables to provide their configuration in a separate file. Refer to [Keeping sensitive data in separate files](../../configuration-methods/#keeping-sensitive-data-in-separate-files) for more details.

You can define external hooks that n8n executes whenever a specific operation runs. Refer to [External hooks](../../external-hooks/) for the full reference, including available hooks and file formatting.

| Variable | Type | Default | Description |
| --- | --- | --- | --- |
| `EXTERNAL_HOOK_FILES` | String | - | Files containing backend external hooks. Provide multiple files separated by the character defined in `EXTERNAL_HOOK_FILES_SEPARATOR`. |
| `EXTERNAL_HOOK_FILES_SEPARATOR` | String | `:` | Separator character for `EXTERNAL_HOOK_FILES`. Use `;` on Windows to avoid conflicts with drive-letter paths like `C:\`. |
| `EXTERNAL_FRONTEND_HOOKS_URLS` | String | - | URLs to files containing frontend external hooks. Provide multiple URLs as a colon-separated list ("`:`"). |

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

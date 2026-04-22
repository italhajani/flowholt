# SSRF protection environment variables | n8n Docs

Source: https://docs.n8n.io/hosting/configuration/environment-variables/ssrf-protection
Lastmod: 2026-04-14
Description: Configure SSRF protection for your self-hosted n8n instance.
environment variables

# SSRF protection environment variables[#](#ssrf-protection-environment-variables "Permanent link")

File-based configuration

You can add `_FILE` to individual variables to provide their configuration in a separate file. Refer to [Keeping sensitive data in separate files](../../configuration-methods/#keeping-sensitive-data-in-separate-files) for more details.

These variables control [SSRF protection](../../../securing/ssrf-protection/) for nodes that make HTTP requests to user-controllable targets.

| Variable | Type | Default | Description |
| --- | --- | --- | --- |
| `N8N_SSRF_PROTECTION_ENABLED` | Boolean | `false` | Whether to enable SSRF protection for nodes making HTTP requests. |
| `N8N_SSRF_BLOCKED_IP_RANGES` | String | Standard private/reserved ranges | Comma-separated CIDR ranges to block. Use `default` to include the [standard blocked ranges](../../../securing/ssrf-protection/#default-blocked-ranges), optionally combined with custom ranges (for example: `default,100.0.0.0/8`). |
| `N8N_SSRF_ALLOWED_IP_RANGES` | String | - | Comma-separated CIDR ranges to allow. Takes precedence over the blocked ranges. |
| `N8N_SSRF_ALLOWED_HOSTNAMES` | String | - | Comma-separated hostname patterns to allow. Supports wildcards (for example: `*.n8n.internal`). Takes precedence over blocked IP ranges. |
| `N8N_SSRF_DNS_CACHE_MAX_SIZE` | Number | `1048576` | Maximum DNS cache size in bytes. Uses LRU eviction when the limit is reached. Default is 1 MB. |

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

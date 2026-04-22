# External data storage environment variables | n8n Docs

Source: https://docs.n8n.io/hosting/configuration/environment-variables/external-data-storage
Lastmod: 2026-04-14
Description: Environment variables to configure external data storage for your self-hosted n8n instance.
environment variables
external storage
storage

# External data storage environment variables[#](#external-data-storage-environment-variables "Permanent link")

File-based configuration

You can add `_FILE` to individual variables to provide their configuration in a separate file. Refer to [Keeping sensitive data in separate files](../../configuration-methods/#keeping-sensitive-data-in-separate-files) for more details.

Refer to [External storage](../../../scaling/external-storage/) for more information on using external storage for binary data.

| Variable | Type | Default | Description |
| --- | --- | --- | --- |
| `N8N_EXTERNAL_STORAGE_S3_HOST` | String | - | Host of the n8n bucket in S3-compatible external storage. For example, `s3.us-east-1.amazonaws.com` |
| `N8N_EXTERNAL_STORAGE_S3_BUCKET_NAME` | String | - | Name of the n8n bucket in S3-compatible external storage. |
| `N8N_EXTERNAL_STORAGE_S3_BUCKET_REGION` | String | - | Region of the n8n bucket in S3-compatible external storage. For example, `us-east-1` |
| `N8N_EXTERNAL_STORAGE_S3_ACCESS_KEY` | String | - | Access key in S3-compatible external storage |
| `N8N_EXTERNAL_STORAGE_S3_ACCESS_SECRET` | String | - | Access secret in S3-compatible external storage. |
| `N8N_EXTERNAL_STORAGE_S3_AUTH_AUTO_DETECT` | Boolean | - | Use automatic credential detection to authenticate S3 calls for external storage. This will ignore the access key and access secret and use the default [credential provider chain](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html#credchain). |

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

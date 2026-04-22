# Snowflake credentials | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/credentials/snowflake
Lastmod: 2026-04-14
Description: Documentation for Snowflake credentials. Use these credentials to authenticate Snowflake in n8n, a workflow automation platform.
# Snowflake credentials[#](#snowflake-credentials "Permanent link")

You can use these credentials to authenticate the following nodes:

* [Snowflake](../../app-nodes/n8n-nodes-base.snowflake/)

## Prerequisites[#](#prerequisites "Permanent link")

Create a [Snowflake](https://www.snowflake.com/en/) account.

## Supported authentication methods[#](#supported-authentication-methods "Permanent link")

* [Password](#using-password-authentication)
* [Key-pair](#using-key-pair-authentication)

## Related resources[#](#related-resources "Permanent link")

Refer to [Snowflake's API documentation](https://docs.snowflake.com/en/api-reference) and [SQL Command Reference](https://docs.snowflake.com/en/sql-reference-commands) for more information about the service.

## Common configuration fields[#](#common-configuration-fields "Permanent link")

Both authentication methods require the following fields:

* An **Account** name: Your account name is the string of characters located between `https://` and `snowflakecomputing.com` in your Snowflake URL. For example, if the URL of your Snowflake account is `https://abc.eu-central-1.snowflakecomputing.com` then the name of your account is `abc.eu-central-1`.
* A **Database**: Enter the name of the [database](https://docs.snowflake.com/en/sql-reference/sql/use-database) the credential should connect to.
* A **Warehouse**: Enter the name of the default virtual [warehouse](https://docs.snowflake.com/en/sql-reference/sql/use-warehouse) to use for the session after connecting. n8n uses this warehouse for performing queries, loading data, and so on.
* A **Schema**: Enter the [schema](https://docs.snowflake.com/en/sql-reference/sql/use-schema) you want to use after connecting.
* A **Role**: Enter the security [role](https://docs.snowflake.com/en/sql-reference/sql/use-role) you want to use after connecting.
* **Client Session Keep Alive**: By default, client connections typically time out three or four hours after the most recent query execution. Turning this setting on sets the `clientSessionKeepAlive` parameter to true: the server will keep the client's connection alive indefinitely, even if the connection doesn't execute any queries.

Refer to [Session Commands](https://docs.snowflake.com/en/sql-reference/commands-session) for more information on these settings.

## Using password authentication[#](#using-password-authentication "Permanent link")

In addition to the [common configuration fields](#common-configuration-fields), password authentication requires:

* A **Username**
* A **Password**

## Using key-pair authentication[#](#using-key-pair-authentication "Permanent link")

Key-pair authentication provides enhanced security as an alternative to password-based authentication. This method uses a public-private key pair for authentication.

In addition to the [common configuration fields](#common-configuration-fields), key-pair authentication requires:

* A **Username**: The Snowflake user that has the public key assigned to it.
* A **Private Key**: The private key in PEM format (PKCS#8). This should be the full content of your private key file, including the `-----BEGIN ENCRYPTED PRIVATE KEY-----` and `-----END ENCRYPTED PRIVATE KEY-----` delimiters (or `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` for unencrypted keys).
* A **Passphrase** (optional): If your private key is encrypted, enter the passphrase used to encrypt it. Leave this field empty if you're using an unencrypted private key.

Refer to [Snowflake's key-pair authentication documentation](https://docs.snowflake.com/en/user-guide/key-pair-auth) for more information about generating and configuring key pairs.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

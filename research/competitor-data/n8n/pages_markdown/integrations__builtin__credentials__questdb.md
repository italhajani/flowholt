# QuestDB credentials | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/credentials/questdb
Lastmod: 2026-04-14
Description: Documentation for QuestDB credentials. Use these credentials to authenticate QuestDB in n8n, a workflow automation platform.
# QuestDB credentials[#](#questdb-credentials "Permanent link")

You can use these credentials to authenticate the following nodes:

* [QuestDB](../../app-nodes/n8n-nodes-base.questdb/)

## Prerequisites[#](#prerequisites "Permanent link")

Create a user account on an instance of [QuestDB](https://questdb.io/).

## Supported authentication methods[#](#supported-authentication-methods "Permanent link")

* Database connection

## Related resources[#](#related-resources "Permanent link")

Refer to [QuestDB's documentation](https://questdb.io/docs) for more information about the service.

## Using database connection[#](#using-database-connection "Permanent link")

To configure this credential, you'll need:

* The **Host**: Enter the host name or IP address for the server.
* The **Database**: Enter the database name, for example `qdb`.
* A **User**: Enter the username for the user account as configured in `pg.user` or `pg.readonly.user` property in `server.conf`. Default value is `admin`.
* A **Password**: Enter the password for the user account as configured in `pg.password` or `pg.readonly.password` property in `server.conf`. Default value is `quest`.
* **SSL**: Select whether the connection should use SSL, which sets the `sslmode` parameter. Options include:
  + **Allow**
  + **Disable**
  + **Require**
* The **Port**: Enter the port number to use for the connection. Default is `8812`.

Refer to [List of supported connection properties](https://questdb.io/docs/reference/api/postgres/#list-of-supported-connection-properties) for more information.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

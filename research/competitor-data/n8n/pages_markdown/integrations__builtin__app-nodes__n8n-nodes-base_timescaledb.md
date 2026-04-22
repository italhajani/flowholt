# TimescaleDB node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.timescaledb
Lastmod: 2026-04-14
Description: Learn how to use the TimescaleDB node in n8n. Follow technical documentation to integrate TimescaleDB node into your workflows.
# TimescaleDB node[#](#timescaledb-node "Permanent link")

Use the TimescaleDB node to automate work in TimescaleDB, and integrate TimescaleDB with other applications. n8n has built-in support for a wide range of TimescaleDB features, including executing an SQL query, as well as inserting and updating rows in a database.

On this page, you'll find a list of operations the TimescaleDB node supports and links to more resources.

Credentials

Refer to [TimescaleDB credentials](../../credentials/timescaledb/) for guidance on setting up authentication.

## Operations[#](#operations "Permanent link")

* Execute an SQL query
* Insert rows in database
* Update rows in database

## Templates and examples[#](#templates-and-examples "Permanent link")

[Browse TimescaleDB integration templates](https://n8n.io/integrations/timescaledb/), or [search all templates](https://n8n.io/workflows/)

## Specify a column's data type[#](#specify-a-columns-data-type "Permanent link")

To specify a column's data type, append the column name with `:type`, where `type` is the data type you want for the column. For example, if you want to specify the type `int` for the column **id** and type `text` for the column **name**, you can use the following snippet in the **Columns** field: `id:int,name:text`.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

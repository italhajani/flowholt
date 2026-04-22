# QuestDB node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.questdb
Lastmod: 2026-04-14
Description: Learn how to use the QuestDB node in n8n. Follow technical documentation to integrate QuestDB node into your workflows.
# QuestDB node[#](#questdb-node "Permanent link")

Use the QuestDB node to automate work in QuestDB, and integrate QuestDB with other applications. n8n supports executing an SQL query and inserting rows in a database with QuestDB.

On this page, you'll find a list of operations the QuestDB node supports and links to more resources.

Credentials

Refer to [QuestDB credentials](../../credentials/questdb/) for guidance on setting up authentication.

## Operations[#](#operations "Permanent link")

* Executes a SQL query.
* Insert rows in database.

## Templates and examples[#](#templates-and-examples "Permanent link")

[Browse QuestDB integration templates](https://n8n.io/integrations/questdb/), or [search all templates](https://n8n.io/workflows/)

## Node reference[#](#node-reference "Permanent link")

### Specify a column's data type[#](#specify-a-columns-data-type "Permanent link")

To specify a column's data type, append the column name with `:type`, where `type` is the data type you want for column. For example, if you want to specify the type `int` for the column **id** and type `text` for the column **name**, you can use the following snippet in the **Columns** field: `id:int,name:text`.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

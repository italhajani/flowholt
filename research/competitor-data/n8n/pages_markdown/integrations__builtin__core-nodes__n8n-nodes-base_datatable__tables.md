# Data Table node table operations | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.datatable/tables
Lastmod: 2026-04-14
Description: Reference documentation for Data Table node table operations, including create, delete, list, and update.
# Table operations

Use table operations to create, delete, list and update data tables. Refer to the [Data Table node](../) documentation for more information on the node itself.

## Create a data table[#](#create-a-data-table "Permanent link")

Use this operation to create a new data table.

Enter these parameters:

* **Resource:** Select **Table**.
* **Operation:** Select **Create**.
* **Name:** Enter a name for the data table, or define using an expression.
* **Columns:** Click **Add Column** to define parameters for the columns of the data table. You can add multiple columns. For each one:
  + **Name:** Set a name for the column, or define using an expression.
  + **Type:** Select the data type for the column: **Boolean**, **Date**, **Number**, or **String**.:

### Create a data table options[#](#create-a-data-table-options "Permanent link")

Use these options to further refine the action's behavior:

* **Reuse Existing Tables:** Enable to return an existing table if one exists with the same name, without throwing an error.

## Delete a data table[#](#delete-a-data-table "Permanent link")

Use this operation to permanently delete an existing data table. This action can't be undone.

Enter these parameters:

* **Resource:** Select **Table**.
* **Operation:** Select **Delete**.
* **Data table:** Select how to identify the data table to delete:
  + **From list:** Select the table from a drop-down list of all your data tables.
  + **By Name:** Enter the name of your data table.
  + **By ID:** Enter the ID of your data table

## List data tables[#](#list-data-tables "Permanent link")

Use this operation to list existing data tables. You can return all tables, all tables up to a defined limit, or filter for tables to return.

Enter these parameters:

* **Resource:** Select **Table**.
* **Operation:** Select **List**.
* **Return All:** Enable to return all matching tables. Or, disable and enter a **Limit** for the number of tables to return, for example `50`.

### List data tables options[#](#list-data-tables-options "Permanent link")

Use these options to further refine the action's behavior:

* **Filter by Name:** Enter a value or expression to return data tables whose names contain the specified text. Matching is case-insensitive.
* **Sort Field:** Select a field to sort results on.
* **Sort Direction:** Select whether to sort results in **Ascending** or **Descending** direction.

## Update a data table[#](#update-a-data-table "Permanent link")

Use this operation to update the name of an existing data tables.

Enter these parameters:

* **Resource:** Select **Table**.
* **Operation:** Select **Update**.
* **Data table:** Select how to identify the data table to update:
  + **From list:** Select the table from a drop-down list of all your data tables.
  + **By Name:** Enter the name of your data table.
  + **By ID:** Enter the ID of your data table
* **New name:** Enter a value or expression to set a new name for the data table.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

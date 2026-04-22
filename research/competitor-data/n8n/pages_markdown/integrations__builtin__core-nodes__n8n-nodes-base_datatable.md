# Data table | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.datatable
Lastmod: 2026-04-14
Description: Documentation for the data table node in n8n, a workflow automation platform. Includes guidance on usage, and links to examples.
data
data table node

# Data table[#](#data-table "Permanent link")

Use the Data Table node to create and manage internal data tables. Data tables allow you to store structured data directly inside n8n and use it across workflows.

You can use the Data Table node to:

* Create, list, and manage data tables
* Insert, update, delete, and upsert rows in data tables
* Query and retrieve rows using matching conditions

Working with data tables

As well as using the Data Tables node in a workflow, you can view and manage data tables manually from the **Data Tables** tab in your project **Overview**.

For information about working with data tables in this tab, and guidance on when to use data tables and their limitations, see [Data tables](../../../../data/data-tables/).

## Resources[#](#resources "Permanent link")

The Data Table node supports the following resources:

* **Data Table:** Create, list, update, and delete tables.
* **Row:** Insert, retrieve, update, delete, and upsert rows within a table.

### Operations[#](#operations "Permanent link")

See available operations below. For detailed information on parameters for different operation types, refer to the [Table operations](tables/) and [Row operations](rows/) pages.

* **Rows**

  + [**Delete:**](rows/#delete-row) Delete one or more rows.
  + [**Get:**](rows/#get-row) Get one or more rows from your table based on defined filters.
  + [**If Row Exists:**](rows/#if-row-exists) Specify a set of conditions to match input items that exist in the data table.
  + [**If Row Does Not Exist:**](rows/#if-row-does-not-exist) Specify a set of conditions to match input items that don't exist in the data table.
  + [**Insert:**](rows/#insert-row) Insert rows into an existing table.
  + [**Update:**](rows/#update-row) Update one or more rows.
  + [**Upsert:**](rows/#upsert-row) Upsert one or more rows. If the row exists, it's updated; otherwise, a new row is created.
* **Tables**

  + [**Create:**](tables/#create-a-data-table) Create a new data table.
  + [**Delete:**](tables/#delete-a-data-table) Delete an existing data table.
  + [**List:**](tables/#list-data-tables) List existing data tables.
  + [**Update:**](tables/#update-a-data-table) Update an existing data table.

## Related resources[#](#related-resources "Permanent link")

[Data tables](../../../../data/data-tables/) explains how to create and manage data tables.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

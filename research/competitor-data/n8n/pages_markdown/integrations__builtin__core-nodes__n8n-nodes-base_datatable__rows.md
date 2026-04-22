# Data Table node row operations | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.datatable/rows
Lastmod: 2026-04-14
Description: Reference documentation for Data Table node row operations, including delete, get, insert, update, and upsert.
# Row operations

Use row operations to delete, get, insert, update, upsert, or filter rows in a data table. Refer to the [Data Table node](../) documentation for more information on the node itself.

## Delete row[#](#delete-row "Permanent link")

Use this operation to delete one or more rows from a data table, based on a defined condition(s).

Enter these parameters:

* **Resource:** Select **Row**.
* **Operation:** Select **Delete**.
* **Data table:** Select how to identify the data table to operate on:
  + **From list:** Select the table from a drop-down list of all your data tables.
  + **By Name:** Enter the name of your data table.
  + **By ID:** Enter the ID of your data table
* **Must Match:** Select whether to delete rows that match **Any Condition** or **All Conditions** defined in the next step.
* **Conditions:** Click **Add Condition** to define which rows from the data table to operate on. You can add multiple conditions. For each one:
  + **Column:** Select the column you want to compare.
  + **Condition:** Choose how to compare the column value: **Equals**, **Not Equals**, **Greater Than**, **Greater Than or Equal**, **Less Than**, **Less Than or Equal**, **Is Empty**, or **Is Not Empty**.
  + **Value:** Enter the value to compare the column against. You can use a fixed value or an expression that references data from previous nodes. This field doesn't exist for **Is Empty** and **Is Not Empty** conditions.

### Delete row options[#](#delete-row-options "Permanent link")

Use these options to further refine the action's behavior:

* **Dry Run:** Enable to simulate deletion without modifying the table. The node returns rows that would be deleted, including their state before and after the operation.

## Get row[#](#get-row "Permanent link")

Use this operation to retrieve one or more rows from a data table, based on a defined condition(s).

Enter these parameters:

* **Resource:** Select **Row**.
* **Operation:** Select **Get**.
* **Data table:** Select how to identify the data table to operate on:
  + **From list:** Select the table from a drop-down list of all your data tables.
  + **By Name:** Enter the name of your data table.
  + **By ID:** Enter the ID of your data table
* **Must Match:** Select whether to get rows that match **Any Condition** or **All Conditions** defined in the next step.
* **Conditions:** Click **Add Condition** to define which rows from the data table to operate on. You can add multiple conditions. For each one:
  + **Column:** Select the column you want to compare.
  + **Condition:** Choose how to compare the column value: **Equals**, **Not Equals**, **Greater Than**, **Greater Than or Equal**, **Less Than**, **Less Than or Equal**, **Is Empty**, or **Is Not Empty**.
  + **Value:** Enter the value to compare the column against. You can use a fixed value or an expression that references data from previous nodes. This field doesn't exist for **Is Empty** and **Is Not Empty** conditions.
* **Return All:** Enable to return all matching rows. Or, disable and enter a **Limit** for the number of rows to return, for example `50`.
* **Order By:** Enable to define the column to order results on, and the direction (ascending or descending). Or, disable for no ordering of results.

## If row exists[#](#if-row-exists "Permanent link")

Use this operation to check whether a row matching the defined condition(s) exists in a data table. If a matching row is found, the node outputs the same input item it received, unchanged. If no matching rows exist, it outputs nothing.

Enter these parameters:

* **Resource:** Select **Row**.
* **Operation:** Select **If Row Exists**.
* **Data table:** Select how to identify the data table to operate on:
  + **From list:** Select the table from a drop-down list of all your data tables.
  + **By Name:** Enter the name of your data table.
  + **By ID:** Enter the ID of your data table
* **Must Match:** Select whether rows must match **Any Condition** or **All Conditions** defined in the next step.
* **Conditions:** Click **Add Condition** to define the data table rows to operate on. You can add multiple conditions. For each one:
  + **Column:** Select the column you want to compare.
  + **Condition:** Choose how to compare the column value: **Equals**, **Not Equals**, **Greater Than**, **Greater Than or Equal**, **Less Than**, **Less Than or Equal**, **Is Empty**, or **Is Not Empty**.
  + **Value:** Enter the value to compare the column against. You can use a fixed value or an expression that references data from previous nodes. This field doesn't exist for **Is Empty** and **Is Not Empty** conditions.

## If row does not exist[#](#if-row-does-not-exist "Permanent link")

Use this operation to check that no rows matching the defined condition(s) exists in a data table. If no matching row is found, the node outputs the same input item it received, unchanged. If a matching row exists, it outputs nothing.

Enter these parameters:

* **Resource:** Select **Row**.
* **Operation:** Select **If Row Does Not Exist**.
* **Data table:** Select how to identify the data table to operate on:
  + **From list:** Select the table from a drop-down list of all your data tables.
  + **By Name:** Enter the name of your data table.
  + **By ID:** Enter the ID of your data table.
* **Must Match:** Select whether rows must match **Any Condition** or **All Conditions** defined in the next step.
* **Conditions:** Click **Add Condition** to define the data table rows to operate on. You can add multiple conditions. For each one:
  + **Column:** Select the column you want to compare.
  + **Condition:** Choose how to compare the column value: **Equals**, **Not Equals**, **Greater Than**, **Greater Than or Equal**, **Less Than**, **Less Than or Equal**, **Is Empty**, or **Is Not Empty**.
  + **Value:** Enter the value to compare the column against. You can use a fixed value or an expression that references data from previous nodes. This field doesn't exist for **Is Empty** and **Is Not Empty** conditions.

## Insert row[#](#insert-row "Permanent link")

Use this operation to insert a new row into a data table.

Enter these parameters:

* **Resource:** Select **Row**.
* **Operation:** Select **Insert**.
* **Data table:** Select how to identify the data table to operate on:
  + **From list:** Select the table from a drop-down list of all your data tables.
  + **By Name:** Enter the name of your data table.
  + **By ID:** Enter the ID of your data table.
* **Mapping Column Mode:** Select whether to:
  + **Map Each Column Manually:** Explicitly select which incoming data fields to map to which column. This allows you to map even when the incoming data field names don't match the data table column names. You can choose to delete certain values from the mapping.
  + **Map Automatically:** Allow the node to automatically match data fields to columns by name. For successful mapping, the field names in your incoming data must exactly match the column names in the data table. All fields will be mapped.

### Insert row options[#](#insert-row-options "Permanent link")

Use these options to further refine the action's behavior:

* **Optimize Bulk:** Enable to prevent inserted data from being returned. This improves bulk insert performance by up to 5x.

## Update row[#](#update-row "Permanent link")

Use this operation to update one or more rows in a data table, based on a defined condition(s).

Enter these parameters:

* **Resource:** Select **Row**.
* **Operation:** Select **Update**.
* **Data table:** Select how to identify the data table to operate on:
  + **From list:** Select the table from a drop-down list of all your data tables.
  + **By Name:** Enter the name of your data table.
  + **By ID:** Enter the ID of your data table.
* **Must Match:** Select whether to update rows that match **Any Condition** or **All Conditions** defined in the next step.
* **Conditions:** Click **Add Condition** to define the data table rows to operate on. You can add multiple conditions. For each one:
  + **Column:** Select the column you want to compare.
  + **Condition:** Choose how to compare the column value: **Equals**, **Not Equals**, **Greater Than**, **Greater Than or Equal**, **Less Than**, **Less Than or Equal**, **Is Empty**, or **Is Not Empty**.
  + **Value:** Enter the value to compare the column against. You can use a fixed value or an expression that references data from previous nodes. This field doesn't exist for **Is Empty** and **Is Not Empty** conditions.
* **Mapping Column Mode:** Select whether to:
  + **Map Each Column Manually:** Explicitly select which incoming data fields to map to which column. This allows you to map even when the incoming data field names don't match the data table column names. You can choose to delete certain values from the mapping.
  + **Map Auomatically:** Allow the node to automatically match data fields to columns by name. For successful mapping, the field names in your incoming data must exactly match the column names in the data table. All fields will be mapped.

### Update row options[#](#update-row-options "Permanent link")

Use these options to further refine the action's behavior:

* **Dry Run:** Enable to simulate updating, without modifying the table. The node returns rows that would be updated, including their state before and after the operation.

## Upsert row[#](#upsert-row "Permanent link")

Use this operation to upsert into a data table. If a row matching the defined condition(s) exists, it's updated with the provided values. If no matching row exists, a new row is created.

* **Resource:** Select **Row**.
* **Operation:** Select **Upsert**.
* **Data table:** Select how to identify the data table to operate on:
  + **From list:** Select the table from a drop-down list of all your data tables.
  + **By Name:** Enter the name of your data table.
  + **By ID:** Enter the ID of your data table.
* **Must Match:** Select whether to upsert rows that match **Any Condition** or **All Conditions** defined in the next step.
* **Conditions:** Click **Add Condition** to define the data table rows to operate on. You can add multiple conditions. For each one:
  + **Column:** Select the column you want to compare.
  + **Condition:** Choose how to compare the column value: **Equals**, **Not Equals**, **Greater Than**, **Greater Than or Equal**, **Less Than**, **Less Than or Equal**, **Is Empty**, or **Is Not Empty**.
  + **Value:** Enter the value to compare the column against. You can use a fixed value or an expression that references data from previous nodes. This field doesn't exist for **Is Empty** and **Is Not Empty** conditions.
* **Mapping Column Mode:** Select whether to:
  + **Map Each Column Manually:** Explicitly select which incoming data fields to map to which column. This allows you to map even when the incoming data field names don't match the data table column names. You can choose to delete certain values from the mapping.
  + **Map Auomatically:** Allow the node to automatically match data fields to columns by name. For successful mapping, the field names in your incoming data must exactly match the column names in the data table. All fields will be mapped.

### Upsert row options[#](#upsert-row-options "Permanent link")

Use these options to further refine the action's behavior:

* **Dry Run:** Enable to simulate the upsert operation without modifying the table. The node returns rows that would be affected, including their state before and after the operation.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

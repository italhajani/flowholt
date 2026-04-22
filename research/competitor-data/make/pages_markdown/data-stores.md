# Data stores - Help Center

Source: https://help.make.com/data-stores
Lastmod: 2026-04-08T14:40:14.601Z
Description: Use data stores as databases to store and manage data across scenarios
Explore more

Data stores

# Data stores

20 min

Data stores allow you to store data from a scenario﻿ or transfer data between individual scenarios﻿ or scenario﻿ runs. You can use data stores to store data from apps during scenario﻿ execution. Data stores are similar to a simple database.

## Data storage allowance

Before creating a data store, take note of your data storage allowance. Total data storage is based on number of operations in your plan, with every 1,000 operations equaling 1 MB of data storage.

As 1 MB is the minimum size of a data store in Make﻿, you will need at least 1 MB of data storage available to create a new data store.

Consider the following data storage allowances for data stores, depending on your [plan](https://www.make.com/en/pricing "plan"):

Free plan users

Enterprise users

All other users

As a Free plan user, you are entitled to 1 MB of data storage, equaling 1 data store, as the plan includes 1,000 credits per month.

As an Enterprise user, calculate your total data store by determining your average monthly credits and then dividing your monthly credits by 1,000.
For example, with 1,000,000 credits per year, you have 83.3 MB of data storage available to allocate to your data stores.
1,000,000 credits / 12 months = 83,333 credits
83,333 credits / 1,000 = 83.33 MB
Each data store is at least 1 MB in size.

As a paid user, calculate your total data storage by dividing your monthly credits by 1,000.

For example, with 20,000 credits, you have 20 MB of data storage (=20,000/1,000) available to allocate to your data stores. Each data store is at least 1 MB in size.

Note that a single organization, regardless of plan type, can have a maximum of 1,000 data stores.

To adjust the data storage allocated to your existing data stores, see [Out of space error](/data-stores#out-of-space-error)﻿.

## Create a data store

To create a data store:

1

In the left sidebar, click **Data stores**.

2

Click **+ Add data store**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/5YUePnbgfe-tN1KmBLZXQ-20251006-142519.png?format=webp "Document image")

﻿

3

Configure the settings for the new data store.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/cXm-x6jixYpvIrMgZzua7-20251006-143158.png "Document image")

﻿

| **Field** | **Description** |
| --- | --- |
| **Data store name** | Enter the name for the data store. For example, Contacts. |
| **Data structure** | A data structure is a list of the columns for a table that indicates the column name and data type.  You have three options:  * **Create a data structure**  * Click **Create a data structure** if you haven't created any yet.  * **Select a data structure that has already been created**  * **Leave the field empty**  * If you don't select a data structure, the database will only contain the primary key. Such a database type is useful if you only want to save keys and are only interested in knowing whether or not a specific key exists in the database.  * **Add a new data structure**  * Click the **Add** button to create a new data structure. |
| **Data storage size in MB** | Allocate the size for the data store from your total data storage. The amount can be changed at any time.  1 MB is the minimum data storage size per data store. You can see your available storage space in the text below the **Data storage size in MB** field. |

﻿

You now have a data store that can be used in your scenarios﻿. Click the scenarios﻿ icon to see a list of scenarios﻿ using the data store.

![Use of data stores in scenarioes](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/RqOEAhyu_8a6HPL4bAzwI-20260316-100011.png?format=webp "Use of data stores in scenarioes")

﻿

﻿

## Manage the data structure of a data store

### Add a new data structure

During the process of setting up a data store, you can set up a new data structure.

To set up the data structure while adding a data store, click the Add button for the Data structure field

You can access this dialog by clicking the **Add** button when creating or editing the data store:

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/TF4_cm207aN5bJTPtlU_n-20251006-143605.png "Document image")

﻿

| ﻿ | ﻿ |
| --- | --- |
| **Data structure name** | Enter the name for the data structure.  The data structure name is its unique identifier and cannot be changed later. |
| **Specification** | There are two options for how you can specify the data store columns.  * Click the **Add item** button to specify the properties of one column manually.  * Enter the **Name** and **Type** for the data store column and define the corresponding properties.   **Note:** Since JavaScript uses the IEEE 754 standard for double-precision, floating-point numbers to store all numeric values, we recommend using type Text for storing integers above 14 digits, to avoid rounding off.  * Use the *Generator button* to determine the columns from the sample data you provide.  * For example, the following JSON sample data creates three columns (name, age, phone number) with phone number as a collection of mobile and landline:   { "name":"John",   "age":30,   "phone number": {   "mobile":"987654321",   "landline":"123456789"   }   } |
| **Strict** | If enabled, the data structure will be compared to the structure of the payload, and if the payload contains extra items not specified in the data structure, the payload will be rejected. |

You now have a data structure for your data store. Click the data store icon to see a list of data stores using the data structure.

![Use of the data structure in a data store](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/cUE6709AV5nLiKrI1yb9Z-20260316-100911.png?format=webp "Use of the data structure in a data store")

﻿

Click the scenarios﻿ icon to see a list of scenarios﻿ using the data structure.

![Use of the data structure in a scenario](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/5WvIHJAIP84_kqFbKe1Oa-20260316-101214.png?format=webp "Use of the data structure in a scenario")

﻿

﻿

### Update the data structure of a data store

Be careful when updating the data structure of a data store. Before updating the structure, make a backup of the data.

Changes in the data structure of a data store might lead to unexpected results.

When you want to update the data structure of a data store, you should keep in mind that:

* The data structure field names are unique identifiers of the data store columns. When you rename a field of a data structure, Make﻿ cannot retrieve the original data in the data store column, because they use a different column identifier.

* You can update the data structure field label anytime without the effects mentioned in the previous point.

* The changes to the data store structure apply only to the new data you put in the data store. Make﻿ doesn't change or validate the original data to fit the updated structure.

The best approach to updating the data structure of a data store is to create temporary fields with copies of your data. Update the data in the temporary fields and make sure they conform to the final data structure.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/bqQnWTnSvC_L1Z79M2Uv0-20251006-144630.png?format=webp "Document image")

﻿

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/7ujKnlwD9zwErwCYAVp5Z-20251006-144854.png "Document image")

﻿

### Rename a field of the data store structure

You can update the **Label** of a data store structure field anytime.

To change the data store structure field **Name**:

1

﻿[Create a backup of the data in the data store](/data-stores#O-UKX)﻿.

2

Create a field in your data store with the new name.

3

Copy all data from the original column to the new column.

4

Update all data in the original column to empty fields. This step prevents storing the data in the original column alongside the data in the new column.

You have put the data from the original data store column into the new data store column. In addition, you have a data store backup to check that the update was successful.

### Change the type of a field of the data store structure

1

﻿[Create a backup of the data in the data store](/data-stores#O-UKX)﻿.

2

Either create a temporary field for the updated data type, or you can skip this step and update the field type in place.

3

Use a conversion function to update the type of all values in the data store column to the new type. For example, to convert text to date, use the parseDate function.

## Data store modules in Make﻿

### Add/Replace a Record

Adds or replaces a record in the data store.

| **Field** | **Description** |
| --- | --- |
| Data store | Select or add the data store where you want to create a record. |
| Key | Enter the unique key. The key can be used later to retrieve the record. If you leave this field blank, the key will be generated. |
| Overwrite an existing record | Enable this option to overwrite the record. The record you want to overwrite must be specified in the **Key** field above. |
| Record | Enter the desired values to the record's fields.  The maximum size of the record in the data store is 15 MB. |

The module throws an error when you try to add the record which is already in the data store under the same name and the **Overwrite an existing record** option is disabled.

### Check the Existence of a Record

Returns the value true if the record exists in the specified data store or false if the record doesn't exist in the data store.

| **Field** | **Description** |
| --- | --- |
| Data store | Select the data store you want to check for the record existence. |
| Key | Enter the key of the record you want to check for existence |

### Count Records

Returns the number of records in the selected data store.

| **Field** | **Description** |
| --- | --- |
| Data store | Select the data store whose records you want to count. |

### Delete All Records

Deletes all records from the selected data store.

| **Field** | **Description** |
| --- | --- |
| Data store | Select the data store you want to delete all records from. |

### Delete a Record

Deletes a specified record from the selected data store.

| **Field** | **Description** |
| --- | --- |
| Data store | Select the data store you want to check for the record existence. |
| Key | Enter the key of the record you want to delete. |

### Get a Record

Retrieves a record from the selected data store.

| **Field** | **Description** |
| --- | --- |
| Data store | Select the data store you want to retrieve a record from. |
| Key | Enter the unique key of the record you want to retrieve. |
| Return Wrapped Output | Choose if you want the output to be returned in the same way that the Search records module returns data. |

### Search Records

Performs a search for records based on filter settings.

| **Field** | **Description** |
| --- | --- |
| Data store | Select the data store you want to check for the record's existence. |
| Filter | Set the filter for the search.  Select the column, operator and required value (search term) for the search.  If you use the **datetime** operators, you need to provide a value in a date format. Use the parseDate function for this purpose. |
| Sort | * Key: Select the column name you want to sort the results by.  * Order : Select whether you want to sort results in ascending or descending order. |
| Limit | Set the maximum number of search results Make﻿ will return during one execution cycle. |
| Continue the execution of the route even if the module returns no results | If enabled, the scenario﻿ will not be stopped by this module. |

### Update a Record

Updates a record in the selected data store.

| **Field** | **Description** |
| --- | --- |
| Data store | Select or add the data store where you want to create a record. |
| Key | Enter the unique key of the record you want to update. |
| Insert missing record | Enable this option to create a new record if the record with the specified key doesn't already exist. |
| Record | Enter the desired values to the record's fields that you want to update.  The maximum size of the record in the data store is 15 MB. |

## Manage records in a data store

﻿Make﻿ allows you to add, view, update, and delete the records in your data store.

### View records

To view the records in your data store, open the **Data store** tab in the left sidebar and click the required **Data store**.

### Add or edit records

Click **Add** to add new records to the data store. Newly inserted records are highlighted in green.

To change an existing field, hover over it and click the edit icon.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/mbm1qnnv6wbP56P80hyFi-20251006-152216.png?format=webp "Document image")

﻿

Click **Save** to save all your changes to the data store. Click **Discard changes** to reset any changes you have made, including added records and edited records.

You cannot use **Discard changes** to get back records that you have deleted.

### Delete records

To delete records from your data store, first select the records you want to delete by selecting the check boxes next to the records. Then, click the **Delete** icon.

You cannot roll back deleted records.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/mNgSIHluRX6PlKcgZj_i4-20251006-152905.png?format=webp "Document image")

﻿

### Back up data in the data store

When you want to make large-scale changes in your data store, like deleting a large number of records or changing the data store structure, you should make a backup of your data first.

There are two options of how to backup the data in your data store with Make:

* Create a Make﻿ scenario﻿

* Use the [Make API](https://developers.make.com/api-documentation/api-reference/data-stores "Make API").

To back up your data using a Make﻿ scenario﻿:

1

Clone the data structure of the original data store. Name the data structure to clearly show that it's for the backup data store.

2

Create a data store with the backup data structure. Name the data store to clearly show that it's a backup of your data.

3

Create a Make﻿﻿scenario﻿. Name the scenario﻿ to clearly show that it's for backing up data in the data store.

4

Add the **Data Store** > **Search Records** module to the scenario﻿. In the **Data Store** field, select the data store which contains the data you want to back up.

5

Add the **Data Store** > **Add/Replace Record** module to the scenario﻿.

6

Run the scenario﻿.

The backup data store now contains all data from the original data store.

You can reduce the number of operations by using the **Text Aggregator** and **CSV** or SQL-processing tools and apps.

## Troubleshooting

### Restore lost data from your data store

There is no automated process to restore lost values in your data stores. However, there is a manual approach that you can use to fix the issue.

To locate and restore the missing data:

1

Open the specific scenario where the missing items were stored.

2

Review the execution history and identify the instances where items were inserted into the data store.

3

Copy the identified missing data into your data store.

### Update the data store structure

There are two challenges that occur when you update the data structure of a data store:

* When you rename a field of the data structure, the data in the field becomes inaccessible.
  If you want to access the data again, add a field to the data store structure with the original field name.
  With the data in the original field accessible again, you can follow the steps to [update the data store structure](/data-stores#update-the-data-structure-of-a-data-store)﻿.

* When you change the type of a field in a data structure, the original data keeps the original data type and the new data has the new type.

Before updating the data structure of a data store, [create a backup of your data](/data-stores#back-up-data-in-the-data-store)﻿.

### Out of space error

You get this error message if you currently have a datastore that has already been assigned your allocated datastore storage.

You can edit any of your existing data stores to free up space.

1

In the left sidebar, click **Data stores**.

2

Click **Edit** next to a data store.

![Edit a data store](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-AO_yOgrMb5jk8zl_k01Yi-20250226-150407.png?format=webp "Edit a data store")

﻿

3

Reduce the data storage size in the **Data storage size in MB** field.

You can now add a new data store.

Make sure that when you create a new data store you do not assign all of your space to only one record unless you need it.

﻿

### Date/time displayed as date for text value

When you input a raw date/time string in ISO format ending with Z in a text-based field of a data store, it will display in a parsed (date) format.

Add [functions](/date-and-time-functions)﻿ to convert a date in raw ISO format to text:

1

In the[data structure](H-nm0PyG893UbiGTe-m-C)﻿of your data store, set the **Type** of the relevant field to Text.

2

In the relevant scenario, add a **Data store > Add/replace a record** module.

1. In its configuration settings, locate the field that corresponds to the relevant column in the data store.

2. Add the **formatDate()** and **toString()** functions as shown below, with the raw ISO date as the first input value.

![Document image](https://images.archbee.com/Q31995ot4OZzZRNwsMBrJ-8TS_wlx_Lq603mtiCPDFU-20250516-090023.jpg?format=webp "Document image")

﻿

For more on formatting date and time data, see [Tokens for date/time formatting](/tokens-for-datetime-formatting)﻿.

3

Click **Save**.

﻿

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

Data stores](/F-qx-data-stores "Data stores")[NEXT

Data structures](/data-structures "Data structures")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

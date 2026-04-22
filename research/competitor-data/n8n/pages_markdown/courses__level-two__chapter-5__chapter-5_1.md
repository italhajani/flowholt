# Workflow 1 | n8n Docs

Source: https://docs.n8n.io/courses/level-two/chapter-5/chapter-5.1
Lastmod: 2026-04-14
Description: Documentation for n8n, a workflow automation platform.
# Workflow 1: Merging data[#](#workflow-1-merging-data "Permanent link")

Nathan's company stores its customer data in Airtable. This data contains information about the customers' ID, country, email, and join date, but lacks data about their respective region and subregion. You need to fill in these last two fields in order to create the reports for regional sales.

To accomplish this task, you first need to make a copy of this table in your Airtable account.

[Click here to access.](https://airtable.com/embed/shrNX9tjPkVLABbNz?backgroundColor=orange&viewControls=on)

When setting up your Airtable, ensure that the `customerSince` column is configured as a Date type field with the **Include time** option enabled. Without this setting, you may encounter errors in step 4 when updating the table.

Next, build a small workflow that merges data from Airtable and a REST Countries API:

1. Use the [**Airtable node**](../../../../integrations/builtin/app-nodes/n8n-nodes-base.airtable/) to list the data in the Airtable table named `customers`.
2. Use the [**HTTP Request node**](../../../../integrations/builtin/core-nodes/n8n-nodes-base.httprequest/) to get data from the REST Countries API: `https://restcountries.com/v3.1/all`, and send the query parameter name `fields` with the value `name,region,subregion`. This will return data about world countries, split out into separate items.
3. Use the [**Merge node**](../../../../integrations/builtin/core-nodes/n8n-nodes-base.merge/) to merge data from Airtable and the Countries API by country name, represented as `customerCountry` in Airtable and `name.common` in the Countries API, respectively.
4. Use another Airtable node to update the fields `region` and `subregion` in Airtable with the data from the Countries API.

The workflow should look like this:

[![Workflow 1 for merging data from Airtable and the Countries API](/_images/courses/level-two/chapter-five/workflow1.png)](https://docs.n8n.io/_images/courses/level-two/chapter-five/workflow1.png)

*Workflow 1 for merging data from Airtable and the Countries API*

Quiz questions

* How many items does the **HTTP Request node** return?
* How many items does the **Merge node** return?
* How many unique regions are assigned in the customers table?
* What's the subregion assigned to the customerID 10?

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

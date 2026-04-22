# Evaluation Trigger node documentation | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.evaluationtrigger
Lastmod: 2026-04-14
Description: Learn how to use the Evaluation Trigger node in n8n. Follow technical documentation to integrate Evaluation Trigger node into your workflows.
# Evaluation Trigger node[#](#evaluation-trigger-node "Permanent link")

Use the Evaluation Trigger node when setting up [evaluations](../../../../advanced-ai/evaluations/overview/) to validate your AI workflow reliability. During evaluation, the Evaluation Trigger node reads your evaluation dataset from Google Sheets, sending the items through the workflow one at a time, in sequence.

On this page, you'll find the Evaluation Trigger node parameters and options.

Credentials for Google Sheets

The Evaluation Trigger node uses data tables or Google Sheets to store the test dataset. To use Google Sheets as a dataset source, configure a [Google Sheets credential](../../credentials/google/).

## Parameters[#](#parameters "Permanent link")

* **Source:** Select the location to which you want to output the evaluation results. Default value is **Data table**.

  Source settings differ depending on **Source** selection.

  + When **Source** is **Data table**:
    - **Data table:** Select a data table by name or ID.
    - **Limit Rows**: Whether to limit the number of rows in the data table to process. Default state is `off`.
      * **Max Rows to Process**: When **Limit Rows** is enabled, the maximum number of rows to read and process during the evaluation. Default value is 10.
      * **Filter Rows:** Whether to filter rows in the data table to process. Default state is `off`.
  + When **Source** is **Google Sheets**:
    - **Credential to connect with**: Create or select an existing [Google Sheets credentials](../../credentials/google/).
    - **Document Containing Dataset**: Choose the spreadsheet document with the sheet containing your test dataset.
      * Select **From list** to choose the spreadsheet title from the dropdown list, **By URL** to enter the url of the spreadsheet, or **By ID** to enter the `spreadsheetId`.
      * You can find the `spreadsheetId` in a Google Sheets URL: `https://docs.google.com/spreadsheets/d/spreadsheetId/edit#gid=0`.
    - **Sheet Containing Dataset**: Choose the sheet containing your test dataset.
      * Select **From list** to choose the sheet title from the dropdown list, **By URL** to enter the url of the sheet, **By ID** to enter the `sheetId`, or **By Name** to enter the sheet title.
      * You can find the `sheetId` in a Google Sheets URL: `https://docs.google.com/spreadsheets/d/aBC-123_xYz/edit#gid=sheetId`.
    - **Limit Rows**: Whether to limit the number of rows in the sheet to process.
      * **Max Rows to Process**: When **Limit Rows** is enabled, the maximum number of rows to read and process during the evaluation.
    - **Filters:** Filter the evaluation dataset based on column values.
      * **Column**: Choose a sheet column you want to filter by. Select **From list** to choose the column name from the dropdown list, or **By ID** to specify an ID using an [expression](../../../../data/expressions/).
      * **Value**: The column value you want to filter by. The evaluation will only process rows with the given value for the selected column.

## Templates and examples[#](#templates-and-examples "Permanent link")

**AI Automated HR Workflow for CV Analysis and Candidate Evaluation**

by Davide Boizza

[View template details](https://n8n.io/workflows/2860-ai-automated-hr-workflow-for-cv-analysis-and-candidate-evaluation/)

**HR Job Posting and Evaluation with AI**

by Francis Njenga

[View template details](https://n8n.io/workflows/2773-hr-job-posting-and-evaluation-with-ai/)

**AI-Powered Candidate Screening and Evaluation Workflow using OpenAI and Airtable**

by Billy Christi

[View template details](https://n8n.io/workflows/4481-ai-powered-candidate-screening-and-evaluation-workflow-using-openai-and-airtable/)

[Browse Evaluation Trigger integration templates](https://n8n.io/integrations/evaluation-trigger/), or [search all templates](https://n8n.io/workflows/)

## Related resources[#](#related-resources "Permanent link")

To learn more about n8n evaluations, check out the [evaluations documentation](../../../../advanced-ai/evaluations/overview/)

n8n provides an app node for evaluations. You can find the node docs [here](../n8n-nodes-base.evaluation/).

For common questions or issues and suggested solutions, refer to the evaluations [tips and common issues](../../../../advanced-ai/evaluations/tips-and-common-issues/) page.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

# Google Sheets node common issues | n8n Docs

Source: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/common-issues
Lastmod: 2026-04-14
Description: Documentation for common questions and solutions in the Google Sheets node in n8n, a workflow automation platform. Includes details of the issue and suggested resolutions.
# Google Sheets node common issues[#](#google-sheets-node-common-issues "Permanent link")

Here are some common errors and issues with the [Google Sheets node](../) and steps to resolve or troubleshoot them.

## Append an array[#](#append-an-array "Permanent link")

To insert an array of data into Google Sheets, you must convert the array into a valid JSON (key, value) format.

To do so, consider using:

1. The [Split Out](../../../core-nodes/n8n-nodes-base.splitout/) node.
2. The [AI Transform](../../../core-nodes/n8n-nodes-base.aitransform/) node. For example, try entering something like:

   |  |  |
   | --- | --- |
   | ``` 1 ``` | ``` Convert 'languages' array to JSON (key, value) pairs. ``` |
3. The [Code node](../../../core-nodes/n8n-nodes-base.code/).

## Column names were updated after the node's setup[#](#column-names-were-updated-after-the-nodes-setup "Permanent link")

You'll receive this error if the Google Sheet's column names have changed since you set up the node.

To refresh the column names, re-select **Mapping Column Mode**. This should prompt the node to fetch the column names again.

Once the column names refresh, update the node parameters.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

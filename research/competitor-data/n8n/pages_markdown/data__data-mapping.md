# Referencing data | n8n Docs

Source: https://docs.n8n.io/data/data-mapping
Lastmod: 2026-04-14
Description: Documentation for n8n, a workflow automation platform.
# Referencing data[#](#referencing-data "Permanent link")

Referencing data, or data mapping, means accessing information from previous nodes in your workflow. This allows you to use output from earlier steps as input for later nodes, creating dynamic workflows that pass data through multiple operations.

When you reference data, you're not changing it. You're pointing to values that already exist so you can use them in node parameters, expressions, or custom code.

If you want to change the data you're referencing, see [Transforming data](../transforming-data/).

## How to reference data[#](#how-to-reference-data "Permanent link")

The main way to reference data is using [expressions](../expressions/#expressions). You can create expressions by typing them in a parameter's field or dragging and dropping fields from the Input panel in the UI. Expressions will automatically figure out the correct item to use using [item linking](data-item-linking/).

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

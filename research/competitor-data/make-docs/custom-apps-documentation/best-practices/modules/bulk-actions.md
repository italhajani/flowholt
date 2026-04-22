---
title: "Bulk actions | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/best-practices/modules/bulk-actions
scraped_at: 2026-04-21T12:44:27.798825Z
---

1. Best practices chevron-right
2. Modules

# Bulk actions

Bulk action modules can perform an action on multiple records in a single call.

To use bulk action modules, the user needs to create an array of records and map the array into the bulk module.

- In the bulk module UI, the mapping should always be turned ON by default.
- Types of output: If the response returns a single success / fail, the module should be an action module. If the response returns an output bundle of success / fail for an individual record, the module should be a search module.
- If possible, bulk modules should output the updated range/rows.

In the bulk module UI, the mapping should always be turned ON by default.

Types of output:

- If the response returns a single success / fail, the module should be an action module.
- If the response returns an output bundle of success / fail for an individual record, the module should be a search module.

If the response returns a single success / fail, the module should be an action module.

If the response returns an output bundle of success / fail for an individual record, the module should be a search module.

If possible, bulk modules should output the updated range/rows.

For more information for labeling and describing bulk action modules, see the best practices guide to module labels and module descriptions .

Last updated 5 months ago

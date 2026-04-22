# Filtering data | n8n Docs

Source: https://docs.n8n.io/data/data-filtering
Lastmod: 2026-04-14
Description: Documentation for n8n, a workflow automation platform.
# Filtering data[#](#filtering-data "Permanent link")

Filtering in n8n can mean different things depending on what you want to accomplish. This guide covers both visual filtering in the UI and data filtering during workflow execution.

## Filter data visually in the UI[#](#filter-data-visually-in-the-ui "Permanent link")

Feature availability

Available on Community, Cloud Pro, and Enterprise plans.

Search and filter data in the node **INPUT** and **OUTPUT** panels. Use this to check your node's data and find specific items.

To search:

1. In a node, select **Search** ![Search icon](../../_images/common-icons/search.png) in the **INPUT** or **OUTPUT** panel.
2. Enter your search term.

n8n filters as you type, displaying the objects or rows containing the term.

Filtering is purely visual: n8n doesn't change or delete data. The filter resets when you close and reopen the node.

## Filter data during workflow execution[#](#filter-data-during-workflow-execution "Permanent link")

To actually remove or filter data in your workflow, use these approaches:

### Filter out items[#](#filter-out-items "Permanent link")

To remove entire items from your workflow based on conditions, use the [Filter node](../../integrations/builtin/core-nodes/n8n-nodes-base.filter/). This node evaluates conditions and only passes through items that meet your criteria.

### Filter out fields[#](#filter-out-fields "Permanent link")

To remove specific fields from an item or object while keeping the item itself, use the [Edit Fields (Set) node](../../integrations/builtin/core-nodes/n8n-nodes-base.set/). Configure it to remove the fields you don't need.

### Filter array elements[#](#filter-array-elements "Permanent link")

To filter elements within an array inside an item, use the `.filter()` method in an expression or Code node. For example:

|  |  |
| --- | --- |
| ``` 1 ``` | ``` {{ $json.myArray.filter(item => item.value > 10) }} ``` |

This removes array elements that don't match your condition while preserving the item structure.

### Filter out duplicate items from previous executions[#](#filter-out-duplicate-items-from-previous-executions "Permanent link")

To remove items that have been seen in previous executions of a workflow, use the [Remove Duplicates](../../integrations/builtin/core-nodes/n8n-nodes-base.removeduplicates/) node. Use this when an event fires multiple times but you only want to process the first occurrence.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

# NodeOutputData | n8n Docs

Source: https://docs.n8n.io/data/expression-reference/nodeoutputdata
Lastmod: 2026-04-14
Description: Documentation for n8n, a workflow automation platform.
# NodeOutputData[#](#nodeoutputdata "Permanent link")

## `$()`.**`all()`**[#](#all "Permanent link")

**Description:** Returns an array of the node’s output items

**Syntax:** `$()`.all(branchIndex?, runIndex?)

**Returns:** Array

**Source:** Custom n8n functionality

**Parameters:**

* `branchIndex` (Number) - optional - The output branch of the node to use. Defaults to the first branch (index 0)
* `runIndex` (Number) - optional - The run of the node to use. Defaults to the first run (index 0)

## `$()`.**`first()`**[#](#first "Permanent link")

**Description:** Returns the first item output by the node

**Syntax:** `$()`.first(branchIndex?, runIndex?)

**Returns:** Item

**Source:** Custom n8n functionality

**Parameters:**

* `branchIndex` (Number) - optional - The output branch of the node to use. Defaults to the first branch (index 0)
* `runIndex` (Number) - optional - The run of the node to use. Defaults to the first run (index 0)

## `$()`.**`isExecuted`**[#](#isexecuted "Permanent link")

**Description:** Is `true` if the node has executed, `false` otherwise

**Syntax:** `$()`.`$()`.**`isExecuted`**

**Returns:** Boolean

**Source:** Custom n8n functionality

## `$()`.**`item`**[#](#item "Permanent link")

**Description:** Returns the matching item, i.e. the one used to produce the current item in the current node. [More info](/data/data-mapping/data-item-linking/)

**Syntax:** `$()`.`$()`.**`item`**

**Returns:** Item

**Source:** Custom n8n functionality

## `$()`.**`itemMatching()`**[#](#itemmatching "Permanent link")

**Description:** Returns the matching item, i.e. the one used to produce the item in the current node at the specified index. [More info](/data/data-mapping/data-item-linking/)

**Syntax:** `$()`.itemMatching(currentItemIndex?)

**Returns:** Item

**Source:** Custom n8n functionality

**Parameters:**

* `currentItemIndex` (Number) - The index of the item in the current node to be matched with.

## `$()`.**`last()`**[#](#last "Permanent link")

**Description:** Returns the last item output by the node

**Syntax:** `$()`.last(branchIndex?, runIndex?)

**Returns:** Item

**Source:** Custom n8n functionality

**Parameters:**

* `branchIndex` (Number) - optional - The output branch of the node to use. Defaults to the first branch (index 0)
* `runIndex` (Number) - optional - The run of the node to use. Defaults to the first run (index 0)

## `$()`.**`params`**[#](#params "Permanent link")

**Description:** The configuration settings of the given node. These are the parameters you fill out within the node’s UI (e.g. its operation).

**Syntax:** `$()`.`$()`.**`params`**

**Returns:** NodeParams

**Source:** Custom n8n functionality

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

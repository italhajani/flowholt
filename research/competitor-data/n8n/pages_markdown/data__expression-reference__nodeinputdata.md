# NodeInputData | n8n Docs

Source: https://docs.n8n.io/data/expression-reference/nodeinputdata
Lastmod: 2026-04-14
Description: Documentation for n8n, a workflow automation platform.
# NodeInputData[#](#nodeinputdata "Permanent link")

## `$input`.**`all()`**[#](#inputall "Permanent link")

**Description:** Returns an array of the current node’s input items

**Syntax:** `$input`.all(branchIndex?, runIndex?)

**Returns:** Array

**Source:** Custom n8n functionality

**Parameters:**

* `branchIndex` (Number) - optional - The output branch index of the node to use. Defaults to the first branch (index 0)
* `runIndex` (Number) - optional - The run of the node to use. Defaults to the first run (index 0)

## `$input`.**`first()`**[#](#inputfirst "Permanent link")

**Description:** Returns the current node’s first input item

**Syntax:** `$input`.first(branchIndex?, runIndex?)

**Returns:** Item

**Source:** Custom n8n functionality

**Parameters:**

* `branchIndex` (Number) - optional - The output branch index of the node to use. Defaults to the first branch (index 0)
* `runIndex` (Number) - optional - The run of the node to use. Defaults to the first run (index 0)

## `$input`.**`item`**[#](#inputitem "Permanent link")

**Description:** Returns the input item currently being processed

**Syntax:** `$input`.`$input`.**`item`**

**Returns:** Item

**Source:** Custom n8n functionality

## `$input`.**`last()`**[#](#inputlast "Permanent link")

**Description:** Returns the current node’s last input item

**Syntax:** `$input`.last(branchIndex?, runIndex?)

**Returns:** Item

**Source:** Custom n8n functionality

**Parameters:**

* `branchIndex` (Number) - optional - The output branch index of the node to use. Defaults to the first branch (index 0)
* `runIndex` (Number) - optional - The run of the node to use. Defaults to the first run (index 0)

## `$input`.**`params`**[#](#inputparams "Permanent link")

**Description:** The configuration settings of the current node. These are the parameters you fill out within the node when configuring it (e.g. its operation).

**Syntax:** `$input`.`$input`.**`params`**

**Returns:** NodeParams

**Source:** Custom n8n functionality

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

# PrevNodeData | n8n Docs

Source: https://docs.n8n.io/data/expression-reference/prevnodedata
Lastmod: 2026-04-14
Description: Documentation for n8n, a workflow automation platform.
# PrevNodeData[#](#prevnodedata "Permanent link")

## **`name`**[#](#name "Permanent link")

**Description:** The name of the node that the current input came from.

Always uses the current node’s first input connector if there is more than one (e.g. in the ‘Merge’ node).

**Syntax:** **`name`**

**Returns:** String

**Source:** Custom n8n functionality

## **`outputIndex`**[#](#outputindex "Permanent link")

**Description:** The index of the output connector that the current input came from. Use this when the previous node had multiple outputs (such as an ‘If’ or ‘Switch’ node).

Always uses the current node’s first input connector if there is more than one (e.g. in the ‘Merge’ node).

**Syntax:** **`outputIndex`**

**Returns:** Number

**Source:** Custom n8n functionality

## **`runIndex`**[#](#runindex "Permanent link")

**Description:** The run of the previous node that generated the current input.

Always uses the current node’s first input connector if there is more than one (e.g. in the ‘Merge’ node).

**Syntax:** **`runIndex`**

**Returns:** Number

**Source:** Custom n8n functionality

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

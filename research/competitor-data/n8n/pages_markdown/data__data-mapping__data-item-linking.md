# Linking data items | n8n Docs

Source: https://docs.n8n.io/data/data-mapping/data-item-linking
Lastmod: 2026-04-14
Description: Documentation for n8n, a workflow automation platform.
# Linking data items[#](#linking-data-items "Permanent link")

An item is a single piece of data. Nodes receive one or more items, operate on them, and output new items. Each item links back to the items in the previous nodes that generated it.

Usually this just works. You need to understand this behavior in detail if you're:

* Using the Code node for complex behaviors with input and output data.
* Building a programmatic-style node.

This section provides:

* A conceptual overview of [Item linking concepts](item-linking-concepts/).
* Information on [Item linking for node creators](item-linking-node-building/).
* Support for end users who need to [work with the data path](item-linking-code-node/) to retrieve item data from previous nodes and link items when using the Code node.
* Guidance on troubleshooting [errors](item-linking-errors/).

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

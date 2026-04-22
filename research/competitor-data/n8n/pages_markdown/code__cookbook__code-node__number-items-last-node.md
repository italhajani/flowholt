# Get number of items returned by last node | n8n Docs

Source: https://docs.n8n.io/code/cookbook/code-node/number-items-last-node
Lastmod: 2026-04-14
Description: Documentation for n8n, a workflow automation platform.
# Get number of items returned by the previous node[#](#get-number-of-items-returned-by-the-previous-node "Permanent link")

To get the number of items returned by the previous node:

[JavaScript](#__tabbed_1_1)[Python](#__tabbed_1_2)

|  |  |
| --- | --- |
| ```  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 ``` | ``` if (Object.keys(items[0].json).length === 0) { return [ 	{ 		json: { 			results: 0, 		} 	} ] } return [ 	{ 		json: { 			results: items.length, 		} 	} ]; ``` |

The output will be similar to the following.

|  |  |
| --- | --- |
| ``` 1 2 3 4 5 ``` | ``` [ 	{ 		"results": 8 	} ] ``` |

|  |  |
| --- | --- |
| ```  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 ``` | ``` if len(items[0].json) == 0: 	return [ 		{ 			"json": { 				"results": 0, 			} 		} 	] else: 	return [ 		{ 			"json": { 				"results": items.length, 			} 		} 	] ``` |

The output will be similar to the following.

|  |  |
| --- | --- |
| ``` 1 2 3 4 5 ``` | ``` [ 	{ 		"results": 8 	} ] ``` |

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

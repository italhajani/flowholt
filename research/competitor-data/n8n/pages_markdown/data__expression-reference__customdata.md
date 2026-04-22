# CustomData | n8n Docs

Source: https://docs.n8n.io/data/expression-reference/customdata
Lastmod: 2026-04-14
Description: Documentation for n8n, a workflow automation platform.
# CustomData[#](#customdata "Permanent link")

## `$execution.customData`.**`get()`**[#](#executioncustomdataget "Permanent link")

**Description:** Returns the custom execution data stored under the given key. [More info](/workflows/executions/custom-executions-data/)

**Syntax:** `$execution.customData`.get(key)

**Returns:** String

**Source:** Custom n8n functionality

**Parameters:**

* `key` (String) - The key (identifier) under which the data is stored

**Examples:**

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // Get the user's email (which was previously stored) $execution.customData.get("user_email") //=> "me@example.com" ``` |

## `$execution.customData`.**`getAll()`**[#](#executioncustomdatagetall "Permanent link")

**Description:** Returns all the key-value pairs of custom data that have been set in the current execution. [More info](/workflows/executions/custom-executions-data/)

**Syntax:** `$execution.customData`.getAll()

**Returns:** Object

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 ``` | ``` $execution.customData.getAll() //=> {"user_email": "me@example.com", "id": 1234} ``` |

## `$execution.customData`.**`set()`**[#](#executioncustomdataset "Permanent link")

**Description:** Stores custom execution data under the key specified. Use this to easily filter executions by this data. [More info](/workflows/executions/custom-executions-data/)

**Syntax:** `$execution.customData`.set(key, value)

**Source:** Custom n8n functionality

**Parameters:**

* `key` (String) - The key (identifier) under which the data is stored
* `value` (String) - The data to store

**Examples:**

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // Store the user's email, to easily retrieve all execs related to that user later $execution.customData.set("user_email", "me@example.com") ``` |

## `$execution.customData`.**`setAll()`**[#](#executioncustomdatasetall "Permanent link")

**Description:** Sets multiple key-value pairs of custom data for the execution. Use this to easily filter executions by this data. [More info](/workflows/executions/custom-executions-data/)

**Syntax:** `$execution.customData`.setAll(obj)

**Source:** Custom n8n functionality

**Parameters:**

* `obj` (Object) - A JavaScript object containing key-value pairs of the data to set

**Examples:**

|  |  |
| --- | --- |
| ``` 1 ``` | ``` $execution.customData.setAll({"user_email": "me@example.com", "id": 1234}) ``` |

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

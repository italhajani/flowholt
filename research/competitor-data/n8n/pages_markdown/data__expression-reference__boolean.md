# Boolean | n8n Docs

Source: https://docs.n8n.io/data/expression-reference/boolean
Lastmod: 2026-04-14
Description: Documentation for n8n, a workflow automation platform.
# Boolean[#](#boolean "Permanent link")

## *`Boolean`*.**`isEmpty()`**[#](#booleanisempty "Permanent link")

**Description:** Returns `false` for all booleans. Returns `true` for `null`.

**Syntax:** *`Boolean`*.isEmpty()

**Returns:** Boolean

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // bool = true bool.isEmpty() // => false ``` |

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // bool = false bool.isEmpty() // => false ``` |

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // bool = null bool.isEmpty() // => true ``` |

## *`Boolean`*.**`toNumber()`**[#](#booleantonumber "Permanent link")

**Description:** Converts `true` to 1 and `false` to 0

**Syntax:** *`Boolean`*.toNumber()

**Returns:** Number

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 ``` | ``` true.toNumber() //=> 1 ``` |

|  |  |
| --- | --- |
| ``` 1 ``` | ``` false.toNumber() //=> 0 ``` |

## *`Boolean`*.**`toString()`**[#](#booleantostring "Permanent link")

**Description:** Converts `true` to the string ‘true’ and `false` to the string ‘false’

**Syntax:** *`Boolean`*.toString()

**Returns:** String

**Source:** JavaScript function

**Examples:**

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // bool = true bool.toString() //=> 'true' ``` |

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // bool = false bool.toString() //=> 'false' ``` |

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

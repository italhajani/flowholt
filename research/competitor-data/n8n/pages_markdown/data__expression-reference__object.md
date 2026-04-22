# Object | n8n Docs

Source: https://docs.n8n.io/data/expression-reference/object
Lastmod: 2026-04-14
Description: Documentation for n8n, a workflow automation platform.
# Object[#](#object "Permanent link")

## *`Object`*.**`compact()`**[#](#objectcompact "Permanent link")

**Description:** Removes all fields that have empty values, i.e. are `null` or `""`

**Syntax:** *`Object`*.compact()

**Returns:** Object

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // obj = {'x':null, 'y':2, 'z':''} obj.compact() //=> {'y':2} ``` |

## *`Object`*.**`hasField()`**[#](#objecthasfield "Permanent link")

**Description:** Returns `true` if there is a field called `name`. Only checks top-level keys. Comparison is case-sensitive.

**Syntax:** *`Object`*.hasField(name)

**Returns:** Boolean

**Source:** Custom n8n functionality

**Parameters:**

* `name` (String) - The name of the key to search for

**Examples:**

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // obj = {'name':'Nathan', 'age':42} obj.hasField('name') //=> true ``` |

|  |  |
| --- | --- |
| ``` 1 2 3 ``` | ``` // obj = {'name':'Nathan', 'age':42} obj.hasField('Name') //=> false obj.hasField('inventedField') //=> false ``` |

## *`Object`*.**`isEmpty()`**[#](#objectisempty "Permanent link")

**Description:** Returns `true` if the Object has no keys (fields) set or is `null`

**Syntax:** *`Object`*.isEmpty()

**Returns:** Boolean

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // obj = {'name': 'Nathan'} obj.isEmpty() //=> false ``` |

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // obj = {} obj.isEmpty() //=> true ``` |

## *`Object`*.**`isNotEmpty()`**[#](#objectisnotempty "Permanent link")

**Description:** Returns `true` if the Object has at least one key (field) set

**Syntax:** *`Object`*.isNotEmpty()

**Returns:** Boolean

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // obj = {'name': 'Nathan'} obj.isNotEmpty() //=> true ``` |

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // obj = {} obj.isNotEmpty() //=> false ``` |

## *`Object`*.**`keepFieldsContaining()`**[#](#objectkeepfieldscontaining "Permanent link")

**Description:** Removes any fields whose values don’t at least partly match the given `value`. Comparison is case-sensitive. Fields that aren’t strings will always be removed.

**Syntax:** *`Object`*.keepFieldsContaining(value)

**Returns:** Object

**Source:** Custom n8n functionality

**Parameters:**

* `value` (String) - The text that a value must contain in order to be kept

**Examples:**

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // obj = {'name': 'Mr Nathan', 'city':'hanoi', age: 42 } obj.keepFieldsContaining('Nathan') //=> {'name': 'Mr Nathan'} ``` |

|  |  |
| --- | --- |
| ``` 1 2 3 ``` | ``` // obj = {'name': 'Mr Nathan', 'city':'hanoi', age: 42 } obj.keepFieldsContaining('nathan') //=> {} obj.keepFieldsContaining('han') //=> {'name': 'Mr Nathan', 'city':'hanoi'} ``` |

## *`Object`*.**`keys()`**[#](#objectkeys "Permanent link")

**Description:** Returns an array with all the field names (keys) the object contains. The same as JavaScript’s `Object.keys(obj)`.

**Syntax:** *`Object`*.keys()

**Returns:** Array

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // obj = {'name': 'Mr Nathan', age: 42 } obj.keys() //=> ['name', 'age'] ``` |

## *`Object`*.**`merge()`**[#](#objectmerge "Permanent link")

**Description:** Merges the two Objects into a single one. If a key (field name) exists in both Objects, the value from the first (base) Object is used.

**Syntax:** *`Object`*.merge(otherObject)

**Returns:** Object

**Source:** Custom n8n functionality

**Parameters:**

* `otherObject` (Object) - The Object to merge with the base Object.

**Examples:**

|  |  |
| --- | --- |
| ``` 1 2 3 ``` | ``` // obj1 = {'name':'Nathan', 'age': 42} // obj2 = {'name':'Jan', 'city': 'hanoi'} obj1.merge(obj2) //=> {'name':'Jan', 'city': 'hanoi', 'age':42} ``` |

## *`Object`*.**`removeField()`**[#](#objectremovefield "Permanent link")

**Description:** Removes a field from the Object. The same as JavaScript’s `delete`.

**Syntax:** *`Object`*.removeField(key)

**Returns:** Object

**Source:** Custom n8n functionality

**Parameters:**

* `key` (String) - The name of the field to remove

**Examples:**

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // obj = {'name':'Nathan', 'city':'hanoi'} obj.removeField('name') //=> {'city':'hanoi'} ``` |

## *`Object`*.**`removeFieldsContaining()`**[#](#objectremovefieldscontaining "Permanent link")

**Description:** Removes keys (fields) whose values at least partly match the given `value`. Comparison is case-sensitive. Fields that aren’t strings are always kept.

**Syntax:** *`Object`*.removeFieldsContaining(value)

**Returns:** Object

**Source:** Custom n8n functionality

**Parameters:**

* `value` (String) - The text that a value must contain in order to be removed

**Examples:**

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // obj = {'name': 'Mr Nathan', 'city':'hanoi', age: 42} obj.removeFieldsContaining('Nathan') //=> {'city':'hanoi', age: 42} ``` |

|  |  |
| --- | --- |
| ``` 1 2 3 ``` | ``` // obj = {'name': 'Mr Nathan', 'city':'hanoi', age: 42} obj.removeFieldsContaining('han') //=> {age: 42} obj.removeFieldsContaining('nathan') //=> {'name': 'Mr Nathan', 'city':'hanoi', age: 42} ``` |

## *`Object`*.**`toJsonString()`**[#](#objecttojsonstring "Permanent link")

**Description:** Converts the Object to a JSON string. Similar to JavaScript’s `JSON.stringify()`.

**Syntax:** *`Object`*.toJsonString()

**Returns:** String

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // obj = {'name':'Nathan', age:42} obj.toJsonString() //=> '{"name":"Nathan","age":42}' ``` |

## *`Object`*.**`urlEncode()`**[#](#objecturlencode "Permanent link")

**Description:** Generates a URL parameter string from the Object’s keys and values. Only top-level keys are supported.

**Syntax:** *`Object`*.urlEncode()

**Returns:** String

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // obj = {'name':'Mr Nathan', 'city':'hanoi'} obj.urlEncode() //=> 'name=Mr+Nathan&city=hanoi' ``` |

## *`Object`*.**`values()`**[#](#objectvalues "Permanent link")

**Description:** Returns an array with all the values of the fields the Object contains. The same as JavaScript’s `Object.values(obj)`.

**Syntax:** *`Object`*.values()

**Returns:** Array

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // obj = {'name': 'Mr Nathan', age: 42 } obj.values() //=> ['Mr Nathan', 42] ``` |

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

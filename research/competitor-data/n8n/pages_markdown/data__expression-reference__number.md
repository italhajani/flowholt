# Number | n8n Docs

Source: https://docs.n8n.io/data/expression-reference/number
Lastmod: 2026-04-14
Description: Documentation for n8n, a workflow automation platform.
# Number[#](#number "Permanent link")

## *`Number`*.**`abs()`**[#](#numberabs "Permanent link")

**Description:** Returns the number’s absolute value, i.e. removes any minus sign

**Syntax:** *`Number`*.abs()

**Returns:** Number

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // x = -1.7 x.abs() //=> 1.7 ``` |

## *`Number`*.**`ceil()`**[#](#numberceil "Permanent link")

**Description:** Rounds the number up to the next whole number

**Syntax:** *`Number`*.ceil()

**Returns:** Number

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // x = 1.234 x.ceil() //=> 2 ``` |

## *`Number`*.**`floor()`**[#](#numberfloor "Permanent link")

**Description:** Rounds the number down to the nearest whole number

**Syntax:** *`Number`*.floor()

**Returns:** Number

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // x = 1.234 x.floor() //=> 1 ``` |

## *`Number`*.**`format()`**[#](#numberformat "Permanent link")

**Description:** Returns a formatted string representing the number. Useful for formatting for a specific language or currency. The same as [`Intl.NumberFormat()`](”https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat”).

**Syntax:** *`Number`*.format(locale?, options?)

**Returns:** String

**Source:** Custom n8n functionality

**Parameters:**

* `locale` (String) - optional - A [locale tag](”https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#locales_argument”) for formatting the number, e.g. `fr-FR`, `en-GB`, `pr-BR`
* `options` (Object) - optional - Configuration options for number formatting. [More info](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat)

**Examples:**

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // number = 123456.789; number.format('de-DE') //=> 123.456,789 ``` |

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // number = 123456.789; number.format('de-DE', {'style': 'currency', 'currency': 'EUR'}) //=> 123.456,79 € ``` |

## *`Number`*.**`isEmpty()`**[#](#numberisempty "Permanent link")

**Description:** Returns `false` for all numbers. Returns `true` for `null`.

**Syntax:** *`Number`*.isEmpty()

**Returns:** Boolean

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // num = 10 num.isEmpty() // => false ``` |

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // num = 0 num.isEmpty() // => false ``` |

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // num = null num.isEmpty() // => true ``` |

## *`Number`*.**`isEven()`**[#](#numberiseven "Permanent link")

**Description:** Returns `true` if the number is even. Throws an error if the number isn’t a whole number.

**Syntax:** *`Number`*.isEven()

**Returns:** Boolean

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // number = 33 number.isEven() //=> false ``` |

## *`Number`*.**`isInteger()`**[#](#numberisinteger "Permanent link")

**Description:** Returns `true` if the number is a whole number

**Syntax:** *`Number`*.isInteger()

**Returns:** Boolean

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // number = 4 number.isInteger() //=> true ``` |

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // number = 4.12 number.isInteger() //=> false ``` |

## *`Number`*.**`isOdd()`**[#](#numberisodd "Permanent link")

**Description:** Returns `true` if the number is odd. Throws an error if the number isn’t a whole number.

**Syntax:** *`Number`*.isOdd()

**Returns:** Boolean

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // number = 33 number.isOdd() //=> true ``` |

## *`Number`*.**`round()`**[#](#numberround "Permanent link")

**Description:** Returns the number rounded to the nearest whole number (or specified number of decimal places)

**Syntax:** *`Number`*.round(decimalPlaces?)

**Returns:** Number

**Source:** Custom n8n functionality

**Parameters:**

* `decimalPlaces` (Number) - optional - The number of decimal places to round to

**Examples:**

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // number = 1.256 number.round() //=> 1 ``` |

|  |  |
| --- | --- |
| ``` 1 2 3 ``` | ``` // number = 1.256 number.round(1) //=> 1.3 number.round(2) //=> 1.26 ``` |

## *`Number`*.**`toBoolean()`**[#](#numbertoboolean "Permanent link")

**Description:** Converts the number to a boolean value. `0` becomes `false`; everything else becomes `true`.

**Syntax:** *`Number`*.toBoolean()

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // number = 12 number.toBoolean() //=> true ``` |

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // number = 0 number.toBoolean() //=> false ``` |

## *`Number`*.**`toDateTime()`**[#](#numbertodatetime "Permanent link")

**Description:** Converts a numerical timestamp into a DateTime. The format of the timestamp must be specified if it’s not in milliseconds. Uses the time zone in n8n (or in the workflow’s settings).

**Syntax:** *`Number`*.toDateTime(format?)

**Returns:** DateTime

**Source:** Custom n8n functionality

**Parameters:**

* `format` (String) - optional - The type of timestamp to convert. Options are `ms` (for Unix timestamp in milliseconds), `s` (for Unix timestamp in seconds) or `excel` (for days since 1900).

**Examples:**

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // ts = 1708695471 ts.toDateTime('s') //=> 2024-02-23T14:37:51+01:00 ``` |

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // ts = 1708695471000 ts.toDateTime('ms') //=> 2024-02-23T14:37:51+01:00 ``` |

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // ts = 45345 ts.toDateTime('excel') //=> 2024-02-23T01:00:00+01:00 ``` |

## *`Number`*.**`toLocaleString()`**[#](#numbertolocalestring "Permanent link")

**Description:** Returns a localised string representing the number, i.e. in the language and format corresponding to its locale. Defaults to the system's locale if none specified.

**Syntax:** *`Number`*.toLocaleString(locales?, options?)

**Returns:** String

**Source:** JavaScript function

**Parameters:**

* `locales` (String|Array) - optional - The locale to assign, e.g. ‘en-GB’ for British English or ‘pt-BR’ for Brazilian Portuguese. See [full list](”https://www.localeplanet.com/icu/”) (unofficial). Also accepts an array of locales. Defaults to the system locale if not specified.
* `options` (Object) - optional - An object with [formatting options](”https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#parameters”)

**Examples:**

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // num = 500000.125 num.toLocaleString() //=> '500,000.125' (if in US English locale) ``` |

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // num = 500000.125 num.toLocaleString('fr-FR') //=> '500 000,125' ``` |

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // num = 500000.125 num.toLocaleString('fr-FR', {style:'currency', currency:'EUR'}) //=> '500 000,13 €' ``` |

## *`Number`*.**`toString()`**[#](#numbertostring "Permanent link")

**Description:** Converts the number to a simple textual representation. For more formatting options, see `toLocaleString()`.

**Syntax:** *`Number`*.toString(radix?)

**Returns:** String

**Source:** JavaScript function

**Parameters:**

* `radix` (Number) - optional - The base to use. Must be an integer between 2 and 36. E.g. base `2` is binary and base `16` is hexadecimal.

**Examples:**

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // num = 500000.125 num.toString() //=> '500000.125' ``` |

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // num = 500000.125 num.toString(16) //=> '7a120.2' ``` |

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

# String | n8n Docs

Source: https://docs.n8n.io/data/expression-reference/string
Lastmod: 2026-04-14
Description: Documentation for n8n, a workflow automation platform.
# String[#](#string "Permanent link")

## *`String`*.**`base64Decode()`**[#](#stringbase64decode "Permanent link")

**Description:** Converts plain text to a base64-encoded string

**Syntax:** *`String`*.base64Encode()

**Returns:** String

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "aGVsbG8=".base64Decode() //=> "hello" ``` |

## *`String`*.**`base64Encode()`**[#](#stringbase64encode "Permanent link")

**Description:** Converts a base64-encoded string to plain text

**Syntax:** *`String`*.base64Encode()

**Returns:** String

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "hello".base64Encode() //=> "aGVsbG8=" ``` |

## *`String`*.**`concat()`**[#](#stringconcat "Permanent link")

**Description:** Joins one or more strings onto the end of the base string. Alternatively, use the `+` operator (see examples).

**Syntax:** *`String`*.concat(string1, string2?, ..., stringN?)

**Returns:** String

**Source:** JavaScript function

**Parameters:**

* `string1` (String) - The first string to append
* `string2` (String) - optional - The second string to append
* `stringN` (String) - optional - The Nth string to append

**Examples:**

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` 'sea'.concat('food') //=> 'seafood' 'sea' + 'food' //=> 'seafood' ``` |

|  |  |
| --- | --- |
| ``` 1 ``` | ``` 'work'.concat('a', 'holic') //=> 'workaholic' ``` |

## *`String`*.**`extractDomain()`**[#](#stringextractdomain "Permanent link")

**Description:** If the string is an email address or URL, returns its domain (or `undefined` if nothing found).

If the string also contains other content, try using `extractEmail()` or `extractUrl()` first.

**Syntax:** *`String`*.extractDomain()

**Returns:** String

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "me@example.com".extractDomain() //=> 'example.com' ``` |

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "http://n8n.io/workflows".extractDomain() //=> 'n8n.io' ``` |

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "It's me@example.com".extractEmail().extractDomain() //=> 'example.com' ``` |

## *`String`*.**`extractEmail()`**[#](#stringextractemail "Permanent link")

**Description:** Extracts the first email found in the string. Returns `undefined` if none is found.

**Syntax:** *`String`*.extractEmail()

**Returns:** String

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "My email is me@example.com".extractEmail() //=> 'me@example.com' ``` |

## *`String`*.**`extractUrl()`**[#](#stringextracturl "Permanent link")

**Description:** Extracts the first URL found in the string. Returns `undefined` if none is found. Only recognizes full URLs, e.g. those starting with `http`.

**Syntax:** *`String`*.extractUrl()

**Returns:** String

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "Check out http://n8n.io".extractUrl() //=> 'http://n8n.io' ``` |

## *`String`*.**`extractUrlPath()`**[#](#stringextracturlpath "Permanent link")

**Description:** Returns the part of a URL after the domain, or `undefined` if no URL found.

If the string also contains other content, try using `extractUrl()` first.

**Syntax:** *`String`*.extractUrlPath()

**Returns:** String

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "http://n8n.io/workflows".extractUrlPath() //=> '/workflows' ``` |

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "Check out http://n8n.io/workflows".extractUrl().extractUrlPath() //=> '/workflows' ``` |

## *`String`*.**`hash()`**[#](#stringhash "Permanent link")

**Description:** Returns the string hashed with the given algorithm. Defaults to md5 if not specified.

**Syntax:** *`String`*.hash(algo?)

**Returns:** String

**Source:** Custom n8n functionality

**Parameters:**

* `algo` (String) - optional - The hashing algorithm to use. One of `md5`, `base64`, `sha1`, `sha224`, `sha256`, `sha384`, `sha512`, `sha3`, `ripemd160`

**Examples:**

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "hello".hash() //=> '5d41402abc4b2a76b9719d911017c592' ``` |

## *`String`*.**`includes()`**[#](#stringincludes "Permanent link")

**Description:** Returns `true` if the string contains the `searchString`. Case-sensitive.

**Syntax:** *`String`*.includes(searchString, start?)

**Returns:** Boolean

**Source:** JavaScript function

**Parameters:**

* `searchString` (String) - The text to search for
* `start` (Number) - optional - The position (index) to start searching from

**Examples:**

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` 'team'.includes('tea') //=> true 'team'.includes('i') //=> false ``` |

|  |  |
| --- | --- |
| ``` 1 2 3 ``` | ``` // Returns false if the case doesn't match, so consider using .toLowerCase() first 'team'.includes('Tea') //=> false 'Team'.toLowerCase().includes('tea') //=> true ``` |

## *`String`*.**`indexOf()`**[#](#stringindexof "Permanent link")

**Description:** Returns the index (position) of the first occurrence of `searchString` within the base string, or -1 if not found. Case-sensitive.

**Syntax:** *`String`*.indexOf(searchString, start?)

**Returns:** Number

**Source:** JavaScript function

**Parameters:**

* `searchString` (String) - The text to search for
* `start` (Number) - optional - The position (index) to start searching from

**Examples:**

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` 'steam'.indexOf('tea') //=> 1 'steam'.indexOf('i') //=> -1 ``` |

|  |  |
| --- | --- |
| ``` 1 2 3 ``` | ``` // Returns -1 if the case doesn't match, so consider using .toLowerCase() first 'STEAM'.indexOf('tea') //=> -1 'STEAM'.toLowerCase().indexOf('tea') //=> 1 ``` |

## *`String`*.**`isDomain()`**[#](#stringisdomain "Permanent link")

**Description:** Returns `true` if the string is a domain

**Syntax:** *`String`*.isDomain()

**Returns:** Boolean

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "n8n.io".isDomain() //=> true ``` |

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "http://n8n.io".isDomain() //=> false ``` |

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "hello".isDomain() //=> false ``` |

## *`String`*.**`isEmail()`**[#](#stringisemail "Permanent link")

**Description:** Returns `true` if the string is an email

**Syntax:** *`String`*.isEmail()

**Returns:** Boolean

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "me@example.com".isEmail() //=> true ``` |

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "It's me@example.com".isEmail() //=> false ``` |

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "hello".isEmail() //=> false ``` |

## *`String`*.**`isEmpty()`**[#](#stringisempty "Permanent link")

**Description:** Returns `true` if the string has no characters or is `null`

**Syntax:** *`String`*.isEmpty()

**Returns:** Boolean

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "".isEmpty() // => true ``` |

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "hello".isEmpty() // => false ``` |

## *`String`*.**`isNotEmpty()`**[#](#stringisnotempty "Permanent link")

**Description:** Returns `true` if the string has at least one character

**Syntax:** *`String`*.isNotEmpty()

**Returns:** Boolean

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "hello".isNotEmpty() // => true ``` |

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "".isNotEmpty() // => false ``` |

## *`String`*.**`isNumeric()`**[#](#stringisnumeric "Permanent link")

**Description:** Returns `true` if the string represents a number

**Syntax:** *`String`*.isNumeric()

**Returns:** Boolean

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "1.2234".isNumeric() // true ``` |

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "hello".isNumeric() // false ``` |

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "123E23".isNumeric() // true ``` |

## *`String`*.**`isUrl()`**[#](#stringisurl "Permanent link")

**Description:** Returns `true` if the string is a valid URL

**Syntax:** *`String`*.isUrl()

**Returns:** Boolean

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "https://n8n.io".isUrl() //=> true ``` |

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "n8n.io".isUrl() //=> false ``` |

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "hello".isUrl() //=> false ``` |

## *`String`*.**`length`**[#](#stringlength "Permanent link")

**Description:** The number of characters in the string

**Syntax:** *`String`*.length

**Returns:** Number

**Source:** JavaScript function

**Examples:**

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "hello".length //=> 5 ``` |

## *`String`*.**`match()`**[#](#stringmatch "Permanent link")

**Description:** Matches the string against a [regular expression](”https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions”). Returns an array containing the first match, or all matches if the `g` flag is set in the regular expression. Returns `null` if no matches are found.

For checking whether text is present, consider `includes()` instead.

**Syntax:** *`String`*.match(regexp)

**Returns:** Array

**Source:** JavaScript function

**Parameters:**

* `regexp` (RegExp) - A [regular expression](”https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions”) with the pattern to look for. Will look for multiple matches if the `g` flag is present (see examples).

**Examples:**

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // Match all words starting with 'r' "rock and roll".match(/r[^ ]*/g) //=> ['rock', 'roll'] ``` |

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // Match first word starting with 'r' (no 'g' flag) "rock and roll".match(/r[^ ]*/) //=> ['rock'] ``` |

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // For case-insensitive, add 'i' flag "ROCK and roll".match(/r[^ ]*/ig) //=> ['ROCK', 'roll'] ``` |

## *`String`*.**`parseJson()`**[#](#stringparsejson "Permanent link")

**Description:** Returns the JavaScript Object or value represented by the string, or `undefined` if the string isn’t valid JSON. Single-quoted JSON is not supported.

**Syntax:** *`String`*.parseJson()

**Returns:** any

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 ``` | ``` '{"name":"Nathan"}'.parseJson() //=> {"name":"Nathan"} ``` |

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "{'name':'Nathan'}".parseJson() //=> undefined ``` |

|  |  |
| --- | --- |
| ``` 1 ``` | ``` 'hello'.parseJson() //=> undefined ``` |

## *`String`*.**`quote()`**[#](#stringquote "Permanent link")

**Description:** Wraps a string in quotation marks, and escapes any quotation marks already in the string. Useful when constructing JSON, SQL, etc.

**Syntax:** *`String`*.quote(mark?)

**Returns:** String

**Source:** Custom n8n functionality

**Parameters:**

* `mark` (String) - optional - The type of quotation mark to use

**Examples:**

|  |  |
| --- | --- |
| ``` 1 ``` | ``` 'Nathan says "hi"'.quote() //=> '"Nathan says \"hi\""' ``` |

## *`String`*.**`removeMarkdown()`**[#](#stringremovemarkdown "Permanent link")

**Description:** Removes any Markdown formatting from the string. Also removes HTML tags.

**Syntax:** *`String`*.removeMarkdown()

**Returns:** String

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "*bold*, [link]()".removeMarkdown() //=> "bold, link" ``` |

## *`String`*.**`removeTags()`**[#](#stringremovetags "Permanent link")

**Description:** Removes tags, such as HTML or XML, from the string

**Syntax:** *`String`*.removeTags()

**Returns:** String

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "<b>bold</b>, <a>link</a>".removeTags() //=> "bold, link" ``` |

## *`String`*.**`replace()`**[#](#stringreplace "Permanent link")

**Description:** Returns a string with the first occurrence of `pattern` replaced by `replacement`.

To replace all occurrences, use `replaceAll()` instead.

**Syntax:** *`String`*.replace(pattern, replacement)

**Returns:** String

**Source:** JavaScript function

**Parameters:**

* `pattern` (String|RegExp) - The pattern in the string to replace. Can be a string to match or a [regular expression](”https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions”).
* `replacement` (String) - The new text to replace with

**Examples:**

|  |  |
| --- | --- |
| ``` 1 ``` | ``` 'Red or blue or green'.replace('or', 'and') //=> 'Red and blue or green' ``` |

|  |  |
| --- | --- |
| ``` 1 2 3 ``` | ``` // A global, case-insensitive replacement: let text = "Mr Blue has a blue house and a blue car"; let result = text.replace(/blue/gi, "red"); ``` |

|  |  |
| --- | --- |
| ``` 1 2 3 4 5 ``` | ``` // A function to return the replacement text: let text = "Mr Blue has a blue house and a blue car"; let result = text.replace(/blue|house|car/i, function (x) {   return x.toUpperCase(); }); ``` |

## *`String`*.**`replaceAll()`**[#](#stringreplaceall "Permanent link")

**Description:** Returns a string with all occurrences of `pattern` replaced by `replacement`

**Syntax:** *`String`*.replaceAll(pattern, replacement)

**Returns:** String

**Source:** JavaScript function

**Parameters:**

* `pattern` (String|RegExp) - The pattern in the string to replace. Can be a string to match or a [regular expression](”https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions”).
* `replacement` (String|function) - The new text to replace with. Can be a string or a function that returns a string (see examples).

**Examples:**

|  |  |
| --- | --- |
| ``` 1 ``` | ``` 'Red or blue or green'.replace('or', 'and') //=> 'Red and blue and green' ``` |

|  |  |
| --- | --- |
| ``` 1 2 3 4 5 6 7 8 ``` | ``` // Uppercase any occurrences of 'blue' or 'car' // (You must include the 'g' flag when using a regex)  // text = 'Mr Blue has a blue car' text.replaceAll(/blue|car/gi, x => x.toUpperCase()) //=> 'Mr BLUE has a BLUE CAR'  // Or with traditional function notation: text.replaceAll(/blue|car/gi, function(x){return x.toUpperCase()}) //=> 'Mr BLUE has a BLUE CAR' ``` |

## *`String`*.**`replaceSpecialChars()`**[#](#stringreplacespecialchars "Permanent link")

**Description:** Replaces special characters in the string with the closest ASCII character

**Syntax:** *`String`*.replaceSpecialChars()

**Returns:** String

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "déjà".replaceSpecialChars() //=> "deja" ``` |

## *`String`*.**`search()`**[#](#stringsearch "Permanent link")

**Description:** Returns the index (position) of the first occurrence of a pattern within the string, or -1 if not found. The pattern is specified using a [regular expression](”https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions”). To use text instead, see `indexOf()`.

**Syntax:** *`String`*.search(regexp)

**Returns:** Number

**Source:** JavaScript function

**Parameters:**

* `regexp` (RegExp) - A [regular expression](”https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions”) with the pattern to look for

**Examples:**

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // Pos of first word starting with 'n' "Neat n8n node".search(/n[^ ]*/) //=> 5 ``` |

|  |  |
| --- | --- |
| ``` 1 2 3 ``` | ``` // Case-insensitive match with 'i' // Pos of first word starting with 'n' or 'N' "Neat n8n node".search(/n[^ ]*/i) //=> 0 ``` |

## *`String`*.**`slice()`**[#](#stringslice "Permanent link")

**Description:** Extracts a fragment of the string at the given position. For more advanced extraction, see `match()`.

**Syntax:** *`String`*.slice(start, end?)

**Returns:** String

**Source:** JavaScript function

**Parameters:**

* `start` (Number) - The position to start from. Positions start at 0. Negative numbers count back from the end of the string.
* `end` (String) - optional - The position to select up to. The character at the end position is not included. Negative numbers select from the end of the string. If omitted, will extract to the end of the string.

**Examples:**

|  |  |
| --- | --- |
| ``` 1 ``` | ``` 'Hello from n8n'.slice(0, 5) //=> 'Hello' ``` |

|  |  |
| --- | --- |
| ``` 1 ``` | ``` 'Hello from n8n'.slice(6) //=> 'from n8n' ``` |

|  |  |
| --- | --- |
| ``` 1 ``` | ``` 'Hello from n8n'.slice(-3) //=> 'n8n' ``` |

## *`String`*.**`split()`**[#](#stringsplit "Permanent link")

**Description:** Splits the string into an array of substrings. Each split is made at the `separator`, and the separator isn’t included in the output.

The opposite of using `join()` on an array.

**Syntax:** *`String`*.split(separator?, limit?)

**Returns:** Array

**Source:** JavaScript function

**Parameters:**

* `separator` (String) - optional - The string (or regular expression) to use for splitting. If omitted, an array with the original string is returned.
* `limit` (Number) - optional - The max number of array elements to return. Returns all elements if omitted.

**Examples:**

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "wind,fire,water".split(",") //=> ['wind', 'fire', 'water'] ``` |

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "me and you and her".split("and") //=> ['me ', ' you ', ' her'] ``` |

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // Split one or more of space, comma and '?' using a regular expression "me? you, and her".split(/[ ,?]+/) //=> ['me', 'you', 'and', 'her'] ``` |

## *`String`*.**`startsWith()`**[#](#stringstartswith "Permanent link")

**Description:** Returns `true` if the string starts with `searchString`. Case-sensitive.

**Syntax:** *`String`*.startsWith(searchString, start?)

**Returns:** Boolean

**Source:** JavaScript function

**Parameters:**

* `searchString` (String) - The text to check against the start of the base string
* `start` (Number) - optional - The position (index) to start searching from

**Examples:**

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` 'team'.startsWith('tea') //=> true 'team'.startsWith('Tea') //=> false ``` |

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // Returns false if the case doesn't match, so consider using .toLowerCase() first 'Team'.toLowerCase().startsWith('tea') //=> true ``` |

## *`String`*.**`substring()`**[#](#stringsubstring "Permanent link")

**Description:** Extracts a fragment of the string at the given position. For more advanced extraction, see `match()`.

**Syntax:** *`String`*.substring(start, end?)

**Returns:** String

**Source:** JavaScript function

**Parameters:**

* `start` (Number) - The position to start from. Positions start at 0.
* `end` (String) - optional - The position to select up to. The character at the end position is not included. If omitted, will extract to the end of the string.

**Examples:**

|  |  |
| --- | --- |
| ``` 1 ``` | ``` 'Hello from n8n'.substring(0, 5) //=> 'Hello' ``` |

|  |  |
| --- | --- |
| ``` 1 ``` | ``` 'Hello from n8n'.substring(6) //=> 'from n8n' ``` |

## *`String`*.**`toBoolean()`**[#](#stringtoboolean "Permanent link")

**Description:** Converts the string to a boolean value. `0`, `false` and `no` resolve to `false`, everything else to `true`. Case-insensitive.

**Syntax:** *`String`*.toBoolean()

**Returns:** Boolean

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "true".toBoolean() //=> true ``` |

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "false".toBoolean() //=> false ``` |

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "0".toBoolean() //=> false ``` |

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "hello".toBoolean() //=> true ``` |

## *`String`*.**`toDateTime()`**[#](#stringtodatetime "Permanent link")

**Description:** Converts the string to a DateTime. Useful for further transformation. Supported formats for the string are ISO 8601, HTTP, RFC2822, SQL and Unix timestamp in milliseconds.

To parse other formats, use  [`DateTime.fromFormat()`](”https://moment.github.io/luxon/api-docs/index.html#datetimefromformat”).

**Syntax:** *`String`*.toDateTime()

**Returns:** DateTime

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "2024-03-29T18:06:31.798+01:00".toDateTime() ``` |

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "Fri, 29 Mar 2024 18:08:01 +0100".toDateTime() ``` |

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "20240329".toDateTime() ``` |

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "1711732132990".toDateTime() ``` |

## *`String`*.**`toJsonString()`**[#](#stringtojsonstring "Permanent link")

**Description:** Prepares the string to be inserted into a JSON object. Escapes any quotes and special characters (e.g. new lines), and wraps the string in quotes.

The same as JavaScript’s `JSON.stringify()`.

**Syntax:** *`String`*.toJsonString()

**Returns:** String

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // str = 'The "best" colours: red\nbrown' str.toJsonString() //=> '"The \\"best\\" colours: red\\nbrown"' ``` |

## *`String`*.**`toLowerCase()`**[#](#stringtolowercase "Permanent link")

**Description:** Converts all letters in the string to lower case

**Syntax:** *`String`*.toLowerCase()

**Returns:** String

**Source:** JavaScript function

**Examples:**

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "I'm SHOUTing".toLowerCase() //=> "i'm shouting" ``` |

## *`String`*.**`toNumber()`**[#](#stringtonumber "Permanent link")

**Description:** Converts a string representing a number to a number. Throws an error if the string doesn’t start with a valid number.

**Syntax:** *`String`*.toNumber()

**Returns:** Number

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "123".toNumber() //=> 123 ``` |

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "1.23E10".toNumber() //=> 12300000000 ``` |

## *`String`*.**`toSentenceCase()`**[#](#stringtosentencecase "Permanent link")

**Description:** Changes the capitalization of the string to sentence case. The first letter of each sentence is capitalized and all others are lowercased.

**Syntax:** *`String`*.toSentenceCase()

**Returns:** String

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "quick! brown FOX".toSentenceCase() //=> "Quick! Brown fox" ``` |

## *`String`*.**`toSnakeCase()`**[#](#stringtosnakecase "Permanent link")

**Description:** Changes the format of the string to snake case. Spaces and dashes are replaced by `_`, symbols are removed and all letters are lowercased.

**Syntax:** *`String`*.toSnakeCase()

**Returns:** String

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "quick brown $FOX".toSnakeCase() //=> "quick_brown_fox" ``` |

## *`String`*.**`toTitleCase()`**[#](#stringtotitlecase "Permanent link")

**Description:** Changes the capitalization of the string to title case. The first letter of each word is capitalized and the others left unchanged. Short prepositions and conjunctions aren’t capitalized (e.g. ‘a’, ‘the’).

**Syntax:** *`String`*.toTitleCase()

**Returns:** String

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "quick a brown FOX".toTitleCase() //=> "Quick a Brown Fox" ``` |

## *`String`*.**`toUpperCase()`**[#](#stringtouppercase "Permanent link")

**Description:** Converts all letters in the string to upper case (capitals)

**Syntax:** *`String`*.toUpperCase()

**Source:** JavaScript function

**Examples:**

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "I'm not angry".toUpperCase() //=> "I'M NOT ANGRY" ``` |

## *`String`*.**`trim()`**[#](#stringtrim "Permanent link")

**Description:** Removes whitespace from both ends of the string. Whitespace includes new lines, tabs, spaces, etc.

**Syntax:** *`String`*.trim()

**Returns:** String

**Source:** JavaScript function

**Examples:**

|  |  |
| --- | --- |
| ``` 1 ``` | ``` '   lonely   '.trim() //=> 'lonely' ``` |

## *`String`*.**`urlDecode()`**[#](#stringurldecode "Permanent link")

**Description:** Decodes a URL-encoded string. Replaces any character codes in the form of `%XX` with their corresponding characters.

**Syntax:** *`String`*.urlDecode(allChars?)

**Returns:** String

**Source:** Custom n8n functionality

**Parameters:**

* `allChars` (Boolean) - optional - Whether to decode characters that are part of the URI syntax (e.g. `=`, `?`)

**Examples:**

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "name%3DNathan%20Automat".urlDecode() //=> "name=Nathan Automat" ``` |

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "name%3DNathan%20Automat".urlDecode(true) //=> "name%3DNathan Automat" ``` |

## *`String`*.**`urlEncode()`**[#](#stringurlencode "Permanent link")

**Description:** Encodes the string so that it can be used in a URL. Spaces and special characters are replaced with codes of the form `%XX`.

**Syntax:** *`String`*.urlEncode(allChars?)

**Returns:** String

**Source:** Custom n8n functionality

**Parameters:**

* `allChars` (Boolean) - optional - Whether to encode characters that are part of the URI syntax (e.g. `=`, `?`)

**Examples:**

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "name=Nathan Automat".urlEncode() //=> "name%3DNathan%20Automat" ``` |

|  |  |
| --- | --- |
| ``` 1 ``` | ``` "name=Nathan Automat".urlEncode(true) //=> "name=Nathan%20Automat" ``` |

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

---
title: "JavaScript in Make | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/block-elements/iml
scraped_at: 2026-04-21T12:41:56.445051Z
---

1. Block elements

# JavaScript in Make

IML is a mustache-like markup language with support for evaluating complex expressions in JavaScript-like syntax. Expressions are written between mustaches: {{body.data}} .

```
{{body.data}}
```

## hashtag Available operators

Algebraic operators

+ , - , * , / , %

```
+
```

```
-
```

```
*
```

```
/
```

```
%
```

Equality operators

== (same as = or === ), != (same as !== )

All equality operations are strict.

```
==
```

```
=
```

```
===
```

```
!=
```

```
!==
```

Relational operators

< , <= , > , >=

```
<
```

```
<=
```

```
>
```

```
>=
```

Logial operators

&& , || , !

```
&&
```

```
||
```

```
!
```

## hashtag Strings inside expressions

You can use ' or " to put strings inside IML expressions:

```
'
```

```
"
```

```
{{'Hello, ' + item.name}}{{"Hello, " + item.name}}
```

## hashtag Conditionals

You can create conditionals with if and ifempty functions:

```
if
```

```
ifempty
```

```
{{if(body.id > 100, body.user, false)}}{{ifempty(body.username, body.user)}}
```

The ifempty function returns a second argument when the first argument is either not defined, null, or an empty string. Otherwise it returns the first argument.

```
ifempty
```

## hashtag Retrieve collection properties

You can use normal JavaScript . (dot) notation to retrieve properties of collections, such as parameters : {{parameters.input.data}} .

```
.
```

```
parameters
```

```
{{parameters.input.data}}
```

If the property name contains spaces or starts with a non-alphabetic character or contains non-alphanumeric characters (except underscore _ ), you can use ` (back ticks) to retrieve such properties: {{headers.`X-HOOK-TYPE`}} or {{parameters.`First Name`}} .

```
_
```

```
`
```

```
{{headers.`X-HOOK-TYPE`}}
```

```
{{parameters.`First Name`}}
```

## hashtag Retrieve array items

You can use normal JavaScript [] bracket notation to retrieve a specific element from an array: {{body.data[2].prop}} . Unlike JavaScript, IML uses 1 to access the first item in an array.

```
[]
```

```
{{body.data[2].prop}}
```

```
1
```

You can also use -1 to access the last element of an array: body.data[-1].prop .

```
-1
```

```
body.data[-1].prop
```

If you need to retrieve a property of an object and the property name is contained in a variable or computed, the dot . notation will not work. For this, you can use the get function, where the first argument of the function is the object you wish to retrieve the property from, and the second argument is the property name, or a variable containing a property name, or an expression that resolves to a property name: get(body.data, 'some property') , get(body, parameters.fieldName) , get(body.data, if(body.xml == true, 'xml', 'json'))

```
.
```

```
get
```

```
get(body.data, 'some property')
```

```
get(body, parameters.fieldName)
```

```
get(body.data, if(body.xml == true, 'xml', 'json'))
```

## hashtag Built-in IML functions

There are many built-in IML functions.

### hashtag General functions

get()

```
get()
```

Returns the value path of an object or array. To access nested objects, use dot notation. The first item in an array is index 1.

if()

```
if()
```

Returns value 1 if the expression is evaluated to be true. Otherwise, it returns value 2.

ifempty()

```
ifempty()
```

Returns value 1 if this value is not empty. Otherwise, it returns value 2.

switch()

```
switch()
```

Evaluates one value (called the expression) against a list of values, and returns the result corresponding to the first matching value.

omit()

```
omit()
```

Removes elements with the given keys from a collection. Returns a collection with the remaining elements. Useful when you want to pass a collection to an API, which expects an exact number of elements in the collection. Using this function, you can make sure your collection meets the requirements of the API.

pick()

```
pick()
```

Picks elements with the given keys from a collection. Returns a collection that contains only the picked elements. Useful when you want to pass a collection to an API, which expects an exact number of elements in the collection. Using this function, you can make sure your collection meets the requirements of the API.

### hashtag String functions

ascii()

```
ascii()
```

Removes all non-ascii characters from a text string.

base64()

```
base64()
```

Transforms text to base64.

capitalize()

```
capitalize()
```

Converts the first character in a text string to uppercase.

contains()

```
contains()
```

Verifies if text contains the search string.

decodeURL()

```
decodeURL()
```

Decodes special characters in URL to text.

encodeURL()

```
encodeURL()
```

Encodes special characters in a text to a valid URL address.

escapeHTML()

```
escapeHTML()
```

Escapes all HTML tags in text.

escapeMarkdown()

```
escapeMarkdown()
```

Escapes all Markdown tags in text.

indexOf()

```
indexOf()
```

Returns the position of the first occurrence of a specified value in a string. This method returns '-1' if the value searched for never occurs.

length()

```
length()
```

Returns the length of a text string (number of characters) or binary buffer (buffer size in bytes).

lower()

```
lower()
```

Converts all alphabetical characters in a text string to lowercase.

md5()

```
md5()
```

Calculates the md5 hash of a string.

mime()

```
mime()
```

Gets MIME Type of the file from its filename with extension.
E.g. calling mime(picture.png) will return image/png MIME Type.

replace()

```
replace()
```

Replaces the search string with the new string.

replaceEmojiCharacters()

```
replaceEmojiCharacters()
```

Replaces emoji characters with the new string.

sha1()

```
sha1()
```

Calculates the sha1 hash of a string. If the key argument is specified, sha1 HMAC hash is returned instead. Supported encodings: hex (default), base64, or latin1 .

sha256()

```
sha256()
```

Calculates the sha256 hash of a string. If the key argument is specified, sha256 HMAC hash is returned instead. Supported encodings: hex (default), base64, or latin1 .

sha512()

```
sha512()
```

Calculates the sha512 hash of a string. If the key argument is specified, sha512 HMAC hash is returned instead. Supported encodings: hex (default), base64, or latin1 . Supported key encodings: text (default), hex , base64, or binary . When using binary key encoding, a key must be a buffer, not a string.

split()

```
split()
```

Splits a string into an array of strings by separating the string into substrings.

startcase()

```
startcase()
```

Capitalizes the first letter of every word and lower cases of all other letters.

stripHTML()

```
stripHTML()
```

Removes all HTML tags from text.

substring()

```
substring()
```

Returns a portion of a text string between the "start" position and "the end" position.

toBinary()

```
toBinary()
```

Converts any value to binary data. You can also specify encoding as a second argument to apply binary conversions from hex or base64 to binary data.

toString()

```
toString()
```

Converts any value to a string.

trim()

```
trim()
```

Removes space characters at the start or end of the text.

upper()

```
upper()
```

Converts all alphabetical characters in a text string to uppercase.

### hashtag Array functions

add()

```
add()
```

Adds values specified in parameters to an array and returns that array.

contains()

```
contains()
```

Verifies if an array contains the value.

deduplicate()

```
deduplicate()
```

Removes duplicates from an array.

distinct()

```
distinct()
```

Removes duplicates inside an array. Use the key argument to access properties inside complex objects. To access nested properties, use dot notation. The first item in an array is index 1.

first()

```
first()
```

Returns the first element of an array.

flatten()

```
flatten()
```

Creates a new array with all sub-array elements concatenated into it recursively up to the specified depth.

join()

```
join()
```

Concatenates all the items of an array into a string, using a specified separator between each item.

keys()

```
keys()
```

Returns an array of a given object's or array's properties.

last()

```
last()
```

Returns the last element of an array.

length()

```
length()
```

Returns the number of items in an array.

map()

```
map()
```

Returns a primitive array containing values of a complex array. Allows filtering values. Use raw variable names for keys.

merge()

```
merge()
```

Merges two or more arrays into one array.

remove()

```
remove()
```

Removes values specified in the parameters of an array. Effective only in the case of primitive arrays of text or numbers.

reverse()

```
reverse()
```

The first element of the array becomes the last element and vice versa.

shuffle()

```
shuffle()
```

Shuffles (randomly reorders) elements of an array.

slice()

```
slice()
```

Returns a new array containing only selected items.

sort()

```
sort()
```

Sorts values of an array.

toArray()

```
toArray()
```

Converts a collection into an array of key-value collections.

toCollection()

```
toCollection()
```

Converts an array containing objects with key-value pairs into a collection.

### hashtag Date & Time functions

formatDate()

```
formatDate()
```

Formats a date into a specific format, e.g. 'YYYY-MM-DD' .

```
'YYYY-MM-DD'
```

parseDate()

```
parseDate()
```

Parses a date in a specific format, e.g. 'YYYY-MM-DD HH:mm' .

```
'YYYY-MM-DD HH:mm'
```

addDays()

```
addDays()
```

Returns a new date as a result of adding a given number of days to a date. To subtract days, enter a negative number.

addHours()

```
addHours()
```

Returns a new date as a result of adding a given number of hours to date. To subtract hours, enter a negative number.

addMinutes()

```
addMinutes()
```

Returns a new date as a result of adding a given number of minutes to date. To subtract minutes, enter a negative number.

addMonths()

```
addMonths()
```

Returns a new date as a result of adding a given number of months to date. To subtract months, enter a negative number.

addSeconds()

```
addSeconds()
```

Returns a new date as a result of adding a given number of seconds to date. To subtract seconds, enter a negative number.

addYears()

```
addYears()
```

Returns a new date as a result of adding a given number of years to date. To subtract years, enter a negative number.

setSecond()

```
setSecond()
```

Returns a new date with the seconds specified in parameters. Accepts numbers from 0 to 59. If a number is given outside of this range, it will return the date with the seconds from the previous or subsequent minute(s), accordingly.

setMinute()

```
setMinute()
```

Returns a new date with the minutes specified in parameters. Accepts numbers from 0 to 59. If a number is given outside of this range, it will return the date with the minutes from the previous or subsequent hour(s), accordingly.

setHour()

```
setHour()
```

Returns a new date with the hour specified in parameters. Accepts numbers from 0 to 59. If a number is given outside of this range, it will return the date with the hour from the previous or subsequent day(s), accordingly.

setDay()

```
setDay()
```

Returns a new date with the day specified in parameters. It can be used to set the day of the week, with Sunday as 1 and Saturday as 7. If the given value is from 1 to 7, the resulting date will be within the current (Sunday-to-Saturday) week. If a number is given outside of the range, it will return the day from the previous or subsequent week(s), accordingly.

setDate()

```
setDate()
```

Returns a new date with the day of the month specified in parameters. Accepts numbers from 1 to 31. If a number is given outside of the range, it will return the day from the previous or subsequent month(s), accordingly.

setMonth()

```
setMonth()
```

Returns a new date with the month specified in parameters. Accepts numbers from 1 to 12. If a number is given outside of this range, it will return the month in the previous or subsequent year(s), accordingly.

setYear()

```
setYear()
```

Returns a new date with the year specified in parameters.

### hashtag Math functions

abs()

```
abs()
```

Returns the absolute value of an integer.

average()

```
average()
```

Returns the average value of the numeric values in a specific array, or the average value of numerical values entered individually.

ceil()

```
ceil()
```

Returns the smallest integer greater than or equal to a specified number.

floor()

```
floor()
```

Returns the largest integer less than or equal to a specified number.

formatNumber()

```
formatNumber()
```

Returns a number in the requested format. A decimal point is, by default, Thousands separator is, by default.

max()

```
max()
```

Returns the largest number in a specified array, or the largest number among numbers entered individually.

median()

```
median()
```

Returns the median of the values in a specified array, or the median of numbers entered individually.

min()

```
min()
```

Returns the smallest number in a specified array, or the smallest number among numbers entered individually.

parseNumber()

```
parseNumber()
```

Parses a string with a number and returns the number.

round()

```
round()
```

Rounds a numeric value to the nearest integer.

stdevP()

```
stdevP()
```

Returns the standard deviation of a specified array of population values, or the standard deviation of numbers entered individually.

sum()

```
sum()
```

Returns the sum of the values in a specified array, or the sum of numbers entered individually.

trunc()

```
trunc()
```

Truncates a number to an integer by removing the fractional part of the number.

### hashtag JSON functions

createJSON()

```
createJSON()
```

Creates a JSON string inside a JSON object.

parseJSON()

```
parseJSON()
```

Parses a JSON string inside a JSON object.

In the custom functions, the JSON.stringify() or JSON.parse() functions should be used instead of createJSON() or parseJSON() .

```
JSON.stringify()
```

```
JSON.parse()
```

```
createJSON()
```

```
parseJSON()
```

See also Custom IML Functions

Last updated 5 months ago

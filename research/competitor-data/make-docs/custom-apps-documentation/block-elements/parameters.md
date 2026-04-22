---
title: "Parameters | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/block-elements/parameters
scraped_at: 2026-04-21T12:41:55.563980Z
---

1. Block elements

# Parameters

## hashtag Common settings

These settings are standard common settings for all types of parameters.

```
{"name":<String>,"label":<String>,"help":<String>,"required":<Boolean>,//default: false"default":<Object>,"advanced":<Boolean>//default: false}
```

### hashtag name

- Type: String
- Required
- An internal parameter name. This is the key to access the value in the resulting object.
- Can contain arbitrary characters.
- Avoid setting it to any of the Make reserved words .

Type: String

```
String
```

Required

An internal parameter name. This is the key to access the value in the resulting object.

Can contain arbitrary characters.

Avoid setting it to any of the Make reserved words .

### hashtag label

- Type: String
- What the user sees in the UI instead of the parameter name.

Type: String

```
String
```

What the user sees in the UI instead of the parameter name.

### hashtag help

- Type: String
- A more detailed description about the parameter and/or how to use it. Used when the label alone is insufficient.

Type: String

```
String
```

A more detailed description about the parameter and/or how to use it. Used when the label alone is insufficient.

### hashtag type

- Type: String
- Required
- Type of the parameter. Each type has its own documentation page.
- Always enter types in lowercase.
- Available types of parameters are: Array - An array of items of the same type Boolean - A true or false value Buffer - A binary buffer (file data) Cert - A certificate in PEM format Collection - An object with key: value pairs Color - Hexadecimal color input Date - Date or date with time (ISO 8601) Email - Allows only a valid email address to be filled in File - A file selection for use with RPCs Filename - A file name with extension Filter - An advanced parameter used for filtering Folder - A folder selection for use with RPCs Hidden - A parameter that is hidden from the user Integer - A whole number JSON - A valid JSON string Number - A number that can include a decimal or fractional parts Password - Marks passwords and secrets when creating a connection to avoid exposing them Path - A path to a file or a folder Pkey - A private key in PEM format Port - A whole number in the range from 1 to 65535 Select - A selection from predefined values (dropdown or checkboxes) Text - A plain text value Time - Time in hh:mm format Timestamp - A timestamp in Unix epoch format (number of second since 01/01/1970 00:00:00 UTC) Timezone - A time zone name in IANA ID format (e.g. Europe/Prague) Uinteger - A positive whole number, 0 and above URL - A URL address UUID - UUID

Type: String

```
String
```

Required

Type of the parameter. Each type has its own documentation page.

Always enter types in lowercase.

Available types of parameters are:

- Array - An array of items of the same type
- Boolean - A true or false value
- Buffer - A binary buffer (file data)
- Cert - A certificate in PEM format
- Collection - An object with key: value pairs
- Color - Hexadecimal color input
- Date - Date or date with time (ISO 8601)
- Email - Allows only a valid email address to be filled in
- File - A file selection for use with RPCs
- Filename - A file name with extension
- Filter - An advanced parameter used for filtering
- Folder - A folder selection for use with RPCs
- Hidden - A parameter that is hidden from the user
- Integer - A whole number
- JSON - A valid JSON string
- Number - A number that can include a decimal or fractional parts
- Password - Marks passwords and secrets when creating a connection to avoid exposing them
- Path - A path to a file or a folder
- Pkey - A private key in PEM format
- Port - A whole number in the range from 1 to 65535
- Select - A selection from predefined values (dropdown or checkboxes)
- Text - A plain text value
- Time - Time in hh:mm format
- Timestamp - A timestamp in Unix epoch format (number of second since 01/01/1970 00:00:00 UTC)
- Timezone - A time zone name in IANA ID format (e.g. Europe/Prague)
- Uinteger - A positive whole number, 0 and above
- URL - A URL address
- UUID - UUID

Array - An array of items of the same type

Boolean - A true or false value

```
true
```

```
false
```

Buffer - A binary buffer (file data)

Cert - A certificate in PEM format

Collection - An object with key: value pairs

```
key: value
```

Color - Hexadecimal color input

Date - Date or date with time (ISO 8601)

Email - Allows only a valid email address to be filled in

File - A file selection for use with RPCs

Filename - A file name with extension

Filter - An advanced parameter used for filtering

Folder - A folder selection for use with RPCs

Hidden - A parameter that is hidden from the user

Integer - A whole number

JSON - A valid JSON string

Number - A number that can include a decimal or fractional parts

Password - Marks passwords and secrets when creating a connection to avoid exposing them

Path - A path to a file or a folder

Pkey - A private key in PEM format

Port - A whole number in the range from 1 to 65535

Select - A selection from predefined values (dropdown or checkboxes)

Text - A plain text value

Time - Time in hh:mm format

```
hh:mm
```

Timestamp - A timestamp in Unix epoch format (number of second since 01/01/1970 00:00:00 UTC)

Timezone - A time zone name in IANA ID format (e.g. Europe/Prague)

Uinteger - A positive whole number, 0 and above

URL - A URL address

UUID - UUID

### hashtag mappable

- Type: Boolean
- Default: true
- Specifies if the user can map a value to the field by inputting a value from another module, manually typing it, or using functions. When set to false , the user can only select a value instead. Used for types such as select or boolean .

Type: Boolean

```
Boolean
```

Default: true

```
true
```

Specifies if the user can map a value to the field by inputting a value from another module, manually typing it, or using functions. When set to false , the user can only select a value instead. Used for types such as select or boolean .

```
false
```

```
select
```

```
boolean
```

### hashtag editable

This property should only be used in Connection parameters. For module parameters, use mappable instead.

```
mappable
```

- Type: Boolean
- Default: false
- Specifies if the parameter is editable. Use this property to set parameters that should be possible to change when users want to update a connection.

Type: Boolean

```
Boolean
```

Default: false

```
false
```

Specifies if the parameter is editable. Use this property to set parameters that should be possible to change when users want to update a connection.

### hashtag required

- Type: Boolean
- Default: false
- Specifies if the parameter is required. The module will show an error when the user tries to save it without providing all the required parameters.

Type: Boolean

```
Boolean
```

Default: false

```
false
```

Specifies if the parameter is required. The module will show an error when the user tries to save it without providing all the required parameters.

### hashtag default

- Type: The same type as the parameter
- Specifies the default value of the parameter.

Type: The same type as the parameter

```
The same type as the parameter
```

Specifies the default value of the parameter.

### hashtag advanced

- Type: Boolean
- Default: false
- Specifies if the parameter is advanced or not. Advanced parameters are hidden by default and can be shown by selecting a checkbox in the module UI. Advanced parameters should be put at the end of the list, for better UX.

Type: Boolean

```
Boolean
```

Default: false

```
false
```

Specifies if the parameter is advanced or not. Advanced parameters are hidden by default and can be shown by selecting a checkbox in the module UI. Advanced parameters should be put at the end of the list, for better UX.

## hashtag Advanced Settings

### hashtag disabled

- Type: Boolean
- Default: false
- If set to true , the field is disabled by default.

Type: Boolean

```
Boolean
```

Default: false

```
false
```

If set to true , the field is disabled by default.

```
true
```

### hashtag rpc

- Type: Object
- Adds an extra button to the field which opens an extra form. When the form is submitted, a specified RPC is called and the result is set as a new value of the parameter. When the RPC outputs an array, the options are shown to the user so they can pick which one to map.

Type: Object

```
Object
```

Adds an extra button to the field which opens an extra form. When the form is submitted, a specified RPC is called and the result is set as a new value of the parameter. When the RPC outputs an array, the options are shown to the user so they can pick which one to map.

Available parameters:

label

```
label
```

string

The text which is displayed on the button.

url

```
url
```

string

The URL of the RPC to be called. rpc://myRpcName

```
rpc://myRpcName
```

parameters

```
parameters
```

array

An array of parameters for the RPC form. Uses regular parameters syntax.

### hashtag semantic

- Type: String
- Specification of a semantic type
- Formatted as type : meaning . Commonly used values: file:data and file:name , to enable easy mapping of files.

Type: String

```
String
```

Specification of a semantic type

Formatted as type : meaning . Commonly used values: file:data and file:name , to enable easy mapping of files.

```
type
```

```
meaning
```

```
file:data
```

```
file:name
```

Last updated 5 months ago

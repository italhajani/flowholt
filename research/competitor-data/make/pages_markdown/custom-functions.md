# Custom functions - Help Center

Source: https://help.make.com/custom-functions
Lastmod: 2026-01-15T18:01:45.387Z
Description: Create custom JavaScript functions to transform data in your scenarios
Explore more

Functions

# Custom functions

15 min

This feature is available to Enterprise customers.

Custom functions allow you to enhance the built-in data transformation capabilities available in the scenario﻿ designer.

Custom functions are created using JavaScript.

﻿Make﻿ supports the infrastructure and system behavior that takes care of managing and using custom functions. However, our customer care team cannot provide support on how to write and debug your own custom functions.

## Create and manage custom functions

You create and manage custom functions in the Functions section.

Custom functions belong to a team. All users with the Team Member role can view and use custom functions. To create and edit custom functions, you need to have the Team Admin role.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/ENU6-_D42gRr4onKWQjHT-20251015-102144.png?format=webp "Document image")

﻿

To create a new custom function:

1

In the left sidebar, click **Functions** (or the **three dots > Functions**).

2

Click **+** **Add a function**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/RtRSZGYyyGxkE5Y8mYXhB-20251015-102304.png?format=webp "Document image")

﻿

3

Enter a **Name** and a **Description**. The name and description will appear in the list of functions available in the scenario designer.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/R5IMgwdnXEdoXIoh-QDgy-20251015-102353.png "Document image")

﻿

4

Click **Save**.

5

Write the code of the function. Use the keyword return to define the return value.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/rU2pWtJJI8uYL7e34ECxS-20251015-102850.png?format=webp "Document image")

﻿

6

Click **Save**.

When you save the function for the first time, it immediately becomes available in the scenario designer. Custom functions are marked with an icon to distinguish them from the built-in functions.

## Basic structure of custom functions

The structure of custom functions reflects the structure of regular JavaScript functions. Each function must contain the following:

* Function header - the name of the function and the parameters it accepts.

* Function body enclosed in curly brackets.

* Exactly one return statement.

## Supported languages

Custom functions support [JavaScript ES6](https://www.w3schools.com/js/js_es6.asp "JavaScript ES6"). No 3rd party libraries are supported.

The code runs on Make﻿'s back end. This means that we do not support functionality that only makes sense in the context of writing browser-executed JavaScript.

## Validation of custom functions

﻿Make﻿ does not validate the code of your functions. If there are errors in your code, they will appear as errors in the execution of scenarios that use these functions. Invalid functions will cause your scenarios to fail.

## Limitations of custom functions

The following limits apply to all custom functions that you create:

* A single custom function can't run for more than 300 milliseconds.

* The code of a custom function cannot have more than 5000 characters.

* Functions must be synchronous. You can't run asynchronous code in your functions.

* You can't make HTTP requests from your functions.

* You can't call other custom functions from inside of a custom function.

* You can't use recursion in your custom functions.

* In order to use a custom variable with an iterator, you need to:

* Set the value with the custom function in a **Set Variable** module before the **Iterator**.

* Map the output of the **Set Variable** to the **Iterator**.

## Custom functions version history

Every time you save a custom function, the system creates a new history record. This allows you to compare versions and revert your function to a previous version.

Select the function, and switch to its **History** tab:

* Select a history record to compare the function with the previous version. You can only compare two consecutive versions.

* Click **Restore this version** to revert to the version that you're currently viewing. This creates a new version of the function with the content of the restored version.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/zmRHpsRGZRMqrujFhX9C2-20251015-103312.png?format=webp "Document image")

﻿

## Work with dates inside custom functions

Custom functions are executed on Make﻿'s servers. Therefore, whenever you work with dates inside a function, the dates will take into account the time zone set for your organization.

## Call built-in functions from inside of your custom functions

You can use Make﻿'s built-in functions in your custom function code.

Built-in functions are available as methods of the iml object.

The following example uses the Length built-in function.

Text

1function useBuiltInFunction(text){
2 return iml.length(text);
3}

function useBuiltInFunction(text){
    return iml.length(text);
}
/\*\*
\* Reset the text fill color so that placeholder is visible
\*/
.npm\_\_react-simple-code-editor\_\_textarea:empty {
-webkit-text-fill-color: inherit !important;
}
/\*\*
\* Hack to apply on some CSS on IE10 and IE11
\*/
@media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
/\*\*
\* IE doesn't support '-webkit-text-fill-color'
\* So we use 'color: transparent' to make the text transparent on IE
\* Unlike other browsers, it doesn't affect caret color in IE
\*/
.npm\_\_react-simple-code-editor\_\_textarea {
color: transparent !important;
}
.npm\_\_react-simple-code-editor\_\_textarea::selection {
background-color: #accef7 !important;
color: transparent !important;
}
}

﻿

## Debug custom functions

You can execute your custom function code in the debug console, which is located under the code editor.

## Delete custom functions

To delete your custom function:

1

In the left sidebar, click **Functions** (or the **three dots > Functions**).

2

Click the **three dots > Delete** next to the function you want to delete.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/sjgnOnLjBUjZRUZzFXGr5-20251015-104015.png?format=webp "Document image")

﻿

3

Before you delete a function, click the **three dots > Edit** next to it and then switch to the **Scenarios** tab. Here, you can check in which scenarios the function is used.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/l1ssophkALW493HGS_dY8-20251015-105506.png "Document image")

﻿

When you delete a function that is used in a scenario, the scenario will fail to execute on its next run.

The scenario that uses the deleted function will fail with the following error message:

Failed to map '<field name>': Function '<function name>' not found!

## Examples

### Hello world

Returns the string "Hello world."

Text

1function helloWorld()
2{
3 return "Hello world!";
4}

function helloWorld()
{
    return "Hello world!";
}
/\*\*
\* Reset the text fill color so that placeholder is visible
\*/
.npm\_\_react-simple-code-editor\_\_textarea:empty {
-webkit-text-fill-color: inherit !important;
}
/\*\*
\* Hack to apply on some CSS on IE10 and IE11
\*/
@media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
/\*\*
\* IE doesn't support '-webkit-text-fill-color'
\* So we use 'color: transparent' to make the text transparent on IE
\* Unlike other browsers, it doesn't affect caret color in IE
\*/
.npm\_\_react-simple-code-editor\_\_textarea {
color: transparent !important;
}
.npm\_\_react-simple-code-editor\_\_textarea::selection {
background-color: #accef7 !important;
color: transparent !important;
}
}

﻿

### Count the number of working days in a month

Calculates how many working days there are in the month specified by the month's number and a year in the function's arguments. Does not take into account local holidays.

Text

1function numberOfWorkingDays(month, year) {
2 let counter = 0;
3 let date = new Date(year, month - 1, 1);
4 const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
5
6 while (date.getTime() < endDate.getTime()) {
7 const weekDay = date.getDay();
8 if (weekDay !== 0 && weekDay !== 6) {
9 counter += 1;
10 }
11 date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
12 }
13 return counter;
14}

function numberOfWorkingDays(month, year) {
let counter = 0;
let date = new Date(year, month - 1, 1);
const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
while (date.getTime() < endDate.getTime()) {
const weekDay = date.getDay();
if (weekDay !== 0 && weekDay !== 6) {
counter += 1;
}
date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
}
return counter;
}
/\*\*
\* Reset the text fill color so that placeholder is visible
\*/
.npm\_\_react-simple-code-editor\_\_textarea:empty {
-webkit-text-fill-color: inherit !important;
}
/\*\*
\* Hack to apply on some CSS on IE10 and IE11
\*/
@media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
/\*\*
\* IE doesn't support '-webkit-text-fill-color'
\* So we use 'color: transparent' to make the text transparent on IE
\* Unlike other browsers, it doesn't affect caret color in IE
\*/
.npm\_\_react-simple-code-editor\_\_textarea {
color: transparent !important;
}
.npm\_\_react-simple-code-editor\_\_textarea::selection {
background-color: #accef7 !important;
color: transparent !important;
}
}

﻿

### Calculate the number of days between two dates

Calculates the number of days between two dates passed to the function as arguments.

Text

1function numberOfDays(start, end) {
2 const startDate = new Date(start);
3 const endDate = new Date(end);
4 return Math.abs((startDate.getTime() - endDate.getTime()) / (1000 \* 60 \* 60 \* 24));
5}

function numberOfDays(start, end) {
const startDate = new Date(start);
const endDate = new Date(end);
return Math.abs((startDate.getTime() - endDate.getTime()) / (1000 \* 60 \* 60 \* 24));
}
/\*\*
\* Reset the text fill color so that placeholder is visible
\*/
.npm\_\_react-simple-code-editor\_\_textarea:empty {
-webkit-text-fill-color: inherit !important;
}
/\*\*
\* Hack to apply on some CSS on IE10 and IE11
\*/
@media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
/\*\*
\* IE doesn't support '-webkit-text-fill-color'
\* So we use 'color: transparent' to make the text transparent on IE
\* Unlike other browsers, it doesn't affect caret color in IE
\*/
.npm\_\_react-simple-code-editor\_\_textarea {
color: transparent !important;
}
.npm\_\_react-simple-code-editor\_\_textarea::selection {
background-color: #accef7 !important;
color: transparent !important;
}
}

﻿

### Randomization: return a random greeting from an array of greetings

Accepts an array as an argument. Returns a random item from the array.

Text

1function randomGreeting(greetings) {
2 const index = Math.floor(Math.random() \* greetings.length);
3 return greetings[index];
4}

function randomGreeting(greetings) {
const index = Math.floor(Math.random() \* greetings.length);
return greetings[index];
}
/\*\*
\* Reset the text fill color so that placeholder is visible
\*/
.npm\_\_react-simple-code-editor\_\_textarea:empty {
-webkit-text-fill-color: inherit !important;
}
/\*\*
\* Hack to apply on some CSS on IE10 and IE11
\*/
@media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
/\*\*
\* IE doesn't support '-webkit-text-fill-color'
\* So we use 'color: transparent' to make the text transparent on IE
\* Unlike other browsers, it doesn't affect caret color in IE
\*/
.npm\_\_react-simple-code-editor\_\_textarea {
color: transparent !important;
}
.npm\_\_react-simple-code-editor\_\_textarea::selection {
background-color: #accef7 !important;
color: transparent !important;
}
}

﻿

﻿

Updated 15 Jan 2026

Did this page help you?

Yes

No

[PREVIOUS

Array functions](/array-functions "Array functions")[NEXT

Securing data with Make](/securing-data-with-make "Securing data with Make")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

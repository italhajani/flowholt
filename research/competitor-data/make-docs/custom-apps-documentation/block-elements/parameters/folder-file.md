---
title: "Folder, File | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/block-elements/parameters/folder-file
scraped_at: 2026-04-21T12:45:02.427501Z
description: "A folder or file selection for use with RPCs"
---

1. Block elements chevron-right
2. Parameters

# Folder, File

A folder or file selection for use with RPCs

To choose a file instead of a folder, the desired option has to contain "file": true . When the field type is file , the file is required and only the folder is passed, the validation will fail.

```
"file": true
```

```
file
```

## hashtag Specification

### hashtag options

Available types :

string

The URL of an RPC returning the list of folders or files.

object

A detailed configuration of the folder/file list.

Available parameters :

store

string

The URL of an RPC returning the list of folders or files.

ids

Boolean

If set to true , you can work with folder IDs. The GUI loads previously selected folders and their labels after reopening the form without having to call the RPC again.

```
true
```

showRoot

Boolean

Default: true . If set to false , top-level folders aren't prefixed with / and there's no option to choose the root / . When the type is file , the root selection is blocked automatically.

```
true
```

```
false
```

```
/
```

```
/
```

```
file
```

singleLevel

Boolean

Default: false . If set to true , only a single level of folders is available.

```
false
```

```
true
```

## hashtag Examples

### hashtag Result of RPC

To display the folder/file selector properly, the output from your RPC should contain only objects matching the following samples.

#### hashtag option

Available parameters:

label

string

The label to be displayed.

value

string

The value of an option that will be used in code.

file

Boolean

Boolean to determine if the option is a file or a folder.

### hashtag Folder selection

To make your folder selection work properly, you need to create a remote procedure that will return the corresponding folders. Each time a folder is selected, the RPC is called and the parameter path containing the whole path in the string is passed. You need to filter the folders inside this RPC.

```
path
```

As you can see, this RPC will be called repeatedly each time the next item is chosen. The passed parameter ( parameters.home in our case) will contain the full path, not only the last item. If you want to get only the last item, you should consider using a split IML function.

```
parameters.home
```

```
split
```

Because the folder path could contain slashes ( / ) which are also part of the URL, you may need to escape it using escapeURL IML function before sending the path in query string.

```
/
```

```
escapeURL
```

If the endpoint returns files too, you need to create a container and set condition in iterate directive. See the iterate collection below.

```
container
```

```
condition
```

```
iterate
```

```
iterate
```

First call (no folders chosen yet)

Second call (passed path: /home)

### hashtag File selection

The file selection is very similar to the folder selection, but files in your RPC result have to contain the "file": true property. Each time a file is selected, the RPC is called and the parameter path containing the whole path in the string is passed. You need to filter the folders and files inside this RPC.

```
"file": true
```

```
path
```

The implementation of this RPC is quite similar to the getFolders RPC above. This RPC is called repeatedly each time the next item is chosen until the type of item is file .

```
getFolders
```

```
file
```

Don't forget to check whether the item is file or folder and to set the file property correctly inside the iterate directive.

```
file
```

```
iterate
```

Here you can see how to get the last item from the path . Some APIs may require the last directory as an input for getting a list of contents of that directory.

```
path
```

First call

Second call

Last updated 5 months ago

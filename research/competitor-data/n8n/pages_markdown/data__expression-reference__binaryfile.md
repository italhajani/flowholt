# BinaryFile | n8n Docs

Source: https://docs.n8n.io/data/expression-reference/binaryfile
Lastmod: 2026-04-14
Description: Documentation for n8n, a workflow automation platform.
# BinaryFile[#](#binaryfile "Permanent link")

## `binaryFile`.**`directory`**[#](#binaryfiledirectory "Permanent link")

**Description:** The path to the directory that the file is stored in. Useful for distinguishing between files with the same name in different directories. Not set if n8n is configured to store files in its database.

**Syntax:** `binaryFile`.**`directory`**

**Returns:** String

**Source:** Custom n8n functionality

## `binaryFile`.**`fileExtension`**[#](#binaryfilefileextension "Permanent link")

**Description:** The suffix attached to the filename (e.g. `txt`)

**Syntax:** `binaryFile`.**`fileExtension`**

**Returns:** String

**Source:** Custom n8n functionality

## `binaryFile`.**`fileName`**[#](#binaryfilefilename "Permanent link")

**Description:** The name of the file, including extension

**Syntax:** `binaryFile`.**`fileName`**

**Returns:** String

**Source:** Custom n8n functionality

## `binaryFile`.**`fileSize`**[#](#binaryfilefilesize "Permanent link")

**Description:** A string representing the size of the file

**Syntax:** `binaryFile`.**`fileSize`**

**Returns:** String

**Source:** Custom n8n functionality

## `binaryFile`.**`fileType`**[#](#binaryfilefiletype "Permanent link")

**Description:** A string representing the type of the file, e.g. `image`. Corresponds to the first part of the MIME type.

**Syntax:** `binaryFile`.**`fileType`**

**Returns:** String

**Source:** Custom n8n functionality

## `binaryFile`.**`id`**[#](#binaryfileid "Permanent link")

**Description:** The unique ID of the file. Used to identify the file when it is stored on disk or in a storage service such as S3.

**Syntax:** `binaryFile`.**`id`**

**Returns:** String

**Source:** Custom n8n functionality

## `binaryFile`.**`mimeType`**[#](#binaryfilemimetype "Permanent link")

**Description:** A string representing the format of the file’s contents, e.g. `image/jpeg`

**Syntax:** `binaryFile`.**`mimeType`**

**Returns:** String

**Source:** Custom n8n functionality

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

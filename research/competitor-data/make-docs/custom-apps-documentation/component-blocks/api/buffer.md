---
title: "Buffer | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/component-blocks/api/buffer
scraped_at: 2026-04-21T12:44:48.212740Z
description: "Used to store file content as a natural binary value, without any extra conversions"
---

1. Component blocks chevron-right
2. Communication

# Buffer

Used to store file content as a natural binary value, without any extra conversions

Buffer is useful for handling files in download or upload modules.

Most APIs use the multipart/form-data content format to upload files and this works seamlessly with buffer types in Make.

## hashtag Download a file

The Download a file module downloads a file from the service with data type buffer in the interface.

```
buffer
```

The parameters are correctly evaluated and automatically pre-mapped in the file input dialog in the following module that accepts buffer with the file's name and data.

```
buffer
```

## hashtag Upload a file

The Upload a file module uploads a file to the service with data type buffer in mappable parameters and type multipart/form-data in communication .

```
buffer
```

```
multipart/form-data
```

Last updated 5 months ago

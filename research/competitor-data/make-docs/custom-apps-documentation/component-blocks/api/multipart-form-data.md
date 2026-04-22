---
title: "Multipart/form-data | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/component-blocks/api/multipart-form-data
scraped_at: 2026-04-21T12:44:47.339749Z
description: "A form-data type that works with body payload or file upload"
---

1. Component blocks chevron-right
2. Communication

# Multipart/form-data

A form-data type that works with body payload or file upload

## hashtag Upload a file

A module that uploads a file to the service works with data type buffer in mappable parameters and type multipart/form-data in communication.

```
buffer
```

```
multipart/form-data
```

The file input dialog is where the user can either choose the module that has a file available or manually map the file's name and data on their own.

This works only if the buffer is correctly implemented in interface in preceding modules.

```
buffer
```

```
[{"name":"file_name","type":"text","label":"Name","required":true,"semantic":"file:name"},{"name":"file_data","type":"buffer","label":"Data","required":true,"semantic":"file:data"}]
```

The type of the request is multipart/form-data .

```
multipart/form-data
```

Last updated 5 months ago

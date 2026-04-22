---
title: "Communication | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/component-blocks/api
scraped_at: 2026-04-21T12:41:51.705425Z
description: "Communication specifies requests and responses."
---

1. Component blocks

# Communication

Communication specifies requests and responses.

The Communication block defines how requests and responses are handled, as well as the output of a module. It may be a collection (single request + response) or an array of collections for multiple requests. Each collection follows the specification below.

## hashtag Specification

This is a complete form of the communication object. You can find detailed information on child pages.

```
{"url":String,"encodeUrl":Boolean,"method":Enum[GET,POST,PUT,DELETE,OPTIONS],"qs":FlatObject,"headers":FlatObject,"body":Object|String|Array,"type":Enum[json,urlencoded,multipart/form-data,binary,text,string,raw],"ca":String,"condition":String|Boolean,"gzip":Boolean,"temp":Object,"aws":{"key":String,"secret":String,"session":String,"bucket":String,"sign_version":2|4},"response":{"type":{"*":Enum[json,urlencoded,xml,text,string,raw,binary,automatic],"[Number[-Number]]":Enum[json,urlencoded,xml,text,string,raw,binary,automatic]},"temp":Object,"iterate":{"container":String|Array,"condition":String|Boolean},"trigger":{"id":String,"date":String,"type":Enum[id,date],"order":Enum[asc,desc,unordered]},"output":String|Object|Array,"wrapper":String|Object|Array,"valid":String|Boolean,"error":{"message":String,"type":Enum[RuntimeError,DataError,RateLimitError,OutOfSpaceError,ConnectionError,InvalidConfigurationError,InvalidAccessTokenError,IncompleteDataError,DuplicateDataError],"[Number]":{"message":String,"type":Enum[RuntimeError,DataError,RateLimitError,OutOfSpaceError,ConnectionError,InvalidConfigurationError,InvalidAccessTokenError,IncompleteDataError,DuplicateDataError]}}},"pagination":{"mergeWithParent":Boolean,"url":String,"method":Enum[GET,POST,PUT,DELETE,OPTIONS],"headers":FlatObject,"qs":FlatObject,"body":Object|String|Array,"condition":String},"log":{"sanitize":Array},"repeat":{"condition":IMLString,"delay":Number,"limit":Number}}
```

## hashtag Escaping

If you need to access a key with certain special characters such as dots ( . ), spaces ( ) or dashes ( - ), you can use back ticks ( `key.with.dots` ) as an escape sequence in order to access the desired key.

```
.
```

```
-
```

```
`key.with.dots`
```

## hashtag Examples

### hashtag Action modules

### hashtag List module

Last updated 5 months ago

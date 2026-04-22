---
title: "Removal of empty collections and nulls | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/app-components/iml-functions/removal-of-empty-collections-and-nulls
scraped_at: 2026-04-21T12:44:43.750519Z
---

1. App components chevron-right
2. Custom IML functions

# Removal of empty collections and nulls

There are API services that throw an error when you pass an empty collection or null for certain optional fields.

```
{"name":"John Doe","dob":"1970-01-01",..."address":{}}
```

The collection "address" has empty data, which will cause an error response.

```
"address"
```

Validation Error

Field "address" cannot be empty.

```
functionremoveEmpty(input){if(typeofinput!=="object"||input===null)returnundefined;returnObject.entries(input).reduce((acc,[key,value])=>{if(Array.isArray(value)){acc[key]=value.map(item=>removeEmpty(item));returnacc;}if(typeofvalue==="object"&&value!==null&&!(valueinstanceofDate)){if(Object.keys(value).length===0)returnacc;acc[key]=removeEmpty(value);returnacc;}if(value===null)returnacc;//comment this line if you have to pass null values.acc[key]=value;returnacc;},{});}
```

In the module:

The collection "address" was not entered in the request.

200 Success

Last updated 5 months ago

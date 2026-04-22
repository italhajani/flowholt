---
title: "Requests | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/component-blocks/api/making-requests
scraped_at: 2026-04-21T12:44:45.981423Z
---

1. Component blocks chevron-right
2. Communication

# Requests

To make a request, specify at least a URL. All other directives are optional.

## hashtag Specification

### hashtag url

Required : yes Type: IML string

Specifies the request URL.

This directive must be present. The trigger does not support request-less/static mode. The URL may be defined as a full URL https://example.com/api/v1/endpoint or partial /endpoint , in which case it is appended to the baseUrl defined in the app's Base. However, for app approval, partial URLs are suggested.

```
https://example.com/api/v1/endpoint
```

```
/endpoint
```

```
baseUrl
```

### hashtag method

Required : no Type: IML string Default : GET Values : GET , POST , PUT , DELETE , PATCH (and other HTTP methods)

```
GET
```

```
GET
```

```
POST
```

```
PUT
```

```
DELETE
```

```
PATCH
```

Specifies the HTTP method that should be used when issuing a request.

Specify the method with an IML expression based on module parameters:

```
{"url":"http://example.com/entity","method":"{{if(parameters.create, 'POST', 'PUT')}}"}
```

### hashtag headers

Required : no Type: IML flat object

A single level (flat) collection that specifies request headers.

All header names should be case insensitive so x-requested-with should be handled the same as X-Requested-With .

```
x-requested-with
```

```
X-Requested-With
```

How Make handles headers:

Input:

Sent by Make:

### hashtag qs

Required : no Type: IML flat object

A single level (flat) collection that specifies request query string parameters.

This will use a request to this URL:

http://example.com?foo=foobar&hello=world&list=one&list=two&list=three

```
http://example.com?foo=foobar&hello=world&list=one&list=two&list=three
```

### hashtag type

Required : no Type: String Default : json Values : json , urlencoded , multipart/form-data , text (or string or raw ), binary .

```
json
```

```
json
```

```
urlencoded
```

```
multipart/form-data
```

```
text
```

```
string
```

```
raw
```

```
binary
```

Specifies how the request body is encoded and sent when the the method is anything except GET : POST , PUT , etc.

```
method
```

```
GET
```

```
POST
```

```
PUT
```

When the method is GET this directive will be ignored.

```
method
```

```
GET
```

When using text (or string or raw ) the body should be a string. If it is not, it will be converted to a string.

```
text
```

```
string
```

```
raw
```

When using json or multipart/form-data or urlencoded , the appropriate value of the Content-Type header is set automatically based on the specified type.

```
json
```

```
multipart/form-data
```

```
urlencoded
```

```
Content-Type
```

### hashtag body

Required : no Type: Any IML type

Specifies the request body when the method directive is set to anything except GET .

```
method
```

```
GET
```

If the body is specified and the method directive is set to GET , the body is ignored and appropriate Content-Type headers are not set.

```
method
```

```
GET
```

```
Content-Type
```

If you want to specify an XML request body, specify it as a string that will use IML expressions to pass values to XML nodes:

If you need to send a JSON string inside a JSON object , use the createJSON() function.

```
createJSON()
```

### hashtag response

Collection of directives controlling the processing of the response.

### hashtag pagination

Collection of directives controlling the pagination logic.

### hashtag log

Required : yes Type: IML flat object

A single level (flat) collection that contains logging options.

This directive specifies logging options for both the request and the response.

### hashtag repeat

Required : no Type: IML object

Repeats a request under a certain condition with a predefined delay in milliseconds. The maximum number of repeats can be bounded by the repeat.limit .

```
repeat.limit
```

The repeat directive repeats a request as long as the test condition evaluates to true. The condition is evaluated after each request. A delay can be defined between each request. The maximum number of repeats can be bound by the limit .

```
repeat
```

```
condition
```

```
condition
```

```
delay
```

```
limit
```

The temp directive must be used within repeat in common cases. The condition expression has no access to the body.data directly, so the response must be stored to the temp object first, then you can use temp in the condition expression.

```
temp
```

```
repeat
```

```
condition
```

```
body.data
```

```
temp
```

```
temp
```

```
condition
```

condition

```
condition
```

IML string

A condition expression evaluated after each request iteration. If this condition evaluates to true, the request is called again after a specified delay. When the condition evaluates to false, the repetition is finished.

The condition has access to the temp object only, not to the body .

```
temp
```

```
body
```

delay

```
delay
```

Number

Specifies the delay between two repeats in milliseconds.

limit

```
limit
```

Number

Specifies the maximum number of iterations. Optional. Not limited if not specified.

delay and limit must be hard-coded. They do not support {{ }} .

```
delay
```

```
limit
```

```
{{ }}
```

It is strongly recommended to set the limit to prevent an infinite loop.

```
limit
```

It is strongly recommended to set the limit to prevent an infinite loop.

```
limit
```

Handling an asynchronous file upload, waiting for completion of background processes.

1. Request an API to initiate some server task (in this case a PDF generation task).
2. Periodically check the status of the task and wait until task is done. Uses the repeat directive.
3. Output the task result.

Request an API to initiate some server task (in this case a PDF generation task).

Periodically check the status of the task and wait until task is done. Uses the repeat directive.

```
repeat
```

Output the task result.

Keep the module timeout limit of 40s in mind when setting up the delay and limit values.

```
delay
```

```
limit
```

### hashtag temp

Required : no Type: IML object

Specifies an object that can be used to create custom temporary variables.

Also creates a temp variable in IML, through which you then access your variables. The temp collection is not persisted and will be lost after the module is done executing.

```
temp
```

```
temp
```

This directive is executed prior to everything else: before condition , url , qs , body or any other directive. This makes it a good place to store some values that you need receptively.

```
condition
```

```
url
```

```
qs
```

```
body
```

When you have multiple requests, this directive is also useful for passing values between requests.

When specifying the temp directives in different requests and in the response section ( response.temp directive), the contents of the temp collection are not overwritten, but instead merged.

```
temp
```

```
response
```

```
response.temp
```

```
temp
```

### hashtag condition

Required : no Type: IML string or Boolean Default : true

```
true
```

Specifies whether to execute the request or not.

If this directive is not specified, the request will always be executed.

If the value of this directive is false , then the request will not be executed, and the flow will go to the next request, if present, or return nothing.

```
false
```

When you need to return some data when the condition is false, Specify the condition directive as an object, in which case it will have the following properties:

```
condition
```

condition

```
condition
```

IML string

Specifies if the request should be executed or not.

default

```
default
```

Any IML Type

Specifies the module output when the condition is false.

### hashtag aws

Collection of parameters for AWS signing.

secret

```
secret
```

IML string

AWS secret

session

```
session
```

IML string

AWS session. This only works for services that require session as part of the canonical string.

bucket

```
bucket
```

IML string

AWS bucket, unless you’re specifying your bucket as part of the path, or the request doesn’t use a bucket.

sign_version

```
sign_version
```

IML string

Default: 2.

AWS sign version. Must be either 2 or 4.

service

```
service
```

IML string

AWS service name
Condition: sign_version must be 4.

```
sign_version
```

### hashtag ca

Required : no Type: IML string

Allows you to enter your self-signed certificate.

The value should be the PEM encoded self-signed certificate.

### hashtag encodeUrl

Required : no Type: Boolean Default : true

```
true
```

Specifies if the URL should be auto encoded or not.

This directive is on by default, so if you have any special characters in your URL they will be automatically encoded.

If you don't want your URL to be encoded automatically or if you want to control the parts of the URL that are included, set this directive to false .

```
false
```

### hashtag followAllRedirect

Required : no Type: Boolean Default : true

```
true
```

Specifies whether or not to follow non-GET HTTP 3xx responses as redirects.

This parameter allows only static input true or false .

```
true
```

```
false
```

Mapping "followAllRedirect": "{{parameters.followAllRedirect}}" is not supported.

```
"followAllRedirect": "{{parameters.followAllRedirect}}"
```

### hashtag followRedirect

Required : no Type: Boolean Default : true

```
true
```

Specifies whether or not to follow GET HTTP 3xx responses as redirects.

This parameter allows only static input true or false .

```
true
```

```
false
```

Mapping "followRedirect": "{{parameters.followRedirect}}" is not supported.

```
"followRedirect": "{{parameters.followRedirect}}"
```

### hashtag gzip

Required: no Type: Boolean Default: false

```
false
```

Adds an Accept-Encoding header to request compressed content encodings from the server (if not already present) and decodes supported content encodings in the response.

```
Accept-Encoding
```

### hashtag rejectUnauthorized (deprecated)

Required : no Default : true Type: Boolean Values : true , false

```
true
```

```
Boolean
```

```
true
```

```
false
```

Verifies the TLS certificate.

If set to true , the TLS certificate of the HTTPS server is verified. If the verification fails, an error is thrown.

```
true
```

If set to false , the server's certificate is not verified, allowing requests to proceed even if the certificate is invalid or insecure.

```
false
```

Disabling certificate verification ( rejectUnauthorized: false ) significantly reduces communication security and increases the risk of man-in-the-middle attacks. Only override the default value when absolutely necessary.

```
rejectUnauthorized: false
```

A typical use case for setting rejectUnauthorized: false is when a non-production HTTPS server uses a self-signed certificate.

```
rejectUnauthorized: false
```

Self-signed certificates should never be used in production environments.

### hashtag sanitize

An array of paths to sanitize when logging a request or response.

Sanitizing sensitive information such as tokens, API keys or passwords is mandatory.

Each item in the sanitizing directive is defined in dot notation and is case insensitive. You can also access nested structures of response bodies.

Each item in the sanitizing directive is defined in dot notation and is case insensitive. You can also access nested structures of response bodies.

### hashtag shareCookies

Required : no Type: Boolean Default : false

```
false
```

This directive specifies remembering cookies for future use.

Last updated 5 months ago

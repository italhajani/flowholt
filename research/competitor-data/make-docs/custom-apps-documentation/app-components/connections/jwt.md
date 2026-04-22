---
title: "JWT | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/app-components/connections/jwt
scraped_at: 2026-04-21T12:44:33.535897Z
---

1. App components chevron-right
2. Connections

# JWT

There's no dedicated JWT connection type because the JWT is a special format of the Authorization header. See the basic connection section for more information.

## hashtag Generating a JWT

To generate the token, use the following code:

```
{"url":"https://mock.api/connect","temp":{"jwt":{"iss":"https://iam.the.issu.er","iat":"{{timestamp}}","exp":"{{timestamp + 30000}}","scope":["rest_webservices"],"aud":"https://iam.the.audien.ce/services/rest/auth/oauth2/v1/token"},"options":{"header":{"kid":"{{parameters.clientId}}"}}},"headers":{"authorization":"Bearer {{jwt(temp.jwt, parameters.clientSecret, 'HS512', temp.options)}}"}}
```

The options argument refers to the same options object as in the npm library arrow-up-right .

In this example, you can build a JWT payload inside the temp variable called jwt .

```
temp
```

```
jwt
```

Inside the Authorization header, call the IML function named jwt . The jwt function accepts four parameters:

```
jwt
```

```
jwt
```

1. The payload to be signed.
2. The secret to sign the payload.
3. The algorithm . The supported algorithms are HS256 , HS384 , HS512 , and RS256 . The default value is HS256 . This parameter is optional.
4. A custom header to customize the JWT authorization header. This parameter is optional.

The payload to be signed.

The secret to sign the payload.

The algorithm . The supported algorithms are HS256 , HS384 , HS512 , and RS256 . The default value is HS256 . This parameter is optional.

```
HS256
```

```
HS384
```

```
HS512
```

```
RS256
```

```
HS256
```

A custom header to customize the JWT authorization header. This parameter is optional.

This function will output a JWT token which you can use in the Authorization header.

Last updated 5 months ago

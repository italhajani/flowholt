---
title: "Keys | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/keys
scraped_at: 2026-04-21T12:41:26.945754Z
---

1. API Reference

# Keys

The following endpoints allow you to manage and retrieve metadata for authentication keys in your custom keychain. You can use these keys to manage your authentication in the HTTP or encryptor apps similarly to other connections.

### hashtag List keys

Gets the list of keys in your custom keychain. You can use the typeName query parameter to filter your keys based on their type. Run the list of key types API call to get a list of available key types.

```
typeName
```

- keys:read

```
keys:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the team.

```
22
```

Use the key type to get only keys with the specified type. You can use the API call GET /keys/types to list available key types.

```
GET /keys/types
```

```
basicauth
```

```
aes-key
```

```
apikeyauth
```

```
apn
```

```
basicauth
```

```
clientcertauth
```

```
eet
```

```
gpg-private
```

```
gpg-public
```

```
webpay
```

Specifies columns that are returned in the response. Use the cols[] parameter for each column that you want included. For example GET /endpoint?cols[]=key1&cols[]=key2 to get both key1 and key2 columns in the response.

```
cols[]
```

```
GET /endpoint?cols[]=key1&cols[]=key2
```

```
key1
```

```
key2
```

Check the "Filtering" section for a full example.

```
{"value":["id","name","typeName","teamId","packageName","theme"]}
```

Successful response

Successful response

### hashtag Create a key

Creates a key in your keychain.

Use the list of key types API call to get a list of available key types for the typeName parameter. Specify additional parameters in the parameters object based on the key type.

```
typeName
```

```
parameters
```

- keys:write

```
keys:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the team.

The name of the key.

Use the key type to get only keys with the specified type. You can use the API call GET /keys/types to list available key types.

```
GET /keys/types
```

Additional parameters required to create the key.

Check the list of key types API call for the parameters you need to specify.

Successful response

Successful response

### hashtag List key types

Gets the list of available key types.

- keys:read

```
keys:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

Successful response

Successful response

### hashtag Get key details

Gets details of the specified key.

- keys:read

```
keys:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the key.

```
16
```

Specifies columns that are returned in the response. Use the cols[] parameter for every column that you want to return in the response. For example GET /endpoint?cols[]=key1&cols[]=key2 to get both key1 and key2 columns in the response.

```
cols[]
```

```
GET /endpoint?cols[]=key1&cols[]=key2
```

```
key1
```

```
key2
```

Check the "Filtering" section for a full example.

```
{"value":["id","name","typeName","teamId","packageName","theme"]}
```

Successful response

Successful response

### hashtag Delete a key

Deletes the specified key. Use the confirmed parameter to confirm deleting the key. Otherwise, you get an error and the key is not deleted.

```
confirmed
```

- keys:write

```
keys:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the key.

```
16
```

Set this parameter to true to confirm deleting the key. Otherwise, you get an error and the key is not deleted.

```
true
```

```
true
```

Successful response

Successful response

### hashtag Update a key

Updates a key name , connection parameters, or both with the data specified in the request body. If you don't specify a parameter, Make keeps the original value.

```
name
```

Use the GET /key-types API call to find out which parameters you need to specify in the parameters object based on the key type.

```
GET /key-types
```

```
parameters
```

- keys:write

```
keys:write
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

The ID of the key.

```
16
```

Successful response

Successful response

Last updated 1 day ago

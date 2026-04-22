---
title: "Processing of JSON strings inside a JSON object | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/component-blocks/api/processing-of-json-strings-inside-a-json-object
scraped_at: 2026-04-21T12:44:48.870321Z
---

1. Component blocks chevron-right
2. Communication

# Processing of JSON strings inside a JSON object

In Make, JSON-based APIs are natively supported. Nevertheless, some APIs may have a JSON string inside a JSON object.

If an API returns a JSON string inside a JSON object, the data inside a JSON string is treated as text and the child parameters cannot be directly mapped.

However, if the API requires a parameter in JSON string format, Make has to send it in the required format.

Note the address parameter. Since the parameter is a JSON string, the content is not parsed as a collection.

```
address
```

```
{"address":"{\"zip\":\"18000\",\"city\":\"Prague\",\"state\":\"Czechia\",\"country\":\"Czechia\",\"address1\":\"Menclova 2\"}","id":"123","name":"Make Office"}
```

Example of an address parameter that has a value in the JSON string format.

```
address
```

## hashtag Create a JSON String

If the API requires a parameter to be sent as a JSON string, the createJSON() function can be used.

```
createJSON()
```

The createJSON() function is used to format the address value to a JSON string .

```
createJSON()
```

```
address
```

The address parameter is sent in JSON string format.

```
address
```

## hashtag Parse a JSON String

If the API output contains a parameter in a JSON string format, the parseJSON() function can be used.

```
parseJSON()
```

The parseJSON() function is used to parse the address value to JSON.

```
parseJSON()
```

```
address
```

If the parseJSON() function is not used, the JSON string is returned in a raw format.

```
parseJSON()
```

If the parseJSON() function is used, the value in address parameter is parsed to JSON. The address parameter is returned as a collection.

```
parseJSON()
```

```
address
```

```
address
```

Last updated 5 months ago

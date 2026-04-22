---
title: "Dynamic fields RPC | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/app-components/rpcs/dynamic-fields-rpc
scraped_at: 2026-04-21T12:44:47.178054Z
---

1. App components chevron-right
2. Remote Procedure Calls

# Dynamic fields RPC

The dynamic fields RPC generates dynamic fields inside a module. You can do this by adding a couple of properties to the output with some modification to match the syntax of the app builder.

```
output
```

## hashtag Details to consider

- Pay attention to the type . For example, Make doesn't accept "type": "string" . In this case, you need to change it to "type": "text" .
- Specify the name for a field. Otherwise, you will not be able to access it in the communication of a module.
- Properly convert field types between your service types and Make types. One of the ways to resolve it is to use custom IML functions .

Pay attention to the type . For example, Make doesn't accept "type": "string" . In this case, you need to change it to "type": "text" .

```
type
```

```
"type": "string"
```

```
"type": "text"
```

Specify the name for a field. Otherwise, you will not be able to access it in the communication of a module.

```
name
```

Properly convert field types between your service types and Make types. One of the ways to resolve it is to use custom IML functions .

The rest of the properties (like options , default , nested , etc.) are also available and can be used according to the selected parameter type. The only difference is that instead of creating parameters manually you create dynamic parameters.

```
options
```

```
default
```

```
nested
```

```
{"response":{"iterate":"{{body}}","output":{"name":"{{item.key}}","label":"{{item.label}}","type":"text","required":"{{item.isRequired == 1}}"}}}
```

## hashtag Examples

### hashtag RPC with only dynamic parameters

You might need to implement a custom IML function if the service types of fields don't match with Make types.

### hashtag RPC with custom fields (additional dynamic parameters)

### hashtag Select parameter with nested dynamic parameters under a specific option

Last updated 5 months ago

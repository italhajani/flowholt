---
title: "Dynamic CSPs | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/customize-your-instance/custom-domains/custom-code-injection/dynamic-csps
scraped_at: 2026-04-21T12:42:54.011348Z
---

1. Customize your instance chevron-right
2. Custom domains chevron-right
3. Custom code injection

# Dynamic CSPs

The Dynamic CSPs field of System settings lets you customize your instance's Content Security Policy (CSP). To permit resources and content from external URLs, use the following procedure:

1. Create a JSON array of the permitted sources. You can use CSP directives as the key and domains as the value according to the following format: Omit the dash and any characters after the dash of a CSP directive. Examples: connect for connect-src or font for font-src Omit https:// from URLs. You can use wildcards. Examples: drive.example.com or *.example.com Example JSON array: { "connect": [ ".example.com" , "wss://web.socket.com" ], "font": [ ".example.com" ] }

Create a JSON array of the permitted sources. You can use CSP directives as the key and domains as the value according to the following format:

1. Omit the dash and any characters after the dash of a CSP directive. Examples: connect for connect-src or font for font-src
2. Omit https:// from URLs. You can use wildcards. Examples: drive.example.com or *.example.com
3. Example JSON array:

Omit the dash and any characters after the dash of a CSP directive. Examples: connect for connect-src or font for font-src

```
connect
```

```
connect-src
```

```
font
```

```
font-src
```

Omit https:// from URLs. You can use wildcards. Examples: drive.example.com or *.example.com

```
https://
```

```
drive.example.com
```

Example JSON array:

{ "connect": [ ".example.com" , "wss://web.socket.com" ], "font": [ ".example.com" ] }

For WebSockets, you must include wss://

```
wss://
```

1. Insert your JSON object into the Dynamic CSPs field.
2. Click Save .

Insert your JSON object into the Dynamic CSPs field.

Click Save .

A message briefly appears confirming the changes are saved.

Last updated 1 year ago

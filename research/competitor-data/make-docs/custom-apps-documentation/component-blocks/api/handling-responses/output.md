---
title: "Output | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/component-blocks/api/handling-responses/output
scraped_at: 2026-04-21T12:46:17.814830Z
---

1. Component blocks chevron-right
2. Communication chevron-right
3. Handling responses

# Output

Required : no Default : body , when iterate is not set; item otherwise

```
body
```

```
iterate
```

```
item
```

With the output directive, you can specify how you want your module output to look.

```
output
```

## hashtag iterate

When using iterate, output is processed for each item of the array that is specified with the iterate directive.

```
output
```

```
iterate
```

When not using iterate, output is executed only once and the result is fed to the wrapper directive if present. Otherwise, it will be the final result of the module.

```
output
```

```
wrapper
```

Within a chain of requests, the output directive should only be defined once, in the final step, to produce the module’s or RPC's output.

When you aren't using iterate , you can use the body object to specify the output of the module.

```
iterate
```

```
body
```

```
"output":"{{body}}"
```

You can also transform the output using custom IML functions to shape the final result as needed.

```
"output":"{{parseResponse(body)}}"
```

When using the iterate directive, specify the output using the item object. However, the body is still available to use.

```
iterate
```

```
item
```

```
body
```

```
"iterate":"{{body.items}}","output":{"id":"{{item}}"}
```

## hashtag wrapper

When using the wrapper directive, the value becomes the final output of the module. This directive is executed only once and at the end of the processing chain. There are no more directives or transformations after it.

```
wrapper
```

In the wrapper directive, you can define additional top-level properties alongside the output . In the example below, the properties someAdditionalStuff and aNumber appear at the top level of the final result, while the transformed data is nested inside the data field.

```
wrapper
```

```
output
```

```
someAdditionalStuff
```

```
aNumber
```

Last updated 5 months ago

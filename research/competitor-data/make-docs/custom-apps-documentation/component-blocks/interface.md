---
title: "Interface | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/component-blocks/interface
scraped_at: 2026-04-21T12:41:53.164351Z
description: "Describes the structure of output bundles and specifies parameters for the next modules"
---

1. Component blocks

# Interface

Describes the structure of output bundles and specifies parameters for the next modules

Interface uses the parameters syntax .

## hashtag Arrays and collections

Arrays and collections use the spec syntax to specify their structure.

```
spec
```

```
{"name":"emails","spec":{"type":"email","label":"Email"},"type":"array","label":"Emails"}
```

```
{"name":"emails","type":"array","label":"Emails","spec":[{"name":"email","type":"email","label":"Email"},{"name":"source","type":"text","label":"Source"}]}
```

### hashtag Arrays and collections with unknown structure

When you have a parameter that is a collection or array but you don't know the structure inside, you need to specify the structure. Then, when the service returns any parameter inside the collection or arrary, the user will be able to map them.

```
{"name":"custom_fields","type":"array","label":"Custom Fields"}
```

For array, spec is not specified.

```
spec
```

```
{"name":"address","type":"collection","label":"Address","spec":[]}
```

For collection, spec is set to an empty array.

```
spec
```

## hashtag Example

## hashtag Interface generator

Both the web interface and Visual Studio Code have an interface generator tool to help generate the interface.

Run a module for which you want to generate an interface, then in the panel with the output, click on the button circled below and choose Download output bundles option.

A new panel will appear with the original response from the endpoint.

Copy the text to your clipboard.

Go back to the tab with your app and make sure you are in the settings of the right module. Select the Interface tab. You can see a JSON snippet:

In the upper-right corner, click the Options button and choose Generator .

A new panel will appear. There, paste the previously copied JSON from your clipboard and click Generate .

A new data structure is generated. Copy it to your clipboard and close the panel.

In the Interface, replace the JSON structure with the new structure.

Go back to VS Code and make sure you are in the settings of the right module. Select tab INTERFACE . You can see a JSON snippet:

Click the 'magic wand' icon.

Paste your data and copy the generated code.

You still need to check all the labels and types to make sure there are no errors.

You might need to change some abbreviations to uppercase (such as URL, VAT, etc.).

The generated code still needs to be reviewed!

Make sure the generated type for dates is date .

The label must be grammatically correct. Use sentence case and uppercase for abbreviations such as UID, URL, etc.

In the case of Search modules, you need to delete the pagination data __IMTLENGTH__ and __IMTINDEX__ .

```
__IMTLENGTH__
```

```
__IMTINDEX__
```

Whenever you change Interface in a module, you need to refresh your scenario in order to see the changes.

## hashtag Dynamic interface using RPC

You can use RPC to generate the interface dynamically.

You can also define RPC to generate just a part of the interface.

You can access module parameters in remote procedures via the {{parameters.foo}} syntax.

```
{{parameters.foo}}
```

If you call the RPC from the interface of an instant trigger, you can use {{webhook.foo}} syntax to access webhook's parameters.

```
{{webhook.foo}}
```

Last updated 3 months ago

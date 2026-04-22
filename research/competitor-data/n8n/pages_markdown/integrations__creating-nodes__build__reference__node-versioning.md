# Versioning | n8n Docs

Source: https://docs.n8n.io/integrations/creating-nodes/build/reference/node-versioning
Lastmod: 2026-04-14
Description: Documentation for n8n, a workflow automation platform.
# Node versioning[#](#node-versioning "Permanent link")

n8n supports node versioning. You can make changes to existing nodes without breaking the existing behavior by introducing a new version.

Be aware of how n8n decides which node version to load:

* If a user builds and saves a workflow using version 1, n8n continues to use version 1 in that workflow, even if you create and publish a version 2 of the node.
* When a user creates a new workflow and browses for nodes, n8n always loads the latest version of the node.

Versioning type restricted by node style

If you build a node using the declarative style, you can't use full versioning.

## Light versioning[#](#light-versioning "Permanent link")

This is available for all node types.

One node can contain more than one version, allowing small version increments without code duplication. To use this feature:

1. Change the main `version` parameter to an array, and add your version numbers, including your existing version.
2. You can then access the version parameter with `@version` in your `displayOptions` in any object (to control which versions n8n displays the object with). You can also query the version from a function using `const nodeVersion = this.getNode().typeVersion;`.

As an example, say you want to add versioning to the NasaPics node from the [Declarative node tutorial](../../declarative-style-node/), then configure a resource so that n8n only displays it in version 2 of the node. In your base `NasaPics.node.ts` file:

|  |  |
| --- | --- |
| ```  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 ``` | ``` {     displayName: 'NASA Pics',     name: 'NasaPics',     icon: 'file:nasapics.svg',     // List the available versions     version: [1,2,3],     // More basic parameters here     properties: [         // Add a resource that's only displayed for version2         {             displayName: 'Resource name',             // More resource parameters             displayOptions: {                 show: {                     '@version': 2,                 },             },         },     ], } ``` |

## Feature-based versioning[#](#feature-based-versioning "Permanent link")

Feature flags let you control parameter visibility and execution logic based on named features tied to node versions.

### Defining features[#](#defining-features "Permanent link")

Add a `features` object to your node type description. Each feature uses `@version` conditions to specify which versions enable it:

|  |  |
| --- | --- |
| ``` 1 2 3 4 5 6 7 8 9 ``` | ``` {     version: [2, 2.1, 2.2, 2.3, 2.4],     features: {         useNewApi: { '@version': [{ _cnd: { gte: 2.2 } }] },         useLegacyAuth: { '@version': [{ _cnd: { lte: 2.1 } }] },         useSpecialMode: { '@version': [2] },     },     // More basic parameters here } ``` |

Available conditions: `gte`, `lte`, `gt`, `lt`. Pass a plain version number to match a specific version.

### Using `@feature` in `displayOptions`[#](#using-feature-in-displayoptions "Permanent link")

Use `@feature` in `displayOptions` to control parameter visibility based on feature flags:

|  |  |
| --- | --- |
| ```  1  2  3  4  5  6  7  8  9 10 ``` | ``` {     displayName: 'New API Field',     name: 'newApiField',     type: 'string',     displayOptions: {         show: {             '@feature': ['useNewApi'],         },     }, } ``` |

To show a parameter when a feature is **not** enabled, use the condition syntax:

|  |  |
| --- | --- |
| ``` 1 2 3 4 5 ``` | ``` displayOptions: {     show: {         '@feature': [{ _cnd: { not: 'useNewApi' } }],     }, } ``` |

You can combine `@feature` with other display conditions:

|  |  |
| --- | --- |
| ``` 1 2 3 4 5 6 ``` | ``` displayOptions: {     show: {         resource: ['myResource'],         '@feature': [{ _cnd: { eq: 'useNewApi' } }],     }, } ``` |

### Checking features in code[#](#checking-features-in-code "Permanent link")

Use `this.isNodeFeatureEnabled()` in execution contexts (such as `IExecuteFunctions` or `IWebhookFunctions`):

|  |  |
| --- | --- |
| ``` 1 2 3 4 5 ``` | ``` if (this.isNodeFeatureEnabled('useNewApi')) {     // Process with new API } else {     // Process with legacy API } ``` |

## Full versioning[#](#full-versioning "Permanent link")

This isn't available for declarative-style nodes.

As an example, refer to the [Mattermost node](https://github.com/n8n-io/n8n/tree/master/packages/nodes-base/nodes/Mattermost).

Full versioning summary:

* The base node file should extend `NodeVersionedType` instead of `INodeType`.
* The base node file should contain a description including the `defaultVersion` (usually the latest), other basic node metadata such as name, and a list of versions. It shouldn't contain any node functionality.
* n8n recommends using `v1`, `v2`, and so on, for version folder names.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit

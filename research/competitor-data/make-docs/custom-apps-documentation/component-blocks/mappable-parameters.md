---
title: "Mappable parameters | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/component-blocks/mappable-parameters
scraped_at: 2026-04-21T12:41:52.372517Z
---

1. Component blocks

# Mappable parameters

Mappable parameters can either be filled in by the user or mapped from previous modules.

Mappable parameters use parameters syntax .

```
[{"name":"email","type":"email","label":"Email address","required":true},{"name":"name","type":"text","label":"Name","required":true},{"name":"newsletter","type":"boolean","label":"Send newsletter?","default":false,"required":true},{"name":"size","type":"select","label":"T-Shirt size","options":[{"label":"S","value":"s"},{"label":"M","value":"m"},{"label":"L","value":"l"}]}]
```

You can use Remote Procedure Calls (RPCs) to generate parameters dynamically.

Learn more about best practices regarding mappable parameters .

Last updated 5 months ago

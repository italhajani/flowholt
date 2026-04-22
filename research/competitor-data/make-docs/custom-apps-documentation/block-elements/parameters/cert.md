---
title: "Cert | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/block-elements/parameters/cert
scraped_at: 2026-04-21T12:44:53.327317Z
description: "A certificate in PEM format"
---

1. Block elements chevron-right
2. Parameters

# Cert

A certificate in PEM format

## hashtag Specification

This type of parameter has no extra options.

## hashtag Example

### hashtag Certificate Input

If your service requires providing a certificate in PEM format, you can use the cert parameter. It's possible to paste a PEM string into the file or you can extract it directly from a P12 or PFX file.

```
cert
```

```
[{"name":"cert","label":"Certificate","type":"cert"}]
```

Last updated 5 months ago

---
title: "Pkey | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/block-elements/parameters/pkey
scraped_at: 2026-04-21T12:45:10.777540Z
description: "A private key in PEM format"
---

1. Block elements chevron-right
2. Parameters

# Pkey

A private key in PEM format

## hashtag Specification

This type of parameter has no extra options.

## hashtag Example

### hashtag Private key input

If your service requires providing a private key in PEM format, you can use the pkey parameter. It's possible to paste a PEM string into the file or you can extract it directly from a P12 or PFX file.

```
pkey
```

```
[{"name":"pkey","label":"Private key","type":"pkey"}]
```

Last updated 5 months ago

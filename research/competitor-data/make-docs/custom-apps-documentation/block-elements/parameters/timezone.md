---
title: "Timezone | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/block-elements/parameters/timezone
scraped_at: 2026-04-21T12:45:17.007587Z
description: "A time zone name in IANA ID format (e.g. Europe/Prague)"
---

1. Block elements chevron-right
2. Parameters

# Timezone

A time zone name in IANA ID format (e.g. Europe/Prague)

## hashtag Specification

### hashtag editable

- Type: Boolean
- If true , the user can manually edit (map) a time zone. The time zone name must be valid.

Type: Boolean

```
Boolean
```

If true , the user can manually edit (map) a time zone. The time zone name must be valid.

```
true
```

## hashtag Example

### hashtag Basic timezone input

By default, the timezone parameter is displayed as select with all available time zones as options.

```
timezone
```

```
select
```

```
[{"name":"timezone","type":"timezone","label":"Time zone"}]
```

Last updated 5 months ago

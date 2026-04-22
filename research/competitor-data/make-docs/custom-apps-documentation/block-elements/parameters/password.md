---
title: "Password | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/block-elements/parameters/password
scraped_at: 2026-04-21T12:45:08.528044Z
description: "Marks passwords and secrets when creating a connection to avoid exposing them"
---

1. Block elements chevron-right
2. Parameters

# Password

Marks passwords and secrets when creating a connection to avoid exposing them

The password type is dedicated to marking parameters in a connection that should be kept secret when the user is editing a connection.

```
password
```

In addition, when the user types in a password field, the text in the field is masked.

```
password
```

The password parameter type is only available in a connection. If used in other modules, this parameter behaves like a text parameter.

```
password
```

```
text
```

## hashtag Example

The user is updating an app connection:

```
[{"name":"serviceUrl","type":"url","required":true,"editable":true,"label":"Service URL"},{"name":"username","type":"email","required":true,"editable":true,"label":"Username"},{"name":"apiToken","type":"password","required":true,"editable":true,"label":"API Token"}]
```

Last updated 5 months ago

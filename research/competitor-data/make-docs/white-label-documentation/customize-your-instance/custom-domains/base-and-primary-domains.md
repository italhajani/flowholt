---
title: "Base and primary domains | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/customize-your-instance/custom-domains/base-and-primary-domains
scraped_at: 2026-04-21T12:46:05.201278Z
---

1. Customize your instance chevron-right
2. Custom domains

# Base and primary domains

Make distinguishes between your Base and Primary domains.

### hashtag Base domain

A Base domain exists for all instances and has the URL {{customName}}.onmake.com or {{customName}}.make.celonis.com or similar.

```
{{customName}}.onmake.com
```

```
{{customName}}.make.celonis.com
```

Your Base domain:

- Always has our branding (i.e. xzy.onmake.com or xyz.make.celonis.com).
- Serves as alternative access in case of issues with your custom domain.
- Provides both public and admin interfaces.

Always has our branding (i.e. xzy.onmake.com or xyz.make.celonis.com).

Serves as alternative access in case of issues with your custom domain.

Provides both public and admin interfaces.

### hashtag Primary domain

The Primary domain is the custom domain that you configure with Make's assistance.

- Your Primary domain:
- Is the custom domain that you define.
- Supports the availability of both public and administration interfaces.
- Can be the sender for email communications.
- Can be used as the SSO redirect URI.

Your Primary domain:

Is the custom domain that you define.

Supports the availability of both public and administration interfaces.

Can be the sender for email communications.

Can be used as the SSO redirect URI.

In case of a problem with the primary domain, SSO login will not work.

- Appears in all dialogs in the interface, e.g. webhook creation, mailhook creation, etc.

Appears in all dialogs in the interface, e.g. webhook creation, mailhook creation, etc.

Last updated 1 year ago

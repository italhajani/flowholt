---
title: "Output labels | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/best-practices/naming-conventions/output-labels
scraped_at: 2026-04-21T12:44:13.041582Z
---

1. Best practices chevron-right
2. Naming conventions

# Output labels

Output (interface) labels should be clear and consistent so it is easy for users to understand their data and confidently map values between different modules.

Consider the following when creating output labels:

- Use sentence case capitalization arrow-up-right . Capitalize only the first word and proper nouns.
- Use plain terms rather than API formats.
- Match terminology exactly. The output label must be identical to the corresponding mappable parameter.
- Follow the same order. The output labels and mappable parameters should be listed in the same order in both locations.

Use sentence case capitalization arrow-up-right . Capitalize only the first word and proper nouns.

Use plain terms rather than API formats.

Match terminology exactly. The output label must be identical to the corresponding mappable parameter.

Follow the same order. The output labels and mappable parameters should be listed in the same order in both locations.

Raw values (the actual keys returned by the API) shouldn’t be updated. They must be left as-is so they accurately reflect the external service's API documentation.

## hashtag Output label examples

Email address

Email Address

User ID

userID or user_id

This example from Make AI Toolkit > Simple text prompt follows the standard practices listed above.

This example from Make AI Toolkit > Simple text prompt follows the standard practices listed above. The mappable parameter labels match the output labels for consistency and clarity.

Last updated 1 month ago

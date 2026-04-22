---
title: "Parameter labels | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/best-practices/naming-conventions/input-parameters/parameter-labels
scraped_at: 2026-04-21T12:44:15.354210Z
---

1. Best practices chevron-right
2. Naming conventions chevron-right
3. Input parameters

# Parameter labels

Static and mappable parameter labels should be clear and easy for users to understand. Consider the following when creating labels:

- Give a short description (1–3 words) of the requested input.
- Match the terminology that users see in the third-party’s UI, not the API documentation.
- Be descriptive, not instructional. If the selection needs more explanation, include information in the help text below the field.
- Use sentence case capitalization arrow-up-right . The following should be capitalized: The first word of the label Proper nouns and trademarks. For example, names of people, companies, products, or other proper nouns Official or trademarked terms Acronyms. For example, Content ID, File URL
- Avoid punctuation and articles (the, an, a).
- Use plain terms rather than API formats.

Give a short description (1–3 words) of the requested input.

Match the terminology that users see in the third-party’s UI, not the API documentation.

Be descriptive, not instructional. If the selection needs more explanation, include information in the help text below the field.

Use sentence case capitalization arrow-up-right . The following should be capitalized:

- The first word of the label
- Proper nouns and trademarks. For example, names of people, companies, products, or other proper nouns
- Official or trademarked terms
- Acronyms. For example, Content ID, File URL

The first word of the label

Proper nouns and trademarks. For example, names of people, companies, products, or other proper nouns

Official or trademarked terms

Acronyms. For example, Content ID, File URL

Avoid punctuation and articles (the, an, a).

Use plain terms rather than API formats.

## hashtag Parameter label examples

Custom data parameters

The Custom Data Parameters

First word capitalized, the rest in lowercase.

Do not use the article ‘the’.

Submit form

Submit Form

First word capitalized, the rest in lowercase.

New Instagram account name

New instagram account name

Instagram is a proper noun, remains capitalized.

Google Drive folder

Google drive folder

Google Drive is a proper noun, remains capitalized.

Content ID

Content id

ID is an acronym and remains capitalized.

Product API key

Product API Key

API is an acronym and remains capitalized. Key is lowercase.

Website URL

Website url

URL is an acronym and remains capitalized.

ID finder

ID Finder

ID is an acronym and the first word in the label.

User ID

userID or user_id

userID or user_ID are in an API format.

Mappable parameter labels should match the output labels for consistency and clarity so it is easy for users to understand their data and confidently map values between different modules. Output labels and mappable parameters should be listed in the same order in both locations.

## hashtag Parameter label for fields with a Map toggle

For select fields, the label of the field should be dependent on whether the Map toggle is ON or OFF by default.

If the Map toggle is ON by default, the field label should contain "ID" .

If the Map toggle is OFF by default, the field label should NOT contain "ID" .

Last updated 1 month ago

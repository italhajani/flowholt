---
title: "Parameter hints | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/best-practices/naming-conventions/input-parameters/parameter-hints
scraped_at: 2026-04-21T12:44:17.015058Z
---

1. Best practices chevron-right
2. Naming conventions chevron-right
3. Input parameters

# Parameter hints

Hints play a very important role in the overall usability of an app and well-written hints can have a significant positive impact on the user experience.

When providing hints, take into consideration the following:

- All fields that are not self-explanatory should contain a hint
- Extra attention should be paid to Connection fields
- All essential information should be included
- The information should be clear and concise
- The terminology used should be non-technical and easy to understand
- Avoid using symbols

All fields that are not self-explanatory should contain a hint

Extra attention should be paid to Connection fields

All essential information should be included

The information should be clear and concise

The terminology used should be non-technical and easy to understand

Avoid using symbols

## hashtag Information to include

There are six categories of information that hints can include. Each hint can contain at least one of the information types. If multiple information types are included, they should be organized in the order listed below.

1. Expected input
2. Result
3. Example
4. Additional information
5. What if left empty
6. Link

Expected input

Result

Example

Additional information

What if left empty

Link

1. Expected input

Expected input

Include a clear description of what to enter/select.

This will often be the description included in the API documentation.

If the description is not clear or is too technical, update it to be more user-friendly.

Response format

Format of the generated audio file.

1. Result

Result

Include a clear description of the outcome, especially if there are various possible outcomes.

Include this information if it is useful to describe what will happen when users enter a specific value.

Temperature

Higher values generate a more random response. For example, 0.8 . Lower values generate a more focused response. For example, 0.2 .

1. Example

Example

Include an example to provide more clarity, if specific formatting is used, or if it is valuable for users.

Use the format ‘For example, code formatting ’.

Image URL

URL address to a public resource of the image. For example, https://getmyimage.com/myimage.png .

1. Additional information

Additional information

Include extra information the user must know to successfully use the field.

Output file name

Name of the generated audio file. Do not include the file extension.

1. What if left empty

What if left empty

Describe the impact of not entering a value.

Format

If left empty, default formatting is used.

1. Link

Link

When linking to Make's Help Center, use ‘our Help Center’.

When linking to third-party documentation, include the name of the app/service and the name of the page/documentation.

Account

Name of the primary user’s account. For details, see our Help Center envelope . Voice

Voice to use in the audio. For voice samples, see the OpenAI Voice options guide arrow-up-right .

## hashtag Connection field hints

### hashtag API key / API token / Access token

The name of the field should always match what the user sees in the 3rd party UI.

Our Help Center

For details on how to obtain your [name of value], see our Help Center.

For details on how to obtain your API key, see our Help Center arrow-up-right .
Link to apps.make.com/[your-app-slug]

```
apps.make.com/[your-app-slug]
```

Third-party resource:

API docs

For details on how to obtain your [name of value], see the [app name] API documentation.

For details on how to obtain your API key, see the Instantly API documentation arrow-up-right .

Third-party resources:

other than API docs

For details on how to obtain your [name of value], see the [app name] [page name].

For details on how to obtain your access token, see the Shopify App Development blog arrow-up-right .

Third-party account:

with link

You can obtain your [name of value] on the [page name] in your [app name] account.

You can obtain your [name of value] on the [app name] [page name].

You can obtain your refresh token on the Security page arrow-up-right in your Atlassian account.

You can obtain your API key on the Anthropic Console API keys page arrow-up-right .

Third-party account:

with instructions
*not preferred due to length

You can obtain your [name of value] by going to [item]→ [item] → [item] in your [app name] account

You can obtain your refresh token by going to Account → Profile → API in your Atlassian account.

### hashtag Required client ID and client secret

The process to obtain these values should be documented in our Help Center if the fields are required.

Our Help Center

For details on how to obtain your [client ID or client secret], see our Help Center.

For details on how to obtain your client secret, see our Help Center arrow-up-right .

Link to apps.make.com/[your-app-slug]

```
apps.make.com/[your-app-slug]
```

### hashtag Optional client ID and client secret in advanced settings

The process to obtain these values do not need to be documented in our Help Center as the fields are not required.

Third-party resource:

API docs

For details on how to obtain your [client ID or client secret], see the [app name] API documentation.

For details on how to obtain your client secret, see the Hotmart API documentation arrow-up-right .

Third-party resource:

other than API docs

For details on how to obtain your [client ID or secret], see the [app name] [page name].

For details on how to obtain your client ID, see the Oracle Help Center arrow-up-right .

## hashtag Limit field hints

Polling trigger

Limit

Maximum number of results to return. For information about setting limits, see our Help Center arrow-up-right .

https://help.make.com/types-of-modules#b3ZEQ

```
https://help.make.com/types-of-modules#b3ZEQ
```

Search and List modules

Limit

Maximum number of results to return and work with during one execution cycle. For information about setting limits, see our Help Center arrow-up-right .

https://help.make.com/types-of-modules#b3ZEQ

```
https://help.make.com/types-of-modules#b3ZEQ
```

The Limit field should also be the last standard field in the module. It should not be in the advanced settings.

## hashtag Make an API call: URL field hints

If a hint includes a URL, the URL should contain the prefix path and an example of the URL. Additionally, the URL field hint should include an example endpoint that works without performing any additional steps (for example, where no {body} is required).

Use GET methods as the example endpoints. Do not use endpoints that create or delete records.

```
GET
```

Do not hard code API versions in the prefix path. This ensures a user can work with any API version. Even if there is currently only one version, future compatibility should be considered.

URL

Enter the part of the URL that comes after [prefix path]} . For example, [postfix] .

```
[prefix path]}
```

```
[postfix]
```

Enter the part of the URL that comes after https://api.openai.com . For example, /v1/models .

```
https://api.openai.com
```

```
/v1/models
```

## hashtag Special formatting

Two types of special formatting are used in hints: bold and code .

If a hint references another input field in the module, make sure to copy the input field’s name exactly and format it in bold .

If you include examples, default values, versions, or specific formats, make sure to use the red code formatting. This can include API versions, color codes, dates, time, and country codes.

Last updated 5 months ago

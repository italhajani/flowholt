---
title: "Enums | Make API | Make Developer Hub"
url: https://developers.make.com/api-documentation/api-reference/enums
scraped_at: 2026-04-21T12:41:25.170791Z
---

1. API Reference

# Enums

The parameters with a predefined set of values are called "enums." The enums endpoints list the mappings of a possible parameter values and the IDs of those values. For example, the endpoint /enums/timezones lists the timezone name and code , such as Europe/Berlin , and the timezoneId .

```
/enums/timezones
```

```
name
```

```
code
```

```
Europe/Berlin
```

```
timezoneId
```

### hashtag List module types

Gets the list of module types.

- organization:read

```
organization:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

Successful response

Successful response

### hashtag List timezones

Gets the list of timezones and their timezoneId values.

```
timezoneId
```

- organization:read

```
organization:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

Successful response

Successful response

### hashtag List countries

Gets the list of countries and their countryId values in the id column. The countryId is a required parameter when you create a new organization with the API call POST /organizations .

```
countryId
```

```
id
```

```
countryId
```

```
POST /organizations
```

- organization:read

```
organization:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

Successful response

Successful response

### hashtag List locales

Gets the list of locales and their localeId values and locale codes.

```
localeId
```

- organization:read

```
organization:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

Successful response

Successful response

### hashtag List languages

Gets the list of languages and their language codes.

- organization:read

```
organization:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

When set to true, the response contains localized language names, for example --  German: Deutch or Czech: Čeština. This setting limits the number of returned languages to those that have defined their localized name. The default value is false .

```
false
```

```
true
```

Successful response

Successful response

### hashtag List user features

Gets the list of all existing user features and their descriptions.

- organization:read

```
organization:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

Successful response

Successful response

### hashtag List organization features

Gets the list of all existing organization features and their descriptions.

- organization:read

```
organization:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

Successful response

Successful response

### hashtag List email notification settings

Gets the list of available email notification settings and their notificationId values. The language of the notification settings descriptions is set according to user language settings by default. You can specify a different language for the notification settings descriptions with the language parameter.

```
notificationId
```

```
language
```

- organization:read

```
organization:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

Language code in the ISO 639-1 code standard. Only en (English) language is supported.

```
en
```

```
en
```

Successful response

Successful response

### hashtag List API token scopes

Gets the list of all of the existing user API token scopes. For more information about the user API scopes refer to the Authentication section.

- organization:read

```
organization:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

Successful response

Successful response

### hashtag List Make regions

Gets the list of Make regions and their regionId values in the id column. The regionId is a required parameter when you create a new organization with the API call POST /organizations .

```
regionId
```

```
id
```

```
regionId
```

```
POST /organizations
```

- organization:read

```
organization:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

Successful response

Successful response

### hashtag List Make zones

Gets the list of Make zones and their zoneId values in the id column. The zoneId is a required parameter when you create a new organization with the API call POST /organizations .

```
zoneId
```

```
id
```

```
zoneId
```

```
POST /organizations
```

- organization:read

```
organization:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

Successful response

Successful response

### hashtag List apps review status

Gets the list of statuses that Make assigns to custom apps.

- requestAccepted : Make has received the request for a custom app review.
- inProgress : The custom app review is in progress.
- feedbackSent : The Make app developers have sent their feedback to the developer of the custom app.
- completed :
- waitingForRelease :
- declined : The custom app publishing has been declined by Make. The reasons for that could be:

requestAccepted : Make has received the request for a custom app review.

```
requestAccepted
```

inProgress : The custom app review is in progress.

```
inProgress
```

feedbackSent : The Make app developers have sent their feedback to the developer of the custom app.

```
feedbackSent
```

completed :

```
completed
```

waitingForRelease :

```
waitingForRelease
```

declined : The custom app publishing has been declined by Make. The reasons for that could be:

```
declined
```

- organization:read

```
organization:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

Successful response

Successful response

### hashtag List variable types

Retrieves the mapping of custom variable types and their typeId values.

```
typeId
```

- organization:read

```
organization:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

Successful response

Successful response

### hashtag List LLM models

Gets the list of available Large Language Models (LLM) with their provider information and display priorities. These models can be used for AI mapping and AI toolkit configurations.

- organization:read

```
organization:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

Successful response

Successful response

### hashtag List LLM builtin tiers

Gets the list of predefined LLM tiers (small, medium, large) with their associated models, providers, and pricing coefficients. These tiers provide standardized AI model configurations for different use cases and billing rates.

- organization:read

```
organization:read
```

Authorize the API call with your API token in the Authorization header with the value: Token your-api-token .

```
Authorization
```

```
Token your-api-token
```

If you don't have an API token yet, please refer to the "Authentication" section to learn how to create one.

Successful response

Successful response

Last updated 1 day ago

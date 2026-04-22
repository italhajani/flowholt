# Pipedrive API v1 to v2 transition by July 31, 2026 - Help Center

Source: https://help.make.com/pipedrive-api-v1-to-v2-transition-by-july-31-2026
Lastmod: 2026-03-10T16:06:42.463Z
Description: Help Center
Release notes

2026

# Pipedrive API v1 to v2 transition by July 31, 2026

4 min

Due to changes in the Pipedrive API, we’ve released updated versions of all Pipedrive modules in Make.

### **What's changing?**

Some of the Pipedrive API v1 modules are now deprecated. Existing scenarios using these modules will continue to run until **July 31, 2026**. After this date, Pipedrive API v1 endpoints will no longer be available, and the scenarios using them will stop working. You can no longer create new scenarios using the deprecated modules.

### **What do you need to do**

To keep your scenarios running, replace your Pipedrive API v1 modules with their API v2 equivalents before July 31, 2026.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/cDcs279ve7m_A4iuUNSk4-20260119-171730.png?format=webp "Document image")

﻿

For a detailed migration guide, see the [Pipedrive Developer Documentation](https://pipedrive.readme.io/docs/pipedrive-api-v2-migration-guide "Pipedrive Developer Documentation").

### **Connection type deprecation**

The **Pipedrive API token** connections are deprecated. When creating a new Pipedrive connection, select **Pipedrive OAuth** in the **Connection type** field. This is the supported connection method for Pipedrive modules. If you’re using an existing connection created with an API token, update it to use Pipedrive OAuth to ensure compatibility with the current Pipedrive API.

### **Modules deprecated without replacement**

The following Pipedrive modules have been deprecated and **do not** have a replacement or supported alternative in API v2:

* Add a Recurring Subscription

* Add an Installment Subscription

* Cancel a Recurring Subscription

* Delete a Subscription

* Find Subscription By Deal

* Get a Subscription

* List Payments of a Subscription

* Update a Recurring Subscription

* Update an Installment Subscription

Some deprecated modules don't have direct replacements, but you can replicate the same functionality using other Pipedrive modules with the required filters.

| **Deprecated module** | **Module to use** | **Required filter** |
| --- | --- | --- |
| List Activities in a Deal | List Activities | ID filter |
| List Deals for a Person | List Deals | Person ID filter |
| List Deals in a Pipeline | List Deals | Pipeline ID filter |
| List Deals in a Stage | List Deals | Stage ID filter |
| List Deals in an Organization | List Deals | Organization ID filter |
| List Persons in a Deal | List Persons | Deal ID filter |

Use the modules and filters in the module configuration to achieve the same behavior as the deprecated modules.

### **Webhook changes**

Some webhook endpoints are no longer available in the Pipedrive API v2.

The following webhook modules are replaced by a single generic module:

* New Activity Event --> Watch New Events

* New Deal Event --> Watch New Events

* New Note Event --> Watch New Events

* New Organization Event --> Watch New Events

* New Person Event --> Watch New Events

* New Product Event --> Watch New Events

Updated 10 Mar 2026

Did this page help you?

Yes

No

[PREVIOUS

New payment methods for greater flexibility](/new-payment-methods-for-greater-flexibility "New payment methods for greater flexibility")[NEXT

Scenario history and run replay improvements, app updates](/scenario-history-and-run-replay-improvements-app-updates "Scenario history and run replay improvements, app updates")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)

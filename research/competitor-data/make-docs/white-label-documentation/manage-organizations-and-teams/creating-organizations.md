---
title: "Creating organizations | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/manage-organizations-and-teams/creating-organizations
scraped_at: 2026-04-21T12:42:34.713780Z
---

1. Manage organizations and teams

# Creating organizations

The Make White Label administration interface lets you create organizations from the Organizations page. Once created, you need to assign users to the organization by inviting them from the Organization detail page. The following procedure requires an instance admin system role, such as SA or Admin .

```
SA
```

```
Admin
```

By default, unless otherwise specified, new organizations inherit the license parameters of your White Label instance. For example, if your Make White Label license has 8,000,000 operations, then a new organization's license also has an operations limit of 8,000,000. You can define an organization's license by using the API endpoint /admin/organizations .

```
/admin/organizations
```

1. Go to Administration > Organizations .
2. Click Create a new organization .
3. Organization name defines the name that appears in the UI. Your end user sees this name on their dashboard. You see this name, for example, in the list of organizations when you go to Administration > Organizations . Timezone defines the time used when executing scenarios and modules. Each user's localization defines how Make displays time, for example, in execution logs. Country represents the organization owner. Select a country based on your end customer's geographic location. You cannot change this after you create the organization.

Go to Administration > Organizations .

Click Create a new organization .

Organization name defines the name that appears in the UI. Your end user sees this name on their dashboard. You see this name, for example, in the list of organizations when you go to Administration > Organizations . Timezone defines the time used when executing scenarios and modules. Each user's localization defines how Make displays time, for example, in execution logs. Country represents the organization owner. Select a country based on your end customer's geographic location. You cannot change this after you create the organization.

Select the Timezone and Country based on your customer's needs. Using a countryID and timezoneID appropriate for your customer ensures that their scheduled scenarios run at the correct time.

```
countryID
```

```
timezoneID
```

1. Click Add to create the organization.

Click Add to create the organization.

The new organization appears on the list of organizations on Administration > Organizations .

Last updated 1 year ago

---
title: "Customize user access to features | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/customize-your-instance/customize-user-access-to-features
scraped_at: 2026-04-21T12:42:49.583730Z
---

1. Customize your instance

# Customize user access to features

You can configure user access to your Make White Label instance and features on the Administration > System Settings page.

### hashtag Instance access

#### hashtag Two-factor authentication

Two-factor authentication defines user access to two-factor authentication on your White Label instance.

- Enable to allow users to configure two-factor authentication.
- Disable to turn off two-factor authentication. Recommended if you configure SSO for your instance.

Enable to allow users to configure two-factor authentication.

Disable to turn off two-factor authentication. Recommended if you configure SSO for your instance.

For Two factor authentication app name (visible in Google Authentificator), you need to enter the name you want to appear in the Google Authentificator app.

#### hashtag SSO

You can use this field to select the kind of SSO you want to configure on your Make White Label instance.

### hashtag Feature access

The following options define access on an instance-wide level.

To allow your users access to a feature, you need to enable it for your instance and then use the license object to allow organizations to access to that specific feature.

For example, to offer custom functions:

1. Enable Custom Functions on Administration > System settings by selecting Enabled under Custom Functions .
2. Include customFunctions: true in the organization's license object for each organization you want to have access to custom functions.

Enable Custom Functions on Administration > System settings by selecting Enabled under Custom Functions .

Include customFunctions: true in the organization's license object for each organization you want to have access to custom functions.

```
customFunctions: true
```

Any organization with customFunctions: true in its license can use the custom functions feature.

```
customFunctions: true
```

Devices enabled

This feature does not impact your instance or its users. Keep this parameter set to disabled .

```
disabled
```

Not applicable

Apps platform

Defines whether users can create their own custom apps.

Enable to allow access on your instance.

Disable to turn off the feature for your instance.

There is no license parameter. Selecting Enable allows all of your users to access the apps platform and create custom apps.

Custom Functions

Defines whether users can use custom functions arrow-up-right in their organizations.

Enable to allow access on your instance.

Disable to turn off the feature for your instance.

customFunctions

```
customFunctions
```

Boolean

True to allow an organization to use custom functions.

False to prevent an organization from using custom function.

Variables

Defines whether users can use custom variables arrow-up-right in their organizations.

Enable to allow access on your instance.

Disable to turn off the feature for your instance.

customVariables

```
customVariables
```

Boolean

True to allow an organization to use custom variables.

False to prevent an organization from using custom variables.

Dynamic connections

Defines whether users can use dynamic connections arrow-up-right in their scenarios.

Enable to allow access on your instance.

Disable to turn off the feature for your instance.

dynamicDependencies

```
dynamicDependencies
```

Boolean

True to allow an organization to use dynamic dependencies in scenarios.

False to prevent an organization from using dynamic dependencies in scenarios.

dynamicConnections

```
dynamicConnections
```

Boolean

True to allow an organization to use dynamic connections in scenario inputs and map them in modules.

False to prevent an organization from using dynamic connections in scenario inputs and mapping them in modules.

Personal connections

This feature does not impact your instance or its users. Keep this parameter set to disabled .

```
disabled
```

Not applicable

On Prem Agent

This feature does not impact your instance or its users. Keep this parameter set to disabled .

```
disabled
```

Not applicable

Scenario inputs

Defines whether users can use scenario inputs arrow-up-right in their scenarios.

Enable to allow access on your instance.

Disable to turn off the feature for your instance.

scenarioIO

```
scenarioIO
```

Boolean

True to allow an organization to use scenario inputs.

False to prevent an organization from using scenario inputs.

Users can create organizations

This feature does not impact your instance or its users. Keep this parameter set to disabled .

```
disabled
```

Not applicable

Custom scenario properties

Defines whether users can use custom scenario properties in their organizations.

Enable to allow access on your instance.

Disable to turn off the feature for your instance.

customProperties

```
customProperties
```

Integer

0 to disable custom scenario properties for an organization.

```
0
```

1 or higher to define the number of custom scenario properties an organization can create.

```
1
```

### hashtag Maintenance mode

Maintenance mode displays a screen that explains to your users that they cannot access your instance due to the maintenance activity on your instance. You can enable maintenance mode and customize the message to your users from the System settings page.

1. Go to Administration > System Settings .
2. Scroll down to the Maintenance mode field.
3. Select Enabled .
4. Enter the custom message you want your users to see on the maintenance mode screen.
5. Click Save in the lower right corner.

Go to Administration > System Settings .

Scroll down to the Maintenance mode field.

Select Enabled .

Enter the custom message you want your users to see on the maintenance mode screen.

Click Save in the lower right corner.

A green notification appears briefly to confirm the changes are saved.

Last updated 1 year ago
